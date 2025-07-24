import logger from './logger';
import { ClientData } from './types/ClientData';
import { esNombreValido } from './logic/validator/esNombreValido';
import { esTelefonoValido } from './logic/validator/esTelefonoValido';
import { parsearDatosCliente } from './logic/validator/parsearDatosCliente';
import { construirRespuestaCliente } from './logic/validator/construirRespuestaCliente';

export class DataValidator {
  /**
   * Valida y estructura los datos del cliente para la compra
   */
  public static validarDatosCliente(datosTexto: string): ClientData {
    try {
      const { nombre, direccion, telefono, lineas } = parsearDatosCliente(datosTexto);

      if (lineas.length < 2) {
        return construirRespuestaCliente('', '', '', false);
      }

      if (!esNombreValido(nombre)) {
        logger.info(`Nombre inválido: "${nombre}"`);
        return construirRespuestaCliente(nombre, direccion, telefono, false);
      }

      if (!esTelefonoValido(telefono)) {
        logger.info(`Teléfono inválido: "${telefono}"`);
        return construirRespuestaCliente(nombre, direccion, telefono, false);
      }

      return construirRespuestaCliente(nombre, direccion, telefono, true);
    } catch (error) {
      logger.error(`Error validando datos del cliente: ${error}`);
      return construirRespuestaCliente('', '', '', false);
    }
  }
}