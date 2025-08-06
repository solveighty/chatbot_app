import { IConversationStateManager, ICartService } from '../../../../../interfaces/services';
import { MessageMedia } from 'whatsapp-web.js';
import { InvoiceGenerator } from '../../../../../utils/invoiceGenerator';
import { OrderService } from '../../../../orderService';
import { generarYEnviarFacturaPDF } from '../checkoutProcessor/facturaUtils';
import { generarResumenPedido } from '../checkoutProcessor/pedidoUtils';
import {
  MENSAJE_PEDIDO_CONFIRMADO,
  MENSAJE_PEDIDO_CONFIRMADO_SIMPLE,
  MENSAJE_PEDIDO_CANCELADO,
  MENSAJE_CON_FACTURA
} from '../checkoutProcessor/messages/checkoutMessages';
import logger from '../../../../../utils/logger';

export class CheckoutHandler {
  constructor(
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly orderService: OrderService
  ) {}

  public async handleCheckout(userId: string, userMessage: string, state: any): Promise<string | { text: string, invoiceMedia?: MessageMedia, invoiceCaption?: string }> {
    const userMessageLower = userMessage.toLowerCase();

    // Si el usuario está en estado de solicitud de nombre para checkout
    if (state && state.lastCategory === 'solicitar_nombre_checkout') {
      return this.handleNameInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de cédula para checkout
    if (state && state.lastCategory === 'solicitar_cedula_checkout') {
      return this.handleCedulaInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de teléfono para checkout
    if (state && state.lastCategory === 'solicitar_telefono_checkout') {
      return this.handlePhoneInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de solicitud de dirección para checkout
    if (state && state.lastCategory === 'solicitar_direccion_checkout') {
      return this.handleAddressInput(userId, userMessage, state);
    }

    // Si el usuario está en estado de confirmación
    if (state && state.lastCategory === 'confirmacion_checkout') {
      return await this.handleConfirmation(userId, userMessage, state);
    }

    // Iniciar proceso de checkout
    const carrito = this.cartService.getCart(userId);
    if (carrito.length === 0) {
      return "❌ Tu carrito está vacío. Añade productos antes de finalizar la compra.";
    }

    // Iniciar proceso de recolección de datos
    this.stateManager.updateState(userId, {
      lastCategory: 'solicitar_nombre_checkout',
      timestamp: new Date()
    });

    return `🛒 *Finalizar*\n\n` +
           `📝 *Para procesar tu pedido, necesito algunos datos:*\n\n` +
           `👤 *Por favor, escribe tu nombre completo:*\n\n` +
           `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
  }

  private handleNameInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Compra cancelada*\n\n` +
             `No se finalizó la compra.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `�� Escribe *finalizar* cuando estés listo.`;
    }

    if (userMessage.trim().length < 3) {
      return `❌ Por favor, escribe tu nombre completo (mínimo 3 caracteres).\n\n` +
             `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
    }

    // Guardar nombre y solicitar cédula
    this.stateManager.updateState(userId, {
      ...state,
      lastCategory: 'solicitar_cedula_checkout',
      userName: userMessage.trim(),
      timestamp: new Date()
    });

    return `✅ *Nombre registrado:* ${userMessage.trim()}\n\n` +
           `🆔 *Ahora escribe tu número de cédula:*\n\n` +
           `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
  }

  private handleCedulaInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Compra cancelada*\n\n` +
             `No se finalizó la compra.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `💳 Escribe *finalizar* cuando estés listo.`;
    }

    const cedula = userMessage.trim();
    
    // Validar formato de cédula (10 dígitos)
    if (!/^\d{10}$/.test(cedula)) {
      return `❌ Por favor, escribe tu número de cédula (10 dígitos).\n\n` +
             `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
    }

    // Guardar cédula y solicitar teléfono
    this.stateManager.updateState(userId, {
      ...state,
      lastCategory: 'solicitar_telefono_checkout',
      userCedula: cedula,
      timestamp: new Date()
    });

    return `✅ *Cédula registrada:* ${cedula}\n\n` +
           `📞 *Ahora escribe tu número de teléfono:*\n\n` +
           `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
  }

  private handlePhoneInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Compra cancelada*\n\n` +
             `No se finalizó la compra.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `💳 Escribe *finalizar* cuando estés listo.`;
    }

    const telefono = userMessage.trim();
    
    // Validar formato de teléfono (10 dígitos)
    if (!/^\d{10}$/.test(telefono)) {
      return `❌ Por favor, escribe tu número de teléfono (10 dígitos).\n\n` +
             `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
    }

    // Guardar teléfono y solicitar dirección
    this.stateManager.updateState(userId, {
      ...state,
      lastCategory: 'solicitar_direccion_checkout',
      userTelefono: telefono,
      timestamp: new Date()
    });

    return `✅ *Teléfono registrado:* ${telefono}\n\n` +
           `📍 *Ahora escribe tu dirección de entrega:*\n\n` +
           `📦 *Nota:* Esta dirección es para entregas nacionales o internacionales.\n` +
           `🏛️ Si deseas retirar en el monasterio, escribe *retirar en monasterio*.\n\n` +
           `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
  }

  private handleAddressInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Compra cancelada*\n\n` +
             `No se finalizó la compra.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `�� Escribe *finalizar* cuando estés listo.`;
    }

    // Verificar si el usuario quiere retirar en el monasterio
    if (userMessageLower.includes('retirar') || userMessageLower.includes('monasterio')) {
      return this.processCompleteCheckout(userId, state, 'Retirar en monasterio');
    }

    if (userMessage.trim().length < 5) {
      return `❌ Por favor, escribe una dirección válida (mínimo 5 caracteres).\n\n` +
             `🏛️ O escribe *retirar en monasterio* si deseas recoger en el monasterio.\n\n` +
             `❌ O escribe *cancelar* para salir sin finalizar la compra.`;
    }

    // Procesar la dirección completa
    return this.processCompleteCheckout(userId, state, userMessage.trim());
  }

  private processCompleteCheckout(userId: string, state: any, direccion: string): string {
    const carrito = this.cartService.getCart(userId);
    const total = this.cartService.getCartTotal(userId);

    // Crear objeto de datos del cliente
    const datosCliente = {
      nombre: state.userName,
      cedula: state.userCedula,
      telefono: state.userTelefono,
      direccion: direccion
    };

    // Generar resumen del pedido
    const resumen = generarResumenPedido(carrito, datosCliente, total);

    // Actualizar estado para confirmación
    this.stateManager.updateState(userId, {
      lastCategory: 'confirmacion_checkout',
      datosCliente: datosCliente,
      timestamp: new Date()
    });

    return resumen;
  }

  private async handleConfirmation(userId: string, userMessage: string, state: any): Promise<string | { text: string, invoiceMedia?: MessageMedia, invoiceCaption?: string }> {
    const userMessageLower = userMessage.toLowerCase();

    if (userMessageLower === 'si' || userMessageLower === 'sí') {
      try {
        const datosCliente = state.datosCliente;
        const carrito = this.cartService.getCart(userId);
        const total = this.cartService.getCartTotal(userId);
        const invoiceNumber = InvoiceGenerator.generateInvoiceNumber();

        const invoiceData = {
          cliente: {
            nombre: datosCliente.nombre,
            cedula: datosCliente.cedula,
            direccion: datosCliente.direccion,
            telefono: datosCliente.telefono,
          },
          items: carrito,
          total: total,
          fecha: new Date(),
          invoiceNumber: invoiceNumber,
        };

        // Guardar orden
        this.orderService.saveOrder({
          orderId: invoiceNumber,
          clientName: datosCliente.nombre,
          clientCedula: datosCliente.cedula,
          clientAddress: datosCliente.direccion,
          clientPhone: datosCliente.telefono,
          items: carrito,
          total: total,
          status: 'pending',
          date: new Date().toISOString(),
          notes: `Pedido realizado por WhatsApp (${userId})`
        });

        // Generar factura PDF
        const { invoiceMedia, pdfPath } = await generarYEnviarFacturaPDF(invoiceData, invoiceNumber);

        // Actualizar estado
        this.stateManager.updateState(userId, {
          lastCategory: 'pedido_completo',
          facturaNumero: invoiceNumber,
          facturaPath: pdfPath,
          timestamp: new Date()
        });

        // Limpiar carrito
        this.cartService.clearCart(userId);

        const totalFormateado = total.toFixed(2).replace('.', ',');

        // Limpiar facturas antiguas después de 1 minuto
        setTimeout(() => {
          InvoiceGenerator.cleanupOldInvoices(24);
        }, 60000);

        return {
          text: MENSAJE_PEDIDO_CONFIRMADO(invoiceNumber, totalFormateado, datosCliente.nombre, datosCliente.telefono),
          invoiceMedia: invoiceMedia,
          invoiceCaption: MENSAJE_CON_FACTURA
        };
      } catch (error) {
        logger.error(`Error al generar factura PDF: ${error}`);
        return MENSAJE_PEDIDO_CONFIRMADO_SIMPLE(state.datosCliente.nombre);
      }
    } else {
      // Cancelar pedido
      this.cartService.clearCart(userId);
      this.stateManager.updateState(userId, {
        lastCategory: 'pedido_cancelado',
        timestamp: new Date()
      });
      return MENSAJE_PEDIDO_CANCELADO;
    }
  }
} 