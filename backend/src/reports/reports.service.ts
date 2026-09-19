import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Daily revenue — all folios/charges posted today
  async dailyRevenue(date: Date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const items = await this.prisma.folioItem.findMany({
      where: { createdAt: { gte: start, lte: end } },
    });
    const byCategory: Record<string, { total: number; count: number }> = {};
    for (const i of items) {
      if (!byCategory[i.category]) byCategory[i.category] = { total: 0, count: 0 };
      byCategory[i.category].total += Number(i.amount);
      byCategory[i.category].count += 1;
    }
    const totalRevenue = Object.values(byCategory).reduce((sum, c) => sum + c.total, 0);
    return { date: date.toISOString().split('T')[0], byCategory, totalRevenue };
  }

  // Room occupancy — current and historical
  async occupancyReport(date: Date = new Date()) {
    const totalRooms = await this.prisma.room.count();
    const occupiedRooms = await this.prisma.room.count({ where: { status: 'OCCUPIED' } });
    const reservedRooms = await this.prisma.room.count({ where: { status: 'RESERVED' } });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const byStatus: Record<string, number> = {};
    const statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DIRTY', 'CLEANING', 'MAINTENANCE', 'BLOCKED'] as const;
    for (const s of statuses) {
      byStatus[s] = await this.prisma.room.count({ where: { status: s } });
    }

    return { date: date.toISOString().split('T')[0], totalRooms, occupiedRooms, reservedRooms, occupancyRate, byStatus };
  }

  // Restaurant revenue for a date
  async restaurantRevenue(date: Date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const items = await this.prisma.folioItem.findMany({
      where: { category: 'RESTAURANT', createdAt: { gte: start, lte: end } },
    });
    const total = items.reduce((sum, i) => sum + Number(i.amount), 0);
    return { date: date.toISOString().split('T')[0], total, itemCount: items.length, items };
  }

  // Bar revenue for a date
  async barRevenue(date: Date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const items = await this.prisma.folioItem.findMany({
      where: { category: 'BAR', createdAt: { gte: start, lte: end } },
    });
    const total = items.reduce((sum, i) => sum + Number(i.amount), 0);
    return { date: date.toISOString().split('T')[0], total, itemCount: items.length, items };
  }

  // Expenses for a date/period
  async expensesReport(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { approvedBy: true },
    });
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    }
    const pendingCount = expenses.filter((e) => e.status === 'PENDING').length;
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], total, byCategory, pendingCount, expenses };
  }

  // Outstanding guest balances
  async outstandingBalances() {
    const openFolios = await this.prisma.guestFolio.findMany({
      where: { status: 'OPEN' },
      include: {
        stay: { include: { guest: true, room: true } },
        items: true,
        payments: true,
      },
    });

    const balances = [];
    for (const f of openFolios) {
      const charges = f.items.reduce((sum, i) => sum + Number(i.amount), 0);
      const paid = f.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = charges - paid;
      if (balance > 0) {
        balances.push({
          folioId: f.id,
          guest: f.stay.guest.fullName,
          room: f.stay.room.number,
          checkInDate: f.stay.checkInAt,
          charges,
          paid,
          outstanding: balance,
        });
      }
    }
    const totalOutstanding = balances.reduce((sum, b) => sum + b.outstanding, 0);
    return { totalOutstanding, count: balances.length, balances };
  }

  // Inventory movement history
  async inventoryMovement(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.stockTransaction.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
    const byType: Record<string, number> = {};
    for (const t of transactions) {
      byType[t.type] = (byType[t.type] || 0) + Number(t.quantity);
    }
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], byType, transactions };
  }

  // Low stock alert
  async lowStockAlert() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { quantity: { lte: this.prisma.inventoryItem.fields.minStock } },
      include: { supplier: true },
      orderBy: { quantity: 'asc' },
    });
    return { count: items.length, items };
  }

  // Staff/user activity
  async staffActivityReport(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await this.prisma.auditLog.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
    const byUser: Record<string, number> = {};
    for (const l of logs) {
      const name = l.user?.fullName || 'System';
      byUser[name] = (byUser[name] || 0) + 1;
    }
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], byUser, activityCount: logs.length };
  }

  // Maintenance tickets report
  async maintenanceReport(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const tickets = await this.prisma.maintenanceTicket.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { room: true },
    });
    const byStatus: Record<string, number> = {};
    let totalCost = 0;
    for (const t of tickets) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      totalCost += Number(t.cost || 0);
    }
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], byStatus, totalCost, ticketCount: tickets.length, tickets };
  }

  // Housekeeping tasks report
  async housekeepingReport(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.housekeepingTask.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { room: true },
    });
    const byStatus: Record<string, number> = {};
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    }
    return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0], byStatus, taskCount: tasks.length, tasks };
  }
}
