import { Property, PropertyStatus } from './types';
import { STATUS_OPTIONS } from './constants';
import { formatDate } from './utils';

// Column mapping from Excel headers to DB fields
const COLUMN_MAP: Record<string, string> = {
  'direccion': 'direccion',
  'dirección': 'direccion',
  'tipo': 'tipo',
  'forma': 'forma',
  'apta credito': 'apta_credito',
  'apta crédito': 'apta_credito',
  'fecha': 'fecha',
  'precio': 'precio_raw',
  'dormitorios': 'dormitorios',
  'llaves': 'llaves',
  'informacion si es apta credito': 'info_credito',
  'información si es apta crédito': 'info_credito',
  'info credito': 'info_credito',
  'info crédito': 'info_credito',
  'vendedor': 'vendedor_nombre',
  'link': 'link',
  'estado': 'estado',
};

export function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function mapExcelHeaders(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (COLUMN_MAP[normalized]) {
      mapping[index] = COLUMN_MAP[normalized];
    }
  });
  return mapping;
}

export function parsePrice(raw: string | number | null | undefined): {
  monto: number | null;
  moneda: 'USD' | 'ARS' | null;
  noDisponible: boolean;
} {
  if (!raw) return { monto: null, moneda: null, noDisponible: false };

  const str = String(raw).trim().toLowerCase();

  if (str === 'no disponible' || str === 'n/d' || str === '-') {
    return { monto: null, moneda: null, noDisponible: true };
  }

  const usdMatch = str.match(/(?:usd|u\$s|us\$|\$)\s*([\d.,]+)/i);
  if (usdMatch) {
    const monto = parseFloat(usdMatch[1].replace(/\./g, '').replace(',', '.'));
    return { monto: isNaN(monto) ? null : monto, moneda: 'USD', noDisponible: false };
  }

  const arsMatch = str.match(/(?:ars|\$)\s*([\d.,]+)/i);
  if (arsMatch) {
    const monto = parseFloat(arsMatch[1].replace(/\./g, '').replace(',', '.'));
    return { monto: isNaN(monto) ? null : monto, moneda: 'ARS', noDisponible: false };
  }

  // Try just a number
  const numMatch = str.match(/([\d.,]+)/);
  if (numMatch) {
    const monto = parseFloat(numMatch[1].replace(/\./g, '').replace(',', '.'));
    return { monto: isNaN(monto) ? null : monto, moneda: 'USD', noDisponible: false };
  }

  return { monto: null, moneda: null, noDisponible: false };
}

// Map status text variations to DB values
const STATUS_TEXT_MAP: Record<string, PropertyStatus> = {
  'disponible': 'disponible',
  'alquilado': 'alquilado_administrado',
  'alquilado administrado': 'alquilado_administrado',
  'alquilado administrado por arrigone': 'alquilado_administrado',
  're hacer publi': 'rehacer_publi',
  'rehacer publi': 'rehacer_publi',
  'hacer publi': 'rehacer_publi',
  'incompleto': 'incompleto',
  'falta info': 'incompleto',
  'incompleto/ falta info': 'incompleto',
  'no disponible': 'no_disponible',
};

export function parseStatus(raw: string | null | undefined): PropertyStatus {
  if (!raw) return 'disponible';
  const normalized = raw.toLowerCase().trim();
  return STATUS_TEXT_MAP[normalized] ?? 'disponible';
}

// Export headers for Excel generation
export const EXPORT_HEADERS = [
  'Dirección',
  'Tipo',
  'Forma',
  'Apta Crédito',
  'Fecha',
  'Precio',
  'Dormitorios',
  'Llaves',
  'Info Crédito',
  'Vendedor',
  'Link',
  'Estado',
];

export function propertyToExcelRow(property: Property): Record<string, string | number | null> {
  let precio: string | null = null;
  if (property.precio_no_disponible) {
    precio = 'No disponible';
  } else if (property.precio_monto != null && property.precio_moneda) {
    precio = `${property.precio_moneda} ${property.precio_monto.toLocaleString('es-AR')}`;
  }

  const statusLabel = STATUS_OPTIONS.find(s => s.value === property.estado)?.label ?? property.estado;

  return {
    'Dirección': property.direccion,
    'Tipo': property.tipo,
    'Forma': property.forma,
    'Apta Crédito': property.apta_credito,
    'Fecha': formatDate(property.fecha),
    'Precio': precio,
    'Dormitorios': property.dormitorios,
    'Llaves': property.llaves,
    'Info Crédito': property.info_credito,
    'Vendedor': property.vendedor?.nombre ?? null,
    'Link': property.link,
    'Estado': statusLabel,
  };
}
