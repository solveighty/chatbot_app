import { CartItem } from "../services/cartService";
import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import logger from "./logger";

export interface InvoiceData {
  cliente: {
    nombre: string;
    direccion: string;
    telefono: string;
  };
  items: CartItem[];
  total: number;
  fecha: Date;
  invoiceNumber: string;
}

export class InvoiceGenerator {
  private static TEMP_DIR = path.resolve(process.cwd(), "temp");

  /**
   * Inicializa el directorio temporal para PDFs
   */
  public static initTempDir(): void {
    try {
      if (!fs.existsSync(this.TEMP_DIR)) {
        fs.mkdirSync(this.TEMP_DIR, { recursive: true });
        logger.info(`Directorio temporal creado: ${this.TEMP_DIR}`);
      }
    } catch (error) {
      logger.error(`Error al crear directorio temporal: ${error}`);
    }
  }

  /**
   * Genera un número de factura único basado en la fecha y un número aleatorio
   */
  public static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

    return `MON-${year}${month}${day}-${random}`;
  }

  /**
   * Genera el texto de la factura para el cliente
   */
  public static generateInvoice(data: InvoiceData): string {
    const { cliente, items, total, fecha, invoiceNumber } = data;

    // Formato de fecha: DD/MM/YYYY HH:MM
    const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Cabecera de la factura
    let factura = `*FACTURA DE COMPRA*\n` +
                  `*Monasterio Trapense*\n\n` +
                  `📝 *Nº Factura:* ${invoiceNumber}\n` +
                  `📅 *Fecha:* ${fechaFormateada}\n\n` +
                  `👤 *DATOS DEL CLIENTE:*\n` +
                  `Nombre: ${cliente.nombre}\n` +
                  `Dirección: ${cliente.direccion}\n` +
                  `Teléfono: ${cliente.telefono}\n\n` +
                  `📋 *DETALLE DE COMPRA:*\n\n`;

    // Detalle de productos
    let subtotal = 0;
    items.forEach((item, index) => {
      const itemTotal = item.precio * item.cantidad;
      subtotal += itemTotal;

      factura += `${index + 1}. ${item.nombre}\n` +
                `   Precio unit: $${item.precio.toFixed(2).replace(".", ",")}\n` +
                `   Cantidad: ${item.cantidad}\n` +
                `   Subtotal: $${itemTotal.toFixed(2).replace(".", ",")}\n\n`;
    });

    // Totales
    const iva = 0; // Asumimos que los productos están exentos de IVA o que ya lo incluyen
    const totalConIva = subtotal + iva;

    factura += `📊 *RESUMEN:*\n` +
              `Subtotal: $${subtotal.toFixed(2).replace(".", ",")}\n` +
              `IVA (0%): $${iva.toFixed(2).replace(".", ",")}\n` +
              `*TOTAL: $${totalConIva.toFixed(2).replace(".", ",")}*\n\n`;

    // Información final
    factura += `✅ *¡GRACIAS POR SU COMPRA!*\n` +
              `Su pedido ha sido registrado y será procesado a la brevedad.\n` +
              `Para consultas adicionales, comuníquese al:\n` +
              `📞 Teléfono: (XX) XXXX-XXXX\n\n` +
              `🙏 Que Dios bendiga su hogar.`;

    return factura;
  }

  /**
   * Genera un PDF con la factura
   * @returns Ruta del archivo PDF generado
   */
  public static async generateInvoicePDF(data: InvoiceData): Promise<string> {
    this.initTempDir();
    
    const { cliente, items, total, fecha, invoiceNumber } = data;
    
    // Formato de fecha para el PDF
    const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    
    // Crear un nuevo documento PDF
    const pdfPath = path.join(this.TEMP_DIR, `factura-${invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe el PDF a un archivo en disco
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    
    // Cabecera
    doc.fontSize(20).text('FACTURA DE COMPRA', { align: 'center' });
    doc.fontSize(16).text('Monasterio Trapense', { align: 'center' });
    doc.moveDown();
    
    // Información de la factura
    doc.fontSize(12);
    doc.text(`Nº Factura: ${invoiceNumber}`, { align: 'left' });
    doc.text(`Fecha: ${fechaFormateada}`, { align: 'left' });
    doc.moveDown();
    
    // Datos del cliente
    doc.fontSize(14).text('DATOS DEL CLIENTE', { underline: true });
    doc.fontSize(12);
    doc.text(`Nombre: ${cliente.nombre}`);
    doc.text(`Dirección: ${cliente.direccion}`);
    doc.text(`Teléfono: ${cliente.telefono}`);
    doc.moveDown();
    
    // Detalle de la compra
    doc.fontSize(14).text('DETALLE DE COMPRA', { underline: true });
    doc.moveDown(0.5);
    
    // Encabezado de tabla
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 150;
    const quantityX = 300;
    const priceX = 370;
    const amountX = 450;
    
    doc.fontSize(10);
    doc.text("Ítem", itemX, tableTop);
    doc.text("Descripción", descriptionX, tableTop);
    doc.text("Cant.", quantityX, tableTop);
    doc.text("Precio", priceX, tableTop);
    doc.text("Total", amountX, tableTop);
    
    doc.moveDown();
    let tableRow = doc.y;
    
    // Línea horizontal
    doc.moveTo(50, tableRow - 5).lineTo(550, tableRow - 5).stroke();
    
    // Detalle de productos
    let subtotal = 0;
    items.forEach((item, index) => {
      const itemTotal = item.precio * item.cantidad;
      subtotal += itemTotal;
      
      doc.text(`${index + 1}`, itemX, tableRow);
      doc.text(`${item.nombre} (${item.categoria})`, descriptionX, tableRow, { width: 140 });
      doc.text(`${item.cantidad}`, quantityX, tableRow);
      doc.text(`$${item.precio.toFixed(2).replace(".", ",")}`, priceX, tableRow);
      doc.text(`$${itemTotal.toFixed(2).replace(".", ",")}`, amountX, tableRow);
      
      // Calcular altura para la siguiente fila
      const textHeight = doc.heightOfString(`${item.nombre} (${item.categoria})`, { width: 140 });
      tableRow += Math.max(textHeight, 20);
    });
    
    // Línea horizontal para cerrar la tabla
    doc.moveTo(50, tableRow + 5).lineTo(550, tableRow + 5).stroke();
    
    // Añadir un espacio adicional después de la línea divisoria
    tableRow += 20; // Aumentar este valor para dar más espacio
    doc.y = tableRow; // Establecer explícitamente la posición Y para el siguiente texto
    
    // Totales
    const iva = 0;
    const totalConIva = subtotal + iva;
    
    doc.fontSize(12);
    doc.text(`Subtotal: $${subtotal.toFixed(2).replace(".", ",")}`, 350, tableRow);
    doc.text(`IVA (0%): $${iva.toFixed(2).replace(".", ",")}`, 350, tableRow + 20);
    doc.fontSize(14).text(`TOTAL: $${totalConIva.toFixed(2).replace(".", ",")}`, 350, tableRow + 40);
    
    // Actualizar la posición Y para el siguiente bloque de contenido
    doc.y = tableRow + 70; // Posicionarse después de todos los totales
    
    // Información final
    doc.fontSize(12).text('¡GRACIAS POR SU COMPRA!', { align: 'center' });
    doc.fontSize(10).text('Su pedido ha sido registrado y será procesado a la brevedad.', { align: 'center' });
    doc.text('Para consultas adicionales, comuníquese al: (XX) XXXX-XXXX', { align: 'center' });
    doc.moveDown();
    doc.text('Que Dios bendiga su hogar.', { align: 'center' });
    
    // Finalizar el documento
    doc.end();
    
    // Esperar a que el stream termine de escribir
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        logger.info(`PDF generado exitosamente: ${pdfPath}`);
        resolve(pdfPath);
      });
      
      stream.on('error', (error) => {
        logger.error(`Error al generar PDF: ${error}`);
        reject(error);
      });
    });
  }

  /**
   * Limpia los archivos temporales de facturas antiguas
   */
  public static cleanupOldInvoices(maxAgeHours: number = 24): void {
    try {
      if (fs.existsSync(this.TEMP_DIR)) {
        const files = fs.readdirSync(this.TEMP_DIR);
        const now = new Date();
        
        files.forEach(file => {
          const filePath = path.join(this.TEMP_DIR, file);
          const stats = fs.statSync(filePath);
          const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60);
          
          if (fileAge > maxAgeHours) {
            fs.unlinkSync(filePath);
            logger.info(`Archivo temporal eliminado: ${filePath}`);
          }
        });
      }
    } catch (error) {
      logger.error(`Error al limpiar archivos temporales: ${error}`);
    }
  }
}