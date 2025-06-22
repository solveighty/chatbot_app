import { WHATSAPP_CLIENT_OPTIONS } from './config/environment';
import { handleMessage } from './handlers/messageHandler';
import { WhatsAppClient } from './core/client';
import { setupDependencies } from './config/di';
import logger from './utils/logger';
import { verificarRutasImagenes } from './utils/imageDebugger';
import { InvoiceGenerator } from './utils/invoiceGenerator';
import { startServer } from './api/server';

// Inicializar el cliente de WhatsApp y el servicio de bot
try {
    logger.info('Iniciando bot de WhatsApp y servidor web...');
    
    // Verificar imágenes al inicio
    verificarRutasImagenes();
    
    // Inicializar directorio temporal para PDFs y facturas
    InvoiceGenerator.initTempDir();
    InvoiceGenerator.cleanupOldInvoices(); // Limpiar facturas antiguas al iniciar
    
    // Configurar dependencias
    const { botService } = setupDependencies();
    const messageProcessor = (message: any) => handleMessage(message, botService);
    
    // Iniciar cliente de WhatsApp
    const client = new WhatsAppClient(WHATSAPP_CLIENT_OPTIONS, messageProcessor);
    client.initialize();
    
    // Iniciar servidor web para reportes
    startServer();
} catch (error) {
    logger.error(`Error al inicializar servicios: ${error}`);
}