import { IProductService, IConversationStateManager } from '../../../../interfaces/services';

export class CategoriaHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async manejarSeleccionCategoria(userId: string, userMessage: string, state: any) {
    // Si el usuario está en el menú de categorías y selecciona una categoría o producto
    const categoriaActual = state?.categoriaSeleccionada;
    if (categoriaActual) {
      const productoSeleccionado = this.productService.buscarProductoEnCategoria(categoriaActual, userMessage);

      if (productoSeleccionado) {
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
}