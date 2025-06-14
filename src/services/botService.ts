import { Message, MessageMedia } from 'whatsapp-web.js';
import { ResponseService } from './responseService';
import { ProductService } from './productService';
import { CartService } from './cartService';
import logger from '../utils/logger';

export class BotService {
  private responseService: ResponseService;
  private productService: ProductService;
  private cartService: CartService;
  private conversationState: Map<string, any>;

  constructor() {
    this.responseService = new ResponseService();
    this.productService = new ProductService();
    this.cartService = new CartService();
    this.conversationState = new Map();
  }

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}"`);
      
      // Comando de carrito
      if (userMessageLower === 'carrito' || userMessageLower === 'ver carrito') {
        return this.cartService.generateCartSummary(userId);
      }
      
      // Comando para finalizar compra
      if (userMessageLower === 'finalizar compra') {
        const cart = this.cartService.getCart(userId);
        if (cart.length === 0) {
          return "Tu carrito está vacío. Añade productos antes de finalizar la compra.";
        }
        
        // Iniciar proceso de finalización
        this.updateConversationState(userId, { 
          lastCategory: 'checkout', 
          etapaPedido: 'datos_cliente',
          timestamp: new Date()
        });
        
        return `Por favor, proporciona los siguientes datos para finalizar tu compra:\n\n` +
               `1️⃣ Tu nombre completo\n` +
               `2️⃣ Tu dirección de entrega (o indica si recogerás en el Monasterio)\n` +
               `3️⃣ Tu número de teléfono`;
      }
      
      // Comando para vaciar carrito
      if (userMessageLower === 'vaciar carrito' || userMessageLower === 'cancelar compra') {
        this.cartService.clearCart(userId);
        return "🗑️ Tu carrito ha sido vaciado. Puedes seguir explorando nuestros productos.";
      }
      
      // Comando para añadir al carrito
      if (userMessageLower.startsWith('añadir') || userMessageLower.startsWith('anadir') || userMessageLower.startsWith('agregar')) {
        const partes = userMessageLower.split(' ');
        if (partes.length < 3) {
          return "Para añadir un producto, escribe: *añadir [cantidad] [nombre del producto]*\n" +
                 "Ejemplo: añadir 2 Frasco de 500 ml";
        }
        
        const cantidadStr = partes[1];
        const cantidad = parseInt(cantidadStr);
        if (isNaN(cantidad) || cantidad <= 0) {
          return "Por favor, indica una cantidad válida. Ejemplo: *añadir 2 Frasco de 500 ml*";
        }
        
        const nombreProducto = userMessage.substring(userMessage.indexOf(cantidadStr) + cantidadStr.length).trim();
        
        // Buscar producto
        const producto = this.productService.buscarProductoExacto(nombreProducto);
        if (!producto) {
          return `No encontré el producto "${nombreProducto}". Verifica el nombre exacto en el catálogo.`;
        }
        
        // Añadir al carrito
        this.cartService.addItemToCart(userId, producto, cantidad);
        return `✅ Añadido al carrito: ${producto.nombre} x${cantidad}\n\n` +
               `Escribe *carrito* para ver tu carrito de compras.`;
      }
      
      // Comando para quitar del carrito
      if (userMessageLower.startsWith('quitar') || userMessageLower.startsWith('eliminar') || userMessageLower.startsWith('borrar')) {
        const partes = userMessageLower.split(' ');
        if (partes.length < 2) {
          return "Para quitar un producto, escribe: *quitar [número]*\n" +
                 "El número es la posición del producto en el carrito.\n" +
                 "Ejemplo: quitar 1";
        }
        
        const indiceStr = partes[1];
        const indice = parseInt(indiceStr) - 1; // Restamos 1 porque los índices empiezan en 0
        
        if (isNaN(indice) || indice < 0) {
          return "Por favor, indica un número válido. Ejemplo: *quitar 1*";
        }
        
        const eliminado = this.cartService.removeItemFromCart(userId, indice);
        if (eliminado) {
          return "✅ Producto eliminado del carrito.\n\n" +
                 this.cartService.generateCartSummary(userId);
        } else {
          return "❌ No encontré ese producto en tu carrito. Verifica el número.";
        }
      }

      // Manejar comando de ayuda
      if (userMessageLower === 'ayuda' || 
          userMessageLower === 'help' || 
          userMessageLower === 'como comprar' ||
          userMessageLower === 'cómo comprar') {
        return this.responseService.getHelpMessage();
      }
      
      // Manejar intención de compra
      if (userMessageLower.includes('quiero comprar') || 
          userMessageLower.includes('comprar') || 
          userMessageLower.includes('pedir')) {
        const resultado = this.productService.procesarPedido(userMessage);
        
        if (resultado.encontrado && resultado.producto) {
          // Añadir al carrito en vez de iniciar pedido directo
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

      // Procesar estado de compra finalizada
      const state = this.getConversationState(userId);
      if (state && state.lastCategory === 'checkout') {
        return this.procesarCheckout(userId, userMessage, state);
      }
      
      // Resto del código existente...
      if (userMessageLower.includes('ver productos')) {
        return this.productService.generarListaProductos();
      }
      
      if (userMessageLower.includes('ver imágenes') || userMessageLower.includes('ver imagenes')) {
        this.updateConversationState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
        return this.productService.generarMenuCategorias();
      }
      
      // Verificar si el usuario está en el flujo de selección de categoría
      if (state && state.lastCategory === 'menu_categorias') {
        // Si el mensaje parece ser un nombre de producto específico
        const categoriaActual = state.categoriaSeleccionada;
        if (categoriaActual) {
          const productoSeleccionado = this.productService.buscarProductoEnCategoria(categoriaActual, userMessage);
          
          if (productoSeleccionado) {
            // El usuario ha seleccionado un producto específico después de ver una categoría
            return {
              text: `¿Deseas comprar ${productoSeleccionado.nombre}?\n\n` +
                    `Para añadir al carrito, escribe: *quiero comprar ${productoSeleccionado.nombre}*`,
              media: await this.productService.obtenerImagenProducto(productoSeleccionado)
            };
          }
        }
        
        // Procesar la selección de categoría
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          // Guardar la categoría seleccionada en el estado para futuras consultas
          this.updateConversationState(userId, { 
            categoriaSeleccionada: userMessage 
          });
          
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // Si el mensaje contiene un número o nombre que podría ser una categoría
      if ((/^\d+$/.test(userMessageLower) || this.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        // Asumimos que el usuario intenta seleccionar una categoría sin ver el menú primero
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
      
      // Si no es un comando especial, usar el servicio de respuestas genéricas
      const category = this.responseService.determineCategory(userMessage);
      
      // Si el usuario está viendo productos, recordar esto en el estado
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
   * Procesa el checkout del pedido
   */
  private procesarCheckout(userId: string, mensaje: string, estado: any): string {
    const { etapaPedido } = estado;
    const carrito = this.cartService.getCart(userId);
    
    if (etapaPedido === 'datos_cliente') {
      // Guardar los datos del cliente
      this.updateConversationState(userId, {
        datosCliente: mensaje,
        etapaPedido: 'confirmacion',
      });
      
      // Generar resumen del pedido
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
        // En una implementación real, aquí se guardaría el pedido en una base de datos
        
        // Limpiar el carrito después de la compra
        const total = this.cartService.getCartTotal(userId);
        const totalFormateado = total.toFixed(2).replace('.', ',');
        this.cartService.clearCart(userId);
        
        this.updateConversationState(userId, {
          lastCategory: 'pedido_completo',
          etapaPedido: 'completado'
        });
        
        return `✅ *¡Pedido confirmado!*\n\n` +
               `Tu pedido por un total de $${totalFormateado} ha sido registrado.\n\n` +
               `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
               `¡Gracias por tu compra! Dios te bendiga.`;
      } else {
        this.cartService.clearCart(userId);
        
        this.updateConversationState(userId, {
          lastCategory: 'pedido_cancelado',
        });
        
        return `❌ *Pedido cancelado*\n\n` +
               `Has cancelado tu pedido. Tu carrito ha sido vaciado.\n\n` +
               `Si deseas realizar otra consulta o pedido, estamos a tu disposición.`;
      }
    }
    
    return `Por favor, proporciona la información solicitada para continuar con tu pedido.`;
  }

  // Métodos existentes...
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

  private esPosibleCategoria(mensaje: string): boolean {
    const categorias = this.productService.getCategorias();
    return categorias.some(categoria => 
      mensaje.toLowerCase().includes(categoria.toLowerCase())
    );
  }
}