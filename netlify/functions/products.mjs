// /.netlify/functions/products
// GET    → liste
// POST   → créer
// PUT    → modifier (?id=xxx)
// DELETE → supprimer (?id=xxx)
// POST ?action=reorder → réordonner

import { ok, err, requireAuth, readData, writeData, slugify, parseBody } from './_utils.mjs';

export const handler = async (event) => {
  const authErr = requireAuth(event);
  if (authErr) return authErr;

  const method = event.httpMethod;
  const params = event.queryStringParameters || {};
  const id     = params.id || '';
  const action = params.action || '';

  // ── GET — liste produits ────────────────────────────────────
  if (method === 'GET') {
    const { data } = await readData();
    return ok({ products: data.products || [] });
  }

  // ── POST ?action=reorder ────────────────────────────────────
  if (method === 'POST' && action === 'reorder') {
    const { ids } = parseBody(event);
    if (!Array.isArray(ids)) return err('ids[] requis');
    const { data, sha } = await readData();
    const indexed = Object.fromEntries((data.products || []).map(p => [p.id, p]));
    data.products = ids
      .filter(i => indexed[i])
      .map((id, order) => ({ ...indexed[id], order }));
    await writeData(data, sha, 'admin: reorder products');
    return ok();
  }

  // ── POST — créer ────────────────────────────────────────────
  if (method === 'POST') {
    const b = parseBody(event);
    if (!b.name) return err('name requis');
    const { data, sha } = await readData();

    // ID unique
    let baseId = slugify(b.name);
    let newId  = baseId;
    const existing = (data.products || []).map(p => p.id);
    let i = 1;
    while (existing.includes(newId)) { newId = `${baseId}-${i++}`; }

    const product = buildProduct(newId, b, (data.products || []).length);
    data.products = [...(data.products || []), product];
    await writeData(data, sha, `admin: add product "${product.name}"`);
    return ok({ product });
  }

  // ── PUT — modifier ──────────────────────────────────────────
  if (method === 'PUT') {
    if (!id) return err('?id requis');
    const b = parseBody(event);
    const { data, sha } = await readData();
    const idx = (data.products || []).findIndex(p => p.id === id);
    if (idx === -1) return err('Produit introuvable', 404);

    const p = data.products[idx];
    data.products[idx] = {
      ...p,
      name:          b.name          ?? p.name,
      price:         b.price         != null ? parseFloat(b.price) : p.price,
      originalPrice: 'originalPrice' in b
        ? (b.originalPrice !== '' && b.originalPrice != null ? parseFloat(b.originalPrice) : null)
        : p.originalPrice,
      category:      b.category      ?? p.category,
      badge:         'badge' in b ? (b.badge || null) : p.badge,
      description:   b.description   ?? p.description,
      details:       b.details       ?? p.details,
      sizes:         b.sizes         ?? p.sizes,
      colors:        b.colors        ?? p.colors,
      images:        b.images        ?? p.images,
      inStock:       'inStock' in b  ? Boolean(b.inStock)  : p.inStock,
      featured:      'featured' in b ? Boolean(b.featured) : p.featured,
    };

    await writeData(data, sha, `admin: update product "${data.products[idx].name}"`);
    return ok({ product: data.products[idx] });
  }

  // ── DELETE ──────────────────────────────────────────────────
  if (method === 'DELETE') {
    if (!id) return err('?id requis');
    const { data, sha } = await readData();
    const before = (data.products || []).length;
    data.products = (data.products || []).filter(p => p.id !== id);
    if (data.products.length === before) return err('Produit introuvable', 404);
    await writeData(data, sha, `admin: delete product ${id}`);
    return ok();
  }

  return err('Méthode non supportée', 405);
};

function buildProduct(id, b, order) {
  return {
    id,
    name:          String(b.name || '').trim(),
    price:         parseFloat(b.price) || 0,
    originalPrice: b.originalPrice != null && b.originalPrice !== '' ? parseFloat(b.originalPrice) : null,
    category:      String(b.category || '').trim(),
    badge:         b.badge ? String(b.badge).trim() : null,
    description:   String(b.description || '').trim(),
    details:       Array.isArray(b.details) ? b.details.filter(Boolean) : [],
    sizes:         Array.isArray(b.sizes)   ? b.sizes.filter(Boolean)   : [],
    colors:        Array.isArray(b.colors)  ? b.colors                  : [],
    images:        Array.isArray(b.images)  ? b.images.filter(Boolean)  : [],
    inStock:       b.inStock !== false,
    featured:      Boolean(b.featured),
    order,
  };
}
