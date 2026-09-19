import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kitchen/tickets')
export class KitchenController {
  constructor(private kitchenService: KitchenService) {}

  @Get('active')
  findActive() {
    return this.kitchenService.findActive();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Req() req: any) {
    return this.kitchenService.updateStatus(id, body.status, req.user.userId);
  }
}
