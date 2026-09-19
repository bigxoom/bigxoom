import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('housekeeping/tasks')
export class HousekeepingController {
  constructor(private service: HousekeepingService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() body: { assignedToId: string }, @Req() req: any) {
    return this.service.assign(id, body.assignedToId, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.service.updateStatus(id, body.status, req.user.userId);
  }
}
