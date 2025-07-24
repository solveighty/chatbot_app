import logger from '../../utils/logger';

export function logMessageProcessing(messageBody: string) {
  logger.debug(`Procesando mensaje: ${messageBody}`);
}

export function logMessageError(error: unknown) {
  logger.error(`Error al procesar el mensaje: ${error}`);
}