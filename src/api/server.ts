import express from 'express';
import logger from '../utils/logger';
import routes from './routes/routes';
import { setupMiddlewares } from './middlewares/middlewares';
import { initializeServices } from './dependencies/initDependencies';

const app = express();
const PORT = process.env.PORT;

// Middlewares
setupMiddlewares(app);

// Inicializar servicios
const { orderService } = initializeServices();

// Usa el router para las rutas
app.use(routes);

// Iniciar servidor
export const startServer = () => {
  app.listen(PORT, () => {
    logger.info(`Servidor web iniciado en puerto ${PORT}`);
    logger.info(`Interfaz de reportes disponible en: http://localhost:${PORT}`);
  });
};