import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('summary')
  summary() {
    return this.service.summary();
  }

  @Get('activity')
  activity(@Query('take') take?: string) {
    return this.service.activityFeed(take ? Number(take) : undefined);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.service.search(q);
  }
}
