import { IProductService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export async function processImageRequest(
  commandLower: string,
  productService: IProductService
): Promise<CommandResult> {
  // Extraer código numérico si existe (ver imágenes 1 o ver imágenes 1.2)
  const codigoMatch = commandLower.match(/\d+(\.\d+)*/);

  if (codigoMatch) {
    const codigo = codigoMatch[0];
    // Procesar la solicitud de imagen con el código específico
    const resultado = await productService.procesarSolicitudImagen(codigo);

    if (resultado.imagen) {
      return {
        response: { text: resultado.texto, media: resultado.imagen },
        stateUpdates: {
          lastCategory: 'imagen_producto',
          codigoVisto: codigo,
          timestamp: new Date()
        }
      };
    } else {
      return {
        response: resultado.texto,
        stateUpdates: {
          lastCategory: 'imagen_producto',
          codigoVisto: codigo,
          timestamp: new Date()
        }
      };
    }
  }

  // Refuerzo robusto: si el mensaje es cualquier variante de 'ver imágenes' o 'ver imagenes', mostrar el menú principal
  const mensajeNormalizado = commandLower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/\s+/g, ' ') // unifica espacios
    .trim();
  if (mensajeNormalizado === 'ver imagenes') {
    return {
      response: productService.generarMenuImagenesNumerado(),
      stateUpdates: { lastCategory: 'menu_imagenes', timestamp: new Date() }
    };
  }

  // Si no hay código específico, mostrar el menú principal de imágenes
  return {
    response: productService.generarMenuImagenesNumerado(),
    stateUpdates: { lastCategory: 'menu_imagenes', timestamp: new Date() }
  };
}