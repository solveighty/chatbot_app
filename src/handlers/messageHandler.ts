import { Message, MessageMedia } from 'whatsapp-web.js';
import { BotService } from '../services/botService';
import { logMessageProcessing, logMessageError } from './messageHandler/logMessageProcessing';

export const handleMessage = async (
    message: Message, 
    botService: BotService
): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia, invoiceCaption?: string } | undefined> => {
    try {
        if (message.body) {
            logMessageProcessing(message.body);
            return await botService.generateResponse(message);
        }
        return undefined;
    } catch (error) {
        logMessageError(error);
        return undefined;
    }
};