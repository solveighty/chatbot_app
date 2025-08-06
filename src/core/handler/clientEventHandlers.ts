import { Message, MessageMedia, Client } from 'whatsapp-web.js';
import logger from '../../utils/logger';
import { stateManager } from '../../services/conversationStateManager';

export function handleQR(qr: string) {
  logger.info('QR Code recibido. Escanea con tu aplicación WhatsApp:');
}

export function handleReady() {
  logger.info('Cliente de WhatsApp listo');
  // Marcar que no estamos en modo de reconexión
  stateManager.setReconnectingStatus(false);
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

  // Verificar si es un mensaje de sincronización
  const userId = message.from;
  const messageId = message.id._serialized;
  const messageTimestamp = message.timestamp * 1000; // Convertir a milisegundos

  // Detectar si es un mensaje de sincronización
  if (stateManager.isSyncMessage(userId, messageId, messageTimestamp)) {
    logger.info(`Ignorando mensaje de sincronización de ${userId}: ${message.body}`);
    return;
  }

  // Marcar el mensaje como procesado
  stateManager.markMessageAsProcessed(userId, messageId, messageTimestamp);

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

export function handleAuthFailure() {
  logger.error('Fallo de autenticación de WhatsApp');
}

export function handleDisconnected(reason: string) {
  logger.info(`Cliente desconectado: ${reason}`);
  // Marcar que estamos en modo de reconexión
  stateManager.setReconnectingStatus(true);
}

export function handleError(error: Error) {
  logger.error(`Error en cliente de WhatsApp: ${error.message}`);
}