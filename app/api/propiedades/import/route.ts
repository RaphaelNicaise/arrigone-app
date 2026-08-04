import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parsePrice } from '@/lib/xlsx-helpers';
import { ImportResult } from '@/lib/types';

async function getOrCreateVendedor(supabase: any, nombre: string) {
  const nombre_normalizado = nombre.trim().toLowerCase();
  
  let { data: vendedor, error: findError } = await supabase
    .from('vendedores')
    .select('id')
    .eq('nombre_normalizado', nombre_normalizado)
    .single();
    
  if (findError && findError.code !== 'PGRST116') {
    throw findError;
  }
  
  if (vendedor) {
    return vendedor.id;
  }
  
  const { data: newVendedor, error: insertError } = await supabase
    .from('vendedores')
    .insert({ nombre: nombre.trim(), nombre_normalizado })
    .select('id')
    .single();
    
  if (insertError) throw insertError;
  
  return newVendedor.id;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { rows } = body;
    
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const result: ImportResult = {
      total: rows.length,
      imported: 0,
      errors: []
    };

    const propertiesToInsert = [];

    // Process rows sequentially to handle vendedor creation safely
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        let vendedor_id = null;
        
        if (row.vendedor_nombre) {
          vendedor_id = await getOrCreateVendedor(supabase, row.vendedor_nombre);
        }

        const { vendedor_nombre, precio_raw, estado, ...mappedData } = row;
        
        if (precio_raw !== undefined) {
          const parsed = parsePrice(precio_raw);
          mappedData.precio_monto = parsed.monto;
          mappedData.precio_moneda = parsed.moneda;
          mappedData.precio_no_disponible = parsed.noDisponible;
        }

        if (estado !== undefined) {
          const { parseStatus } = await import('@/lib/xlsx-helpers');
          mappedData.estado = parseStatus(estado);
        }

        propertiesToInsert.push({
          ...mappedData,
          vendedor_id,
        });

      } catch (err: any) {
        result.errors.push({ row: i + 1, message: err.message || 'Error desconocido' });
      }
    }

    if (propertiesToInsert.length > 0) {
      const { data, error } = await supabase
        .from('propiedades')
        .insert(propertiesToInsert)
        .select('id');
        
      if (error) {
        throw error;
      }
      
      result.imported = data.length;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error importing properties:', error);
    return NextResponse.json({ error: error.message || 'Failed to import properties' }, { status: 500 });
  }
}
