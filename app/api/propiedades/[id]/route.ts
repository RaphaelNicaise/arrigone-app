import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
    const body = await request.json();
    
    let { vendedor_nombre, vendedor_id, ...propertyData } = body;

    if (vendedor_nombre && !vendedor_id) {
      const nombre_normalizado = vendedor_nombre.trim().toLowerCase();
      
      // Get or create vendedor
      let { data: vendedorData, error: findError } = await supabase
        .from('vendedores')
        .select('id')
        .eq('nombre_normalizado', nombre_normalizado)
        .single();
        
      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }
      
      if (vendedorData) {
        vendedor_id = vendedorData.id;
      } else {
        const { data: newVendedor, error: insertError } = await supabase
          .from('vendedores')
          .insert({ nombre: vendedor_nombre.trim(), nombre_normalizado })
          .select()
          .single();
          
        if (insertError) throw insertError;
        vendedor_id = newVendedor.id;
      }
    }

    const { data, error } = await supabase
      .from('propiedades')
      .update({
        ...propertyData,
        vendedor_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, vendedor:vendedores(id,nombre,nombre_normalizado)')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

    const { error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
