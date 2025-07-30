import { Request, Response } from 'express';
import { setupDependencies } from '../../config/di';
import logger from '../../utils/logger';

const { orderService } = setupDependencies();

export const getSalesReport = (req: Request, res: Response) => {
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
};

export const updateOrderStatus = (req: Request, res: Response) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'orderId y status son obligatorios'
      });
    }

    const result = orderService.updateOrderStatus(orderId, status);
    
    if (result) {
      res.json({
        success: true,
        message: 'Estado del pedido actualizado correctamente'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }
  } catch (error) {
    logger.error(`Error al actualizar estado del pedido: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pedido'
    });
  }
};

export const clearAllOrders = (req: Request, res: Response) => {
  try {
    const result = orderService.clearAllOrders();
    
    if (result) {
      res.json({
        success: true,
        message: 'Todas las órdenes han sido eliminadas correctamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al limpiar las órdenes'
      });
    }
  } catch (error) {
    logger.error(`Error al limpiar órdenes: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar las órdenes'
    });
  }
};