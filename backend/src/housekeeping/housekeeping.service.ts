import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HousekeepingService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  findAll() {
    return this.prisma.housekeepingTask.findMany({
      include: { room: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  assign(id: string, assignedToId: string, userId: string) {
    return this.prisma.housekeepingTask.update({ where: { id }, data: { assignedToId, status: 'ASSIGNED' } });
  }

  // DIRTY -> ASSIGNED -> CLEANING -> INSPECTION -> READY (room status follows)
  async updateStatus(id: string, status: string, userId: string) {
    const task = await this.prisma.housekeepingTask.update({
      where: { id },
      data: { status: status as any, completedAt: status === 'READY' ? new Date() : undefined },
    });
    if (status === 'CLEANING') {
      await this.prisma.room.update({ where: { id: task.roomId }, data: { status: 'CLEANING' } });
    }
    if (status === 'READY') {
      await this.prisma.room.update({ where: { id: task.roomId }, data: { status: 'AVAILABLE' } });
    }
    await this.audit.log({ userId, action: 'HOUSEKEEPING_STATUS', entity: 'HousekeepingTask', entityId: id, newValue: { status } });
    return task;
  }
}
