import { WHATSAPP_CLIENT_OPTIONS } from './config/environment';
import { MessageHandler } from './handlers/messageHandler';
import { WhatsAppClient } from './core/client';
import { setupDependencies } from './config/di';
import logger from './utils/logger';
import { verificarRutasImagenes } from './utils/imageDebugger';
import { InvoiceGenerator } from './utils/invoiceGenerator';
import { startServer } from './api/server';
import { MqttService } from './utils/mqttService';

// Inicializar el cliente de WhatsApp y el servicio de bot
async function initializeServices() {
    try {
        logger.info('Iniciando bot de WhatsApp y servidor web...');
        
        // Verificar imágenes al inicio
        verificarRutasImagenes();
        
        // Inicializar directorio temporal para PDFs y facturas
        // InvoiceGenerator.initTempDir();
        InvoiceGenerator.cleanupOldInvoices(); // Limpiar facturas antiguas al iniciar
        
        // Configurar dependencias
        const { botService } = setupDependencies();
        const messageHandler = new MessageHandler(botService);
        const messageProcessor = (message: any) => messageHandler.handleMessage(message);
        
        // Iniciar cliente de WhatsApp
        const client = new WhatsAppClient(WHATSAPP_CLIENT_OPTIONS, messageProcessor);
        client.initialize();
        
        // Iniciar servidor web para reportes
        const serverPort = await startServer();
        
        // Iniciar servicio MQTT para comunicación local
        if (serverPort) {
            const mqttService = new MqttService(serverPort);
            mqttService.start();
            logger.info('Servicio MQTT iniciado correctamente');
        }
        
    } catch (error) {
        logger.error(`Error al inicializar servicios: ${error}`);
    }
}

// Ejecutar inicialización
initializeServices();