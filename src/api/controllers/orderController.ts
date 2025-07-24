import { Request, Response } from 'express';
import { setupDependencies } from '../../config/di';
import logger from '../../utils/logger';

const { orderService } = setupDependencies();

export function updateOrderStatus(req: Request, res: Response) {
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