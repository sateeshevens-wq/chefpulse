import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  // Sanitize internal errors: never leak stack traces, database schema, or internal paths
  const userSafeMessage =
    statusCode >= 500
      ? 'An unexpected error occurred while processing your request. Please try again later.'
      : err.message || 'Invalid request';

  // Log error internally for debugging
  console.error(`[API Error] ${errorCode} (${statusCode}):`, err.message);
  if (statusCode >= 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: userSafeMessage,
    },
  });
}
