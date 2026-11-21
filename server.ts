import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type Request, type Response, type NextFunction } from 'express';
import {
  VALID_ORDER_STATUSES,
  createOrderInStore,
  deleteOrderInStore,
  loadOrders,
  updateOrderStatusInStore,
  validateIncomingOrderPayload,
  type OrderStatus,
} from './server/orderStore.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const ORDERS_FILE = path.resolve(__dirname, 'data/orders.json');
const OWNER_PIN = (process.env.OWNER_PIN || '1010').trim();
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const activeSessions = new Set<string>();

function createSessionToken(): string {
  const nonce = crypto.randomBytes(24).toString('hex');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(nonce)
    .digest('hex');
  const token = `${nonce}.${signature}`;
  activeSessions.add(token);
  return token;
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({ error: 'غير مصرح. يرجى تسجيل الدخول كصاحب المحل.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Public: Submit a customer COD order
  app.post('/api/orders', (req: Request, res: Response) => {
    const check = validateIncomingOrderPayload(req.body ?? {});
    if (!check.valid) {
      res.status(400).json({ error: check.message });
      return;
    }
    const created = createOrderInStore(ORDERS_FILE, {
      customer: req.body.customer,
      items: req.body.items,
      deliveryFeeMad: req.body.deliveryFeeMad,
    });
    res.status(201).json({ order: created });
  });

  // Owner Auth: Login with Admin Username/Password or PIN
  app.post('/api/owner/login', (req: Request, res: Response) => {
    const submittedUser =
      typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const submittedPass =
      typeof req.body?.password === 'string' ? req.body.password : '';
    const submittedPin =
      typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';

    const validAdminCreds =
      submittedUser === 'abdejalil' && submittedPass === 'gokugoku';
    const validPin = Boolean(submittedPin && submittedPin === OWNER_PIN);

    if (!validAdminCreds && !validPin) {
      res.status(401).json({ error: 'بيانات الدخول غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.' });
      return;
    }
    const token = createSessionToken();
    res.json({ authenticated: true, token });
  });

  // Owner Auth: Check active session
  app.get('/api/owner/session', (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    const authenticated = Boolean(token && activeSessions.has(token));
    res.json({ authenticated });
  });

  // Owner Auth: Logout
  app.post('/api/owner/logout', (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    if (token) {
      activeSessions.delete(token);
    }
    res.json({ ok: true });
  });

  // Protected Owner Routes: List orders
  app.get('/api/owner/orders', requireOwnerAuth, (_req: Request, res: Response) => {
    const orders = loadOrders(ORDERS_FILE);
    res.json({ orders });
  });

  // Protected Owner Routes: Update order status
  app.patch(
    '/api/owner/orders/:orderNumber',
    requireOwnerAuth,
    (req: Request, res: Response) => {
      const orderNumber = String(req.params.orderNumber || '').trim();
      const status = req.body?.status as OrderStatus;
      if (!VALID_ORDER_STATUSES.includes(status)) {
        res.status(400).json({ error: 'حالة الطلب غير صالحة.' });
        return;
      }
      const updated = updateOrderStatusInStore(ORDERS_FILE, orderNumber, status);
      if (!updated) {
        res.status(404).json({ error: 'الطلب غير موجود.' });
        return;
      }
      res.json({ order: updated });
    },
  );

  // Protected Owner Routes: Delete order
  app.delete(
    '/api/owner/orders/:orderNumber',
    requireOwnerAuth,
    (req: Request, res: Response) => {
      const orderNumber = String(req.params.orderNumber || '').trim();
      const deleted = deleteOrderInStore(ORDERS_FILE, orderNumber);
      if (!deleted) {
        res.status(404).json({ error: 'الطلب غير موجود.' });
        return;
      }
      res.json({ ok: true });
    },
  );

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Perfume 10 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
