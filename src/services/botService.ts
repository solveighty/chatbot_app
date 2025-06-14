import { Message, MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService, IResponseService } from '../interfaces/services';
import { CommandHandler } from '../handlers/commandHandler';
import logger from '../utils/logger';

export class BotService {
  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler
  ) {}

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}"`);
      
      // se verifica si el mensaje es un comando
      const commandResult = await this.commandHandler.handleCommand(
        userMessage, 
        userId, 
        this.stateManager.getState(userId)
      );
      
      if (commandResult.response) {
        // si hay actualizaciones de estado, las aplicamos
        if (commandResult.stateUpdates) {
          this.stateManager.updateState(userId, commandResult.stateUpdates);
        }
        return commandResult.response;
      }
      
      // se verifica si es comando de carrito
      const cartCommandResult = await this.commandHandler.handleCartCommands(userMessage, userId);
      if (cartCommandResult?.response) {
        return cartCommandResult.response;
      }
      
      // lógica de compra
      if (userMessageLower.includes('quiero comprar') || 
          userMessageLower.includes('comprar') || 
          userMessageLower.includes('pedir')) {
        const resultado = this.productService.procesarPedido(userMessage);
        
        if (resultado.encontrado && resultado.producto) {
          this.cartService.addItemToCart(userId, resultado.producto, 1);
          
          return `✅ *Producto añadido al carrito:*\n\n` +
                 `📦 ${resultado.producto.nombre}\n` +
                 `💰 Precio: $${resultado.producto.precio.toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${resultado.producto.categoria}\n\n` +
                 `🛒 Escribe *carrito* para ver todos los productos seleccionados.\n` +
                 `➕ Puedes seguir añadiendo más productos escribiendo *quiero comprar [producto]*.\n` +
                 `✅ Cuando termines, escribe *finalizar compra* para proceder al pago.`;
        }
        
        return resultado.texto;
      }

      // se verifica el estado actual de la conversación
      const state = this.stateManager.getState(userId);
      
      // estado checkout
      if (state && state.lastCategory === 'checkout') {
        return this.procesarCheckout(userId, userMessage);
      }
      
      // estado de selección de cat images
      if (state && state.lastCategory === 'menu_categorias') {
        // si el mensaje parece ser un nombre de producto específico
        const categoriaActual = state.categoriaSeleccionada;
        if (categoriaActual) {
          const productoSeleccionado = this.productService.buscarProductoEnCategoria(categoriaActual, userMessage);
          
          if (productoSeleccionado) {
            // el usuario ha seleccionado un producto específico después de ver una categoría
            return {
              text: `¿Deseas comprar ${productoSeleccionado.nombre}?\n\n` +
                    `Para añadir al carrito, escribe: *quiero comprar ${productoSeleccionado.nombre}*`,
              media: await this.productService.obtenerImagenProducto(productoSeleccionado)
            };
          }
        }
        
        // procesar la selección de categoría
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          // guardar la categoría seleccionada en el estado para futuras consultas
          this.stateManager.updateState(userId, { 
            categoriaSeleccionada: userMessage 
          });
          
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // manejo de mensajes por número o categoría sin context previo
      if ((/^\d+$/.test(userMessageLower) || this.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        // se asume que el usuario intenta seleccionar una categoría sin ver el menú primero
        this.stateManager.updateState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // última opción: respuesta genérica según categoría detectada
      const category = this.responseService.determineCategory(userMessage);
      
      // actualizar estado según la categoría detectada
      if (category === 'productos') {
        this.stateManager.updateState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
      } else {
        this.stateManager.updateState(userId, { lastCategory: category, timestamp: new Date() });
      }
      
      return this.responseService.getRandomResponse(category);
    } catch (error) {
      logger.error(`Error al generar respuesta: ${error}`);
      return "Lo siento, ocurrió un error al procesar tu mensaje.";
    }
  }
  
  /**
   * Procesa el checkout del pedido
   */
  private procesarCheckout(userId: string, mensaje: string): string {
    const state = this.stateManager.getState(userId);
    const { etapaPedido } = state;
    const carrito = this.cartService.getCart(userId);
    
    if (etapaPedido === 'datos_cliente') {
      // guardar los datos del cliente
      this.stateManager.updateState(userId, {
        datosCliente: mensaje,
        etapaPedido: 'confirmacion',
      });
      
      // generar resumen del pedido
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
      resumen += `👤 *Datos proporcionados:*\n${mensaje}\n\n`;
      resumen += `¿Deseas confirmar este pedido? Responde con *SI* para confirmar o *NO* para cancelar.`;
      
      return resumen;
    }
    
    if (etapaPedido === 'confirmacion') {
      if (mensaje.toLowerCase() === 'si' || mensaje.toLowerCase() === 'sí') {        
        // limpiar el carrito después de la compra
        const total = this.cartService.getCartTotal(userId);
        const totalFormateado = total.toFixed(2).replace('.', ',');
        this.cartService.clearCart(userId);
        
        this.stateManager.updateState(userId, {
          lastCategory: 'pedido_completo',
          etapaPedido: 'completado'
        });
        
        return `✅ *¡Pedido confirmado!*\n\n` +
               `Tu pedido por un total de $${totalFormateado} ha sido registrado.\n\n` +
               `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
               `¡Gracias por tu compra! Dios te bendiga.`;
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

  private esPosibleCategoria(mensaje: string): boolean {
    const categorias = this.productService.getCategorias();
    return categorias.some(categoria => 
      mensaje.toLowerCase().includes(categoria.toLowerCase())
    );
  }
}