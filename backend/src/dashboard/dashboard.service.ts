import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [
      roomsByStatus,
      checkInsToday,
      checkOutsToday,
      arrivalsToday,
      departuresToday,
      currentGuests,
      openMaintenance,
      openHousekeeping,
      lowStock,
      unreadMessages,
    ] = await Promise.all([
      this.prisma.room.groupBy({ by: ['status'], _count: true }),
      this.prisma.stay.count({ where: { checkInAt: { gte: startOfDay } } }),
      this.prisma.stay.count({ where: { checkOutAt: { gte: startOfDay } } }),
      this.prisma.reservation.count({
        where: { arrivalDate: { gte: startOfDay, lt: endOfDay }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      }),
      this.prisma.reservation.count({
        where: { departureDate: { gte: startOfDay, lt: endOfDay }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      }),
      this.prisma.stay.count({ where: { checkOutAt: null } }),
      this.prisma.maintenanceTicket.count({ where: { status: { notIn: ['CLOSED', 'VERIFIED'] } } }),
      this.prisma.housekeepingTask.count({ where: { status: { not: 'READY' } } }),
      this.prisma.$queryRaw`SELECT count(*)::int AS count FROM "InventoryItem" WHERE quantity <= "minStock"`,
      this.prisma.message.count({ where: { readAt: null } }),
    ]);

    const folioItemsToday = await this.prisma.folioItem.findMany({ where: { createdAt: { gte: startOfDay } } });
    const revenueByCategory: Record<string, number> = {};
    for (const item of folioItemsToday) {
      revenueByCategory[item.category] = (revenueByCategory[item.category] || 0) + Number(item.amount);
    }
    const totalRevenue = Object.values(revenueByCategory).reduce((a, b) => a + b, 0);

    const paymentsToday = await this.prisma.payment.findMany({ where: { receivedAt: { gte: startOfDay } } });
    const paymentsByMethod: Record<string, number> = {};
    for (const p of paymentsToday) {
      paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + Number(p.amount);
    }

    const outstandingFolios = await this.prisma.guestFolio.findMany({
      where: { status: 'OPEN' },
      include: { items: true, payments: true },
    });
    const outstandingBalance = outstandingFolios.reduce((sum, f) => {
      const charges = f.items.reduce((s, i) => s + Number(i.amount), 0);
      const paid = f.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + Math.max(charges - paid, 0);
    }, 0);

    return {
      rooms: roomsByStatus,
      today: {
        checkIns: checkInsToday,
        checkOuts: checkOutsToday,
        arrivals: arrivalsToday,
        departures: departuresToday,
        currentGuests,
      },
      financial: { revenueByCategory, totalRevenue, outstandingBalance, paymentsByMethod },
      operations: {
        openMaintenance,
        openHousekeeping,
        lowStockItems: (lowStock as any)[0]?.count || 0,
        unreadMessages,
      },
    };
  }

  activityFeed(take = 30) {
    return this.prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, role: true } } },
    });
  }

  // Single-box global search across the identifiers reception/admin actually
  // search by: guest name/phone, room number, reservation id, receipt number.
  async search(q: string) {
    const query = (q || '').trim();
    if (!query) return { guests: [], rooms: [], reservations: [], payments: [] };

    const receiptNumber = Number(query);
    const [guests, rooms, reservations, payments] = await Promise.all([
      this.prisma.guest.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 8,
      }),
      this.prisma.room.findMany({
        where: { number: { contains: query, mode: 'insensitive' } },
        include: { roomType: true },
        take: 8,
      }),
      this.prisma.reservation.findMany({
        where: {
          OR: [{ id: { contains: query, mode: 'insensitive' } }, { groupBookingRef: { contains: query, mode: 'insensitive' } }],
        },
        include: { guest: true, room: true },
        take: 8,
      }),
      Number.isFinite(receiptNumber) && receiptNumber > 0
        ? this.prisma.payment.findMany({
            where: { receiptNumber },
            include: { folio: { include: { stay: { include: { guest: true, room: true } } } } },
            take: 8,
          })
        : Promise.resolve([]),
    ]);

    return { guests, rooms, reservations, payments };
  }
}
