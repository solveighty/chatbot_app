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