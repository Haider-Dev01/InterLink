import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = null;

  // Gestion des erreurs Zod (validation)
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Erreur de validation';
    errors = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  }
  // Gestion des erreurs AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errors = err.errors;
  }
  // Gestion des autres erreurs
  else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  logger.error(
    `[${req.method}] ${req.path} >> ${statusCode} - ${message}`,
    err instanceof Error ? err : new Error(JSON.stringify(err))
  );

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
  });
};
