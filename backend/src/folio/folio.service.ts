import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { PrintService } from '../print/print.service';

@Injectable()
export class FolioService {
  constructor(private prisma: PrismaService, private audit: AuditService, private print: PrintService) {}

  getByStay(stayId: string) {
    return this.prisma.guestFolio.findUnique({
      where: { stayId },
      include: { items: true, payments: true, invoices: true },
    });
  }

  // Any authorized department (restaurant, bar, laundry, other) posts a charge here
  async addItem(folioId: string, data: { description: string; category: string; amount: number; sourceOrderId?: string }, userId: string) {
    const folio = await this.prisma.guestFolio.findUnique({ where: { id: folioId } });
    if (!folio || folio.status !== 'OPEN') throw new BadRequestException('Folio is not open for charges');
    const item = await this.prisma.folioItem.create({ data: { folioId, ...data } });
    await this.audit.log({ userId, action: 'FOLIO_CHARGE', entity: 'FolioItem', entityId: item.id, newValue: data });
    return item;
  }

  async addPayment(folioId: string, data: { amount: number; method: string; reference?: string }, userId: string) {
    const payment = await this.prisma.payment.create({ data: { folioId, ...data } });
    await this.audit.log({ userId, action: 'PAYMENT_RECEIVED', entity: 'Payment', entityId: payment.id, newValue: data });
    return payment;
  }

  async generateInvoice(folioId: string, userId: string) {
    const folio = await this.prisma.guestFolio.findUnique({ where: { id: folioId }, include: { items: true } });
    if (!folio) throw new BadRequestException('Folio not found');
    const total = folio.items.reduce((s, i) => s + Number(i.amount), 0);
    const invoice = await this.prisma.invoice.create({ data: { folioId, total } });
    await this.audit.log({ userId, action: 'INVOICE_GENERATED', entity: 'Invoice', entityId: invoice.id, newValue: { total } });
    return invoice;
  }
}
