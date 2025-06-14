import { Message } from 'whatsapp-web.js';
import { BotService } from '../services/botService';
import logger from '../utils/logger';

export const handleMessage = async (
    message: Message, 
    botService: BotService
): Promise<string | undefined> => {
    try {
        if (message.body) {
            logger.info(`Processing message: ${message.body}`);
            return await botService.generateResponse(message);
        }
        return undefined;
    } catch (error) {
        logger.error(`Error handling message: ${error}`);
        return undefined;
    }
};