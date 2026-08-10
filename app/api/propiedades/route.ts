import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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
      .select('*, vendedor:vendedores(id,nombre,nombre_normalizado)');

    if (search && search.trim()) {
      // Replace quotes for PostgREST
      let wildcardSearch = search.trim().replace(/"/g, '""');
      // Replace all vowels (accented or not) with the '_' wildcard.
      // This allows 'ilike' to match characters regardless of their accent (e.g. 'Martin' matches 'Martín')
      wildcardSearch = wildcardSearch.replace(/[aáàäâAÁÀÄÂeéèëêEÉÈËÊiíìïîIÍÌÏÎoóòöôOÓÒÖÔuúùüûUÚÙÜÛ]/g, '_');
      
      const safeSearch = wildcardSearch;
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
      const tipos = tipo.split(',').map(v => v.trim()).filter(Boolean);
      if (tipos.length === 1) {
        query = query.eq('tipo', tipos[0]);
      } else if (tipos.length > 1) {
        query = query.in('tipo', tipos);
      }
    }
    if (forma) {
      const formas = forma.split(',').map(v => v.trim()).filter(Boolean);
      if (formas.length === 1) {
        query = query.eq('forma', formas[0]);
      } else if (formas.length > 1) {
        query = query.in('forma', formas);
      }
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
      const dormitoriosList = dormitorios.split(',').map(v => v.trim()).filter(Boolean);
      if (dormitoriosList.length === 1) {
        query = query.eq('dormitorios', dormitoriosList[0]);
      } else if (dormitoriosList.length > 1) {
        query = query.in('dormitorios', dormitoriosList);
      }
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

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
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
        
      if (findError && findError.code !== 'PGRST116') { // PGRST116 is not found
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
      .insert({
        ...propertyData,
        vendedor_id
      })
      .select('*, vendedor:vendedores(id,nombre,nombre_normalizado)')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
