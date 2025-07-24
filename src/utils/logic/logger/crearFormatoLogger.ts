import winston from 'winston';

export function crearFormatoLogger() {
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  );
}