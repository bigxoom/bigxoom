import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [RoomsService, PrismaService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
