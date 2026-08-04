import { SignJWT, jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret');

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  );
}
