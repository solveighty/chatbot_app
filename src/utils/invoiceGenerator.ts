import { InvoiceData } from "./logic/invoiceGenerator/types/invoiceTypes";
import { generateInvoiceNumber } from "./logic/invoiceGenerator/utils/invoiceNumberUtils";
import { generateInvoiceText } from "./logic/invoiceGenerator/utils/invoiceTextUtils";
import { generateInvoicePDF } from "./logic/invoiceGenerator/utils/invoicePdfUtils";
import { cleanupOldInvoices } from "./logic/invoiceGenerator/utils/tempDirUtils";

export class InvoiceGenerator {
  /**
   * Genera un número de factura único basado en la fecha y un número aleatorio
   */
  public static generateInvoiceNumber(): string {
    return generateInvoiceNumber();
  }

  /**
   * Genera el texto de la factura para el cliente
   */
  public static generateInvoice(data: InvoiceData): string {
    return generateInvoiceText(data);
  }

  /**
   * Genera un PDF con la factura
   * @returns Ruta del archivo PDF generado
   */
  public static async generateInvoicePDF(data: InvoiceData): Promise<string> {
    return generateInvoicePDF(data);
  }

  /**
   * Limpia los archivos temporales de facturas antiguas
   */
  public static cleanupOldInvoices(maxAgeHours: number = 24): void {
    return cleanupOldInvoices(maxAgeHours);
  }
}