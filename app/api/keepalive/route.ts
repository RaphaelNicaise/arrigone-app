import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Esta ruta es invocada diariamente por Vercel Cron para mantener activo
// el proyecto de Supabase (Free Tier) y evitar que lo pausen por inactividad.
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Hacemos una consulta súper liviana para registrar actividad en la API de Supabase
    const { data, error } = await supabase
      .from('propiedades')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Supabase keepalive ping exitoso',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Keepalive error:', error);
    return NextResponse.json({ error: 'Fallo al hacer ping a Supabase' }, { status: 500 });
  }
}
