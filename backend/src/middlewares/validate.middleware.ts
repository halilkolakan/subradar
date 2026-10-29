import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { BadRequestError, type ValidationIssue } from '../utils/AppError';

type RequestPart = 'body' | 'query' | 'params';
type ValidationSchemas = Partial<Record<RequestPart, ZodType>>;

const PARTS: readonly RequestPart[] = ['body', 'query', 'params'];

export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const issues: ValidationIssue[] = [];

    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          issues.push({ path: [part, ...issue.path].join('.'), message: issue.message });
        }
        continue;
      }

      // Express 4 allows reassignment; defineProperty keeps this safe for getters (Express 5).
      Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
    }

    if (issues.length > 0) {
      next(new BadRequestError('Validation failed', issues));
      return;
    }
    next();
  };
