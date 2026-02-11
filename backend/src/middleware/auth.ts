import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in to access this resource' });
};

// Middleware to attach user to request (optional - doesn't block if not authenticated)
export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  // User is already attached by passport if authenticated
  next();
};
