import { crearFormatoLogger } from './logic/logger/crearFormatoLogger';
import { crearTransportesLogger } from './logic/logger/crearTransportesLogger';
import { crearInstanciaLogger } from './logic/logger/crearInstanciaLogger';

const logger = crearInstanciaLogger(
  crearFormatoLogger(),
  crearTransportesLogger()
);

export default logger;