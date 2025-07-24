import { IResponseService, IConversationStateManager } from '../../../../../interfaces/services';

export class RespuestaGenericaHandler {
  constructor(
    private readonly responseService: IResponseService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public manejarRespuestaGenerica(userId: string, userMessage: string): string {
    const category = this.responseService.determineCategory(userMessage);

    // actualizar estado según la categoría detectada
    if (category === 'productos') {
      this.stateManager.updateState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
    } else {
      this.stateManager.updateState(userId, { lastCategory: category, timestamp: new Date() });
    }

    return this.responseService.getRandomResponse(category);
  }
}