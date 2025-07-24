import winston from 'winston';

export function crearInstanciaLogger(format: winston.Logform.Format, transports: winston.transport[], level?: string) {
  return winston.createLogger({
    level: level || process.env.LOG_LEVEL || 'info',
    format,
    transports
  });
}