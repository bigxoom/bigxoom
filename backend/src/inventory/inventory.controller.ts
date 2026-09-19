import { Body, Controller, Get, Param, Post, Patch, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get('items')
  findAll() {
    return this.service.findAll();
  }

  @Get('low-stock')
  lowStock() {
    return this.service.lowStock();
  }

  @Get('items/:id/history')
  history(@Param('id') id: string) {
    return this.service.history(id);
  }

  @Roles('STOREKEEPER', 'SUPERVISOR', 'ADMIN')
  @Post('transactions')
  transact(@Body() body: { itemId: string; type: string; quantity: number; reason?: string }, @Req() req: any) {
    return this.service.transact(body.itemId, body.type, body.quantity, req.user.userId, body.reason);
  }

  @Roles('STOREKEEPER', 'SUPERVISOR', 'ADMIN')
  @Get('adjustments/pending')
  pending() {
    return this.service.pendingAdjustments();
  }

  @Roles('SUPERVISOR', 'ADMIN')
  @Patch('adjustments/:id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.service.decideAdjustment(id, true, req.user.userId);
  }

  @Roles('SUPERVISOR', 'ADMIN')
  @Patch('adjustments/:id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.service.decideAdjustment(id, false, req.user.userId);
  }

  @Roles('ADMIN')
  @Patch('settings/allow-negative-stock')
  setAllowNegativeStock(@Body() body: { allow: boolean }, @Req() req: any) {
    return this.service.setAllowNegativeStock(body.allow, req.user.userId);
  }
}
