import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

// Verifies the request's Bearer token and requires role === 'admin'.
// Returns the decoded payload if authorized, otherwise null.
export function requireAdmin(request: Request): TokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') return null;

  return decoded;
}
