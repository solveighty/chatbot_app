import { Router } from 'express';
import { getSalesReport, updateOrderStatus, clearAllOrders } from './../controllers/reportController';
import { serveHomePage, getServerInfo, listFacturas } from './../controllers/homeController';

const router = Router();

router.get('/api/reports/sales', getSalesReport);
router.put('/api/orders/:orderId/status', updateOrderStatus);
router.post('/api/orders/clear', clearAllOrders);
router.get('/api/server-info', getServerInfo);
router.get('/api/facturas/list', listFacturas);
router.get('/', serveHomePage);

export default router;