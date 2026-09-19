import { Module } from '@nestjs/common';
import { FolioService } from './folio.service';
import { FolioController } from './folio.controller';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';
import { PrintModule } from '../print/print.module';

@Module({
  imports: [AuditModule, PrintModule],
  providers: [FolioService, PrismaService],
  controllers: [FolioController],
  exports: [FolioService],
})
export class FolioModule {}
