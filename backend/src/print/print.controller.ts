import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrintService } from './print.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('print')
export class PrintController {
  constructor(private printService: PrintService) {}

  @Get('invoices/:folioId')
  async guestInvoice(@Param('folioId') folioId: string, @Res() res: Response) {
    const html = await this.printService.guestInvoiceHtml(folioId);
    res.type('text/html').send(html);
  }

  @Get('receipts/:receiptNumber')
  async thermalReceipt(
    @Param('receiptNumber') receiptNumber: string,
    @Res() res: Response,
  ) {
    // This is a simplified endpoint — in production, you'd look up the receipt from DB.
    // For now, just return a template example.
    const html = await this.printService.thermalReceiptHtml(Number(receiptNumber), [{ description: 'Example Item', amount: 5000 }], 5000, 'CASH', 'Demo Cashier');
    res.type('text/html').send(html);
  }
}
