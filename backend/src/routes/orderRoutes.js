import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createOrderValidator, cancelOrderValidator } from '../validators/orderValidators.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrderValidator, validate, createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrderValidator, validate, cancelOrder);

export default router;
