// Import statique via Vite — compatible build Netlify
const files = import.meta.glob('/public/admin/data.json', {
  eager: true,
  as: 'raw',
});

const raw = Object.values(files)[0] as string;

let _data: any;
try {
  _data = JSON.parse(raw);
} catch {
  _data = {
    brand: { name: 'MA BOUTIQUE', tagline: '', description: '', logo: 'SHOP', currency: 'EUR', currencySymbol: '€', locale: 'fr-FR' },
    nav: [], hero: { headline: 'Bienvenue', subheadline: '', cta: 'Découvrir', ctaHref: '/#products', badge: '' },
    about: { title: '', text: '', values: [] }, footer: { text: '', links: [] },
    theme: { bg: '#FAFAF8', bgAlt: '#F2F1EE', text: '#1A1A18', textMuted: '#888880', accent: '#1A1A18', accentFg: '#FAFAF8', border: '#E5E4E0', radius: '2px' },
    categories: [], products: [],
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
  orde