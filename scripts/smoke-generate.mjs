// Teste único e restrito da integração completa durante o build.
// Não é executado em builds normais: só quando BELLATECH_SMOKE_ONCE=true.
import generate from '../api/generate.js';
import { db } from '../lib/bellatechDb.js';

const name = 'Teste Interno BellaTech 2';
if (process.env.BELLATECH_SMOKE_ONCE !== 'true') {
  console.log('BELLA_SMOKE_SKIPPED: modo de teste único desligado.');
  process.exit(0);
}
if (process.env.BELLATECH_AI_ENABLED !== 'true') {
  console.error('BELLA_SMOKE_BLOCKED: IA desativada.');
  process.exit(1);
}
try {
  // Proteção para não gastar outra chamada em caso de reimplantação.
  const previous = await db('activities', {
    query: { select: 'id,generated_content', area: 'eq.' + name, limit: '1' }
  });
  if (previous.length) {
    console.log('BELLA_SMOKE_ALREADY_ATTEMPTED: nenhuma nova chamada ao Gemini.');
    process.exit(0);
  }
  const auth = process.env.BELLATECH_TEST_TOKEN;
  if (!auth) throw new Error('PRIVATE_ACCESS_NOT_CONFIGURED');
  const req = {
    method: 'POST',
    headers: { authorization: 'Bearer ' + auth },
    body: { area: name, level: 'zero' }
  };
  let code = 200;
  let body;
  const res = {
    setHeader() { return this; },
    status(next) { code = next; return this; },
    json(payload) { body = payload; return payload; }
  };
  await generate(req, res);
  if (code !== 202 || body?.reviewStatus !== 'pending') {
    const related = await db('activities', { query: { select: 'id', area: 'eq.' + name, limit: '1' } });
    if (related[0]?.id) {
      const logs = await db('execution_logs', { query: {
        select: 'error_category,execution_status',
        activity_id: 'eq.' + related[0].id,
        order: 'created_at.desc', limit: '3'
      } });
      const failure = logs.find(x => x.execution_status === 'error');
      console.error('BELLA_SMOKE_DIAGNOSTIC: ' + (failure?.error_category || 'NO_ERROR_CATEGORY'));
    }
    console.error('BELLA_SMOKE_NOT_APPROVED: HTTP ' + code + '; category ' +
      (body?.code || 'GENERATION_FAILED'));
    process.exit(1);
  }
  const saved = await db('activities', {
    query: { select: 'id,review_status,generated_content', id: 'eq.' + body.activityId }
  });
  if (saved.length !== 1 || saved[0].review_status !== 'pending' ||
      !saved[0].generated_content || saved[0].generated_content.length < 80) {
    throw new Error('ACTIVITY_NOT_STORED_OR_NOT_PENDING');
  }
  const logs = await db('execution_logs', {
    query: { select: 'execution_status', activity_id: 'eq.' + body.activityId }
  });
  if (!logs.some(x => x.execution_status === 'started') ||
      !logs.some(x => x.execution_status === 'success')) {
    throw new Error('EXECUTION_LOGS_INCOMPLETE');
  }
  console.log('BELLA_SMOKE_OK: uma atividade de teste salva como pending; ' +
    'conteúdo e logs verificados; id=' + body.activityId);
} catch (err) {
  console.error('BELLA_SMOKE_ERROR: ' +
    String(err?.message || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0,70));
  process.exitCode = 1;
}
