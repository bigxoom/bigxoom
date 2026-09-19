import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';
import { InventoryModule } from '../inventory/inventory.module';
import { KitchenModule } from '../kitchen/kitchen.module';

@Module({
  imports: [AuditModule, InventoryModule, KitchenModule],
  providers: [PosService, PrismaService],
  controllers: [PosController],
  exports: [PosService],
})
export class PosModule {}
