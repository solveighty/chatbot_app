import { IProductService, IConversationStateManager } from '../../../../interfaces/services';

export class SolicitudImagenHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async manejarSolicitudImagen(userId: string, userMessage: string, state: any) {
    const resultado = await this.productService.procesarSolicitudImagen(userMessage);

    this.stateManager.updateState(userId, {
      lastCategory: resultado.esCategoria ? 'menu_imagenes_categoria' : 'imagen_producto',
      codigoVisto: userMessage,
      timestamp: new Date()
    });

    if (resultado.imagen) {
      return {
        text: resultado.texto,
        media: resultado.imagen
      };
    }

    return resultado.texto;
  }
}