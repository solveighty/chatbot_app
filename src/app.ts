import { WHATSAPP_CLIENT_OPTIONS } from './config/environment';
import { handleMessage } from './handlers/messageHandler';
import { BotService } from './services/botService';
import { WhatsAppClient } from './core/client';
import  logger  from './utils/logger';

// Initialization
try {
    logger.info('Iniciando el chatbot de WhatsApp...');

    const botService = new BotService();
    const messageProcessor = (message: any) => handleMessage(message, botService);
    
    const client = new WhatsAppClient(WHATSAPP_CLIENT_OPTIONS, messageProcessor);
    client.initialize();

    logger.info('Chatbot de WhatsApp inicializado con éxito');
} catch (error) {
    logger.error(`Error al inicializar el chatbot de WhatsApp: ${error}`);
}