import express from 'express';
import cors from 'cors';
import path from 'path';
import { setupDependencies } from '../config/di';
import logger from '../utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Configurar servicios
const { orderService } = setupDependencies();

// Definir funciones manejadoras separadamente
function getSalesReport(req: any, res: any) {
  try {
    const { startDate, endDate, product, status } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Las fechas de inicio y fin son obligatorias' 
      });
    }

    const report = orderService.generateSalesSummary(
      startDate as string,
      endDate as string,
      product as string,
      status as string
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error(`Error al generar reporte: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte'
    });
  }
}

function updateOrderStatus(req: any, res: any) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID del pedido y estado son requeridos'
      });
    }
    
    const updated = orderService.updateOrderStatus(
      orderId,
      status as 'pending' | 'completed' | 'cancelled'
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: `Estado del pedido actualizado a: ${status}`
    });
  } catch (error) {
    logger.error(`Error al actualizar estado del pedido: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pedido'
    });
  }
}

function serveHomePage(req: any, res: any) {
  res.sendFile(path.join(process.cwd(), 'public', 'reports.html'));
}

// Registrar las rutas
app.get('/api/reports/sales', getSalesReport);
app.put('/api/orders/:orderId/status', updateOrderStatus);
app.get('/', serveHomePage);

// Iniciar servidor
export const startServer = () => {
  app.listen(PORT, () => {
    logger.info(`Servidor web iniciado en puerto ${PORT}`);
    logger.info(`Interfaz de reportes disponible en: http://localhost:${PORT}`);
  });
};