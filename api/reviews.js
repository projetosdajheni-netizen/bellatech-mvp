// Controle restrito de revisão. Não publica o conteúdo gerado.
import { isAuthorized, preparePrivateResponse } from '../lib/privateAuth.js';
import { db } from '../lib/bellatechDb.js';

export default async function handler(req, res) {
  preparePrivateResponse(res, 'GET, POST');
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({ error: 'Método não permitido.' });
  if (!isAuthorized(req)) return res.status(403).json({ error: 'Acesso restrito.' });
  try {
    if (req.method === 'GET') {
      const activities = await db('activities', { query: {
        select: 'id,area,level,generated_content,review_status,created_at',
        order: 'created_at.desc', limit: 25
      } });
      return res.status(200).json({ activities });
    }
    const { activityId, round, evaluatorCode, approved, notes } = req.body || {};
    if (typeof activityId !== 'string' || !/^[0-9a-f-]{36}$/i.test(activityId) ||
        ![1,2].includes(round) || !['E1','E2','E3'].includes(evaluatorCode) ||
        typeof approved !== 'boolean' || typeof notes !== 'string' ||
        notes.trim().length < 3 || notes.length > 800) {
      return res.status(400).json({ error: 'Preencha rodada, avaliadora, decisão e justificativa.' });
    }
    const activity = await db('activities', { query: {
      select: 'id,review_status,generated_content', id: 'eq.' + activityId, limit: 1
    } });
    if (activity.length !== 1 || !activity[0].generated_content || activity[0].review_status !== 'pending') {
      return res.status(409).json({ error: 'Atividade indisponível para revisão.' });
    }
    if (round === 2) {
      const earlier = await db('human_reviews', { query: {
        select: 'evaluation_round', activity_id: 'eq.' + activityId
      } });
      const logs = await db('execution_logs', { query: {
        select: 'execution_details', activity_id: 'eq.' + activityId
      } });
      if (earlier.filter(x => x.evaluation_round === 1).length !== 3 ||
          !logs.some(x => x.execution_details?.kind === 'human_correction')) {
        return res.status(409).json({
          error: 'Conclua as 3 avaliações da rodada 1 e registre a correção antes da rodada 2.'
        });
      }
    }
    await db('human_reviews', { method: 'POST', prefer: 'return=minimal',
      body: {
        activity_id: activityId, evaluation_round: round,
        evaluator_code: evaluatorCode, approved, criterion_notes: notes.trim()
      }
    });
    const votes = await db('human_reviews', { query: {
      select: 'evaluation_round,evaluator_code,approved', activity_id: 'eq.' + activityId
    } });
    const one = votes.filter(x => x.evaluation_round === 1);
    const two = votes.filter(x => x.evaluation_round === 2);
    let reviewStatus = 'pending';
    if (one.length === 3 && two.length === 3) {
      reviewStatus = two.filter(x => x.approved).length >= 2 ? 'approved' : 'rejected';
      await db('activities', { method: 'PATCH', query: { id: 'eq.' + activityId },
        body: { review_status: reviewStatus, reviewed_at: new Date().toISOString() },
        prefer: 'return=minimal'
      });
    }
    return res.status(200).json({ activityId, reviewStatus,
      round1Reviews: one.length, round2Reviews: two.length });
  } catch (error) {
    console.error('BellaTech review failure', String(error.message || 'unknown').slice(0,65));
    return res.status(503).json({ error: 'Falha ao registrar revisão; verifique se a avaliadora já votou nesta rodada.' });
  }
}
