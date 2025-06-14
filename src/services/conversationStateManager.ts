import { IConversationStateManager } from '../interfaces/services';
import logger from '../utils/logger';

export class ConversationStateManager implements IConversationStateManager {
  private conversationState: Map<string, any>;

  constructor() {
    this.conversationState = new Map();
    logger.info('Administrador de estado de conversación inicializado');
  }

  public updateState(userId: string, state: any): void {
    const currentState = this.conversationState.get(userId) || {};
    this.conversationState.set(userId, {
      ...currentState,
      ...state
    });
    logger.debug(`Estado actualizado para usuario ${userId}`);
  }

  public getState(userId: string): any {
    return this.conversationState.get(userId);
  }
}