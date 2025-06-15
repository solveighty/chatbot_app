import logger from './logger';

export interface ClientData {
  nombre: string;
  direccion: string;
  telefono: string;
  valido: boolean;
}

export class DataValidator {
  /**
   * Valida y estructura los datos del cliente para la compra
   */
  public static validarDatosCliente(datosTexto: string): ClientData {
    try {
      // dividir el texto en líneas
      const lineas = datosTexto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // si no hay suficientes líneas, retornar datos inválidos
      if (lineas.length < 2) {
        return {
          nombre: '',
          direccion: '',
          telefono: '',
          valido: false
        };
      }

      // extraer nombre, dirección y teléfono
      let nombre = lineas[0];
      let direccion = lineas.length >= 3 ? lineas[1] : 'Recoge en Monasterio';
      let telefono = lineas.length >= 3 ? lineas[2] : lineas[1];

      // validar nombre
      if (nombre.length < 3 || /^\d+$/.test(nombre)) {
        logger.info(`Nombre inválido: "${nombre}"`);
        return {
          nombre,
          direccion,
          telefono,
          valido: false
        };
      }

      // validar telefono
      if (!/\d{7,15}/.test(telefono.replace(/\D/g, ''))) {
        logger.info(`Teléfono inválido: "${telefono}"`);
        return {
          nombre,
          direccion,
          telefono,
          valido: false
        };
      }

      return {
        nombre,
        direccion,
        telefono,
        valido: true
      };
    } catch (error) {
      logger.error(`Error validando datos del cliente: ${error}`);
      return {
        nombre: '',
        direccion: '',
        telefono: '',
        valido: false
      };
    }
  }
}