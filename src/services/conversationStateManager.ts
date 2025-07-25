import { IConversationStateManager } from '../interfaces/services';
import logger from '../utils/logger';
import { updateStateLogic } from './logic/conversationStateManager/updateState';
import { getStateLogic } from './logic/conversationStateManager/getState';
import { clearStateLogic } from './logic/conversationStateManager/clearState';

export class ConversationStateManager implements IConversationStateManager {
  private conversationState: Map<string, any>;

  constructor() {
    this.conversationState = new Map();
    logger.info('Administrador de estado de conversación inicializado');
  }

  public updateState(userId: string, state: any): void {
    updateStateLogic(this.conversationState, userId, state);
    logger.debug(`Estado actualizado para usuario ${userId}`);
  }

  public getState(userId: string): any {
    return getStateLogic(this.conversationState, userId);
  }

  public clearState(userId: string): void {
    clearStateLogic(this.conversationState, userId);
    logger.debug(`Estado eliminado para usuario ${userId}`);
  }
}