/**
 * AppError - Classe pour les erreurs applicatives
 * Utilisée pour les erreurs métier et de validation
 */
export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number = 500, errors?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
