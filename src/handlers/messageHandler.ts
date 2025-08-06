import { Message } from 'whatsapp-web.js';
import { BotService } from '../services/botService';
import { logMessageProcessing } from './messageHandler/logMessageProcessing';
import logger from '../utils/logger';

export class MessageHandler {
  constructor(private readonly botService: BotService) {}

  public async handleMessage(message: Message): Promise<string | { text: string, media?: any, invoiceMedia?: any, invoiceCaption?: string }> {
    try {
      // Log del procesamiento del mensaje
      logMessageProcessing(message.body);

      // Procesar el mensaje con el bot service
      return await this.botService.procesarMensaje(message);
    } catch (error) {
      logger.error('Error en MessageHandler:', error);
      return 'Lo siento, ha ocurrido un error al procesar tu mensaje.';
    }
  }
}