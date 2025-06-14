import { Message } from 'whatsapp-web.js';
import { ResponseService } from './responseService';
import logger from '../utils/logger';

export class BotService {
  private responseService: ResponseService;
  private conversationState: Map<string, any>;

  constructor() {
    this.responseService = new ResponseService();
    this.conversationState = new Map();
  }

  public async generateResponse(message: Message): Promise<string> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      
      logger.info(`Generando respuesta para: "${userMessage}"`);
      
      // determinar la categoría del mensaje del usuario
      const category = this.responseService.determineCategory(userMessage);
      
      // obtiene una respuesta aleatoria de la categoría determinada
      const response = this.responseService.getRandomResponse(category);
      
      // Registrar la interacción (opcional, para análisis futuro)
      this.updateConversationState(userId, {
        lastMessage: userMessage,
        lastCategory: category,
        timestamp: new Date()
      });
      
      return response;
    } catch (error) {
      logger.error(`Error al generar respuesta: ${error}`);
      return "Lo siento, ocurrió un error al procesar tu mensaje.";
    }
  }

  public updateConversationState(userId: string, state: any): void {
    const currentState = this.conversationState.get(userId) || {};
    this.conversationState.set(userId, {
      ...currentState,
      ...state
    });
  }

  public getConversationState(userId: string): any {
    return this.conversationState.get(userId);
  }
}