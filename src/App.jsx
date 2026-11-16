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
// Avaliação demonstrativa objetiva: 10 questões, 1 ponto por acerto.
const quiz = [
 {q:'O que significa “Tell me about yourself”?',opts:['Fale um pouco sobre você.','Qual é seu endereço?','Qual é seu salário?'],correct:0,why:'É um convite para apresentar seu perfil e experiência profissional.'},
 {q:'Qual frase apresenta uma habilidade profissional?',opts:['I am organized and responsible.','I am twenty years old.','I live near the office.'],correct:0,why:'Organized e responsible são qualidades relacionadas ao trabalho.'},
 {q:'O que significa “What are your strengths?”',opts:['Quais são seus pontos fortes?','Qual é sua disponibilidade?','Qual foi seu último emprego?'],correct:0,why:'Strengths significa pontos fortes.'},
 {q:'Qual frase expressa interesse pela oportunidade?',opts:['I do not want to learn.','I want to develop my skills.','I never work with others.'],correct:1,why:'Develop my skills indica desejo de desenvolver competências.'},
 {q:'Qual é a tradução de “teamwork”?',opts:['Pontualidade','Trabalho em equipe','Entrevista'],correct:1,why:'Teamwork é trabalho em equipe.'},
 {q:'Qual ordem forma uma frase correta?',opts:['Responsible am I.','I responsible am.','I am responsible.'],correct:2,why:'Em frases simples, usamos sujeito + verbo to be + adjetivo.'},
 {q:'O que a pessoa quer saber com “Why do you want this job?”',opts:['Por que você quer este emprego?','Quando você nasceu?','Onde você estudou?'],correct:0,why:'Why significa por que; want this job significa querer este emprego.'},
 {q:'Qual resposta é adequada para “How do you work in a team?”',opts:['I listen and share ideas.','I never listen to people.','I refuse to help anyone.'],correct:0,why:'A resposta demonstra colaboração e comunicação.'},
 {q:'Complete: “I ___ motivated to learn.”',opts:['is','am','are'],correct:1,why:'Com I, a forma correta do verbo to be é am.'},
 {q:'Qual resposta descreve uma experiência de forma clara?',opts:['I good job yesterday.','I worked on a group project and helped organize tasks.','Me project good.'],correct:1,why:'A frase apresenta uma atividade e a contribuição da pessoa.'}
];
const levels = {zero:'Começando do zero',iniciante:'Iniciante',basico:'Básico'};
const areas = {geral:'Qualquer área',tecnologia:'Tecnologia',atendimento:'Atendimento',administracao:'Administração'};
export default function App() {
  const [area,setArea] = useState('geral');
  const [level,setLevel] = useState('zero');
  const [stage,setStage] = useState('intro');
  const [guidedIndex,setGuidedIndex] = useState(0);
  const [practiceAnswers,setPracticeAnswers] = useState([]);
  const [quizAnswers,setQuizAnswers] = useState({});
  const [attempts,setAttempts] = useState(0);
  const [index,setIndex] = useState(0);
  const [answer,setAnswer] = useState('');
  const [showExample,setShowExample] = useState(false);
  const [access,setAccess] = useState('');
  const [result,setResult] = useState(null);
  const [err,setErr] = useState('');
  const [busy,setBusy] = useState(false);
  const available = exercises.filter(q => (q.area === area || q.area === 'geral') && (q.level === level || q.level === 'zero')).slice(0,3);
  const current = available[index] || available[0];
  const guided = available[guidedIndex] || available[0];
  const score = quiz.reduce((sum,q,i)=>sum+(quizAnswers[i]===q.correct?1:0),0);
  const passed = score >= 7;
  function restart(){setGuidedIndex(0);setStage('intro');setIndex(0);setAnswer('');setShowExample(false);setQuizAnswers({});setPracticeAnswers([]);setAttempts(0);}
  function advancePractice(){if(!answer.trim())return;setPracticeAnswers(prev=>[...prev,answer.trim()]);setAnswer('');setShowExample(false);if(index+1>=available.length){setStage('evaluation-intro');}else{setIndex(i=>i+1);}}
  function submitQuiz(){if(Object.keys(quizAnswers).length!==quiz.length)return;setAttempts(n=>n+1);setStage('result');}
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
    <header className="brand-header"><a className="brand-home-link" href="/" aria-label="BellaTech — voltar à página inicial"><div className="logo" aria-hidden="true">✦</div><div className="brand-copy"><strong className="brand-name">Bella<span className="brand-tech">Tech</span></strong><small className="brand-subtitle">Desenvolvimento profissional e empregabilidade</small><span className="brand-audience">Para mulheres LGBTQIAPN+</span></div></a></header>
    <section className="hero"><div className="hero-content"><span className="hero-pill">✨ Interview Coach</span><h1>Pratique inglês para <em>entrevistas de emprego</em></h1><p>Desenvolva suas habilidades de comunicação em inglês, conquiste mais confiança e amplie suas oportunidades de carreira.</p><ul className="hero-benefits"><li>▣ &nbsp; Perguntas de entrevistas profissionais</li><li>✦ &nbsp; Traduções, dicas e exemplos</li><li>↗ &nbsp; Avaliação para acompanhar seu aprendizado</li></ul><a className="hero-cta" href="#disciplina">Começar treino gratuito <span aria-hidden="true">→</span></a></div><div className="hero-bottom"><span>◎ &nbsp; Situações reais de trabalho</span><span>▤ &nbsp; Diferentes áreas profissionais</span><span>▥ &nbsp; Evolução no seu ritmo</span><span>♧ &nbsp; Ambiente seguro e inclusivo</span></div></section>
    <section id="disciplina" className="panel" aria-label="Disciplina de inglês para entrevistas">
      <p className="eyebrow">MY FIRST JOB INTERVIEW</p><h2>Minha primeira entrevista em inglês</h2>
      <p>Aprenda em quatro etapas: preparação, aprendizagem guiada, prática e avaliação final. Você poderá estudar exemplos antes de responder. A avaliação verifica apenas este conteúdo, não sua proficiência geral.</p>
      {stage==='intro' && <form onSubmit={e=>{e.preventDefault();setIndex(0);setAnswer('');setPracticeAnswers([]);setQuizAnswers({});setShowExample(false);setGuidedIndex(0);setStage('preparation');}}>
        <label htmlFor="area">Área profissional</label><select id="area" value={area} onChange={e=>setArea(e.target.value)}>{Object.entries(areas).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
        <label htmlFor="level">Seu nível de inglês</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}>{Object.entries(levels).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select>
        <button type="submit">Começar minha jornada →</button>
      </form>}
      {stage==='intro' && <div className="journey-list" aria-label="Etapas da aprendizagem">
        {[['01','Preparação','Conheça expressões essenciais e como funciona uma entrevista.'],['02','Aprendizagem guiada','Leia traduções, respostas-modelo e dicas.'],['03','Prática','Escreva suas respostas e pratique no seu ritmo.'],['04','Avaliação final','Verifique o que aprendeu e revise as respostas.']].map(([n,title,desc])=><div className="journey-step" key={n}><span className="journey-number">{n}</span><div><strong>{title}</strong><p>{desc}</p></div></div>)}
      </div>}
      {stage==='preparation' && <div className="training">
        <p className="progress">ETAPA 1 DE 4 • Preparação</p><div className="progress-track"><div style={{width:'25%'}}/></div>
        <h3>Seu primeiro contato com entrevistas em inglês</h3>
        <p>Você não precisa falar inglês perfeitamente para começar. Nesta jornada, vamos estudar perguntas comuns e construir respostas simples, uma etapa por vez.</p>
        <div className="learning-card"><strong>Expressões para começar</strong><p><b>Hello!</b> — Olá!</p><p><b>My name is...</b> — Meu nome é...</p><p><b>I am learning English.</b> — Estou aprendendo inglês.</p><p><b>Thank you for the opportunity.</b> — Obrigada pela oportunidade.</p></div>
        <p className="tip">Dica: use respostas verdadeiras e curtas. Você pode estudar cada exemplo antes de escrever.</p>
        <div className="actions"><button type="button" className="secondary" onClick={restart}>Voltar</button><button type="button" onClick={()=>setStage('guided')}>Continuar para aprendizagem →</button></div>
      </div>}
      {stage==='guided' && <div className="training">
        <p className="progress">ETAPA 2 DE 4 • Aprendizagem guiada • {guidedIndex+1} de {available.length}</p><div className="progress-track"><div style={{width:(25+25*(guidedIndex+1)/available.length)+'%'}}/></div>
        <h3>Aprenda com uma pergunta de entrevista</h3>
        <div className="learning-card"><strong>{guided.en}</strong><p><b>Tradução:</b> {guided.pt}</p></div>
        <div className="learning-card"><strong>Exemplo de resposta</strong><p>{guided.sample}</p><small>Este é apenas um modelo. Use sua própria experiência na prática.</small></div>
        <p className="tip"><strong>Dica da BellaTech:</strong> {guided.tip}</p>
        <div className="actions"><button type="button" className="secondary" onClick={()=>guidedIndex===0?setStage('preparation'):setGuidedIndex(i=>i-1)}>Voltar</button><button type="button" onClick={()=>{if(guidedIndex+1>=available.length){setIndex(0);setStage('practice')}else setGuidedIndex(i=>i+1)}}>{guidedIndex+1>=available.length?'Começar a praticar →':'Próximo exemplo →'}</button></div>
      </div>}
      {stage==='practice' && <div className="training">
        <p className="progress">ETAPA 3 DE 4 • Prática {index+1} de {available.length}</p>
        <div className="progress-track"><div style={{width:(50+(index+1)/available.length*25)+'%'}}/></div>
        <h3>{current.en}</h3><p><strong>Tradução:</strong> {current.pt}</p>
        <label htmlFor="answer">Sua resposta em inglês <span aria-hidden="true">*</span></label>
        <textarea id="answer" rows={4} required value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Escreva sua resposta em inglês. Não inclua informações pessoais."/>
        <p className="tip"><strong>Dica:</strong> {current.tip}</p>
        <button type="button" className="secondary" onClick={()=>setShowExample(v=>!v)}>{showExample?'Ocultar exemplo':'Ver resposta de exemplo'}</button>
        {showExample && <div className="output"><strong>Exemplo para estudar:</strong><p>{current.sample}</p><small>Adapte ao seu contexto; não invente experiências.</small></div>}
        <div className="actions"><button type="button" className="secondary" onClick={restart}>Sair do treino</button><button type="button" disabled={!answer.trim()} onClick={advancePractice}>{index+1>=available.length?'Concluir prática →':'Próxima pergunta →'}</button></div>
      </div>}
      {stage==='evaluation-intro' && <div className="training">
        <p className="progress">ETAPA 4 DE 4 • Avaliação final</p><div className="progress-track"><div style={{width:'100%'}}/></div>
        <h3>Você concluiu a prática!</h3><p>Agora você pode avaliar o que aprendeu. São dez questões sobre as expressões estudadas, com explicações ao final. A meta demonstrativa é acertar sete questões.</p>
        <p className="tip">A avaliação é sobre o conteúdo da jornada, não sobre sua capacidade profissional ou fluência.</p>
        <div className="actions"><button type="button" className="secondary" onClick={()=>{setIndex(available.length-1);setStage('practice')}}>Revisar prática</button><button type="button" onClick={()=>setStage('quiz')}>Iniciar avaliação →</button></div>
      </div>}
      {stage==='quiz' && <div className="training">
        <p className="progress">ETAPA 4 DE 4 • Avaliação final</p>
        <h3>Questionário de aprendizagem</h3><p>Responda todas as 10 questões. Cada acerto vale um ponto. Nota mínima: 7/10 (70%).</p>
        {quiz.map((item,i)=><fieldset className="quiz-question" key={i}><legend>{i+1}. {item.q}</legend>{item.opts.map((option,j)=><label className="quiz-option" key={j}><input type="radio" name={'q'+i} checked={quizAnswers[i]===j} onChange={()=>setQuizAnswers(prev=>({...prev,[i]:j}))}/><span>{option}</span></label>)}</fieldset>)}
        <p className="progress">{Object.keys(quizAnswers).length} de 10 questões respondidas</p>
        <button type="button" disabled={Object.keys(quizAnswers).length!==10} onClick={submitQuiz}>Concluir avaliação e ver resultado</button>
      </div>}
      {stage==='result' && <div className="training" aria-live="polite">
        <p className="progress">DISCIPLINA 01 • RESULTADO</p><h3>{passed?'Parabéns! Disciplina concluída.':'Você está progredindo. Vamos revisar?'}</h3>
        <div className="score"><strong>{score}/10</strong><span>{score*10}% de acertos • {attempts}ª tentativa</span></div>
        <p>{passed?'Você atingiu a meta de 70%. A próxima disciplina ficará disponível quando for criada.':'Para desbloquear a próxima disciplina, é necessário atingir 70%. Revise as explicações e tente novamente.'}</p>
        <h3>Revisão das respostas</h3>
        {quiz.map((item,i)=><div className="review-item" key={i}><strong>{i+1}. {quizAnswers[i]===item.correct?'✓ Correta':'✕ Revisar'}</strong><p>{item.q}</p><p><strong>Resposta esperada:</strong> {item.opts[item.correct]}</p><small>{item.why}</small></div>)}
        <p className="privacy-note">Nesta versão, suas respostas e notas não são enviadas ao banco de dados. Ao fechar a página, você perde o resultado. O cadastro e o histórico individual ainda não foram implementados.</p>
        <div className="actions">{!passed && <button type="button" onClick={()=>{setQuizAnswers({});setStage('quiz');}}>Refazer avaliação</button>}<button type="button" className="secondary" onClick={restart}>Voltar ao início</button></div>
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
