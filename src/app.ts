import { WHATSAPP_CLIENT_OPTIONS } from './config/environment';
import { handleMessage } from './handlers/messageHandler';
import { WhatsAppClient } from './core/client';
import { setupDependencies } from './config/di';
import logger from './utils/logger';
import { verificarRutasImagenes } from './utils/imageDebugger';

// inicializar el cliente de WhatsApp y el servicio de bot
try {
    logger.info('Iniciando bot de WhatsApp...');
    
    // Verificar imágenes al inicio
    verificarRutasImagenes();
    
    // Configurar dependencias
    const { botService } = setupDependencies();
    const messageProcessor = (message: any) => handleMessage(message, botService);
    
    const client = new WhatsAppClient(WHATSAPP_CLIENT_OPTIONS, messageProcessor);
    client.initialize();
} catch (error) {
    logger.error(`Error al inicializar el chatbot de WhatsApp: ${error}`);
}