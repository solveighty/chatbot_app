import { MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService } from '../../../interfaces/services';
import { DataValidator } from '../../../utils/validators';
import { InvoiceGenerator } from '../../../utils/invoiceGenerator';
import fs from 'fs-extra';
import logger from '../../../utils/logger';
import { OrderService } from '../../orderService';

export class CheckoutProcessor {
  constructor(
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly productService: IProductService,
    private readonly orderService: OrderService
  ) {}

  public async procesarCheckout(userId: string, mensaje: string): Promise<string | { text: string, invoiceMedia?: MessageMedia }> {
    const state = this.stateManager.getState(userId);
    const { etapaPedido } = state;
    const carrito = this.cartService.getCart(userId);

    if (etapaPedido === 'datos_cliente') {
      const datosCliente = DataValidator.validarDatosCliente(mensaje);

      if (!datosCliente.valido) {
        return `❌ *Los datos proporcionados no son válidos*\n\n` +
               `Por favor, proporciona la siguiente información en formato correcto:\n\n` +
               `1️⃣ *Tu nombre completo* (mínimo 3 caracteres)\n` +
               `2️⃣ *Tu dirección de entrega* (o indica si recogerás en el Monasterio)\n` +
               `3️⃣ *Tu número de teléfono* (formato válido)\n\n` +
               `Ejemplo:\n` +
               `María Pérez\n` +
               `Calle Principal 123, Ciudad\n` +
               `0991234567`;
      }

      this.stateManager.updateState(userId, {
        datosCliente: datosCliente,
        datosClienteTexto: mensaje,
        etapaPedido: 'confirmacion',
      });

      let resumen = `¡Gracias por proporcionar tus datos!\n\n*Resumen de tu pedido:*\n\n`;

      carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        const precioFormateado = item.precio.toFixed(2).replace('.', ',');
        const subtotalFormateado = subtotal.toFixed(2).replace('.', ',');

        resumen += `${index + 1}. ${item.nombre} (${item.categoria})\n` +
                  `   $${precioFormateado} x ${item.cantidad} = $${subtotalFormateado}\n\n`;
      });

      const total = this.cartService.getCartTotal(userId);
      const totalFormateado = total.toFixed(2).replace('.', ',');

      resumen += `💰 *Total a pagar: $${totalFormateado}*\n\n`;
      resumen += `👤 *Datos del cliente:*\n`;
      resumen += `📝 Nombre: ${datosCliente.nombre}\n`;
      resumen += `🏠 Dirección: ${datosCliente.direccion}\n`;
      resumen += `📱 Teléfono: ${datosCliente.telefono}\n\n`;
      resumen += `¿Deseas confirmar este pedido? Responde con *SI* para confirmar o *NO* para cancelar.`;

      return resumen;
    }

    if (etapaPedido === 'confirmacion') {
      if (mensaje.toLowerCase() === 'si' || mensaje.toLowerCase() === 'sí') {
        try {
          const datosCliente = state.datosCliente;
          const invoiceNumber = InvoiceGenerator.generateInvoiceNumber();

          const invoiceData = {
            cliente: {
              nombre: datosCliente.nombre,
              direccion: datosCliente.direccion,
              telefono: datosCliente.telefono,
            },
            items: carrito,
            total: this.cartService.getCartTotal(userId),
            fecha: new Date(),
            invoiceNumber: invoiceNumber,
          };

          this.orderService.saveOrder({
            orderId: invoiceNumber,
            clientName: datosCliente.nombre,
            clientAddress: datosCliente.direccion,
            clientPhone: datosCliente.telefono,
            items: carrito,
            total: this.cartService.getCartTotal(userId),
            status: 'pending',
            date: new Date().toISOString(),
            notes: `Pedido realizado por WhatsApp (${userId})`
          });

          const pdfPath = await InvoiceGenerator.generateInvoicePDF(invoiceData);
          const pdfBuffer = fs.readFileSync(pdfPath);
          const invoiceMedia = new MessageMedia(
            'application/pdf',
            pdfBuffer.toString('base64'),
            `factura-${invoiceNumber}.pdf`
          );

          this.stateManager.updateState(userId, {
            lastCategory: 'pedido_completo',
            etapaPedido: 'completado',
            facturaNumero: invoiceNumber,
            facturaPath: pdfPath
          });

          const total = this.cartService.getCartTotal(userId);
          const totalFormateado = total.toFixed(2).replace('.', ',');

          this.cartService.clearCart(userId);

          setTimeout(() => {
            InvoiceGenerator.cleanupOldInvoices(24);
          }, 60000);

          return {
            text: `✅ *¡Pedido confirmado!*\n\n` +
                `Tu pedido Nº ${invoiceNumber} por un total de $${totalFormateado} ha sido registrado a nombre de ${datosCliente.nombre}.\n\n` +
                `Una hermana del monasterio se pondrá en contacto contigo al ${datosCliente.telefono} pronto para coordinar el pago y la entrega.\n\n` +
                `A continuación te enviamos tu factura digital en formato PDF.\n\n` +
                `¡Gracias por tu compra! Dios te bendiga.`,
            invoiceMedia: invoiceMedia
          };
        } catch (error) {
          logger.error(`Error al generar factura PDF: ${error}`);

          return `✅ *¡Pedido confirmado!*\n\n` +
                `Tu pedido ha sido registrado correctamente a nombre de ${state.datosCliente.nombre}.\n\n` +
                `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
                `¡Gracias por tu compra! Dios te bendiga.`;
        }
      } else {
        this.cartService.clearCart(userId);

        this.stateManager.updateState(userId, {
          lastCategory: 'pedido_cancelado',
        });

        return `❌ *Pedido cancelado*\n\n` +
               `Has cancelado tu pedido. Tu carrito ha sido vaciado.\n\n` +
               `Si deseas realizar otra consulta o pedido, estamos a tu disposición.`;
      }
    }

    return `Por favor, proporciona la información solicitada para continuar con tu pedido.`;
  }
}