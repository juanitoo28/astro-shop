// /.netlify/functions/settings
// POST ?section=brand|hero|about|categories

import { ok, err, requireAuth, readData, writeData, parseBody } from './_utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return err('POST uniquement', 405);

  const authErr = requireAuth(event);
  if (authErr) return authErr;

  const section = event.queryStringParameters?.section || '';
  const b = parseBody(event);
  const { data, sha } = await readData();

  if (section === 'brand') {
    const fields = ['name', 'tagline', 'description', 'logo', 'currencySymbol'];
    fields.forEach(f => { if (f in b) data.brand[f] = String(b[f]).trim(); });
    await writeData(data, sha, 'admin: update brand');
    return ok({ brand: data.brand });
  }

  if (section === 'hero') {
    const fields = ['headline', 'subheadline', 'cta', 'ctaHref', 'badge'];
    fields.forEach(f => { if (f in b) data.hero[f] = String(b[f]).trim(); });
    await writeData(data, sha, 'admin: update hero');
    return ok();
  }

  if (section === 'about') {
    if ('title'  in b) data.about.title  = String(b.title).trim();
    if ('text'   in b) data.about.text   = String(b.text).trim();
    if ('values' in b) data.about.values = b.values;
    await writeData(data, sha, 'admin: update about');
    return ok();
  }

  if (section === 'categories') {
    if (!Array.isArray(b.categories)) return err('categories[] requis');
    data.categories = b.categories.map(c => String(c).trim()).filter(Boolean);
    await writeData(data, sha, 'admin: update categories');
    return ok({ categories: data.categories });
  }

  return err('Section inconnue (brand|hero|about|categories)');
};
