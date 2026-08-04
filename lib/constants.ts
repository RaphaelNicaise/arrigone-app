import { PropertyType, PropertyForm, CreditStatus, KeysStatus, PropertyStatus, Currency } from './types';

export const PROPERTY_TYPES: PropertyType[] = [
  'Casa', 'Departamento', 'Terreno', 'Local', 'Duplex', 'Oficina',
  'Cochera', 'Semipiso', 'Piso', 'Galpón', 'Penthouse', 'Lote', 'Cabaña',
];

export const PROPERTY_FORMS: PropertyForm[] = [
  'Alquiler', 'Venta', 'Fideicomiso', 'Venta y Alquiler', 'Alquiler Temporario',
];

export const CREDIT_OPTIONS: CreditStatus[] = ['Apta Crédito', 'No es apta Crédito'];

export const KEYS_OPTIONS: KeysStatus[] = [
  'Llaves en la oficina',
  'Coordinar (gente viviendo)',
  'Hablar con el dueño',
];

export const CURRENCY_OPTIONS: Currency[] = ['USD', 'ARS'];

export const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'alquilado_administrado', label: 'Alquilado admin. Arrigone' },
  { value: 'rehacer_publi', label: 'Re hacer publi' },
  { value: 'incompleto', label: 'Incompleto / Falta info' },
  { value: 'no_disponible', label: 'No disponible' },
];

export const STATUS_COLORS: Record<PropertyStatus, { bg: string; text: string; border: string }> = {
  disponible: {
    bg: 'rgba(92, 192, 90, 0.10)',
    text: '#2d7a2b',
    border: 'rgba(92, 192, 90, 0.30)',
  },
  alquilado_administrado: {
    bg: 'rgba(255, 152, 0, 0.10)',
    text: '#b36b00',
    border: 'rgba(255, 152, 0, 0.30)',
  },
  rehacer_publi: {
    bg: 'rgba(255, 235, 59, 0.15)',
    text: '#8a7600',
    border: 'rgba(255, 235, 59, 0.40)',
  },
  incompleto: {
    bg: 'rgba(216, 27, 96, 0.15)',
    text: '#880e4f',
    border: 'rgba(216, 27, 96, 0.45)',
  },
  no_disponible: {
    bg: 'rgba(239, 83, 80, 0.10)',
    text: '#c62828',
    border: 'rgba(239, 83, 80, 0.30)',
  },
};

export const BRAND_GREEN = '#5CC05A';
