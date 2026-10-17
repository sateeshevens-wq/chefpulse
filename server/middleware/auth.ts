import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne } from '../db/database.js';

export interface AuthUser {
  id: string;
  email?: string;
  phone: string;
  role: 'customer' | 'chef' | 'admin' | 'support';
  status: 'active' | 'suspended' | 'deleted';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: { id: string; role: string; phone: string }): string {
  const secret: jwt.Secret = config.jwtSecret;
  const options: jwt.SignOptions = { expiresIn: '7d' };
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      phone: user.phone,
    },
    secret,
    options
  );
}

export function verifyToken(token: string): { sub: string; role: string; phone: string } | null {
  try {
    return jwt.verify(token, config.jwtSecret) as { sub: string; role: string; phone: string };
  } catch {
    return null;
  }
}

/**
 * Middleware: Strictly requires valid authentication token.
 * Validates against DB to ensure account is active and role is fresh.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required. Please sign in.',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token. Please sign in again.',
      },
    });
    return;
  }

  // Authoritative check against persistent database
  let user: any;
  try {
    user = await queryOne<any>(
      'SELECT id, email, phone, role, status, name FROM users WHERE id = ?',
      [payload.sub]
    );
  } catch (error) {
    next(error);
    return;
  }

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'The user account associated with this token no longer exists.',
      },
    });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended by administration. Please contact support.',
      },
    });
    return;
  }

  if (user.status === 'deleted') {
    res.status(401).json({
      success: false,
      error: {
        code: 'ACCOUNT_DELETED',
        message: 'This account has been deleted.',
      },
    });
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    name: user.name,
  };

  next();
}

/**
 * Middleware: Enforces that the authenticated user possesses one of the allowed roles.
 * Role is verified server-side from the database, never from client input.
 */
export function requireRole(allowedRoles: ('customer' | 'chef' | 'admin' | 'support')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Optional authentication. If a valid token exists, populates req.user.
 */
export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }

  let user: any;
  try {
    user = await queryOne<any>(
      'SELECT id, email, phone, role, status, name FROM users WHERE id = ?',
      [payload.sub]
    );
  } catch (error) {
    next(error);
    return;
  }

  if (user && user.status === 'active') {
    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      name: user.name,
    };
  }

  next();
}
