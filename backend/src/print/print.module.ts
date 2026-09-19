import { Module } from '@nestjs/common';
import { PrintService } from './print.service';
import { PrintController } from './print.controller';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [PrintService, PrismaService],
  controllers: [PrintController],
  exports: [PrintService],
})
export class PrintModule {}
