import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.message.findMany({
      include: { sender: { select: { fullName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: any, senderId: string) {
    return this.prisma.message.create({ data: { ...data, senderId } });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.message.update({ where: { id }, data: { status: status as any } });
  }
}
