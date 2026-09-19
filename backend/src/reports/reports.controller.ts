import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'GENERAL_MANAGER', 'ACCOUNTANT', 'SUPERVISOR')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily-revenue')
  dailyRevenue(@Query('date') date?: string) {
    return this.reportsService.dailyRevenue(date ? new Date(date) : new Date());
  }

  @Get('occupancy')
  occupancy(@Query('date') date?: string) {
    return this.reportsService.occupancyReport(date ? new Date(date) : new Date());
  }

  @Get('restaurant-revenue')
  restaurantRevenue(@Query('date') date?: string) {
    return this.reportsService.restaurantRevenue(date ? new Date(date) : new Date());
  }

  @Get('bar-revenue')
  barRevenue(@Query('date') date?: string) {
    return this.reportsService.barRevenue(date ? new Date(date) : new Date());
  }

  @Get('expenses')
  expenses(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.expensesReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('outstanding-balances')
  outstandingBalances() {
    return this.reportsService.outstandingBalances();
  }

  @Get('inventory-movement')
  inventoryMovement(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.inventoryMovement(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('low-stock')
  lowStock() {
    return this.reportsService.lowStockAlert();
  }

  @Get('staff-activity')
  staffActivity(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.staffActivityReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('maintenance')
  maintenance(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.maintenanceReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get('housekeeping')
  housekeeping(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.housekeepingReport(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }
}
