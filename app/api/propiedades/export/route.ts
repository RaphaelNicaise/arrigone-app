import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { propertyToExcelRow } from '@/lib/xlsx-helpers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const tipo = searchParams.get('tipo');
    const forma = searchParams.get('forma');
    const estado = searchParams.get('estado');
    const vendedor_id = searchParams.get('vendedor_id');
    const apta_credito = searchParams.get('apta_credito');
    const dormitorios = searchParams.get('dormitorios');
    const llaves = searchParams.get('llaves');
    const moneda = searchParams.get('moneda');
    const precio_min = searchParams.get('precio_min');
    const precio_max = searchParams.get('precio_max');

    let query = supabase
      .from('propiedades')
      .select('*, vendedor:vendedores(id,nombre)');

    if (search && search.trim()) {
      // Escape double quotes for PostgREST by doubling them, then wrap the whole value in double quotes
      // This prevents characters like ( ) , from breaking the .or() syntax parser
      const safeSearch = search.trim().replace(/"/g, '""');
      const orQuery = [
        `direccion.ilike."%${safeSearch}%"`,
        `tipo.ilike."%${safeSearch}%"`,
        `forma.ilike."%${safeSearch}%"`,
        `apta_credito.ilike."%${safeSearch}%"`,
        `fecha.ilike."%${safeSearch}%"`,
        `precio_moneda.ilike."%${safeSearch}%"`,
        `dormitorios.ilike."%${safeSearch}%"`,
        `llaves.ilike."%${safeSearch}%"`,
        `info_credito.ilike."%${safeSearch}%"`,
        `estado.ilike."%${safeSearch}%"`
      ].join(',');
      query = query.or(orQuery);
    }
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    if (forma) {
      query = query.eq('forma', forma);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }
    if (vendedor_id) {
      query = query.eq('vendedor_id', vendedor_id);
    }
    if (apta_credito) {
      query = query.eq('apta_credito', apta_credito);
    }
    if (dormitorios) {
      query = query.eq('dormitorios', dormitorios);
    }
    if (llaves) {
      query = query.eq('llaves', llaves);
    }
    if (moneda) {
      query = query.eq('precio_moneda', moneda);
      if (precio_min) {
        query = query.gte('precio_monto', parseFloat(precio_min));
      }
      if (precio_max) {
        query = query.lte('precio_monto', parseFloat(precio_max));
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const rows = (data || []).map(propertyToExcelRow);
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Propiedades');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `arrigone-propiedades-${date}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting properties:', error);
    return NextResponse.json({ error: 'Failed to export properties' }, { status: 500 });
  }
}
