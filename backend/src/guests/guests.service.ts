import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.guest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: any) {
    return this.prisma.guest.create({ data });
  }

  history(id: string) {
    return this.prisma.guest.findUnique({
      where: { id },
      include: { stays: { include: { room: true, folio: true } }, reservations: true },
    });
  }
}
