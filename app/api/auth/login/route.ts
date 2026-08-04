import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const isValid = validateCredentials(username, password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('arrigone-session', token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
