import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  findAll() {
    return this.prisma.room.findMany({
      include: { roomType: true },
      orderBy: { number: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.room.findUnique({ where: { id }, include: { roomType: true } });
  }

  async setStatus(id: string, status: string, userId?: string, reason?: string) {
    const before = await this.prisma.room.findUnique({ where: { id } });
    const room = await this.prisma.room.update({ where: { id }, data: { status: status as any } });
    await this.audit.log({
      userId,
      action: 'ROOM_STATUS_CHANGE',
      entity: 'Room',
      entityId: id,
      oldValue: { status: before?.status },
      newValue: { status },
      reason,
    });
    return room;
  }

  summary() {
    return this.prisma.room.groupBy({ by: ['status'], _count: true });
  }

  // Everything the Room Detail drawer needs in one call: current guest, stay,
  // and folio broken down by category (accommodation/restaurant/bar/other).
  async occupancy(roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId }, include: { roomType: true } });
    if (!room) return null;

    const stay = await this.prisma.stay.findFirst({
      where: { roomId, checkOutAt: null },
      include: {
        guest: true,
        reservation: true,
        folio: { include: { items: true, payments: true } },
      },
      orderBy: { checkInAt: 'desc' },
    });

    const upcomingReservation = stay
      ? null
      : await this.prisma.reservation.findFirst({
          where: { roomId, status: { in: ['NEW', 'CONFIRMED', 'ARRIVAL'] } },
          include: { guest: true },
          orderBy: { arrivalDate: 'asc' },
        });

    if (!stay) {
      return { room, stay: null, reservation: upcomingReservation };
    }

    const items = stay.folio?.items || [];
    const byCategory: Record<string, number> = {};
    for (const item of items) {
      byCategory[item.category] = (byCategory[item.category] || 0) + Number(item.amount);
    }
    const charges = items.reduce((s, i) => s + Number(i.amount), 0);
    const paid = (stay.folio?.payments || []).reduce((s, p) => s + Number(p.amount), 0);

    return {
      room,
      stay,
      reservation: null,
      folio: stay.folio
        ? {
            id: stay.folio.id,
            status: stay.folio.status,
            byCategory,
            charges,
            paid,
            balance: Math.max(charges - paid, 0),
            items,
            payments: stay.folio.payments,
          }
        : null,
    };
  }
}
