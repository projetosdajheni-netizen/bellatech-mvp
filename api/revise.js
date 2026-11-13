// Correção humana entre a primeira e a segunda rodada. Somente acesso privado.
import { isAuthorized, preparePrivateResponse } from '../lib/privateAuth.js';
import { db } from '../lib/bellatechDb.js';

export default async function handler(req, res) {
  preparePrivateResponse(res, 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!isAuthorized(req)) return res.status(403).json({ error: 'Acesso restrito.' });
  const { activityId, correctedText, changeNotes } = req.body || {};
  if (typeof activityId !== 'string' || !/^[0-9a-f-]{36}$/i.test(activityId) ||
      typeof correctedText !== 'string' || correctedText.trim().length < 30 ||
      correctedText.length > 14000 || typeof changeNotes !== 'string' ||
      changeNotes.trim().length < 8 || changeNotes.length > 800) {
    return res.status(400).json({ error: 'Informe ID, texto corrigido e justificativa.' });
  }
  try {
    const rows = await db('activities', { query: {
      select: 'id,review_status,generated_content', id: 'eq.' + activityId, limit: 1
    } });
    if (rows.length !== 1 || rows[0].review_status !== 'pending' || !rows[0].generated_content) {
      return res.status(409).json({ error: 'Atividade não está pendente de revisão.' });
    }
    const votes = await db('human_reviews', { query: {
      select: 'evaluation_round', activity_id: 'eq.' + activityId
    } });
    if (votes.filter(v => v.evaluation_round === 1).length !== 3 ||
        votes.some(v => v.evaluation_round === 2)) {
      return res.status(409).json({ error: 'Corrija apenas após 3 avaliações da rodada 1 e antes da rodada 2.' });
    }
    const logs = await db('execution_logs', { query: {
      select: 'execution_details', activity_id: 'eq.' + activityId
    } });
    if (logs.some(x => x.execution_details?.kind === 'human_correction')) {
      return res.status(409).json({ error: 'Já existe uma correção registrada para esta atividade.' });
    }

    // Rastreabilidade: preserva conteúdo anterior na tabela interna e protegida de logs.
    await db('execution_logs', { method: 'POST', prefer: 'return=minimal', body: {
      activity_id: activityId, trigger_type: 'manual_test', execution_status: 'success',
      execution_details: {
        kind: 'human_correction',
        before: rows[0].generated_content,
        after: correctedText.trim(),
        notes: changeNotes.trim()
      }
    } });
    await db('activities', { method: 'PATCH', query: { id: 'eq.' + activityId },
      body: { generated_content: correctedText.trim() }, prefer: 'return=minimal' });

    return res.status(200).json({ activityId, correctionRecorded: true,
      message: 'Correção registrada. Rodada 2 pode começar.' });
  } catch (error) {
    console.error('BellaTech correction error:', String(error.message || 'UNKNOWN').slice(0,60));
    return res.status(503).json({ error: 'Falha ao registrar correção.' });
  }
}
