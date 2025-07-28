import { Message, MessageMedia, Client } from 'whatsapp-web.js';
import logger from '../../utils/logger';

export function handleQR(qr: string) {
  logger.info('QR Code recibido. Escanea con tu aplicación WhatsApp:');
}

export function handleReady() {
  logger.info('Cliente WhatsApp está listo y conectado.');
}

export async function handleMessage(
  message: Message,
  messageHandler: (message: Message) => Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia, invoiceCaption?: string } | undefined>,
  client: Client
) {
  const isGroup = message.from.includes('@g.us');
  if (isGroup) {
    logger.info(`Mensaje de grupo ignorado: ${message.body}`);
    return;
  }

  const response = await messageHandler(message);

  if (response) {
    try {
      if (typeof response === 'string') {
        await message.reply(response);
      } else if (response.invoiceMedia) {
        await message.reply(response.text);
        setTimeout(async () => {
          await message.reply(response.invoiceMedia as MessageMedia, undefined, {
            caption: response.invoiceCaption || `📝 Factura de tu pedido`
          });
        }, 1000);
      } else if (response.media) {
        await client.sendMessage(message.from, response.media, {
          caption: response.text
        });
      } else {
        await message.reply(response.text);
      }
    } catch (error) {
      logger.error(`Error al enviar respuesta: ${error}`);
    }
  }
}

export function handleAuthFailure(error: any) {
  logger.error(`Error de autenticación: ${error}`);
}

export function handleDisconnected(reason: string) {
  logger.info(`Cliente desconectado: ${reason}`);
}

export function handleError(error: any) {
  logger.error(`Error del cliente: ${error}`);
}