import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'AUDITOR', 'GENERAL_MANAGER')
  @Get()
  findAll(@Query('take') take = '100') {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Number(take),
      include: { user: { select: { fullName: true, role: true } } },
    });
  }
}
