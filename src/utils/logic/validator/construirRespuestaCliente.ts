import { ClientData } from '../../types/ClientData';

export function construirRespuestaCliente(
  nombre: string,
  direccion: string,
  telefono: string,
  valido: boolean
): ClientData {
  return { nombre, direccion, telefono, valido };
}