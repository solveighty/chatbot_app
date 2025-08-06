import { IProductService, IConversationStateManager } from '../../../../../interfaces/services';

export class SolicitudImagenHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async manejarSolicitudImagen(userId: string, userMessage: string, state: any): Promise<string | { text: string, media?: any }> {
    const resultado = await this.productService.procesarSolicitudImagen(userMessage);

    if (resultado.imagen) {
      // Actualizar estado
      this.stateManager.updateState(userId, {
        lastCategory: 'imagen_producto',
        timestamp: new Date()
      });

      return {
        text: resultado.texto,
        media: resultado.imagen
      };
    } else {
      // Si no hay imagen, mostrar solo texto
      this.stateManager.updateState(userId, {
        lastCategory: 'imagen_producto',
        timestamp: new Date()
      });

      return resultado.texto;
    }
  }
}