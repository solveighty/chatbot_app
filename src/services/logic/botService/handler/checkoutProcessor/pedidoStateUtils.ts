import { IConversationStateManager } from '../../../../../interfaces/services';

export class PedidoStateUtils {
  static actualizarEstado(
    stateManager: IConversationStateManager,
    userId: string,
    updates: Record<string, any>
  ) {
    stateManager.updateState(userId, {
      ...updates,
      timestamp: new Date()
    });
  }
}