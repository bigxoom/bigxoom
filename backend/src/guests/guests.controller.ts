import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Get()
  findAll() {
    return this.guestsService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.guestsService.create(body);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.guestsService.history(id);
  }
}
