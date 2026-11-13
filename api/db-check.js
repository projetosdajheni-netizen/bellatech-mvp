// Diagnóstico privado: não expõe perguntas nem credenciais.
// O token deve ser enviado via header Authorization, nunca na URL.
import { timingSafeEqual } from 'node:crypto';
import { getInterviewQuestions } from '../lib/supabaseQuestions.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const expected = process.env.BELLATECH_TEST_TOKEN;
  const supplied = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const ok = expected && supplied &&
    Buffer.byteLength(expected) === Buffer.byteLength(supplied) &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));

  if (!ok) return res.status(403).json({ error: 'Acesso negado.' });

  try {
    const questions = await getInterviewQuestions({ limit: 15 });
    return res.status(200).json({
      database: 'connected',
      totalQuestions: questions.length,
      expectedQuestions: 15,
      result: questions.length === 15 ? 'pass' : 'mismatch'
    });
  } catch (error) {
    console.error('BellaTech database check failed:', String(error.message || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0,80));
    return res.status(503).json({ error: 'Falha na verificação do banco de dados.' });
  }
}
