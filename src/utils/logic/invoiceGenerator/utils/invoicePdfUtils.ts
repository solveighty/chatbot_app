import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import logger from "../../../logger";
import { InvoiceData } from "../types/invoiceTypes";
import { TEMP_DIR, initTempDir,} from "./tempDirUtils";
import { INVOICE_CONFIG } from "./invoiceConfig";

// Función para cargar logo si existe
async function loadLogo(): Promise<Buffer | null> {
  try {
    const logoPath = path.join(process.cwd(), INVOICE_CONFIG.document.logoPath);
    if (await fs.pathExists(logoPath)) {
      return await fs.readFile(logoPath);
    }
    
    // Intentar con otros formatos
    for (const format of INVOICE_CONFIG.document.logoFormats) {
      const altLogoPath = path.join(process.cwd(), 'assets', 'images', format);
      if (await fs.pathExists(altLogoPath)) {
        return await fs.readFile(altLogoPath);
      }
    }
    
    return null;
  } catch (error) {
    logger.warn('No se pudo cargar el logo:', error);
    return null;
  }
}

// Función para formatear números según la configuración
function formatCurrency(amount: number): string {
  const { currencySymbol, decimalSeparator, thousandsSeparator, decimalPlaces } = INVOICE_CONFIG.numberFormat;
  const formatted = amount.toFixed(decimalPlaces);
  const [whole, decimal] = formatted.split('.');
  
  // Agregar separadores de miles
  const wholeWithSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  return `${currencySymbol}${wholeWithSeparators}${decimalSeparator}${decimal}`;
}

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
  const doc = new PDFDocument({ 
    margin: INVOICE_CONFIG.document.margin,
    size: INVOICE_CONFIG.document.pageSize,
    autoFirstPage: true
  });

  // Pipe el PDF a un archivo en disco
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Cargar logo
  const logoBuffer = await loadLogo();

  // ===== CABECERA MEJORADA =====
  drawHeader(doc, invoiceNumber, fechaFormateada, logoBuffer);

  // ===== INFORMACIÓN DEL CLIENTE =====
  drawCustomerInfo(doc, cliente);

  // ===== TABLA DE PRODUCTOS MEJORADA =====
  const tableEndY = drawProductsTable(doc, items);

  // ===== SECCIÓN DE TOTALES MEJORADA =====
  drawTotalsSection(doc, items, tableEndY);

  // ===== CÓDIGO QR SIMULADO =====
  if (INVOICE_CONFIG.qrCode.enabled) {
    drawQRCode(doc, invoiceNumber);
  }

  // ===== PIE DE PÁGINA MEJORADO =====
  drawFooter(doc);

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

function drawHeader(doc: PDFKit.PDFDocument, invoiceNumber: string, fechaFormateada: string, logoBuffer: Buffer | null) {
  const { colors, document, fonts, fontSizes, company } = INVOICE_CONFIG;
  
  // Fondo de cabecera con gradiente simulado (reducido)
  doc.rect(0, 0, doc.page.width, 100)
     .fill(colors.light);
  
  // Logo real o simulado (más pequeño)
  if (logoBuffer) {
    try {
      // Insertar logo real
      doc.image(logoBuffer, 25, 25, { width: 45, height: 45 });
    } catch (error) {
      logger.warn('Error al insertar logo, usando logo simulado:', error);
      drawSimulatedLogo(doc);
    }
  } else {
    drawSimulatedLogo(doc);
  }
  
  // Título principal con sombra (más pequeño)
  doc.fontSize(fontSizes.title - 2)
     .fillColor(colors.primary)
     .font(fonts.title)
     .text(document.title, 85, 25);
  
  doc.fontSize(fontSizes.subtitle - 2)
     .fillColor(colors.secondary)
     .font(fonts.subtitle)
     .text(company.name, 85, 45);
  
  // Información de la factura (lado derecho)
  const rightX = 380;
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('Nº Factura:', rightX, 30);
  doc.fontSize(fontSizes.sectionTitle - 2)
     .fillColor(colors.accent)
     .font(fonts.emphasis)
     .text(invoiceNumber, rightX + 70, 30);
  
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('Fecha:', rightX, 50);
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .text(fechaFormateada, rightX + 45, 50);
  
  // Línea divisoria con efecto
  doc.moveTo(document.margin, 110)
     .lineTo(doc.page.width - document.margin, 110)
     .strokeColor(colors.accent)
     .lineWidth(2)
     .stroke();
  
  doc.y = 125;
}

function drawSimulatedLogo(doc: PDFKit.PDFDocument) {
  const { colors, fonts, fontSizes } = INVOICE_CONFIG;
  
  // Logo simulado mejorado (más pequeño)
  doc.circle(47, 47, 22)
     .fill(colors.primary);
  doc.circle(47, 47, 22)
     .strokeColor(colors.accent)
     .lineWidth(1.5)
     .stroke();
  doc.fontSize(fontSizes.sectionTitle - 2)
     .fillColor('white')
     .font(fonts.emphasis)
     .text('MT', 40, 40, { align: 'center' });
}

function drawCustomerInfo(doc: PDFKit.PDFDocument, cliente: any) {
  const { colors, fonts, fontSizes, document } = INVOICE_CONFIG;
  
  // Contenedor de información del cliente (más compacto)
  const containerX = document.margin;
  const containerY = doc.y;
  const containerWidth = 520;
  const containerHeight = 90; // Aumentado para incluir cédula
  
  // Fondo del contenedor
  doc.rect(containerX - 3, containerY - 3, containerWidth + 6, containerHeight + 6)
     .fill(colors.light)
     .strokeColor(colors.border)
     .lineWidth(0.5)
     .stroke();
  
  // Título de sección (sin línea decorativa)
  doc.fontSize(fontSizes.sectionTitle - 1)
     .fillColor(colors.primary)
     .font(fonts.emphasis)
     .text('DATOS DEL CLIENTE', containerX, containerY);
  
  // Información del cliente con iconos simples (sin emojis problemáticos)
  const startY = containerY + 15;
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('• Nombre:', containerX, startY);
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text(cliente.nombre, containerX + 80, startY);
  
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('• Cédula:', containerX, startY + 18);
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text(cliente.cedula || 'No especificada', containerX + 80, startY + 18);
  
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('• Dirección:', containerX, startY + 36);
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text(cliente.direccion, containerX + 80, startY + 36);
  
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.emphasis)
     .text('• Teléfono:', containerX, startY + 54);
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text(cliente.telefono, containerX + 80, startY + 54);
  
  doc.y = containerY + containerHeight + 15;
}

function drawProductsTable(doc: PDFKit.PDFDocument, items: any[]): number {
  const { colors, fonts, fontSizes, table, document } = INVOICE_CONFIG;
  
  // Título de sección
  doc.fontSize(fontSizes.sectionTitle - 1)
     .fillColor(colors.primary)
     .font(fonts.emphasis)
     .text('DETALLE DE COMPRA', document.margin, doc.y);
  
  // Línea decorativa
  doc.moveTo(document.margin, doc.y + 3)
     .lineTo(document.margin + 180, doc.y + 3)
     .strokeColor(colors.accent)
     .lineWidth(0.5)
     .stroke();
  
  doc.y += 15;
  
  // Encabezado de tabla
  const tableTop = doc.y;
  const itemX = document.margin;
  const descriptionX = itemX + 35;
  const quantityX = descriptionX + 220;
  const priceX = quantityX + 50;
  const amountX = priceX + 70;
  
  // Fondo del encabezado con gradiente (más compacto)
  doc.rect(itemX - 3, tableTop - 3, 520, table.headerHeight - 5)
     .fill(colors.primary);
  
  doc.fontSize(fontSizes.small - 1)
     .fillColor('white')
     .font(fonts.emphasis)
     .text("Ítem", itemX, tableTop);
  doc.text("Descripción", descriptionX, tableTop);
  doc.text("Cant.", quantityX, tableTop);
  doc.text("Precio", priceX, tableTop);
  doc.text("Total", amountX, tableTop);
  
  let tableRow = tableTop + table.headerHeight;
  
  // Detalle de productos
  let subtotal = 0;
  items.forEach((item, index) => {
    const itemTotal = item.precio * item.cantidad;
    subtotal += itemTotal;
    
    // Fondo alternado para filas (más compacto)
    if (table.alternateRowColor && index % 2 === 0) {
      doc.rect(itemX - 3, tableRow - 2, 520, table.rowHeight - 5)
         .fill(colors.light);
    }
    
    doc.fontSize(fontSizes.small - 1)
       .fillColor(colors.dark)
       .font(fonts.emphasis)
       .text(`${index + 1}`, itemX, tableRow);
    
    doc.fontSize(fontSizes.small - 1)
       .fillColor(colors.dark)
       .font(fonts.body)
       .text(`${item.nombre}`, descriptionX, tableRow, { width: table.columnWidths.description - 10 });
    
    doc.text(`${item.cantidad}`, quantityX, tableRow);
    doc.text(formatCurrency(item.precio), priceX, tableRow);
    doc.font(fonts.emphasis)
       .text(formatCurrency(itemTotal), amountX, tableRow);
    
    // Calcular altura para la siguiente fila (más compacto)
    const textHeight = doc.heightOfString(`${item.nombre}`, { width: table.columnWidths.description - 10 });
    tableRow += Math.max(textHeight, table.rowHeight - 5);
  });
  
  // Borde de la tabla
  if (table.showBorders) {
    doc.rect(itemX - 3, tableTop - 3, 520, tableRow - tableTop + 3)
       .strokeColor(colors.border)
       .lineWidth(0.5)
       .stroke();
  }
  
  return tableRow + 15;
}

function drawTotalsSection(doc: PDFKit.PDFDocument, items: any[], tableEndY: number) {
  const { colors, fonts, fontSizes, taxes } = INVOICE_CONFIG;
  
  doc.y = tableEndY;
  
  // Calcular totales
  let subtotal = 0;
  items.forEach(item => {
    subtotal += item.precio * item.cantidad;
  });
  const iva = subtotal * (taxes.ivaRate / 100);
  const totalConIva = subtotal + iva;
  
  // Contenedor de totales (más compacto)
  const totalsX = 350;
  const totalsY = doc.y;
  const totalsWidth = 180;
  const totalsHeight = 100;
  
  // Fondo del contenedor con sombra
  doc.rect(totalsX - 8, totalsY - 8, totalsWidth + 16, totalsHeight + 16)
     .fill(colors.light)
     .strokeColor(colors.border)
     .lineWidth(0.5)
     .stroke();
  
  // Título de totales
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.primary)
     .font(fonts.emphasis)
     .text('RESUMEN DE PAGO', totalsX, totalsY, { align: 'center' });
  
  // Línea divisoria
  doc.moveTo(totalsX, totalsY + 15)
     .lineTo(totalsX + totalsWidth, totalsY + 15)
     .strokeColor(colors.accent)
     .lineWidth(0.5)
     .stroke();
  
  // Detalle de totales
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text('Subtotal:', totalsX, totalsY + 25);
  doc.text(formatCurrency(subtotal), totalsX + 100, totalsY + 25);
  
  if (taxes.showTaxBreakdown) {
    doc.text(taxes.ivaName + ':', totalsX, totalsY + 40);
    doc.text(formatCurrency(iva), totalsX + 100, totalsY + 40);
  }
  
  // Línea para el total
  doc.moveTo(totalsX, totalsY + 55)
     .lineTo(totalsX + totalsWidth, totalsY + 55)
     .strokeColor(colors.accent)
     .lineWidth(0.5)
     .stroke();
  
  // Total principal
  doc.fontSize(fontSizes.sectionTitle - 1)
     .fillColor(colors.success)
     .font(fonts.emphasis)
     .text('TOTAL:', totalsX, totalsY + 65);
  doc.fontSize(fontSizes.title - 2)
     .text(formatCurrency(totalConIva), totalsX + 100, totalsY + 65);
  
  doc.y = totalsY + totalsHeight + 20;
}

function drawQRCode(doc: PDFKit.PDFDocument, invoiceNumber: string) {
  const { colors, fonts, fontSizes, qrCode, company } = INVOICE_CONFIG;
  
  // Código QR simulado (más pequeño)
  const qrX = 40;
  const qrY = doc.y;
  const qrSize = qrCode.size - 20;
  
  // Fondo del código QR
  doc.rect(qrX, qrY, qrSize, qrSize)
     .fill('white')
     .strokeColor(colors.dark)
     .lineWidth(0.5)
     .stroke();
  
  // Patrón simulado del código QR
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (Math.random() > 0.5) {
        doc.rect(qrX + i * 10, qrY + j * 10, 10, 10)
           .fill(colors.dark);
      }
    }
  }
  
  // Texto del código QR
  doc.fontSize(fontSizes.tiny)
     .fillColor(colors.secondary)
     .font(fonts.body)
     .text('Código QR', qrX, qrY + qrSize + 3, { align: 'center' });
  
  if (qrCode.includeInvoiceNumber) {
    doc.fontSize(fontSizes.tiny)
       .fillColor(colors.secondary)
       .text(`Factura: ${invoiceNumber}`, qrX, qrY + qrSize + 15, { align: 'center' });
  }
  
  if (qrCode.includeCompanyInfo) {
    doc.fontSize(fontSizes.tiny)
       .fillColor(colors.secondary)
       .text(company.name, qrX, qrY + qrSize + 27, { align: 'center' });
  }
  
  doc.y = qrY + qrSize + 35;
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const { colors, fonts, fontSizes, messages, company, document } = INVOICE_CONFIG;
  
  // Línea divisoria
  doc.moveTo(document.margin, doc.y)
     .lineTo(doc.page.width - document.margin, doc.y)
     .strokeColor(colors.border)
     .lineWidth(0.5)
     .stroke();
  
  doc.y += 15;
  
  // Mensaje de agradecimiento
  doc.fontSize(fontSizes.sectionTitle - 1)
     .fillColor(colors.success)
     .font(fonts.emphasis)
     .text(messages.thankYou, { align: 'center' });
  
  doc.y += 8;
  
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.dark)
     .font(fonts.body)
     .text(messages.processing, { align: 'center' });
  
  doc.y += 12;
  
  // Información de contacto
  doc.fontSize(fontSizes.small - 1)
     .fillColor(colors.secondary)
     .font(fonts.emphasis)
     .text('• ' + messages.contactInfo, { align: 'center' });
  
  doc.fontSize(fontSizes.small - 1)
     .fillColor(colors.secondary)
     .font(fonts.body)
     .text(`Teléfono: ${company.phone} | WhatsApp: ${company.whatsapp}`, { align: 'center' });
  
  doc.y += 8;
  
  doc.fontSize(fontSizes.small - 1)
     .fillColor(colors.secondary)
     .font(fonts.body)
     .text(`• Dirección: ${company.name}, ${company.address}`, { align: 'center' });
  
  doc.y += 12;
  
  // Mensaje espiritual
  doc.fontSize(fontSizes.body - 1)
     .fillColor(colors.primary)
     .font(fonts.emphasis)
     .text(messages.spiritualMessage, { align: 'center' });
  
  // Pie de página con información adicional
  doc.fontSize(fontSizes.tiny)
     .fillColor(colors.secondary)
     .font(fonts.body)
     .text(messages.footerNote, { align: 'center' });
}