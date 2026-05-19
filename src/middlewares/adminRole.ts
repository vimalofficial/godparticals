import { Request, Response, NextFunction } from 'express';

// Must be used AFTER authMiddleware
export const adminRoleMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
    return;
  }
  next();
};