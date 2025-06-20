import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import { ClientOptions } from './types';
import logger from '../utils/logger';

export class WhatsAppClient {
    private client: Client;
    private messageHandler: (message: Message) => Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia } | undefined>;

    constructor(
        options: ClientOptions,
        messageHandler: (message: Message) => Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia } | undefined>
    ) {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            ...options,
        });
        this.messageHandler = messageHandler;
    }

    public initialize(): void {
        this.client.on('qr', (qr) => {
            logger.info('QR Code recibido. Escanea con tu aplicación WhatsApp:');
        });

        this.client.on('ready', () => {
            logger.info('Cliente WhatsApp está listo y conectado.');
        });

        this.client.on('message', async (message) => {
            const isGroup = message.from.includes('@g.us');
            
            if (isGroup) {
                logger.info(`Mensaje de grupo ignorado: ${message.body}`);
                return;
            }
            
            const response = await this.messageHandler(message);
            
            if (response) {
                try {
                    if (typeof response === 'string') {
                        await message.reply(response);
                    } else if (response.invoiceMedia) {
                        // Enviar el mensaje de confirmación
                        await message.reply(response.text);
                        
                        // Esperar un segundo y enviar la factura como PDF
                        setTimeout(async () => {
                            await message.reply(response.invoiceMedia as MessageMedia, undefined, {
                                caption: `📝 Factura de tu pedido`
                            });
                        }, 1000);
                    } else if (response.media) {
                        await this.client.sendMessage(message.from, response.media, { 
                            caption: response.text 
                        });
                    } else {
                        await message.reply(response.text);
                    }
                } catch (error) {
                    logger.error(`Error al enviar respuesta: ${error}`);
                }
            }
        });

        this.client.on('auth_failure', (error) => {
            logger.error(`Error de autenticación: ${error}`);
        });
        this.client.on('disconnected', (reason) => {
            logger.info(`Cliente desconectado: ${reason}`);
        });
        this.client.on('error', (error) => {
            logger.error(`Error del cliente: ${error}`);
        });
        logger.info('Inicializando cliente de WhatsApp...');

        this.client.initialize();
    }
}