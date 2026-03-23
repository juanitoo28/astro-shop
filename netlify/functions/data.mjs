// /.netlify/functions/data  →  GET /admin/api/data
import { ok, err, requireAuth, readData } from './_utils.mjs';

export const handler = async (event) => {
  const authErr = requireAuth(event);
  if (authErr) return authErr;

  try {
    const { data } = await readData();
    return ok(data);
  } catch (e) {
    return err('Impossible de lire les données : ' + e.message, 500);
  }
};
