import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/AppError';

const tokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().min(1),
});

const BEARER_PREFIX = 'Bearer ';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    const payload = tokenPayloadSchema.safeParse(decoded);
    if (!payload.success) {
      next(new UnauthorizedError('Invalid token payload'));
      return;
    }
    req.user = { id: payload.data.sub, email: payload.data.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
