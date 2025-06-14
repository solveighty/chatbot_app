import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { ClientOptions } from './types';
import  logger from '../utils/logger';

export class WhatsAppClient {
    private client: Client;
    private messageHandler: (message: Message) => Promise<string | undefined>;

    constructor(
        options: ClientOptions,
        messageHandler: (message: Message) => Promise<string | undefined>
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
            logger.info(`Mensaje recibido: ${message.body}`);
            const response = await this.messageHandler(message);
            if (response) {
                await message.reply(response);
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