import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import logger from "../../../logger";
import { InvoiceData } from "../types/invoiceTypes";
import { TEMP_DIR, initTempDir,} from "./tempDirUtils";


export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  initTempDir();

  const { cliente, items, total, fecha, invoiceNumber } = data;

  // Formato de fecha para el PDF
  const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Crear un nuevo documento PDF
  const pdfPath = path.join(TEMP_DIR, `factura-${invoiceNumber}.pdf`);
  const doc = new PDFDocument({ margin: 50 });

  // Pipe el PDF a un archivo en disco
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Cabecera
  doc.fontSize(20).text('FACTURA PARA RETIRO', { align: 'center' });
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
  tableRow += 20;
  doc.y = tableRow;

  // Totales
  const iva = 0;
  const totalConIva = subtotal + iva;

  doc.fontSize(12);
  doc.text(`Subtotal: $${subtotal.toFixed(2).replace(".", ",")}`, 350, tableRow);
  doc.text(`IVA (0%): $${iva.toFixed(2).replace(".", ",")}`, 350, tableRow + 20);
  doc.fontSize(14).text(`TOTAL: $${totalConIva.toFixed(2).replace(".", ",")}`, 350, tableRow + 40);

  doc.y = tableRow + 70;

  // Información final
  doc.fontSize(12).text('¡GRACIAS POR SU COMPRA!', { align: 'center' });
  doc.fontSize(10).text('Su pedido ha sido registrado y será procesado a la brevedad.', { align: 'center' });
  doc.text('Para consultas adicionales, comuníquese al: (XX) XXXX-XXXX', { align: 'center' });
  doc.moveDown();
  doc.text('Que Dios bendiga su hogar.', { align: 'center' });

  doc.end();

  // Esperar a que el stream termine de escribir
  return new Promise<string>((resolve, reject) => {
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