import {
  Droplet,
  Snowflake,
  Flame,
  Coffee,
  Utensils,
  Cake,
  Apple,
  Wind,
  Zap,
  Heart,
  Leaf,
  Sun,
} from 'lucide-react';

// Mapeo de categorías a iconos y colores
const CATEGORY_ICON_MAP: Record<string, {
  icon: any;
  color: string;
  bgColor: string;
  label: string;
}> = {
  // Bebidas Frescas
  'bebidas-frescas': {
    icon: Droplet,
    color: '#F97316',
    bgColor: '#FEE2E2',
    label: 'Bebidas Frescas'
  },
  'bebidas frescas': {
    icon: Droplet,
    color: '#F97316',
    bgColor: '#FEE2E2',
    label: 'Bebidas Frescas'
  },
  
  // Bebidas Frías
  'bebidas-frias': {
    icon: Snowflake,
    color: '#0891B2',
    bgColor: '#E0F2FE',
    label: 'Bebidas Frías'
  },
  'bebidas frías': {
    icon: Snowflake,
    color: '#0891B2',
    bgColor: '#E0F2FE',
    label: 'Bebidas Frías'
  },
  
  // Bebidas Calientes
  'bebidas-calientes': {
    icon: Flame,
    color: '#DC2626',
    bgColor: '#FEE2E2',
    label: 'Bebidas Calientes'
  },
  'bebidas calientes': {
    icon: Flame,
    color: '#DC2626',
    bgColor: '#FEE2E2',
    label: 'Bebidas Calientes'
  },
  
  // Café
  'cafe': {
    icon: Coffee,
    color: '#92400E',
    bgColor: '#FEF3C7',
    label: 'Café'
  },
  'café': {
    icon: Coffee,
    color: '#92400E',
    bgColor: '#FEF3C7',
    label: 'Café'
  },
  
  // Postres
  'postres': {
    icon: Cake,
    color: '#EC4899',
    bgColor: '#FCE7F3',
    label: 'Postres'
  },
  
  // Pasteles
  'pasteles': {
    icon: Cake,
    color: '#A855F7',
    bgColor: '#F3E8FF',
    label: 'Pasteles'
  },
  
  // Frutas
  'frutas': {
    icon: Apple,
    color: '#16A34A',
    bgColor: '#DCFCE7',
    label: 'Frutas'
  },
  
  // Smoothies
  'smoothies': {
    icon: Wind,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    label: 'Smoothies'
  },
  
  // Bebidas Energéticas
  'energeticas': {
    icon: Zap,
    color: '#FCD34D',
    bgColor: '#FEF3C7',
    label: 'Energéticas'
  },
  'energéticas': {
    icon: Zap,
    color: '#FCD34D',
    bgColor: '#FEF3C7',
    label: 'Energéticas'
  },
  
  // Saludables
  'saludables': {
    icon: Heart,
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    label: 'Saludables'
  },
  
  // Naturales
  'naturales': {
    icon: Leaf,
    color: '#10B981',
    bgColor: '#D1FAE5',
    label: 'Naturales'
  },
  
  // Verano
  'verano': {
    icon: Sun,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    label: 'Verano'
  },
};

// Función para obtener icono por nombre de categoría
export function getCategoryIcon(categoryName: string) {
  const normalized = categoryName.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (CATEGORY_ICON_MAP[normalized]) {
    return CATEGORY_ICON_MAP[normalized];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(CATEGORY_ICON_MAP)) {
    if (normalized.includes(key.split('-')[0]) || key.includes(normalized.split(' ')[0])) {
      return value;
    }
  }
  
  // Retornar icono por defecto
  return {
    icon: Utensils,
    color: '#D97706',
    bgColor: '#FEF3C7',
    label: categoryName,
  };
}

// Función para renderizar icono (útil para componentes React)
export function getIconComponent(categoryName: string) {
  const iconData = getCategoryIcon(categoryName);
  return {
    Icon: iconData.icon,
    color: iconData.color,
    bgColor: iconData.bgColor,
  };
}

// Lista de todos los iconos disponibles
export const AVAILABLE_ICONS = [
  { name: 'Droplet', icon: Droplet, label: 'Bebida' },
  { name: 'Snowflake', icon: Snowflake, label: 'Frío' },
  { name: 'Flame', icon: Flame, label: 'Caliente' },
  { name: 'Coffee', icon: Coffee, label: 'Café' },
  { name: 'Utensils', icon: Utensils, label: 'Comida' },
  { name: 'Cake', icon: Cake, label: 'Pastel' },
  { name: 'Apple', icon: Apple, label: 'Fruta' },
  { name: 'Wind', icon: Wind, label: 'Smoothie' },
  { name: 'Zap', icon: Zap, label: 'Energía' },
  { name: 'Heart', icon: Heart, label: 'Saludable' },
  { name: 'Leaf', icon: Leaf, label: 'Natural' },
  { name: 'Sun', icon: Sun, label: 'Verano' },
];
