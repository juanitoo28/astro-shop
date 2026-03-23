// ============================================================
//  Utilitaires partagés entre toutes les Netlify Functions
// ============================================================

// ── Réponses JSON ────────────────────────────────────────────
export function ok(data = {}) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, ...data }),
  };
}

export function err(message, code = 400) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}

// ── Auth session (cookie JWT-like simplifié) ─────────────────
const SECRET = process.env.ADMIN_PASSWORD || 'changeme';

export function makeToken() {
  const payload = { ts: Date.now(), sig: Buffer.from(SECRET).toString('base64') };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token) {
  if (!token) return false;
  try {
    const { ts, sig } = JSON.parse(Buffer.from(token, 'base64').toString());
    const validSig = Buffer.from(SECRET).toString('base64');
    const age = Date.now() - ts;
    return sig === validSig && age < 8 * 60 * 60 * 1000; // 8h
  } catch {
    return false;
  }
}

export function getToken(event) {
  // Cookie ou header Authorization
  const cookie = event.headers?.cookie || '';
  const match  = cookie.match(/admin_token=([^;]+)/);
  if (match) return match[1];
  const auth = event.headers?.authorization || '';
  return auth.replace('Bearer ', '') || null;
}

export function requireAuth(event) {
  const token = getToken(event);
  if (!verifyToken(token)) return err('Non authentifié', 401);
  return null; // null = ok
}

// ── GitHub API ───────────────────────────────────────────────
const GH_TOKEN  = process.env.GITHUB_TOKEN;
const GH_REPO   = process.env.GITHUB_REPO;   // "username/repo"
const GH_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GH_PATH   = process.env.GITHUB_DATA_PATH || 'admin/data.json';
const GH_API    = `https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`;

async function ghFetch(method, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${GH_API}?ref=${GH_BRANCH}`, opts);
  if (!method.includes('GET') && !r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub API ${r.status}: ${txt}`);
  }
  return r.json();
}

// Lire data.json depuis GitHub
export async function readData() {
  const file = await ghFetch('GET');
  const content = Buffer.from(file.content, 'base64').toString('utf-8');
  return { data: JSON.parse(content), sha: file.sha };
}

// Écrire data.json sur GitHub (déclenche un rebuild Netlify)
export async function writeData(data, sha, message = 'admin: update data') {
  const content = Buffer.from(
    JSON.stringify(data, null, 2)
  ).toString('base64');

  await ghFetch('PUT', {
    message,
    content,
    sha,
    branch: GH_BRANCH,
  });
}

// ── Slugify ──────────────────────────────────────────────────
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Parse body ───────────────────────────────────────────────
export function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return {}; }
}
