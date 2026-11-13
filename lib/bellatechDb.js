// Somente servidor. Nunca importe em arquivos dentro de src/.
const urlBase = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

export async function db(table, { method = 'GET', query = {}, body, prefer } = {}) {
  if (!urlBase || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  const url = new URL('/rest/v1/' + table, urlBase);
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(name, String(value));
  }
  const result = await fetch(url, {
    method,
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  });
  if (!result.ok) {
    // Não registrar o corpo do erro para evitar vazamento de dados.
    throw new Error('DB_REQUEST_' + result.status);
  }
  const raw = await result.text();
  return raw ? JSON.parse(raw) : null;
}

export async function logExecution(activityId, status, details = {}, errorCategory = null) {
  return db('execution_logs', {
    method: 'POST',
    body: {
      activity_id: activityId,
      trigger_type: 'form_submission',
      execution_status: status,
      error_category: errorCategory,
      execution_details: details
    },
    prefer: 'return=minimal'
  });
}
