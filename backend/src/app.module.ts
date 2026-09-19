import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { GuestsModule } from './guests/guests.module';
import { ReservationsModule } from './reservations/reservations.module';
import { FolioModule } from './folio/folio.module';
import { PosModule } from './pos/pos.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { InventoryModule } from './inventory/inventory.module';
import { MessagesModule } from './messages/messages.module';
import { PrintModule } from './print/print.module';
import { ReportsModule } from './reports/reports.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    RoomsModule,
    GuestsModule,
    ReservationsModule,
    FolioModule,
    PosModule,
    KitchenModule,
    HousekeepingModule,
    MaintenanceModule,
    InventoryModule,
    MessagesModule,
    PrintModule,
    ReportsModule,
    DashboardModule,
    AuditModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
