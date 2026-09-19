import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PrintService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // Generate an A4 guest invoice — folio summary with payment record.
  async guestInvoiceHtml(folioId: string): Promise<string> {
    const folio = await this.prisma.guestFolio.findUnique({
      where: { id: folioId },
      include: { stay: { include: { guest: true, room: true } }, items: true, payments: true, invoices: { take: 1, orderBy: { issuedAt: 'desc' } } },
    });
    if (!folio) throw new Error('Folio not found');

    const totalCharges = folio.items.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalPaid = folio.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = totalCharges - totalPaid;
    const invoice = folio.invoices[0];
    const invoiceNumber = invoice?.number || '—';
    const invoiceDate = invoice?.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('en-RW') : new Date().toLocaleDateString('en-RW');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Guest Invoice</title>
  <style>
    body { font-family: Georgia, serif; max-width: 210mm; margin: 0 auto; padding: 20mm; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8C5A2B; padding-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18px; color: #8C5A2B; font-weight: bold; letter-spacing: 2px; }
    .header p { margin: 5px 0; font-size: 12px; color: #666; }
    .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 12px; }
    .invoice-info div { }
    .invoice-info label { font-weight: bold; color: #8C5A2B; }
    .guest-info { margin-bottom: 30px; font-size: 12px; }
    .guest-info label { font-weight: bold; color: #8C5A2B; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    table th { border-bottom: 2px solid #B8863B; padding: 10px 0; text-align: left; font-size: 12px; font-weight: bold; color: #8C5A2B; }
    table td { border-bottom: 1px solid #EFE2CB; padding: 8px 0; font-size: 11px; }
    table td.amount { text-align: right; }
    .summary { display: grid; grid-template-columns: 1fr 150px; gap: 20px; margin-bottom: 30px; }
    .summary-right { text-align: right; font-size: 12px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .summary-row.total { font-weight: bold; font-size: 14px; color: #8C5A2B; border-top: 2px solid #B8863B; padding-top: 8px; }
    .payment-methods { margin-bottom: 30px; font-size: 11px; }
    .payment-methods div { margin-bottom: 5px; }
    .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #EFE2CB; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CENTRE PASTORAL NOTRE DAME DE FATIMA</h1>
    <p>Hospitality Management System</p>
    <p>Hospitality • Service • Accountability • Excellence</p>
  </div>

  <div class="invoice-info">
    <div>
      <label>Invoice #:</label> ${invoiceNumber}<br>
      <label>Invoice Date:</label> ${invoiceDate}
    </div>
    <div>
      <label>Check-in:</label> ${new Date(folio.stay.checkInAt).toLocaleDateString('en-RW')}<br>
      <label>Check-out:</label> ${folio.stay.checkOutAt ? new Date(folio.stay.checkOutAt).toLocaleDateString('en-RW') : '—'}
    </div>
  </div>

  <div class="guest-info">
    <label>Guest Name:</label> ${folio.stay.guest.fullName}<br>
    <label>Room:</label> ${folio.stay.room.number}<br>
    <label>Phone:</label> ${folio.stay.guest.phone || '—'}<br>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Category</th>
        <th class="amount">Amount (RWF)</th>
      </tr>
    </thead>
    <tbody>
      ${folio.items.map((item) => `
        <tr>
          <td>${item.description}</td>
          <td>${item.category}</td>
          <td class="amount">${Number(item.amount).toLocaleString('en-RW', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary">
    <div></div>
    <div class="summary-right">
      <div class="summary-row">
        <span>Total Charges:</span>
        <span>${Number(totalCharges).toLocaleString('en-RW', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="summary-row">
        <span>Total Paid:</span>
        <span>${Number(totalPaid).toLocaleString('en-RW', { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="summary-row total">
        <span>${balance >= 0 ? 'Balance Due' : 'Credit'}:</span>
        <span>${Number(Math.abs(balance)).toLocaleString('en-RW', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>

  ${folio.payments.length > 0 ? `
    <div class="payment-methods">
      <strong>Payments:</strong>
      ${folio.payments.map((p) => `<div>${p.method} – ${Number(p.amount).toLocaleString('en-RW', { minimumFractionDigits: 2 })} RWF (${new Date(p.receivedAt).toLocaleDateString('en-RW')})</div>`).join('')}
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your stay at Centre Pastoral Notre Dame de Fatima</p>
    <p>Printed: ${new Date().toLocaleString('en-RW')}</p>
  </div>
</body>
</html>
    `;
  }

  // Generate an 80mm thermal receipt — compact POS receipt for a direct sale or folio charge.
  async thermalReceiptHtml(
    receiptNumber: number,
    items: { description: string; amount: number }[],
    total: number,
    method: string,
    cashierName?: string,
  ): Promise<string> {
    const now = new Date();
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  <style>
    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 0; }
    .receipt { width: 100%; text-align: center; padding: 10px; }
    .header { font-size: 10px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
    .header h1 { margin: 0; font-size: 9px; letter-spacing: 1px; font-weight: bold; }
    .header p { margin: 2px 0; font-size: 7px; }
    .details { font-size: 8px; text-align: left; margin: 10px 0; }
    .details div { margin: 2px 0; }
    .items { font-size: 8px; text-align: left; margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; }
    .item { margin: 2px 0; display: flex; justify-content: space-between; }
    .item-name { flex: 1; }
    .item-amount { text-align: right; }
    .total { font-size: 10px; font-weight: bold; text-align: right; margin: 10px 0; }
    .payment { font-size: 8px; text-align: center; margin: 10px 0; }
    .footer { font-size: 7px; color: #666; margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>CENTRE PASTORAL</h1>
      <h1>NOTRE DAME DE FATIMA</h1>
      <p>Receipt #${receiptNumber}</p>
      <p>${now.toLocaleDateString('en-RW')} ${now.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>

    <div class="items">
      ${items.map((item) => `
        <div class="item">
          <span class="item-name">${item.description}</span>
          <span class="item-amount">${Number(item.amount).toLocaleString('en-RW', { minimumFractionDigits: 0 })}</span>
        </div>
      `).join('')}
    </div>

    <div class="total">
      TOTAL: ${Number(total).toLocaleString('en-RW', { minimumFractionDigits: 0 })} RWF
    </div>

    <div class="payment">
      Payment: ${method}<br>
      ${cashierName ? `Cashier: ${cashierName}<br>` : ''}
    </div>

    <div class="footer">
      <p>Thank you!</p>
      <p style="margin: 2px 0;">Centre Pastoral Notre Dame de Fatima</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
