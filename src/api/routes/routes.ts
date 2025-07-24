import { Router } from 'express';
import { getSalesReport } from './../controllers/reportController';
import { updateOrderStatus } from './../controllers/orderController';
import { serveHomePage } from './../controllers/homeController';

const router = Router();

router.get('/api/reports/sales', getSalesReport);
router.put('/api/orders/:orderId/status', updateOrderStatus);
router.get('/', serveHomePage);

export default router;