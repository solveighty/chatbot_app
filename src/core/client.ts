import { Client, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js';
import { ClientOptions } from './types/types';
import logger from '../utils/logger';
import {
  handleQR,
  handleReady,
  handleMessage,
  handleAuthFailure,
  handleDisconnected,
  handleError
} from './handler/clientEventHandlers';

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

    private registerEventHandlers(): void {
        this.client.on('qr', handleQR);
        this.client.on('ready', handleReady);
        this.client.on('message', (message) =>
          handleMessage(message, this.messageHandler, this.client)
        );
        this.client.on('auth_failure', handleAuthFailure);
        this.client.on('disconnected', handleDisconnected);
        this.client.on('error', handleError);
    }

    public initialize(): void {
        this.registerEventHandlers();
        logger.info('Inicializando cliente de WhatsApp...');
        this.client.initialize();
    }
}