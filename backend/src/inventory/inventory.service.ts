import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

// Types that require supervisor/admin approval before they touch quantity.
const APPROVAL_REQUIRED_TYPES = ['WASTAGE', 'ADJUSTMENT'];

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({ include: { supplier: true }, orderBy: { name: 'asc' } });
  }

  lowStock() {
    return this.prisma.$queryRaw`SELECT * FROM "InventoryItem" WHERE quantity <= "minStock" ORDER BY name`;
  }

  history(itemId: string) {
    return this.prisma.stockTransaction.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async allowNegativeStock(): Promise<boolean> {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'allow_negative_stock' } });
    return setting?.value === 'true';
  }

  // ---- Direct stock movements: IN (purchases/receiving), OUT, TRANSFER ----
  // These post immediately — no approval needed for ordinary receiving/issuing.
  async transact(itemId: string, type: string, quantity: number, userId: string, reason?: string) {
    if (APPROVAL_REQUIRED_TYPES.includes(type)) {
      return this.requestAdjustment(itemId, type, quantity, userId, reason);
    }
    return this.postTransaction(itemId, type, quantity, userId, reason);
  }

  private async postTransaction(
    itemId: string,
    type: string,
    quantity: number,
    userId?: string,
    reason?: string,
    sourceOrderId?: string,
  ) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Inventory item not found');

    const delta = type === 'IN' ? quantity : -quantity;
    const resultingQty = Number(item.quantity) + delta;

    if (resultingQty < 0 && !(await this.allowNegativeStock())) {
      throw new BadRequestException(
        `Insufficient stock for "${item.name}" (have ${item.quantity}${item.unit}, need ${Math.abs(delta)}${item.unit}). ` +
          `Enable "allow negative stock" to override.`,
      );
    }

    await this.prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity: { increment: delta } } });
    const tx = await this.prisma.stockTransaction.create({
      data: { itemId, type, quantity, reason, status: 'POSTED', requestedById: userId, sourceOrderId },
    });
    await this.audit.log({
      userId,
      action: `STOCK_${type}`,
      entity: 'InventoryItem',
      entityId: itemId,
      oldValue: { quantity: item.quantity },
      newValue: { quantity: resultingQty },
      reason,
    });
    return tx;
  }

  // Called by the POS module when an order with trackStock items is sent/paid.
  // Deducts every recipe component for every sold item. Every deduction is audited.
  async deductForSale(orderId: string, orderItems: { menuItemId: string; quantity: number }[], userId?: string) {
    const menuItemIds = orderItems.map((i) => i.menuItemId);
    const recipes = await this.prisma.menuItemRecipeComponent.findMany({
      where: { menuItemId: { in: menuItemIds } },
      include: { inventoryItem: true },
    });
    if (recipes.length === 0) return [];

    const results = [];
    for (const orderItem of orderItems) {
      const components = recipes.filter((r) => r.menuItemId === orderItem.menuItemId);
      for (const c of components) {
        const totalQty = Number(c.quantityPerUnit) * orderItem.quantity;
        const tx = await this.postTransaction(
          c.inventoryItemId,
          'SALE_DEDUCTION',
          totalQty,
          userId,
          `POS sale (order ${orderId})`,
          orderId,
        );
        results.push(tx);
      }
    }
    return results;
  }

  // ---- Wastage & manual adjustments: require supervisor/admin approval ----
  async requestAdjustment(itemId: string, type: string, quantity: number, userId: string, reason?: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Inventory item not found');
    const tx = await this.prisma.stockTransaction.create({
      data: { itemId, type, quantity, reason, status: 'PENDING', requestedById: userId },
    });
    await this.audit.log({
      userId,
      action: `STOCK_${type}_REQUESTED`,
      entity: 'StockTransaction',
      entityId: tx.id,
      newValue: { itemId, type, quantity, reason },
      reason,
    });
    return tx;
  }

  pendingAdjustments() {
    return this.prisma.stockTransaction.findMany({
      where: { status: 'PENDING' },
      include: { item: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async decideAdjustment(txId: string, approve: boolean, approverId: string) {
    const tx = await this.prisma.stockTransaction.findUnique({ where: { id: txId }, include: { item: true } });
    if (!tx) throw new NotFoundException('Stock transaction not found');
    if (tx.status !== 'PENDING') throw new BadRequestException('This adjustment has already been decided');

    if (!approve) {
      const rejected = await this.prisma.stockTransaction.update({
        where: { id: txId },
        data: { status: 'REJECTED', approvedById: approverId, decidedAt: new Date() },
      });
      await this.audit.log({ userId: approverId, action: 'STOCK_ADJUSTMENT_REJECTED', entity: 'StockTransaction', entityId: txId });
      return rejected;
    }

    // WASTAGE always reduces stock; ADJUSTMENT can go either way (e.g. a stock-count correction).
    const delta = tx.type === 'WASTAGE' ? -Number(tx.quantity) : Number(tx.quantity);
    const resultingQty = Number(tx.item.quantity) + delta;
    if (resultingQty < 0 && !(await this.allowNegativeStock())) {
      throw new BadRequestException(`Approving this would take "${tx.item.name}" below zero stock.`);
    }

    await this.prisma.inventoryItem.update({ where: { id: tx.itemId }, data: { quantity: { increment: delta } } });
    const approved = await this.prisma.stockTransaction.update({
      where: { id: txId },
      data: { status: 'APPROVED', approvedById: approverId, decidedAt: new Date() },
    });
    await this.audit.log({
      userId: approverId,
      action: 'STOCK_ADJUSTMENT_APPROVED',
      entity: 'StockTransaction',
      entityId: txId,
      oldValue: { quantity: tx.item.quantity },
      newValue: { quantity: resultingQty },
    });
    return approved;
  }

  async setAllowNegativeStock(allow: boolean, userId: string) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'allow_negative_stock' },
      update: { value: String(allow) },
      create: { key: 'allow_negative_stock', value: String(allow) },
    });
    await this.audit.log({
      userId,
      action: 'SETTING_CHANGED',
      entity: 'SystemSetting',
      entityId: 'allow_negative_stock',
      newValue: { allow },
    });
    return { allow_negative_stock: allow };
  }
}
