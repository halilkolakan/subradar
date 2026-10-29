import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env';
import type { ErrorResponseBody } from '../types/auth.types';
import { AppError, NotFoundError } from '../utils/AppError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err: Error, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    const body: ErrorResponseBody = { success: false, message: err.message };
    if (err.errors) body.errors = err.errors;
    res.status(err.statusCode).json(body);
    return;
  }

  const isMalformedJson = err instanceof SyntaxError && 'body' in err;
  if (isMalformedJson) {
    const body: ErrorResponseBody = { success: false, message: 'Malformed JSON body' };
    res.status(400).json(body);
    return;
  }

  console.error('Unexpected error:', err);
  const body: ErrorResponseBody = {
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };
  res.status(500).json(body);
};
