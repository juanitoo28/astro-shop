// /.netlify/functions/upload
// POST multipart — upload d'image vers le repo GitHub

import { ok, err, requireAuth } from './_utils.mjs';

const GH_TOKEN  = process.env.GITHUB_TOKEN;
const GH_REPO   = process.env.GITHUB_REPO;
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const MAX_MB    = 4; // Netlify Function max payload ~6MB

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return err('POST uniquement', 405);

  const authErr = requireAuth(event);
  if (authErr) return authErr;

  // Le body est en base64 (isBase64Encoded = true pour les binaires)
  const contentType = event.headers['content-type'] || '';

  if (!contentType.includes('multipart/form-data')) {
    return err('multipart/form-data requis');
  }

  // Parse multipart manuellement (pas de lib dispo en ESM serverless facilement)
  // On accepte aussi un JSON avec { base64, filename, mimeType }
  let base64Data, filename, mimeType;

  try {
    const body = JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString()
        : event.body
    );
    base64Data = body.base64;
    filename   = body.filename || `img_${Date.now()}.jpg`;
    mimeType   = body.mimeType || 'image/jpeg';
  } catch {
    return err('Body JSON attendu: { base64, filename, mimeType }');
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(mimeType)) return err('Format non autorisé');

  const bytes = Buffer.from(base64Data, 'base64').length;
  if (bytes > MAX_MB * 1024 * 1024) return err(`Fichier trop lourd (max ${MAX_MB}Mo)`);

  const ext     = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const safeName = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const ghPath   = `public/images/${safeName}`;
  const ghUrl    = `https://api.github.com/repos/${GH_REPO}/contents/${ghPath}`;

  const r = await fetch(ghUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `admin: upload image ${safeName}`,
      content: base64Data,
      branch:  GH_BRANCH,
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    return err('Erreur GitHub upload: ' + t, 500);
  }

  return ok({ url: `/images/${safeName}` });
};
