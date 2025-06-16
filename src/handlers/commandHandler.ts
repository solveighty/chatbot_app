import { ICartService, IProductService, IResponseService } from '../interfaces/services';
import { MessageMedia } from 'whatsapp-web.js';

export interface CommandResult {
  response: string | { text: string; media?: MessageMedia };
  stateUpdates?: any;
}

export class CommandHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly responseService: IResponseService
  ) {}

  public async handleCommand(command: string, userId: string, currentState: any): Promise<CommandResult> {
    const commandLower = command.toLowerCase();
    
    // comando de carrito
    if (commandLower === 'carrito' || commandLower === 'ver carrito') {
      return {
        response: this.cartService.generateCartSummary(userId)
      };
    }
    
    // para finalizar compra
    if (commandLower === 'finalizar compra') {
      const cart = this.cartService.getCart(userId);
      if (cart.length === 0) {
        return {
          response: "Tu carrito está vacío. Añade productos antes de finalizar la compra."
        };
      }
      
      return {
        response: `Por favor, proporciona los siguientes datos para finalizar tu compra:\n\n` +
                 `1️⃣ *Tu nombre completo* (mínimo 3 caracteres)\n` +
                 `2️⃣ *Tu dirección de entrega* (o indica si recogerás en el Monasterio)\n` +
                 `3️⃣ *Tu número de teléfono* (formato válido)\n\n` +
                 `Ejemplo:\n` +
                 `María Pérez\n` +
                 `Calle Principal 123, Ciudad\n` +
                 `0991234567\n\n` +
                 `Nota: Es muy importante proporcionar la información completa para procesar tu pedido.`,
        stateUpdates: { 
          lastCategory: 'checkout', 
          etapaPedido: 'datos_cliente',
          timestamp: new Date()
        }
      };
    }
    
    // para vaciar el carrito
    if (commandLower === 'vaciar carrito' || commandLower === 'cancelar compra') {
      this.cartService.clearCart(userId);
      return {
        response: "🗑️ Tu carrito ha sido vaciado. Puedes seguir explorando nuestros productos."
      };
    }
    
    // para ayuda
    if (commandLower === 'ayuda' || 
        commandLower === 'help' || 
        commandLower === 'como comprar' ||
        commandLower === 'cómo comprar') {
      return {
        response: this.responseService.getHelpMessage()
      };
    }
    
    // para ver productos
    if (commandLower.includes('ver productos')) {
      return {
        response: this.productService.generarListaProductos()
      };
    }
    
    // para ver imágenes
    if (commandLower.includes('ver imágenes') || commandLower.includes('ver imagenes')) {
      return {
        response: this.productService.generarMenuCategorias(),
        stateUpdates: { lastCategory: 'menu_categorias', timestamp: new Date() }
      };
    }

    // si no reconoce el comando
    return {
      response: ""
    };
  }

  public async handleCartCommands(message: string, userId: string): Promise<CommandResult | null> {
    const messageLower = message.toLowerCase();
    
    // para añadir al carrito
    if (messageLower.startsWith('añadir') || messageLower.startsWith('anadir') || messageLower.startsWith('agregar')) {
      const partes = messageLower.split(' ');
      
      // si solo escribe "añadir [producto]" sin cantidad
      if (partes.length >= 2) {
        // ver si el segundo elemento es un número
        const posibleCantidad = parseInt(partes[1]);
        
        if (!isNaN(posibleCantidad) && posibleCantidad > 0) {
          // caso "añadir 2 Frasco de 500 ml"
          const cantidadStr = partes[1];
          const cantidad = parseInt(cantidadStr);
          
          const nombreProducto = message.substring(message.indexOf(cantidadStr) + cantidadStr.length).trim();
          
          // producto exacto
          const producto = this.productService.buscarProductoExacto(nombreProducto);
          if (!producto) {
            return {
              response: `No encontré el producto "${nombreProducto}". Verifica el nombre exacto en el catálogo.`
            };
          }
          
          // añade al carrito
          this.cartService.addItemToCart(userId, producto, cantidad);
          return {
            response: `✅ Añadido al carrito: ${producto.nombre} x${cantidad}\n\n` +
                    `Precio por unidad: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
                    `Total: $${(producto.precio * cantidad).toFixed(2).replace('.', ',')}\n\n` +
                    `Escribe *carrito* para ver tu carrito de compras.`
          };
        } else {
          // caso "añadir Frasco de 500 ml" sin cantidad
          const nombreProducto = message.substring(message.indexOf(partes[0]) + partes[0].length).trim();
          
          // producto exacto
          const producto = this.productService.buscarProductoExacto(nombreProducto);
          if (!producto) {
            return {
              response: `No encontré el producto "${nombreProducto}". Verifica el nombre exacto en el catálogo.`
            };
          }
          
          // devolver un resultado especial para que BotService pregunte la cantidad
          return {
            response: `✅ *Producto encontrado:*\n\n` +
                     `📦 ${producto.nombre}\n` +
                     `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
                     `🏷️ Categoría: ${producto.categoria}\n\n` +
                     `*¿Cuántas unidades deseas añadir al carrito?*\n` +
                     `Responde con un número (ejemplo: 2)`,
            stateUpdates: {
              lastCategory: 'solicitar_cantidad',
              productoSeleccionado: producto,
              timestamp: new Date()
            }
          };
        }
      }
      
      return {
        response: "Para añadir un producto, escribe: *añadir [producto]* o *añadir [cantidad] [producto]*\n" +
                 "Ejemplos:\n" +
                 "• añadir Frasco de 500 ml\n" +
                 "• añadir 2 Frasco de 500 ml"
      };
    }
    
    // para quitar del carrito
    if (messageLower.startsWith('quitar') || messageLower.startsWith('eliminar') || messageLower.startsWith('borrar')) {
      const partes = messageLower.split(' ');
      if (partes.length < 2) {
        return {
          response: "Para quitar un producto, escribe: *quitar [número]*\n" +
                  "El número es la posición del producto en el carrito.\n" +
                  "Ejemplo: quitar 1"
        };
      }
      
      const indiceStr = partes[1];
      const indice = parseInt(indiceStr) - 1;
      
      if (isNaN(indice) || indice < 0) {
        return {
          response: "Por favor, indica un número válido. Ejemplo: *quitar 1*"
        };
      }
      
      const eliminado = this.cartService.removeItemFromCart(userId, indice);
      if (eliminado) {
        return {
          response: "✅ Producto eliminado del carrito.\n\n" +
                  this.cartService.generateCartSummary(userId)
        };
      } else {
        return {
          response: "❌ No encontré ese producto en tu carrito. Verifica el número."
        };
      }
    }
    
    return null;
  }
}