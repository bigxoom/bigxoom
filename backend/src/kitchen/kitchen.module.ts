import { Module } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { KitchenGateway } from './kitchen.gateway';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [KitchenService, KitchenGateway, PrismaService],
  controllers: [KitchenController],
  exports: [KitchenGateway, KitchenService],
})
export class KitchenModule {}
