// Teste não interativo executado no build. Não imprime chaves nem dados das perguntas.
import { getInterviewQuestions } from '../lib/supabaseQuestions.js';

try {
  const questions = await getInterviewQuestions({ limit: 15 });
  if (questions.length !== 15) {
    console.error('BELLATECH_DB_CHECK_FAILED: quantidade inesperada (' + questions.length + '/15).');
    process.exitCode = 1;
  } else {
    console.log('BELLATECH_DB_CHECK_OK: 15 perguntas consultadas no Supabase.');
  }
} catch (error) {
  const code = String(error?.message || 'UNKNOWN_ERROR').replace(/[^A-Za-z0-9_-]/g, '_').slice(0,70);
  console.error('BELLATECH_DB_CHECK_FAILED: ' + code);
  process.exitCode = 1;
}
