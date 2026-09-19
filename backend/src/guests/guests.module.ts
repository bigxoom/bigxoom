import { Module } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [GuestsService, PrismaService],
  controllers: [GuestsController],
  exports: [GuestsService],
})
export class GuestsModule {}
