import { IResponseService, IConversationStateManager } from '../../../../../interfaces/services';

export class RespuestaGenericaHandler {
  constructor(
    private readonly responseService: IResponseService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarRespuestaGenerica(userId: string, userMessage: string): string {
    // Determinar la categoría del mensaje
    const categoria = this.responseService.determineCategory(userMessage);
    
    // Obtener respuesta aleatoria para la categoría
    const respuesta = this.responseService.getRandomResponse(categoria);
    
    // Actualizar el estado del usuario
    this.stateManager.updateState(userId, {
      lastCategory: 'menu_principal',
      timestamp: new Date()
    });
    
    return respuesta;
  }
}