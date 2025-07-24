import { Message, MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService, IResponseService } from '../../../interfaces/services';
import { CommandHandler } from '../../../handlers/commandHandler';
import logger from '../../../utils/logger';
import { BotService } from '../../botService';
import { OrderService } from '../../orderService';

export class BotResponder {
  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler,
    private readonly orderService: OrderService,
    private readonly botService: BotService // para acceder a métodos auxiliares como procesarCheckout y esPosibleCategoria
  ) {}

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}" de usuario: ${userId}`);
      
      // se verifica el estado actual de la conversación antes de cualquier procesamiento
      const state = this.stateManager.getState(userId);
      
      // procesar respuesta a solicitud de cantidad (mayor prioridad)
      if (state && state.lastCategory === 'solicitar_cantidad') {
        // intentar obtener un número válido
        const cantidad = parseInt(userMessage);
        
        if (isNaN(cantidad) || cantidad <= 0) {
          return `Por favor, indica una cantidad válida usando solo números.\n` +
                 `Ejemplo: *2* para añadir dos unidades.`;
        }
        
        // si tenemos un número válido, añadir al carrito
        const producto = state.productoSeleccionado;
        if (producto) {
          this.cartService.addItemToCart(userId, producto, cantidad);
          
          // actualizar el estado para salir del flujo de solicitud de cantidad
          this.stateManager.updateState(userId, {
            lastCategory: 'producto_agregado',
            lastProductAdded: producto,
            timestamp: new Date()
          });
          
          return `✅ *Producto añadido al carrito:*\n\n` +
                 `📦 ${producto.nombre}\n` +
                 `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')} x ${cantidad} = $${(producto.precio * cantidad).toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${producto.categoria}\n\n` +
                 `🛒 Escribe *carrito* para ver todos los productos seleccionados.\n` +
                 `➕ Puedes seguir añadiendo más productos escribiendo *quiero comprar [producto]*.\n` +
                 `✅ Cuando termines, escribe *finalizar compra* para proceder al pago.`;
        } else {
          // si por alguna razón no tenemos el producto en el estado
          return `Lo siento, ha ocurrido un error. Por favor, intenta seleccionar el producto nuevamente.`;
        }
      }
      
      // a partir de aquí continúa con el flujo normal
      // verificar si es un comando...
      const commandResult = await this.commandHandler.handleCommand(
        userMessage, 
        userId, 
        state
      );
      
      if (commandResult.response) {
        // si hay actualizaciones de estado, las aplicamos
        if (commandResult.stateUpdates) {
          this.stateManager.updateState(userId, commandResult.stateUpdates);
        }
        return commandResult.response;
      }
      
      // verificar si es comando de carrito
      const cartCommandResult = await this.commandHandler.handleCartCommands(userMessage, userId);
      if (cartCommandResult?.response) {
        // si hay actualizaciones de estado, las aplicamos
        if (cartCommandResult.stateUpdates) {
          this.stateManager.updateState(userId, cartCommandResult.stateUpdates);
        }
        return cartCommandResult.response;
      }
      
      // lógica de compra
      if (userMessageLower.includes('quiero comprar') || 
          userMessageLower.includes('comprar') || 
          userMessageLower.includes('pedir')) {
        const resultado = this.productService.procesarPedido(userMessage);
        
        if (resultado.encontrado && resultado.producto) {
          // en vez de añadir directamente, guardar el producto en estado y preguntar cantidad
          this.stateManager.updateState(userId, {
            lastCategory: 'solicitar_cantidad',
            productoSeleccionado: resultado.producto,
            timestamp: new Date()
          });
          
          return `✅ *Producto encontrado:*\n\n` +
                 `📦 ${resultado.producto.nombre}\n` +
                 `💰 Precio: $${resultado.producto.precio.toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${resultado.producto.categoria}\n\n` +
                 `*¿Cuántas unidades deseas añadir al carrito?*\n` +
                 `Responde con un número (ejemplo: 2)`;
        }
        
        return resultado.texto;
      }
      
      // procesar estado de checkout
      if (state && state.lastCategory === 'checkout') {
        return this.botService.procesarCheckout(userId, userMessage);
      }
      
      // procesar estado de selección de categoría de imágenes
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
      if ((/^\d+$/.test(userMessageLower) || this.botService.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        // asumimos que el usuario intenta seleccionar una categoría sin ver el menú primero
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
      
      // Procesar entrada numérica como selección de producto cuando estamos en una categoría
      if (/^\d+(\.\d+)*$/.test(userMessageLower) && state?.lastCategory === 'menu_categoria') {
        const producto = this.productService.buscarProductoPorCodigo(userMessageLower);
        
        if (producto) {
          this.stateManager.updateState(userId, {
            lastCategory: 'solicitar_cantidad',
            productoSeleccionado: producto,
            timestamp: new Date()
          });
          
          return `✅ *Producto encontrado:*\n\n` +
                 `📦 ${producto.nombre}\n` +
                 `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${producto.categoria}\n\n` +
                 `*¿Cuántas unidades deseas añadir al carrito?*\n` +
                 `Responde con un número (ejemplo: 2)`;
        }
      }
      
      // Manejar entradas numéricas como códigos para ver imágenes cuando estamos en un menú de imágenes
      if (/^\d+(\.\d+)*$/.test(userMessageLower) && 
          (state?.lastCategory === 'menu_imagenes' || state?.lastCategory === 'menu_imagenes_categoria')) {
        
        const resultado = await this.productService.procesarSolicitudImagen(userMessageLower);
        
        this.stateManager.updateState(userId, {
          lastCategory: resultado.esCategoria ? 'menu_imagenes_categoria' : 'imagen_producto',
          codigoVisto: userMessageLower,
          timestamp: new Date()
        });
        
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
}