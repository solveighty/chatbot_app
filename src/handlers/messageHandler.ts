import { Message, MessageMedia } from 'whatsapp-web.js';
import { BotService } from '../services/botService';
import logger from '../utils/logger';

export const handleMessage = async (
    message: Message, 
    botService: BotService
): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia } | undefined> => {
    try {
        if (message.body) {
            logger.debug(`Procesando mensaje: ${message.body}`);
            return await botService.generateResponse(message);
        }
        return undefined;
    } catch (error) {
        logger.error(`Error al procesar el mensaje: ${error}`);
        return undefined;
    }
};