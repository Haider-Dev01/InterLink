import type { Request } from 'express';

export function toPublicAssetUrl(req: Request, filePath?: string | null) {
  if (!filePath) {
    return null;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalizedFilePath = filePath.replace(/\\/g, '/');
  const uploadsIndex = normalizedFilePath.indexOf('/uploads/');
  const normalizedPath = uploadsIndex >= 0
    ? normalizedFilePath.slice(uploadsIndex + 1)
    : normalizedFilePath.replace(/^\.?\//, '').replace(/^[A-Za-z]:\//, '');

  return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
}
