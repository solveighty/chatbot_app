import { IProductService, ICartService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function addToCart(
  message: string,
  userId: string,
  productService: IProductService,
  cartService: ICartService
): CommandResult | null {
  const partes = message.toLowerCase().split(' ');

  if (partes.length >= 2) {
    const posibleCantidad = parseInt(partes[1]);
    if (!isNaN(posibleCantidad) && posibleCantidad > 0 && partes.length >= 3) {
      // "añadir 2 1.3"
      const cantidadStr = partes[1];
      const cantidad = parseInt(cantidadStr);
      const codigoMatch = message.substring(message.indexOf(cantidadStr) + cantidadStr.length).trim().match(/\d+(\.\d+)*/);
      if (codigoMatch) {
        const codigo = codigoMatch[0];
        const producto = productService.buscarProductoPorCodigo(codigo);
        if (producto) {
          cartService.addItemToCart(userId, producto, cantidad);
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
    } else {
      // "añadir 1.2"
      const codigoMatch = partes.slice(1).join(' ').match(/\d+(\.\d+)*/);
      if (codigoMatch) {
        const codigo = codigoMatch[0];
        const producto = productService.buscarProductoPorCodigo(codigo);
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
  return null;
}