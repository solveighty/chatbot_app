import { InvoiceData } from "../types/invoiceTypes";

export function generateInvoiceText(data: InvoiceData): string {
  const { cliente, items, total, fecha, invoiceNumber } = data;

  // Formato de fecha: DD/MM/YYYY HH:MM
  const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Cabecera de la factura
  let factura = `*FACTURA PARA RETIRO*\n` +
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