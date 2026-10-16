import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface RequestContextRequest extends Request {
  requestId?: string;
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const requestId = typeof incoming === 'string' && /^[A-Za-z0-9._:-]{8,100}$/.test(incoming)
    ? incoming
    : crypto.randomUUID();
  (req as RequestContextRequest).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  const started = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - started;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms request_id=${requestId}`);
  });
  next();
}
