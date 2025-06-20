import { Message, MessageMedia } from 'whatsapp-web.js';
import { BotService } from '../services/botService';
import logger from '../utils/logger';

export const handleMessage = async (
    message: Message, 
    botService: BotService
): Promise<string | { text: string, media?: MessageMedia } | undefined> => {
    try {
        if (message.body) {
            logger.debug(`Procesando mensaje: ${message.body}`);
            const response = await botService.generateResponse(message);
            
            // Comprobar si la respuesta incluye una factura en PDF
            if (typeof response === 'object' && 'invoiceMedia' in response) {
                // Enviar el mensaje de confirmación primero
                await message.reply(response.text);
                
                // Enviar la factura como un archivo PDF separado
                setTimeout(async () => {
                    try {
                        await message.reply(response.invoiceMedia as MessageMedia, undefined, {
                            caption: `📝 Factura de tu pedido`
                        });
                    } catch (error) {
                        logger.error(`Error al enviar la factura PDF: ${error}`);
                    }
                }, 1000); // Esperar un segundo antes de enviar la factura
                
                // Devolvemos undefined porque ya manejamos el envío
                return undefined;
            }
            
            // Devolver la respuesta normal
            return response;
        }
        return undefined;
    } catch (error) {
        logger.error(`Error al procesar el mensaje: ${error}`);
        return undefined;
    }
};