import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  findAll() {
    return this.prisma.reservation.findMany({
      include: { guest: true, room: true },
      orderBy: { arrivalDate: 'asc' },
    });
  }

  async create(data: any, userId: string) {
    const reservation = await this.prisma.reservation.create({
      data: { ...data, createdById: userId, status: 'CONFIRMED' },
    });
    await this.prisma.room.update({ where: { id: data.roomId }, data: { status: 'RESERVED' } });
    await this.audit.log({ userId, action: 'RESERVATION_CREATED', entity: 'Reservation', entityId: reservation.id });
    return reservation;
  }

  // Core workflow step: RESERVATION -> CHECK-IN -> creates Stay + GuestFolio, room becomes OCCUPIED
  async checkIn(reservationId: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) throw new BadRequestException('Reservation not found');
    if (reservation.status === 'CHECKED_IN') throw new BadRequestException('Already checked in');

    const stay = await this.prisma.stay.create({
      data: {
        reservationId: reservation.id,
        guestId: reservation.guestId,
        roomId: reservation.roomId,
      },
    });
    await this.prisma.guestFolio.create({ data: { stayId: stay.id } });
    await this.prisma.reservation.update({ where: { id: reservationId }, data: { status: 'CHECKED_IN' } });
    await this.prisma.room.update({ where: { id: reservation.roomId }, data: { status: 'OCCUPIED' } });

    await this.audit.log({ userId, action: 'CHECK_IN', entity: 'Stay', entityId: stay.id });
    return this.prisma.stay.findUnique({ where: { id: stay.id }, include: { folio: true, room: true, guest: true } });
  }

  // Core workflow step: CHECK-OUT -> folio must be settled, room goes DIRTY, housekeeping task auto-created
  async checkOut(stayId: string, userId: string) {
    const stay = await this.prisma.stay.findUnique({
      where: { id: stayId },
      include: { folio: { include: { items: true, payments: true } } },
    });
    if (!stay) throw new BadRequestException('Stay not found');

    const totalCharges = (stay.folio?.items || []).reduce((sum, i) => sum + Number(i.amount), 0);
    const totalPaid = (stay.folio?.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalPaid < totalCharges) {
      throw new BadRequestException(
        `Cannot check out: outstanding balance of ${totalCharges - totalPaid} on the folio`,
      );
    }

    await this.prisma.stay.update({ where: { id: stayId }, data: { checkOutAt: new Date() } });
    await this.prisma.guestFolio.update({ where: { id: stay.folio!.id }, data: { status: 'CLOSED' } });
    await this.prisma.room.update({ where: { id: stay.roomId }, data: { status: 'DIRTY' } });
    await this.prisma.housekeepingTask.create({ data: { roomId: stay.roomId, status: 'DIRTY' } });

    await this.audit.log({ userId, action: 'CHECK_OUT', entity: 'Stay', entityId: stayId });
    return { message: 'Checked out successfully', roomId: stay.roomId };
  }
}
