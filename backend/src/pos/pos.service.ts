import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { KitchenGateway } from '../kitchen/kitchen.gateway';

@Injectable()
export class PosService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private inventory: InventoryService,
    private kitchenGateway: KitchenGateway,
  ) {}

  findMenu() {
    return this.prisma.menuItem.findMany({ where: { active: true }, include: { category: true } });
  }

  findAll() {
    return this.prisma.posOrder.findMany({
      include: { items: { include: { menuItem: true } }, kitchenTicket: true, room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(data: any, userId: string) {
    const order = await this.prisma.posOrder.create({
      data: {
        type: data.type,
        tableNumber: data.tableNumber,
        roomId: data.roomId,
        chargeToRoom: !!data.chargeToRoom,
        waiterId: userId,
        items: {
          create: data.items.map((i: any) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            notes: i.notes,
          })),
        },
      },
      include: { items: true },
    });
    return order;
  }

  // WAITER -> SEND ORDER -> KITCHEN. Creates the kitchen ticket, deducts inventory, and pushes it live.
  async sendToKitchen(orderId: string, userId: string) {
    const order = await this.prisma.posOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } }, waiter: true, room: true },
    });
    if (!order) throw new BadRequestException('Order not found');

    // Auto-deduct inventory for all trackStock items in this order.
    const trackStockItems = order.items.filter((i) => i.menuItem.trackStock);
    if (trackStockItems.length > 0) {
      await this.inventory.deductForSale(
        orderId,
        trackStockItems.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        userId,
      );
    }

    const updated = await this.prisma.posOrder.update({
      where: { id: orderId },
      data: { status: 'SENT' },
      include: { items: { include: { menuItem: true } }, waiter: true, room: true },
    });
    const ticket = await this.prisma.kitchenTicket.create({
      data: { orderId, status: 'NEW' },
    });
    await this.audit.log({
      userId,
      action: 'ORDER_SENT_TO_KITCHEN',
      entity: 'PosOrder',
      entityId: orderId,
      newValue: { inventoryDeducted: trackStockItems.length > 0 },
    });
    this.kitchenGateway.broadcastNewTicket({ ticket, order: updated });
    return ticket;
  }

  // Charge to room -> posts each order item onto the guest's open folio
  async chargeToRoom(orderId: string, folioId: string, userId: string) {
    const order = await this.prisma.posOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } } },
    });
    if (!order) throw new BadRequestException('Order not found');

    for (const item of order.items) {
      await this.prisma.folioItem.create({
        data: {
          folioId,
          description: `${item.menuItem.name} x${item.quantity}`,
          category: order.type === 'BAR' ? 'BAR' : 'RESTAURANT',
          amount: Number(item.unitPrice) * item.quantity,
          sourceOrderId: order.id,
        },
      });
    }
    await this.prisma.posOrder.update({ where: { id: orderId }, data: { status: 'PAID' } });
    await this.audit.log({ userId, action: 'ORDER_CHARGED_TO_ROOM', entity: 'PosOrder', entityId: orderId, newValue: { folioId } });
    return { message: 'Order charged to room folio' };
  }

  async pay(orderId: string, userId: string) {
    await this.prisma.posOrder.update({ where: { id: orderId }, data: { status: 'PAID' } });
    await this.audit.log({ userId, action: 'ORDER_PAID_DIRECT', entity: 'PosOrder', entityId: orderId });
    return { message: 'Order paid' };
  }
}
