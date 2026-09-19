import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.reservationsService.create(body, req.user.userId);
  }

  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Req() req: any) {
    return this.reservationsService.checkIn(id, req.user.userId);
  }

  @Post('stays/:stayId/check-out')
  checkOut(@Param('stayId') stayId: string, @Req() req: any) {
    return this.reservationsService.checkOut(stayId, req.user.userId);
  }
}
