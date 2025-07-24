import { IProductService } from '../../../interfaces/services';
import { CommandResult } from '../../types/commandResult';

export function processDirectBuyCommand(
  commandLower: string,
  productService: IProductService
): CommandResult {
  const codigoMatch = commandLower.match(/\d+(\.\d+)*/);
  if (codigoMatch) {
    const codigo = codigoMatch[0];
    const producto = productService.buscarProductoPorCodigo(codigo);

    if (producto) {
      return {
        response:
          `✅ *Producto encontrado:*\n\n` +
          `📦 ${producto.nombre}\n` +
          `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
          `🏷️ Categoría: ${producto.categoria}\n\n` +
          `*¿Cuántas unidades deseas añadir al carrito?*\n` +
          `Responde con un número (ejemplo: 2)`,
        stateUpdates: {
          lastCategory: 'solicitar_cantidad',
          productoSeleccionado: producto,
          timestamp: new Date(),
        },
      };
    } else {
      return {
        response:
          `❌ No encontré ningún producto con el código ${codigo}.\n\n` +
          `Por favor, verifica el código en el catálogo. Escribe *ver productos* para ver la lista completa.`,
      };
    }
  }
  return { response: '' };
}