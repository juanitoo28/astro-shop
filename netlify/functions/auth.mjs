// /.netlify/functions/auth  →  /admin/api/auth
import { ok, err, makeToken, verifyToken, getToken, parseBody } from './_utils.mjs';

const COOKIE_OPTS = 'Path=/; HttpOnly; SameSite=Strict; Max-Age=28800';

export const handler = async (event) => {
  const action = event.queryStringParameters?.action || '';
  const method = event.httpMethod;

  // ── POST /auth?action=login ───────────────────────────────
  if (action === 'login' && method === 'POST') {
    const { password } = parseBody(event);
    if (password !== process.env.ADMIN_PASSWORD) {
      return err('Mot de passe incorrect', 401);
    }
    const token = makeToken();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_token=${token}; ${COOKIE_OPTS}`,
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  // ── POST /auth?action=logout ──────────────────────────────
  if (action === 'logout' && method === 'POST') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_token=; Path=/; Max-Age=0`,
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  // ── GET /auth?action=check ────────────────────────────────
  if (action === 'check') {
    const token = getToken(event);
    return ok({ authenticated: verifyToken(token) });
  }

  return err('Route inconnue', 404);
};
