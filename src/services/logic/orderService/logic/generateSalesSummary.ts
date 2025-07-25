import logger from '../../../../utils/logger';
import { OrderData } from '../types/orderData';

export function generateSalesSummaryLogic(
  orders: OrderData[],
  startDate: string,
  endDate: string,
  product?: string,
  status?: string
) {
  try {
    // Filtrar por producto si se proporciona
    if (product) {
      orders = orders.filter(order =>
        order.items.some(item =>
          item.nombre.toLowerCase().includes(product.toLowerCase()) ||
          item.categoria.toLowerCase().includes(product.toLowerCase())
        )
      );
    }

    // Filtrar por estado si se proporciona
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Calcular estadísticas de ventas
    let totalAmount = 0;
    const productSales: Record<string, { quantity: number, total: number, category: string }> = {};

    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        totalAmount += order.total;

        order.items.forEach(item => {
          const itemKey = `${item.nombre} (${item.categoria})`;

          if (!productSales[itemKey]) {
            productSales[itemKey] = {
              quantity: 0,
              total: 0,
              category: item.categoria
            };
          }

          productSales[itemKey].quantity += item.cantidad;
          productSales[itemKey].total += item.precio * item.cantidad;
        });
      }
    });

    const sortedProducts = Object.keys(productSales).map(key => ({
      name: key,
      category: productSales[key].category,
      quantity: productSales[key].quantity,
      total: productSales[key].total
    })).sort((a, b) => b.total - a.total);

    const topProduct = sortedProducts.length > 0 ?
      sortedProducts.reduce((prev, current) =>
        (current.quantity > prev.quantity) ? current : prev
      ) : null;

    return {
      summary: {
        startDate,
        endDate,
        totalAmount,
        totalOrders: orders.filter(order => order.status !== 'cancelled').length,
        cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
        topProductName: topProduct ? topProduct.name : 'Ninguno',
        topProductQuantity: topProduct ? topProduct.quantity : 0
      },
      products: sortedProducts,
      orders: orders
    };
  } catch (error) {
    logger.error(`Error al generar resumen de ventas: ${error}`);
    return {
      summary: {
        startDate,
        endDate,
        totalAmount: 0,
        totalOrders: 0,
        cancelledOrders: 0,
        topProductName: 'Error',
        topProductQuantity: 0
      },
      products: [],
      orders: []
    };
  }
}