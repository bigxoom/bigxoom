import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('summary')
  summary() {
    return this.roomsService.summary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/occupancy')
  occupancy(@Param('id') id: string) {
    return this.roomsService.occupancy(id);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() body: { status: string; reason?: string }, @Req() req: any) {
    return this.roomsService.setStatus(id, body.status, req.user?.userId, body.reason);
  }
}
