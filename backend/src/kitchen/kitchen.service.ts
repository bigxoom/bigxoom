import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { KitchenGateway } from './kitchen.gateway';

@Injectable()
export class KitchenService {
  constructor(private prisma: PrismaService, private audit: AuditService, private gateway: KitchenGateway) {}

  findActive() {
    return this.prisma.kitchenTicket.findMany({
      where: { status: { notIn: ['SERVED', 'CANCELLED'] } },
      include: { order: { include: { items: { include: { menuItem: true } }, room: true, waiter: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(ticketId: string, status: string, userId: string) {
    const ticket = await this.prisma.kitchenTicket.update({
      where: { id: ticketId },
      data: { status: status as any, handledById: userId },
      include: { order: { include: { items: { include: { menuItem: true } } } } },
    });
    await this.audit.log({ userId, action: 'KITCHEN_TICKET_UPDATE', entity: 'KitchenTicket', entityId: ticketId, newValue: { status } });
    this.gateway.broadcastTicketUpdate(ticket);
    return ticket;
  }
}
