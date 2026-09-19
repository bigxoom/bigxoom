import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FolioService } from './folio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('folios')
export class FolioController {
  constructor(private folioService: FolioService) {}

  @Get('by-stay/:stayId')
  getByStay(@Param('stayId') stayId: string) {
    return this.folioService.getByStay(stayId);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.folioService.addItem(id, body, req.user.userId);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.folioService.addPayment(id, body, req.user.userId);
  }

  @Post(':id/invoice')
  invoice(@Param('id') id: string, @Req() req: any) {
    return this.folioService.generateInvoice(id, req.user.userId);
  }
}
