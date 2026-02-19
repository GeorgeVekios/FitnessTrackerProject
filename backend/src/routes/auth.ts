import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import { generateJwt, verifyJwt } from '../utils/jwt';

const router = Router();

// Google OAuth login
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback - generates JWT and passes it to the frontend via redirect
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as { id: string; email: string; name: string; profilePictureUrl?: string | null };
    const token = generateJwt(user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user - supports JWT Bearer token and session fallback
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyJwt(token);
      return res.json({
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          profilePictureUrl: decoded.profilePictureUrl,
        },
      });
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Fallback to session-based auth
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }

  res.status(401).json({ error: 'Not authenticated' });
});

export default router;
