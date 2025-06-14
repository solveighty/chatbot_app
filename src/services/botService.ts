import { Message, MessageMedia } from 'whatsapp-web.js';
import { ResponseService } from './responseService';
import { ProductService } from './productService';
import logger from '../utils/logger';

export class BotService {
  private responseService: ResponseService;
  private productService: ProductService;
  private conversationState: Map<string, any>;

  constructor() {
    this.responseService = new ResponseService();
    this.productService = new ProductService();
    this.conversationState = new Map();
  }

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}"`);
      
      // manejo de comando ayuda
      if (userMessageLower === 'ayuda' || 
          userMessageLower === 'help' || 
          userMessageLower === 'como comprar' ||
          userMessageLower === 'cómo comprar') {
        return this.responseService.getHelpMessage();
      }

      // manejo de intención de compra
      if (userMessageLower.includes('quiero comprar') || 
          userMessageLower.includes('comprar') || 
          userMessageLower.includes('pedir')) {
        const resultado = this.productService.procesarPedido(userMessage);
        
        if (resultado.encontrado && resultado.producto) {
          // se guarda el estado del pedido en la conversación
          this.updateConversationState(userId, { 
            lastCategory: 'pedido_en_proceso', 
            productoPedido: resultado.producto,
            etapaPedido: 'datos_cliente',
            timestamp: new Date()
          });
        }
        
        return resultado.texto;
      }
      
      // se maneja la búsqueda de productos
      if (userMessageLower.includes('buscar producto') || 
          userMessageLower.includes('buscar')) {
        const termino = userMessageLower
          .replace('buscar producto', '')
          .replace('buscar', '')
          .trim();
        
        if (termino.length < 3) {
          return "Por favor, especifica qué producto deseas buscar. Ejemplo: 'buscar miel'";
        }
        
        return this.productService.buscarProductos(termino);
      }
      
      // se maneja el flujo de pedidos en proceso
      const state = this.getConversationState(userId);
      if (state && state.lastCategory === 'pedido_en_proceso') {
        return this.procesarEtapaPedido(userId, userMessage, state);
      }
      
      // comandos especiales
      if (userMessageLower.includes('ver productos')) {
        return this.productService.generarListaProductos();
      }
      
      if (userMessageLower.includes('ver imágenes') || userMessageLower.includes('ver imagenes')) {
        this.updateConversationState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
        return this.productService.generarMenuCategorias();
      }
      
      // se verifica si el usuario está intentando seleccionar una categoría
      if (state && state.lastCategory === 'menu_categorias') {
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // si el usuario intenta seleccionar una categoría sin haber visto el menú
      if ((/^\d+$/.test(userMessageLower) || this.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        // se asume que el usuario quiere ver categorías
        this.updateConversationState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // si no se reconoce el mensaje, se determina la categoría
      const category = this.responseService.determineCategory(userMessage);
      
      // si el usuario intenta seleccionar una categoría de productos
      if (category === 'productos') {
        this.updateConversationState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
      } else {
        this.updateConversationState(userId, { lastCategory: category, timestamp: new Date() });
      }
      
      return this.responseService.getRandomResponse(category);
    } catch (error) {
      logger.error(`Error al generar respuesta: ${error}`);
      return "Lo siento, ocurrió un error al procesar tu mensaje.";
    }
  }

  /**
   * Procesa las diferentes etapas de un pedido
   */
  private procesarEtapaPedido(userId: string, mensaje: string, estado: any): string {
    const { etapaPedido, productoPedido } = estado;
    
    if (etapaPedido === 'datos_cliente') {
      // se recibe la información del cliente
      
      this.updateConversationState(userId, {
        datosCliente: mensaje,
        etapaPedido: 'confirmacion',
      });
      
      return `¡Gracias por proporcionar tus datos!\n\n` +
             `*Resumen de tu pedido:*\n` +
             `📦 Producto: ${productoPedido.nombre}\n` +
             `💰 Precio: $${productoPedido.precio.toFixed(2).replace('.', ',')}\n` +
             `👤 Datos proporcionados: ${mensaje}\n\n` +
             `¿Deseas confirmar este pedido? Responde con *SI* para confirmar o *NO* para cancelar.`;
    }
    
    if (etapaPedido === 'confirmacion') {
      if (mensaje.toLowerCase() === 'si' || mensaje.toLowerCase() === 'sí') {
        // En una implementación real, aquí se guardaría el pedido en una base de datos
        this.updateConversationState(userId, {
          lastCategory: 'pedido_completo',
          etapaPedido: 'completado'
        });
        
        return `✅ *¡Pedido confirmado!*\n\n` +
               `Tu pedido de *${productoPedido.nombre}* ha sido registrado.\n\n` +
               `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
               `¡Gracias por tu compra! Dios te bendiga.`;
      } else {
        this.updateConversationState(userId, {
          lastCategory: 'pedido_cancelado',
        });
        
        return `❌ *Pedido cancelado*\n\n` +
               `Has cancelado tu pedido de ${productoPedido.nombre}.\n\n` +
               `Si deseas realizar otra consulta o pedido, estamos a tu disposición.`;
      }
    }
    
    return `Por favor, proporciona la información solicitada para continuar con tu pedido de ${productoPedido.nombre}.`;
  }

  public updateConversationState(userId: string, state: any): void {
    const currentState = this.conversationState.get(userId) || {};
    this.conversationState.set(userId, {
      ...currentState,
      ...state
    });
  }

  public getConversationState(userId: string): any {
    return this.conversationState.get(userId);
  }

  /**
   * Verifica si un mensaje podría ser el nombre de una categoría
   */
  private esPosibleCategoria(mensaje: string): boolean {
    const categorias = this.productService.getCategorias();
    return categorias.some(categoria => 
      mensaje.toLowerCase().includes(categoria.toLowerCase())
    );
  }
}