import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

// Middleware to check if user is authenticated (supports JWT Bearer token and session)
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyJwt(token);
      req.user = decoded as Express.User;
      return next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  }

  // Fallback to session-based auth
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in to access this resource' });
};

// Middleware to attach user to request (optional - doesn't block if not authenticated)
export const attachUser = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
