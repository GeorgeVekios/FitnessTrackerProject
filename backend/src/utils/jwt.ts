import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export function generateJwt(user: { id: string; email: string; name: string; profilePictureUrl?: string | null }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, profilePictureUrl: user.profilePictureUrl },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; profilePictureUrl?: string };
}
