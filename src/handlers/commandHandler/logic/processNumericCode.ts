import { IProductService, IServiceService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function processNumericCode(
  code: string,
  productService: IProductService,
  serviceService?: IServiceService
): CommandResult {
  const codigoNum = parseInt(code);
  
  // Verificar si es un servicio (cualquier ID válido)
  if (serviceService) {
    const service = serviceService.getServiceById(codigoNum);
    if (service) {
      return {
        response: `🏛️ *${service.nombre}*\n\n` +
                 `${service.descripcion}\n\n` +
                 `📱 *Contacto:* ${service.contacto.telefono}\n\n` +
                 `${service.contacto.mensaje}\n\n` +
                 `💬 Para obtener más información, escribe: *quiero contactar con una hermana*`,
        stateUpdates: {
          lastCategory: 'menu_principal',
          timestamp: new Date()
        }
      };
    }
  }

  // Verificar si es un producto
  const producto = productService.buscarProductoPorCodigo(code);

  if (producto) {
    return {
      response:
        `✅ *Producto encontrado:*\n\n` +
        `📦 ${producto.nombre}\n` +
        `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')}\n` +
        `🏷️ Categoría: ${producto.categoria}\n\n` +
        `*¿Cuántas unidades deseas añadir al carrito?*\n` +
        `Responde con un número (ejemplo: 2)\n\n` +
        `❌ O escribe *cancelar* para salir sin agregar el producto.`,
      stateUpdates: {
        lastCategory: 'solicitar_cantidad',
        productoSeleccionado: producto,
        timestamp: new Date(),
      },
    };
  } else {
    // Verificar si es solo una categoría
    const match = code.match(/^(\d+)$/);
    if (match) {
      const catIndex = parseInt(match[1]) - 1;
      if (catIndex >= 0 && catIndex < productService.getCategorias().length) {
        // Es una categoría válida, mostrar sus productos
        const categoria = productService.getCategorias()[catIndex];

        return {
          response: productService.generarListaProductosCategoria(categoria),
          stateUpdates: {
            lastCategory: 'menu_categoria',
            categoriaSeleccionada: categoria,
            timestamp: new Date(),
          },
        };
      }
    }

    return {
      response:
        `❌ No encontré ningún producto o servicio con el código ${code}.\n\n` +
        `Por favor, verifica el código en el catálogo. Escribe *productos* para ver la lista completa.`,
    };
  }
}