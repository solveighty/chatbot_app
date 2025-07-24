import { MessageMedia } from 'whatsapp-web.js';
import { InvoiceGenerator } from '../../../../../utils/invoiceGenerator';
import fs from 'fs-extra';

export async function generarYEnviarFacturaPDF(invoiceData: any, invoiceNumber: string) {
  const pdfPath = await InvoiceGenerator.generateInvoicePDF(invoiceData);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const invoiceMedia = new MessageMedia(
    'application/pdf',
    pdfBuffer.toString('base64'),
    `factura-${invoiceNumber}.pdf`
  );
  return { invoiceMedia, pdfPath };
}