import { MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService } from '../../../interfaces/services';
import { DataValidator } from '../../../utils/validators';
import { InvoiceGenerator } from '../../../utils/invoiceGenerator';
import fs from 'fs-extra';
import logger from '../../../utils/logger';
import { OrderService } from '../../orderService';
import { generarYEnviarFacturaPDF } from './handler/checkoutProcessor/facturaUtils';
import { generarResumenPedido } from './handler/checkoutProcessor/pedidoUtils';
import {
  MENSAJE_DATOS_INVALIDOS,
  MENSAJE_PEDIDO_CONFIRMADO,
  MENSAJE_PEDIDO_CONFIRMADO_SIMPLE,
  MENSAJE_PEDIDO_CANCELADO,
  MENSAJE_SOLICITAR_INFO
} from './handler/checkoutProcessor/messages/checkoutMessages';
import { PedidoStateUtils } from './handler/checkoutProcessor/pedidoStateUtils';

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
        return MENSAJE_DATOS_INVALIDOS;
      }

      PedidoStateUtils.actualizarEstado(this.stateManager, userId, {
        datosCliente: datosCliente,
        datosClienteTexto: mensaje,
        etapaPedido: 'confirmacion',
      });

      const total = this.cartService.getCartTotal(userId);
      return generarResumenPedido(carrito, datosCliente, total);
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

          // Usa la utilidad aquí
          const { invoiceMedia, pdfPath } = await generarYEnviarFacturaPDF(invoiceData, invoiceNumber);

          PedidoStateUtils.actualizarEstado(this.stateManager, userId, {
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
            text: MENSAJE_PEDIDO_CONFIRMADO(invoiceNumber, totalFormateado, datosCliente.nombre, datosCliente.telefono),
            invoiceMedia: invoiceMedia
          };
        } catch (error) {
          logger.error(`Error al generar factura PDF: ${error}`);

          return MENSAJE_PEDIDO_CONFIRMADO_SIMPLE(state.datosCliente.nombre);
        }
      } else {
        this.cartService.clearCart(userId);

        this.stateManager.updateState(userId, {
          lastCategory: 'pedido_cancelado',
        });

        return MENSAJE_PEDIDO_CANCELADO;
      }
    }
    return MENSAJE_SOLICITAR_INFO;
  }
}