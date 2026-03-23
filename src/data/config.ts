// ============================================================
//  CONFIG — Lire depuis admin/data.json (source de vérité)
//  Ce fichier est utilisé par Astro au moment du BUILD.
//  Toutes les modifications se font via l'interface admin.
// ============================================================

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath  = join(__dirname, '../../admin/data.json');

let _data: any;
try {
  _data = JSON.parse(readFileSync(dataPath, 'utf-8'));
} catch {
  _data = {
    brand: { name: 'MA BOUTIQUE', tagline: '', description: '', logo: 'SHOP', currency: 'EUR', currencySymbol: '€', locale: 'fr-FR' },
    nav:   [],
    hero:  { headline: 'Bienvenue', subheadline: '', cta: 'Découvrir', ctaHref: '/#products', badge: '' },
    about: { title: '', text: '', values: [] },
    footer: { text: '', links: [] },
    theme: { bg: '#FAFAF8', bgAlt: '#F2F1EE', text: '#1A1A18', textMuted: '#888880', accent: '#1A1A18', accentFg: '#FAFAF8', border: '#E5E4E0', radius: '2px' },
    categories: [],
    products: [],
  };
}

export const siteConfig = {
  brand:  _data.brand,
  nav:    _data.nav    || [],
  hero:   _data.hero,
  about:  _data.about,
  footer: _data.footer,
  theme:  _data.theme,
};

export interface Stock {
  global: number;
  bySizeColor: Record<string, Record<string, number>>;
}

export interface Product {
  id:            string;
  name:          string;
  price:         number;
  originalPrice?: number | null;
  category:      string;
  badge?:        string | null;
  description:   string;
  details:       string[];
  sizes:         string[];
  colors:        { name: string; hex: string }[];
  images:        string[];
  inStock:       boolean;
  featured?:     boolean;
  order?:        number;
  stock?:        Stock;
}

export const products: Product[] = ((_data.products || []) as Product[])
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

export const categories: string[] = _data.categories || [];
