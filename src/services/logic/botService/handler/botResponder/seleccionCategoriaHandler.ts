import { IProductService, IConversationStateManager } from '../../../../../interfaces/services';

export class SeleccionCategoriaHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async manejarSeleccionSinContexto(userId: string, userMessage: string) {
    // Asumimos que el usuario intenta seleccionar una categoría sin ver el menú primero
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

  public async manejarSeleccionCategoria(userId: string, userMessage: string, state: any) {
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