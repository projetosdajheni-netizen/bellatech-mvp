import React, { useState } from 'react';
import ReviewPanel from './ReviewPanel.jsx';

// Conteúdo demonstrativo criado para o piloto; não representa atividades aprovadas no banco.
const exercises = [
  { area:'geral', level:'zero', en:'Tell me about yourself.', pt:'Fale um pouco sobre você.', sample:'My name is Ana. I am learning English and I want to grow professionally.', tip:'Diga seu nome, uma habilidade e seu objetivo. Não é necessário compartilhar dados pessoais.' },
  { area:'geral', level:'zero', en:'Why do you want this job?', pt:'Por que você quer este emprego?', sample:'I want to learn, help the team and develop my skills.', tip:'Conecte seu interesse à oportunidade. Use frases curtas.' },
  { area:'geral', level:'zero', en:'What are your strengths?', pt:'Quais são seus pontos fortes?', sample:'I am organized, responsible and I like working with people.', tip:'Escolha duas qualidades que você consiga explicar com exemplos.' },
  { area:'tecnologia', level:'iniciante', en:'How do you solve a technical problem?', pt:'Como você resolve um problema técnico?', sample:'First, I check the problem. Then, I test possible solutions and ask for help when needed.', tip:'Organize sua resposta em etapas: first, then, finally.' },
  { area:'atendimento', level:'iniciante', en:'How do you help an unhappy customer?', pt:'Como você ajuda um cliente insatisfeito?', sample:'I listen carefully, stay calm and look for a solution.', tip:'Destaque escuta, respeito e resolução de problemas.' },
  { area:'administracao', level:'iniciante', en:'How do you organize your tasks?', pt:'Como você organiza suas tarefas?', sample:'I make a list, set priorities and check deadlines.', tip:'Explique seu método de organização com verbos simples.' },
  { area:'geral', level:'basico', en:'Describe a challenge you overcame at work or during your studies.', pt:'Descreva um desafio que você superou no trabalho ou nos estudos.', sample:'During a group project, we had a short deadline. I organized the tasks and we finished on time.', tip:'Use situação, ação e resultado. Pode usar experiências acadêmicas.' },
  { area:'tecnologia', level:'basico', en:'How do you learn a new technology?', pt:'Como você aprende uma tecnologia nova?', sample:'I read the documentation, practice with a small project and ask for feedback.', tip:'Mostre curiosidade e uma estratégia de aprendizagem.' },
  { area:'atendimento', level:'basico', en:'Tell me about a time you worked with a team.', pt:'Conte sobre uma situação em que trabalhou em equipe.', sample:'In a group project, I shared updates and listened to my colleagues. We completed the task together.', tip:'Mostre colaboração com um exemplo real, mesmo fora de um emprego.' }
];
const levels = {zero:'Começando do zero',iniciante:'Iniciante',basico:'Básico'};
const areas = {geral:'Qualquer área',tecnologia:'Tecnologia',atendimento:'Atendimento',administracao:'Administração'};
export default function App() {
  const [area,setArea] = useState('geral');
  const [level,setLevel] = useState('zero');
  const [started,setStarted] = useState(false);
  const [index,setIndex] = useState(0);
  const [answer,setAnswer] = useState('');
  const [showExample,setShowExample] = useState(false);
  const [access,setAccess] = useState('');
  const [result,setResult] = useState(null);
  const [err,setErr] = useState('');
  const [busy,setBusy] = useState(false);
  const available = exercises.filter(q => (q.area === area || q.area === 'geral') && (q.level === level || q.level === 'zero')).slice(0,3);
  const current = available[index] || available[0];
  function restart(){setStarted(false);setIndex(0);setAnswer('');setShowExample(false);}
  async function generate(e) {
    e.preventDefault();setResult(null);setErr('');setBusy(true);
    try {
      const response = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+access},body:JSON.stringify({area:areas[area],level})});
      const json=await response.json();
      if(!response.ok)throw new Error(json.error || 'Não foi possível solicitar a atividade.');
      setResult(json);
    } catch(error){setErr(error.message || 'Falha na solicitação.');} finally{setBusy(false);}
  }
  return <main className="container">
    <header><div className="logo">✦</div><div><strong>BellaTech</strong><small>Inglês profissional • IA • oportunidades</small></div></header>
    <section className="hero"><span>PROTÓTIPO DEMONSTRATIVO</span><h1>Pratique entrevistas em inglês, no seu ritmo.</h1><p>Treine respostas, consulte traduções e ganhe confiança para se preparar para oportunidades profissionais.</p></section>
    <section className="panel" aria-label="Treinamento de entrevistas">
      <h2>Experimente o Interview Coach</h2>
      <p>Este piloto gratuito usa exercícios demonstrativos preparados para o teste. Não avalia sua proficiência nem utiliza IA para corrigir respostas nesta versão.</p>
      {!started ? <form onSubmit={e=>{e.preventDefault();setIndex(0);setAnswer('');setShowExample(false);setStarted(true);}}>
        <label htmlFor="area">Área profissional</label>
        <select id="area" value={area} onChange={e=>setArea(e.target.value)}>{Object.entries(areas).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
        <label htmlFor="level">Seu nível de inglês</label>
        <select id="level" value={level} onChange={e=>setLevel(e.target.value)}>{Object.entries(levels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
        <button type="submit">Começar treino gratuito</button>
      </form> : <div className="training">
        <p className="progress">Exercício {index+1} de {available.length} • {levels[level]}</p>
        <h3>{current.en}</h3><p><strong>Tradução:</strong> {current.pt}</p>
        <label htmlFor="answer">Escreva sua resposta em inglês (opcional)</label>
        <textarea id="answer" rows={4} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Escreva aqui para praticar. Sua resposta fica somente nesta página."/>
        <p className="tip"><strong>Dica:</strong> {current.tip}</p>
        <button type="button" className="secondary" onClick={()=>setShowExample(v=>!v)}>{showExample?'Ocultar exemplo':'Ver resposta de exemplo'}</button>
        {showExample && <div className="output" role="status"><strong>Exemplo para estudar:</strong><p>{current.sample}</p><small>Adapte ao seu contexto. Não copie experiências que você não viveu.</small></div>}
        <div className="actions"><button type="button" className="secondary" onClick={restart}>Recomeçar</button><button type="button" onClick={()=>{if(index+1>=available.length){restart();}else{setIndex(i=>i+1);setAnswer('');setShowExample(false);}}}>{index+1>=available.length?'Concluir treino':'Próxima pergunta'}</button></div>
      </div>}
    </section>
    <details className="panel private"><summary>Área restrita da equipe de avaliação</summary>
      <p>Esta seção é exclusiva de avaliadoras autorizadas. Não compartilhe códigos nem insira dados pessoais.</p>
      <form onSubmit={generate}><label htmlFor="access">Código privado de teste</label><input id="access" type="password" autoComplete="off" value={access} onChange={e=>setAccess(e.target.value)} required/><button disabled={busy||!access}>{busy?'Registrando...':'Solicitar atividade privada'}</button></form>
      {err && <p className="error" role="alert">{err}</p>}
      {result && <p role="status">Solicitação registrada: {result.activityId}. Aguardando revisão humana.</p>}
      <ReviewPanel access={access}/>
    </details>
    <footer>Projeto acadêmico em desenvolvimento • Não compartilhe dados pessoais • Nenhuma promessa de contratação ou fluência</footer>
  </main>;
}
