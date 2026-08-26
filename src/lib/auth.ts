import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User, Role } from './types';
import { db } from './store';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-placement-platform-key-change-in-production';
const TOKEN_COOKIE = 'placement_auth_token';

export interface AuthSession {
  userId: string;
  role: Role;
  registerNumber: string;
  collegeEmail: string;
  emailVerified: boolean;
}

export function generateAuthToken(user: User): string {
  const payload: AuthSession = {
    userId: user.id,
    role: user.role,
    registerNumber: user.register_number,
    collegeEmail: user.college_email,
    emailVerified: user.email_verified,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (!token) return null;
    return verifyAuthToken(token);
  } catch (err) {
    return null;
  }
}

export async function requireAuth(allowedRoles: Role[] = ['STUDENT', 'TPO_ADMIN', 'COLLEGE_ADMIN']): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  if (!session.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED: Please verify your college email address before continuing.');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN: Insufficient privileges');
  }
  return session;
}
