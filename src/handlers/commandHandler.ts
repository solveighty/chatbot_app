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
    const commandLower = command.toLowerCase().trim();
    
    // Verificar si es un código numérico (1, 1.2, 1.2.3)
    if (/^\d+(\.\d+)*$/.test(commandLower)) {
      const producto = this.productService.buscarProductoPorCodigo(commandLower);
      
      if (producto) {
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
      } else {
        // Verificar si es solo una categoría
        const match = commandLower.match(/^(\d+)$/);
        if (match) {
          const catIndex = parseInt(match[1]) - 1;
          if (catIndex >= 0 && catIndex < this.productService.getCategorias().length) {
            // Es una categoría válida, mostrar sus productos
            const categoria = this.productService.getCategorias()[catIndex];
            
            return {
              response: this.productService.generarListaProductosCategoria(categoria),
              stateUpdates: {
                lastCategory: 'menu_categoria',
                categoriaSeleccionada: categoria,
                timestamp: new Date()
              }
            };
          }
        }
        
        return {
          response: `❌ No encontré ningún producto con el código ${commandLower}.\n\n` +
                   `Por favor, verifica el código en el catálogo. Escribe *ver productos* para ver la lista completa.`
        };
      }
    }
    
    // Si el mensaje comienza con "quiero comprar" seguido de un número
    if (/^(quiero comprar|comprar|pedir|ordenar)\s+\d+(\.\d+)*$/i.test(commandLower)) {
      const codigoMatch = commandLower.match(/\d+(\.\d+)*/);
      if (codigoMatch) {
        const codigo = codigoMatch[0];
        const producto = this.productService.buscarProductoPorCodigo(codigo);
        
        if (producto) {
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
        } else {
          return {
            response: `❌ No encontré ningún producto con el código ${codigo}.\n\n` +
                    `Por favor, verifica el código en el catálogo. Escribe *ver productos* para ver la lista completa.`
          };
        }
      }
    }
    
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
    if (commandLower === 'ver productos' || commandLower === 'productos' || commandLower === 'catálogo' || commandLower === 'catalogo') {
      // Ahora usamos la versión numerada
      return {
        response: this.productService.generarListaProductosNumerados()
      };
    }
    
    // para ver imágenes
    if (commandLower.includes('ver imágenes') || commandLower.includes('ver imagenes')) {
      // Extraer código numérico si existe (ver imágenes 1 o ver imágenes 1.2)
      const codigoMatch = commandLower.match(/\d+(\.\d+)*/);
      
      if (codigoMatch) {
        const codigo = codigoMatch[0];
        // Procesar la solicitud de imagen con el código específico
        const resultado = await this.productService.procesarSolicitudImagen(codigo);
        
        if (resultado.imagen) {
          return {
            response: { text: resultado.texto, media: resultado.imagen },
            stateUpdates: { 
              lastCategory: resultado.esCategoria ? 'menu_imagenes_categoria' : 'imagen_producto',
              codigoVisto: codigo,
              timestamp: new Date() 
            }
          };
        } else {
          return {
            response: resultado.texto,
            stateUpdates: { 
              lastCategory: resultado.esCategoria ? 'menu_imagenes_categoria' : 'imagen_producto',
              codigoVisto: codigo,
              timestamp: new Date() 
            }
          };
        }
      }
      
      // Si no hay código específico, mostrar el menú principal de imágenes
      return {
        response: this.productService.generarMenuImagenesNumerado(),
        stateUpdates: { lastCategory: 'menu_imagenes', timestamp: new Date() }
      };
    }

    // si no reconoce el comando
    return {
      response: ""
    };
  }

  public async handleCartCommands(message: string, userId: string): Promise<CommandResult | null> {
    const messageLower = message.toLowerCase();
    
    // Para añadir al carrito
    if (messageLower.startsWith('añadir') || messageLower.startsWith('anadir') || messageLower.startsWith('agregar')) {
      const partes = messageLower.split(' ');
      
      // Si solo escribe "añadir [código o producto]" sin cantidad
      if (partes.length >= 2) {
        // Ver si el segundo elemento es un número (puede ser cantidad o código)
        const posibleCantidad = parseInt(partes[1]);
        
        if (!isNaN(posibleCantidad) && posibleCantidad > 0) {
          // Caso "añadir 2 1.3" (cantidad seguida de código)
          if (partes.length >= 3) {
            const cantidadStr = partes[1];
            const cantidad = parseInt(cantidadStr);
            
            // Verificar si lo que sigue es un código numérico
            const codigoMatch = message.substring(message.indexOf(cantidadStr) + cantidadStr.length).trim().match(/\d+(\.\d+)*/);
            
            if (codigoMatch) {
              const codigo = codigoMatch[0];
              const producto = this.productService.buscarProductoPorCodigo(codigo);
              
              if (producto) {
                this.cartService.addItemToCart(userId, producto, cantidad);
                return {
                  response: `✅ Añadido al carrito: ${producto.nombre} x${cantidad}\n\n` +
                          `Precio por unidad: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
                          `Total: $${(producto.precio * cantidad).toFixed(2).replace('.', ',')}\n\n` +
                          `Escribe *carrito* para ver tu carrito de compras.`
                };
              } else {
                return {
                  response: `❌ No encontré ningún producto con el código ${codigo}.\n\n` +
                          `Por favor, verifica el código en el catálogo. Escribe *ver productos* para ver la lista completa.`
                };
              }
            }
          }
        } else {
          // Caso "añadir 1.2" (código directo sin cantidad)
          const codigoMatch = partes.slice(1).join(' ').match(/\d+(\.\d+)*/);
          
          if (codigoMatch) {
            const codigo = codigoMatch[0];
            const producto = this.productService.buscarProductoPorCodigo(codigo);
            
            if (producto) {
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
            } else {
              return {
                response: `❌ No encontré ningún producto con el código ${codigo}.\n\n` +
                        `Por favor, verifica el código en el catálogo. Escribe *ver productos* para ver la lista completa.`
              };
            }
          }
        }
      }
      
      // Resto del código existente para el manejo de "añadir [producto]" por nombre...
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