import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching vendedores:', error);
    return NextResponse.json({ error: 'Failed to fetch vendedores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { nombre } = body;
    
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const nombre_normalizado = nombre.trim().toLowerCase();

    // Check if exists
    const { data: existing, error: findError } = await supabase
      .from('vendedores')
      .select('*')
      .eq('nombre_normalizado', nombre_normalizado)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new
    const { data: newVendedor, error: insertError } = await supabase
      .from('vendedores')
      .insert({ nombre: nombre.trim(), nombre_normalizado })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(newVendedor);
  } catch (error) {
    console.error('Error creating vendedor:', error);
    return NextResponse.json({ error: 'Failed to create vendedor' }, { status: 500 });
  }
}
