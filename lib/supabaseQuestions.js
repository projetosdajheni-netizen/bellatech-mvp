// Uso exclusivo do servidor. Nunca importe este arquivo em src/ (navegador).
// As tabelas privadas do Supabase permanecem protegidas por RLS.
// As consultas ficam disponíveis apenas depois de configurar a chave secreta
// no ambiente da Vercel e autenticar/autorizAR a rota que as utilizar.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export function hasSupabaseServerConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}

export async function getInterviewQuestions({ level, limit = 3 } = {}) {
  if (!hasSupabaseServerConfig()) {
    throw new Error('SUPABASE_SERVER_NOT_CONFIGURED');
  }
  const acceptedLevels = ['zero', 'iniciante', 'basico'];
  if (level !== undefined && !acceptedLevels.includes(level)) {
    throw new Error('INVALID_LEVEL');
  }
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 3, 15));
  const url = new URL('/rest/v1/interview_questions', SUPABASE_URL);
  url.searchParams.set('select', 'id,area,level,question_en,translation_pt,sample_answer_en,guidance_pt,source_reference');
  url.searchParams.set('is_active', 'eq.true');
  if (level) url.searchParams.set('level', 'eq.' + level);
  url.searchParams.set('limit', String(boundedLimit));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Accept: 'application/json'
    },
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('SUPABASE_QUERY_FAILED_' + response.status);
  return response.json();
}
