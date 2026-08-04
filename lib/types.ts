export type PropertyType = 'Casa' | 'Departamento' | 'Terreno' | 'Local' | 'Duplex' | 'Oficina' | 'Cochera' | 'Semipiso' | 'Piso' | 'Galpón' | 'Penthouse' | 'Lote' | 'Cabaña';

export type PropertyForm = 'Alquiler' | 'Venta' | 'Fideicomiso' | 'Venta y Alquiler' | 'Alquiler Temporario';

export type CreditStatus = 'Apta Crédito' | 'No es apta Crédito';

export type KeysStatus = 'Llaves en la oficina' | 'Coordinar (gente viviendo)' | 'Hablar con el dueño';

export type PropertyStatus = 'alquilado_administrado' | 'rehacer_publi' | 'incompleto' | 'no_disponible' | 'disponible';

export type Currency = 'USD' | 'ARS';

export interface Vendedor {
  id: string;
  nombre: string;
  nombre_normalizado: string;
  created_at: string;
}

export interface Property {
  id: string;
  direccion: string | null;
  tipo: PropertyType | null;
  forma: PropertyForm | null;
  apta_credito: CreditStatus | null;
  fecha: string | null;
  precio_monto: number | null;
  precio_moneda: string | null; // Utilizado como texto libre para el precio
  precio_no_disponible: boolean;
  dormitorios: string | null;
  llaves: KeysStatus | null;
  info_credito: string | null;
  vendedor_id: string | null;
  link: string | null;
  estado: PropertyStatus;
  created_at: string;
  updated_at: string;
  // Joined field
  vendedor?: Vendedor | null;
}

export interface PropertyFilters {
  search?: string;
  tipo?: PropertyType;
  forma?: PropertyForm;
  estado?: PropertyStatus;
  vendedor_id?: string;
  apta_credito?: CreditStatus;
  dormitorios?: string;
  llaves?: KeysStatus;
  moneda?: Currency;
  precio_min?: number;
  precio_max?: number;
}

export interface ImportResult {
  total: number;
  imported: number;
  errors: { row: number; message: string }[];
}
