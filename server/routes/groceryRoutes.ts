import { Router, Response, Request } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { GroceryOrderService } from '../services/groceryOrderService.js';

export const groceryRouter = Router();

// Provider webhook boundary. Real Zepto/Blinkit/BigBasket contracts can call this endpoint
// with their signed delivery events; no customer action can mark a delivery complete.
groceryRouter.post('/webhooks/:partner', async (req: Request, res: Response) => {
  try {
    const secret = config.groceryWebhookSecret;
    if (!secret) { res.status(503).json({ success:false, error:{ code:'GROCERY_WEBHOOK_NOT_CONFIGURED', message:'Grocery provider webhook secret is not configured.' } }); return; }
    const signature = String(req.headers['x-grocery-signature'] || '');
    const raw = req.rawBody?.toString('utf8') || JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) { res.status(401).json({success:false,error:{code:'INVALID_SIGNATURE',message:'Invalid grocery provider signature.'}}); return; }
    const { orderId, status } = req.body || {};
    if (!orderId || !['out_for_delivery','delivered_to_customer','cancelled'].includes(status)) { res.status(400).json({success:false,error:{code:'INVALID_EVENT',message:'Unsupported grocery delivery event.'}}); return; }
    const result = await GroceryOrderService.updateStatus(orderId, status, 'system', 'system');
    res.status(result.statusCode).json(result.data);
  } catch (e:any) { res.status(500).json({success:false,error:{code:'GROCERY_WEBHOOK_FAILED',message:e.message}}); }
});


groceryRouter.post('/orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, partner, address, area, items, totalPaise } = req.body;
    const result = await GroceryOrderService.create({ bookingId, customerId: req.user!.id, partner, address, area, items, totalPaise: Number(totalPaise) });
    res.status(result.statusCode).json(result.data);
  } catch (e: any) { res.status(500).json({ success:false, error:{ code:'GROCERY_ORDER_FAILED', message:e.message } }); }
});

groceryRouter.post('/orders/:id/payment-intent', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try { const result = await GroceryOrderService.createPaymentIntent(req.params.id, req.user!.id); res.status(result.statusCode).json(result.data); }
  catch (e:any) { res.status(500).json({success:false,error:{code:'GROCERY_PAYMENT_INTENT_FAILED',message:e.message}}); }
});

groceryRouter.post('/payments/confirm', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try { const { paymentId, providerPaymentId, signature } = req.body; const result = await GroceryOrderService.confirmPayment({ paymentId, customerId:req.user!.id, providerPaymentId, signature }); res.status(result.statusCode).json(result.data); }
  catch (e:any) { res.status(500).json({success:false,error:{code:'GROCERY_PAYMENT_CONFIRM_FAILED',message:e.message}}); }
});

groceryRouter.get('/orders/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const order = await (await import('../db/database.js')).queryOne<any>('SELECT * FROM grocery_orders WHERE id=?',[req.params.id]);
  if (!order) { res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Grocery order not found.'}}); return; }
  if (order.customer_id !== req.user!.id && !['admin','support'].includes(req.user!.role)) { res.status(403).json({success:false,error:{code:'FORBIDDEN',message:'Unauthorized.'}}); return; }
  res.json({success:true,order});
});

groceryRouter.post('/orders/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const result = await GroceryOrderService.updateStatus(req.params.id, req.body.status, req.user!.id, req.user!.role as any);
  res.status(result.statusCode).json(result.data);
});
