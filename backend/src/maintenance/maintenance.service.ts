import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  findAll() {
    return this.prisma.maintenanceTicket.findMany({
      include: { room: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, userId: string) {
    const ticket = await this.prisma.maintenanceTicket.create({ data });
    if (data.roomId) {
      await this.prisma.room.update({ where: { id: data.roomId }, data: { status: 'MAINTENANCE' } });
    }
    await this.audit.log({ userId, action: 'MAINTENANCE_TICKET_CREATED', entity: 'MaintenanceTicket', entityId: ticket.id });
    return ticket;
  }

  async updateStatus(id: string, status: string, userId: string) {
    const ticket = await this.prisma.maintenanceTicket.update({
      where: { id },
      data: { status: status as any, resolvedAt: status === 'CLOSED' ? new Date() : undefined },
    });
    if (status === 'CLOSED' && ticket.roomId) {
      await this.prisma.room.update({ where: { id: ticket.roomId }, data: { status: 'AVAILABLE' } });
    }
    await this.audit.log({ userId, action: 'MAINTENANCE_STATUS', entity: 'MaintenanceTicket', entityId: id, newValue: { status } });
    return ticket;
  }
}
