import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pos/orders')
export class PosController {
  constructor(private posService: PosService) {}

  @Get()
  findAll() {
    return this.posService.findAll();
  }

  @Get('menu/items')
  menu() {
    return this.posService.findMenu();
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.posService.createOrder(body, req.user.userId);
  }

  @Post(':id/send-to-kitchen')
  send(@Param('id') id: string, @Req() req: any) {
    return this.posService.sendToKitchen(id, req.user.userId);
  }

  @Post(':id/charge-to-room')
  charge(@Param('id') id: string, @Body() body: { folioId: string }, @Req() req: any) {
    return this.posService.chargeToRoom(id, body.folioId, req.user.userId);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Req() req: any) {
    return this.posService.pay(id, req.user.userId);
  }
}
