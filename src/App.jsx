import React, { useState, useEffect, useRef } from 'react';
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
const goals={entrevista:'Preparar-me para entrevistas',trabalho:'Comunicar-me no trabalho',carreira:'Desenvolver minha carreira'};
const paths=[{id:'fundamentos',title:'Fundamentos do inglês profissional'},{id:'entrevista',title:'Inglês para entrevistas'},{id:'trabalho',title:'Comunicação no trabalho'}];
const learningModules=[
 {title:'Apresente-se em inglês',desc:'Construa sua apresentação profissional.',items:[
  {en:'My name is Ana.',pt:'Meu nome é Ana.',q:'Complete: My name ___ Ana.',opts:['am','is','are'],correct:1,why:'Com “my name”, usamos “is”.'},
  {en:'I am learning English.',pt:'Estou aprendendo inglês.',q:'Qual frase significa “Estou aprendendo inglês”?',opts:['I is learning English.','I am learning English.','I are English.'],correct:1,why:'Com “I”, usamos “am”.'}]},
 {title:'Vocabulário de tecnologia',desc:'Reconheça termos comuns em tecnologia.',items:[
  {en:'I work with a team.',pt:'Eu trabalho com uma equipe.',q:'O que significa “team”?',opts:['Equipe','Computador','Entrevista'],correct:0,why:'Team significa equipe.'},
  {en:'I am interested in software.',pt:'Tenho interesse em software.',q:'Qual expressão indica interesse?',opts:['I am interested in...','I am late for...','I do not know...'],correct:0,why:'“I am interested in” significa “Tenho interesse em”.'}]},
 {title:'Fale sobre suas habilidades',desc:'Comunique competências e interesses.',items:[
  {en:'I can solve problems.',pt:'Eu consigo resolver problemas.',q:'Qual frase expressa uma habilidade?',opts:['I can solve problems.','I am a problem.','I have a problem yesterday.'],correct:0,why:'“I can” é usado para indicar algo que você consegue fazer.'},
  {en:'I like learning new technologies.',pt:'Eu gosto de aprender novas tecnologias.',q:'Complete: I ___ learning new technologies.',opts:['likes','like','liking'],correct:1,why:'Com “I”, usamos “like” nessa frase.'}]},
 {title:'Minha primeira entrevista',desc:'Pratique respostas de uma conversa profissional.',items:[
  {en:'Tell me about yourself.',pt:'Fale um pouco sobre você.',q:'Qual resposta apresenta você?',opts:['My name is Ana. I am learning English.','I no name English.','Technology is name.'],correct:0,why:'Uma apresentação pode começar com seu nome e o que está aprendendo.'},
  {en:'Why are you interested in technology?',pt:'Por que você tem interesse em tecnologia?',q:'Qual resposta demonstra interesse profissional?',opts:['I never want to learn.','I want to learn and develop my skills.','I am not interested.'],correct:1,why:'A resposta expressa interesse em aprender e desenvolver habilidades.'}]}
];
const modulePhotos=[
 ['bellatech_capa_modulo_1.jpg','Mulher em videochamada profissional'],
 ['bellatech_capa_modulo_2.jpg','Mulher trabalhando com tecnologia'],
 ['bellatech_capa_modulo_3.jpg','Mulher 50+ apresentando suas habilidades'],
 ['bellatech_capa_modulo_4.jpg','Mulher em entrevista profissional']
];
function ModuleCover({variant,locked}){
 const [filename,description]=modulePhotos[variant];
 return <div className={'module-cover module-photo-cover module-cover-'+variant+(locked?' cover-locked':'')}>
  <img src={'https://raw.githubusercontent.com/projetosdajheni-netizen/bellatech-mvp/main/'+filename} alt={description} loading="lazy"/>
  {locked&&<span className="module-cover-lock" aria-label="Módulo bloqueado">🔒</span>}
 </div>;
}
function AudioControls({en,pt}) {
 const [slow,setSlow]=useState(false);const [notice,setNotice]=useState('');
 function speak(t,lang){
  if(typeof window==='undefined'||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){setNotice('Áudio indisponível neste navegador.');return;}
  const synth=window.speechSynthesis;
  synth.cancel();
  const normalize=value=>(value||'').toLowerCase().replace(/_/g,'-');
  const selectVoice=()=>{
   const voices=synth.getVoices();
   const matching=voices.filter(v=>normalize(v.lang).startsWith(lang.slice(0,2).toLowerCase()));
   const femaleHints=/female|feminina|woman|mulher|samantha|victoria|karen|moira|tessa|ava|allison|susan|zira|jenny|aria|sonia|natasha|joana|luciana|francisca|helena|maria|paulina|camila/i;
   const maleHints=/(^|[^a-z])male([^a-z]|$)|masculin|daniel|david|mark|alex|fred|jorge|felipe|ricardo|pedro|carlos/i;
   const ranked=matching.map(v=>({voice:v,score:(normalize(v.lang)===normalize(lang)?5:0)+(femaleHints.test(v.name)?20:0)-(maleHints.test(v.name)?20:0)})).sort((a,b)=>b.score-a.score);
   return ranked.find(v=>v.score>=20)?.voice||null;
  };
  const play=()=>{
   const u=new SpeechSynthesisUtterance(t);u.lang=lang;u.rate=slow?.75:1;
   const voice=selectVoice();
   if(voice){u.voice=voice;setNotice('');}
   else setNotice('Não há voz feminina identificável neste aparelho. Será usada a voz padrão disponível.');
   u.onerror=()=>setNotice('Não foi possível reproduzir o áudio.');
   synth.speak(u);
  };
  if(!synth.getVoices().length){
   let started=false;
   const onVoices=()=>{if(started)return;started=true;synth.removeEventListener?.('voiceschanged',onVoices);play();};
   synth.addEventListener?.('voiceschanged',onVoices,{once:true});
   setTimeout(onVoices,600);
  }else play();
 }
 return <div className="audio-controls"><button type="button" className="secondary" onClick={()=>speak(en,'en-US')}>🔊 Ouvir em inglês</button>{pt&&<button type="button" className="secondary" onClick={()=>speak(pt,'pt-BR')}>🔊 Ouvir em português</button>}<label><input type="checkbox" checked={slow} onChange={e=>setSlow(e.target.checked)}/> Áudio mais lento</label>{notice&&<small role="status">{notice}</small>}</div>;
}

// Supabase public client configuration. Only publishable credentials are included.
const SB_URL='https://sbgioddnffycpuwvkact.supabase.co';
const SB_KEY='sb_publishable_cGHOaAtOzPQVhfrO83Wnxw_FpK8fZV-';
const authHeaders={'apikey':SB_KEY,'Content-Type':'application/json'};
const PASSWORD_OK=p=>p.length>=8&&/[A-Z]/.test(p)&&/[a-z]/.test(p)&&/[^A-Za-z0-9]/.test(p);
async function authRequest(endpoint,body,token){
 const response=await fetch(SB_URL+'/auth/v1/'+endpoint,{method:'POST',headers:{...authHeaders,...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.msg||data.error_description||data.message||data.error||'Não foi possível concluir a solicitação.');
 return data;
}
async function progressRequest(token,method,body){
 const response=await fetch(SB_URL+'/rest/v1/learning_progress'+(method==='GET'?'?select=selected_path,unlocked_modules,last_module,quiz_score,quiz_attempts':''),{
 method,headers:{...authHeaders,Authorization:'Bearer '+token,...(method==='POST'?{Prefer:'resolution=merge-duplicates,return=representation'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.message||'Erro ao sincronizar progresso.');}
 return response.json().catch(()=>[]);
}

export default function App() {
  const [authMode,setAuthMode]=useState('login');
  const [authOpen,setAuthOpen]=useState(false);
  const [authEmail,setAuthEmail]=useState('');
  const [authPassword,setAuthPassword]=useState('');
  const [authError,setAuthError]=useState('');
  const [authMessage,setAuthMessage]=useState('');
  const [authBusy,setAuthBusy]=useState(false);
  const [session,setSession]=useState(null);
  const [syncStatus,setSyncStatus]=useState('');
  const [authLoaded,setAuthLoaded]=useState(false);
  const progressReady=useRef(false);
  const sessionRef=useRef(null);
  const progressRef=useRef(null);
  const [progressLoaded,setProgressLoaded]=useState(false);
  const [hasSavedJourney,setHasSavedJourney]=useState(false);
  const [savedScore,setSavedScore]=useState(null);
  const [savedAttempts,setSavedAttempts]=useState(0);
  const saveQueue=useRef(Promise.resolve());
  const latestProgress=useRef(null);
  const savingUser=useRef(null);
  useEffect(()=>{sessionRef.current=session;},[session]);
  useEffect(()=>{
    const saved=sessionStorage.getItem('bellatech_auth');
    if(!saved){setAuthLoaded(true);return;}
    try{
      const old=JSON.parse(saved);
      if(old.refresh_token){
        authRequest('token?grant_type=refresh_token',{refresh_token:old.refresh_token}).then(data=>{
          if(data.access_token){sessionStorage.setItem('bellatech_auth',JSON.stringify(data));setSession(data);}
        }).catch(()=>sessionStorage.removeItem('bellatech_auth')).finally(()=>setAuthLoaded(true));
      }else setAuthLoaded(true);
    }catch{sessionStorage.removeItem('bellatech_auth');setAuthLoaded(true);}
  },[]);
  async function handleAuth(e){
    e.preventDefault();setAuthError('');setAuthMessage('');
    if(authMode==='signup'&&!PASSWORD_OK(authPassword)){setAuthError('Use pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um símbolo.');return;}
    setAuthBusy(true);
    try{
      if(authMode==='reset'){
        await authRequest('recover',{email:authEmail});
        setAuthMessage('Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
      }else{
        const data=await authRequest(authMode==='signup'?'signup':'token?grant_type=password',{email:authEmail,password:authPassword});
        if(data.access_token){
          sessionStorage.setItem('bellatech_auth',JSON.stringify(data));
          setSession(data);setAuthOpen(false);setAuthPassword('');
        }else setAuthMessage('Cadastro recebido. Verifique seu e-mail para confirmar a conta antes de entrar.');
      }
    }catch(error){setAuthError(error.message);}
    finally{setAuthBusy(false);}
  }
  async function logout(){
    const token=sessionRef.current?.access_token;
    if(token&&progressReady.current&&latestProgress.current){
      try{
        await queueProgressSave(token,latestProgress.current);
        await saveQueue.current;
      }catch(error){setSyncStatus('Não foi possível salvar seu progresso: '+error.message);return;}
    }
    if(token)await authRequest('logout',{},token).catch(()=>{});
    sessionStorage.removeItem('bellatech_auth');progressReady.current=false;setProgressLoaded(false);
    setSession(null);setSyncStatus('');setHasSavedJourney(false);
    setUnlocked(0);setModuleIndex(0);setQuizAnswers({});setAttempts(0);setPath('fundamentos');
    setStage('home');
  }
  const [area,setArea] = useState('geral');
  const [goal,setGoal]=useState('entrevista');
  const [path,setPath]=useState('fundamentos');
  const [level,setLevel] = useState('zero');
  const [stage,setStage] = useState('home');
  const [shootingStars,setShootingStars]=useState([]);
  const starCounter=useRef(0);
  const lastStarTime=useRef(0);
  function createShootingStar(event){
    if(event.pointerType!=='mouse'&&event.pointerType!=='touch'&&event.pointerType!=='pen')return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const now=Date.now();
    if(now-lastStarTime.current<210)return;
    lastStarTime.current=now;
    const bounds=event.currentTarget.getBoundingClientRect();
    const x=event.clientX-bounds.left;
    const y=event.clientY-bounds.top;
    const id=++starCounter.current;
    setShootingStars(current=>[...current.slice(-7),{id,x,y}]);
  }

  const previousStages = useRef([]);
  const currentStage = useRef('home');
  const skipHistory = useRef(false);
  useEffect(()=>{
    if(stage===currentStage.current)return;
    if(skipHistory.current){skipHistory.current=false;}
    else if(stage==='home'){previousStages.current=[];}
    else {previousStages.current.push(currentStage.current);}
    currentStage.current=stage;
  },[stage]);
  function goToPreviousPage(){
    const previous=previousStages.current.pop();
    if(!previous)return;
    skipHistory.current=true;
    setStage(previous);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  const [guidedIndex,setGuidedIndex] = useState(0);
  const [unlocked,setUnlocked]=useState(0);
  const [moduleIndex,setModuleIndex]=useState(0);
  const [activityIndex,setActivityIndex]=useState(0);
  const [moduleChoice,setModuleChoice]=useState(null);
  const [moduleChecked,setModuleChecked]=useState(false);
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
  const recommended=level==='zero'?'fundamentos':goal==='trabalho'?'trabalho':'entrevista';
  const available = exercises.filter(q => (q.area === area || q.area === 'geral') && (q.level === level || q.level === 'zero')).slice(0,3);
  const current = available[index] || available[0];
  const guided = available[guidedIndex] || available[0];
  const score = quiz.reduce((sum,q,i)=>sum+(quizAnswers[i]===q.correct?1:0),0);
  const passed = score >= 7;
  function queueProgressSave(token,payload){
    saveQueue.current=saveQueue.current.catch(()=>{}).then(()=>progressRequest(token,'POST',payload));
    return saveQueue.current;
  }
  useEffect(()=>{
    if(!session?.access_token||!authLoaded)return;
    progressReady.current=false;setProgressLoaded(false);
    let active=true;
    progressRequest(session.access_token,'GET').then(rows=>{
      if(!active)return;
      const row=rows?.[0];
      if(row){
        setPath(row.selected_path||'fundamentos');
        setUnlocked(row.unlocked_modules||0);
        setModuleIndex(row.last_module||0);
        setAttempts(row.quiz_attempts||0);
        setSavedScore(row.quiz_score);
        setSavedAttempts(row.quiz_attempts||0);
        setHasSavedJourney(true);
        setSyncStatus('Progresso recuperado da nuvem.');
      }else{
        setHasSavedJourney(false);
        setSavedScore(null);
        setSavedAttempts(0);
        setSyncStatus('Sua jornada está pronta para ser salva na nuvem.');
      }
      // Allow the save effect only after the remote snapshot has been applied.
      progressReady.current=true;
      setProgressLoaded(true);
    }).catch(error=>{if(active)setSyncStatus('Não foi possível carregar seu progresso: '+error.message);});
    return ()=>{active=false;};
  },[session?.access_token,authLoaded]);
  useEffect(()=>{
    if(!session?.access_token||!progressLoaded||!progressReady.current)return;
    const payload={
      user_id:session.user.id,selected_path:path,unlocked_modules:unlocked,
      last_module:Math.min(moduleIndex,3),
      quiz_score:stage==='result'?score:savedScore,
      quiz_attempts:attempts,updated_at:new Date().toISOString()
    };
    latestProgress.current=payload;
    const timer=setTimeout(()=>{
      queueProgressSave(session.access_token,payload)
        .then(()=>{setHasSavedJourney(true);setSyncStatus('Progresso salvo na nuvem.');})
        .catch(error=>setSyncStatus('Erro ao salvar progresso: '+error.message));
    },450);
    return ()=>clearTimeout(timer);
  },[session?.access_token,progressLoaded,path,unlocked,moduleIndex,attempts,stage,savedScore]);
  function continueJourney(){
    if(!session||!progressLoaded)return;
    setStage('module-map');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function goHome(){
    setStage('home');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function choosePath(id){setSavedScore(null);setUnlocked(0);setModuleIndex(0);setActivityIndex(0);setModuleChoice(null);setModuleChecked(false);setPath(id);setGuidedIndex(0);setIndex(0);setAnswer('');setPracticeAnswers([]);setQuizAnswers({});setStage('module-map');}
  function restart(){setActivityIndex(0);setModuleChoice(null);setModuleChecked(false);setGuidedIndex(0);setStage('intro');setIndex(0);setAnswer('');setShowExample(false);setQuizAnswers({});setPracticeAnswers([]);}
  function openModule(i){if(i>unlocked)return;setModuleIndex(i);setActivityIndex(0);setModuleChoice(null);setModuleChecked(false);setStage('module-activity');}
  function advanceModule(){const total=learningModules[moduleIndex].items.length;if(activityIndex+1<total){setActivityIndex(i=>i+1);setModuleChoice(null);setModuleChecked(false);}else{setUnlocked(n=>Math.max(n,moduleIndex+1));setStage('module-map');}}
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
  return <main className={stage==='home'?"container home-container":"container"}>
    <header className="brand-header"><a className="brand-home-link" href="/" aria-label="BellaTech — voltar à página inicial"><div className="logo logo-shooting-star" aria-hidden="true"><svg viewBox="0 0 70 65" width="58" height="54" focusable="false"><defs><linearGradient id="bellatech-logo-trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#EAA5F5" stopOpacity="0"/><stop offset="1" stopColor="#E13DAA"/></linearGradient></defs><g className="logo-star-motion"><path d="M6 54 Q22 35 47 23" stroke="url(#bellatech-logo-trail)" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M48 10 L52 20 L63 24 L52 28 L48 39 L44 28 L33 24 L44 20Z" fill="#E13DAA"/></g><circle cx="24" cy="19" r="2" fill="#AD7AE8"/></svg></div><div className="brand-copy"><strong className="brand-name">Bella<span className="brand-tech">Tech</span></strong><small className="brand-subtitle">Desenvolvimento profissional e empregabilidade</small><span className="brand-audience">Para mulheres LGBTQIAPN+</span></div></a><div className="auth-header-actions">{session?<><span className="auth-user-label">{session.user?.email}</span><button type="button" className="secondary" onClick={logout}>Sair</button></>:<button type="button" className="secondary" onClick={()=>{setAuthMode('login');setAuthOpen(true);setAuthError('');setAuthMessage('');}}>Entrar / Criar conta</button>}</div></header>
    {authOpen&&<div className="auth-overlay" role="presentation"><section className="auth-dialog" role="dialog" aria-modal="true" aria-label="Acesso à conta BellaTech"><button type="button" className="auth-close secondary" onClick={()=>setAuthOpen(false)} aria-label="Fechar">✕</button><h2>{authMode==='signup'?'Criar conta':authMode==='reset'?'Recuperar senha':'Entrar na BellaTech'}</h2><p>Entre para salvar sua jornada na nuvem e continuar em outro dispositivo.</p><form onSubmit={handleAuth}><label htmlFor="auth-email">E-mail</label><input id="auth-email" type="email" required autoComplete="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/>{authMode!=='reset'&&<><label htmlFor="auth-password">Senha</label><input id="auth-password" type="password" required minLength={authMode==='signup'?8:undefined} autoComplete={authMode==='signup'?'new-password':'current-password'} value={authPassword} onChange={e=>setAuthPassword(e.target.value)}/>{authMode==='signup'&&<small>Obrigatório: 8 caracteres ou mais, uma letra maiúscula, uma minúscula e um símbolo.</small>}</>}{authError&&<p className="auth-error" role="alert">{authError}</p>}{authMessage&&<p role="status">{authMessage}</p>}<button type="submit" disabled={authBusy}>{authBusy?'Aguarde...':authMode==='signup'?'Criar conta':authMode==='reset'?'Enviar instruções':'Entrar'}</button></form><div className="auth-links">{authMode!=='login'&&<button type="button" className="secondary" onClick={()=>{setAuthMode('login');setAuthError('');setAuthMessage('');}}>Já tenho conta</button>}{authMode!=='signup'&&<button type="button" className="secondary" onClick={()=>{setAuthMode('signup');setAuthError('');setAuthMessage('');}}>Criar conta</button>}{authMode!=='reset'&&<button type="button" className="secondary" onClick={()=>{setAuthMode('reset');setAuthError('');setAuthMessage('');}}>Esqueci minha senha</button>}</div></section></div>}
    {session&&syncStatus&&(/erro|falha|não foi possível/i.test(syncStatus))&&<p className="sync-notice" role="alert">{syncStatus}</p>}
    {stage==='home'&&session&&hasSavedJourney&&progressLoaded&&<section className="resume-journey" aria-label="Retomar sua aprendizagem"><div><strong>💜 Sua jornada está esperando!</strong><p>Trilha: {paths.find(p=>p.id===path)?.title} · {unlocked} de 4 módulos concluídos{savedScore!==null?' · Última avaliação: '+savedScore+'/10':''}</p></div><button type="button" onClick={continueJourney}>Continuar minha jornada →</button></section>}
    {stage==='home' && <section className="hero" onPointerMove={createShootingStar} onPointerDown={event=>{if(event.pointerType!=='mouse')createShootingStar(event);}}><div className="shooting-stars" aria-hidden="true">{shootingStars.map(star=><span key={star.id} className="shooting-star" style={{left:star.x,top:star.y}} onAnimationEnd={()=>setShootingStars(current=>current.filter(item=>item.id!==star.id))}/>)}</div><div className="hero-content"><span className="hero-pill">✨ Interview Coach</span><h1>Pratique inglês para <em>entrevistas de emprego</em></h1><p>Desenvolva sua comunicação em inglês, ganhe confiança e prepare-se para novas oportunidades profissionais.</p><button type="button" className="hero-cta" onClick={()=>{setStage("intro");window.scrollTo({top:0,behavior:"smooth"});}}><span className="hero-cta-rocket" aria-hidden="true">🚀</span><span className="hero-cta-label">Começar treino gratuito</span><span className="hero-cta-arrow" aria-hidden="true">→</span></button></div><div className="hero-mobile-photo" role="img" aria-label="Quatro mulheres sorrindo diante de uma bandeira arco-íris"/><div className="hero-bottom"><span>◎ &nbsp; Situações reais de trabalho</span><span>▤ &nbsp; Diferentes áreas profissionais</span><span>▥ &nbsp; Evolução no seu ritmo</span><span>♧ &nbsp; Ambiente seguro e inclusivo</span></div></section>}
    {stage!=='home' && <div className="journey-navigation"><div className="journey-navigation-actions"><button type="button" className="secondary" onClick={goToPreviousPage} disabled={previousStages.current.length===0}>← Página anterior</button><button type="button" className="secondary" onClick={goHome}>⌂ Voltar ao início</button></div><span>Ambiente de aprendizagem BellaTech</span></div>}
    {stage!=='home' && <section id="disciplina" className="panel" aria-label="Disciplina de inglês para entrevistas">
      {(stage==='intro'||stage==='paths') && <div className="journey-intro"><p className="eyebrow">INGLÊS PROFISSIONAL</p><h2>Encontre sua trilha</h2><p>Conte seu objetivo e escolha por onde começar. A sugestão é inicial e não representa um teste de proficiência.</p></div>}
      {stage==='intro' && <form onSubmit={e=>{e.preventDefault();setStage('paths')}}>
       <label htmlFor="goal">Objetivo profissional</label><select id="goal" value={goal} onChange={e=>setGoal(e.target.value)}>{Object.entries(goals).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
       <label htmlFor="area">Área de interesse</label><select id="area" value={area} onChange={e=>setArea(e.target.value)}>{Object.entries(areas).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
       <label htmlFor="level">Como você avalia seu inglês?</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}>{Object.entries(levels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
       <p className="privacy-note">Diagnóstico inicial demonstrativo baseado em autoavaliação. Atividades para estimar o nível ainda não foram implementadas.</p><button type="submit">Ver trilhas de aprendizagem →</button>
      </form>}
      {stage==='paths' && <div className="training"><p className="progress">ESCOLHA SUA TRILHA</p><h3>Sua jornada de aprendizagem</h3><p>{goals[goal]} • {areas[area]} • {levels[level]}</p>
       <div className="path-list">{paths.map(p=><article className="path-card" key={p.id}><strong>{p.title}</strong>{recommended===p.id&&<span className="path-tag">Recomendada para você</span>}<p>{p.id==='fundamentos'?'Apresentações e frases essenciais.':p.id==='entrevista'?'Perguntas e respostas de entrevistas.':'Expressões para o ambiente de trabalho.'}</p><button type="button" className={recommended===p.id?'recommended-path-button':undefined} onClick={()=>choosePath(p.id)}>{recommended===p.id?'✦ Começar minha trilha recomendada →':'Escolher esta trilha →'}</button></article>)}</div>
       <p className="tip">Neste MVP, as trilhas compartilham exercícios demonstrativos. Conteúdos específicos ainda serão desenvolvidos.</p><button type="button" className="secondary" onClick={()=>setStage('intro')}>Alterar respostas</button>
      </div>}
      {stage==='module-map' && <div className="training">
        <div className="journey-intro"><p className="eyebrow">TRILHA DE APRENDIZAGEM · {paths.find(p=>p.id===path)?.title}</p>
        <h2>Sua jornada começa aqui!</h2>
        <p>Desenvolva seu inglês para situações reais de trabalho. Conclua cada módulo para avançar e ganhar confiança na comunicação profissional.</p></div>
        <div className="module-progress"><div className="module-progress-label"><strong>Seu progresso</strong><span>{unlocked} de 4 módulos</span></div><div className="progress-track"><div style={{width:(unlocked/4*100)+'%'}}/></div></div>
        <div className="module-map">{learningModules.map((m,i)=><article className={'module-tile '+(i>unlocked?'module-locked':'')+(i<unlocked?' module-completed':'')} key={i}>
          <ModuleCover variant={i} locked={i>unlocked}/>
          <div className="module-details">
           <span className={'module-status '+(i>unlocked?'status-locked':i<unlocked?'status-done':'status-ready')}>{i>unlocked?'🔒 Bloqueado':i<unlocked?'✓ Concluído':'✦ Disponível'}</span>
           <strong>{String(i+1).padStart(2,'0')}. {m.title}</strong>
           <p>{m.desc}</p>
           <small>{i>unlocked?'Conclua o módulo anterior para liberar.':i<unlocked?'Você pode revisar quando quiser.':'Pronta para começar!'}</small>
          </div>
          <div className="module-card-action">{i<=unlocked?<button type="button" onClick={()=>openModule(i)}>{i<unlocked?'Revisar módulo':'Começar módulo →'}</button>:<button type="button" disabled aria-label={'Módulo '+(i+1)+' bloqueado'}>🔒 Bloqueado</button>}</div>
        </article>)}</div>
        <div className="module-extras">
         <article className="module-extra-card">
          <div className="module-extra-cover final-cover"><img src="https://raw.githubusercontent.com/projetosdajheni-netizen/bellatech-mvp/main/certificado%20final.png" alt="Participante comemorando a conclusão de sua jornada profissional" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/></div>
          <div className="module-extra-body">
           <span className={'module-status '+(unlocked===4?'status-ready':'status-locked')}>{unlocked===4?'✦ Disponível':'🔒 Bloqueado'}</span>
           <strong>🏆 Desafio final</strong>
           <p>{unlocked===4?'Você concluiu os quatro módulos! A avaliação opcional está disponível.':'Desbloqueado após concluir os quatro módulos.'}</p>
           {unlocked===4?<button type="button" onClick={()=>setStage('evaluation-intro')}>Ir para avaliação opcional →</button>:<button type="button" disabled>🔒 Bloqueado</button>}
          </div>
         </article>
         <article className="module-extra-card">
          <div className="module-extra-cover community-cover"><img src="https://raw.githubusercontent.com/projetosdajheni-netizen/bellatech-mvp/main/comunidade.png" alt="Mulheres de diferentes idades conversando e compartilhando experiências profissionais" loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/></div>
          <div className="module-extra-body">
           <span className="module-status status-community">🤝 Em planejamento</span>
           <strong>Comunidade BellaTech</strong>
           <p>Um espaço futuro para trocar experiências, criar conexões e compartilhar oportunidades profissionais.</p>
           <span className="module-extra-note">Funcionalidade ainda não disponível neste protótipo.</span>
          </div>
         </article>
        </div>
        <button type="button" className="secondary" onClick={()=>setStage('paths')}>Voltar às trilhas</button>
      </div>}
      {stage==='module-activity' && <div className="training">
        <p className="progress">MÓDULO {moduleIndex+1} DE 4 • ATIVIDADE {activityIndex+1} DE {learningModules[moduleIndex].items.length}</p>
        <h3>{learningModules[moduleIndex].title}</h3>
        <div className="learning-card"><strong>{learningModules[moduleIndex].items[activityIndex].en}</strong><p>{learningModules[moduleIndex].items[activityIndex].pt}</p><AudioControls en={learningModules[moduleIndex].items[activityIndex].en} pt={learningModules[moduleIndex].items[activityIndex].pt}/></div>
        <fieldset className="quiz-question"><legend>{learningModules[moduleIndex].items[activityIndex].q}</legend>
        {learningModules[moduleIndex].items[activityIndex].opts.map((opt,j)=><label className="quiz-option" key={j}><input type="radio" name="module-answer" checked={moduleChoice===j} onChange={()=>{setModuleChoice(j);setModuleChecked(false)}}/><span>{opt}</span></label>)}</fieldset>
        {moduleChecked&&<div className="learning-card" role="status"><strong>{moduleChoice===learningModules[moduleIndex].items[activityIndex].correct?'Muito bem!':'Vamos aprender com esta tentativa!'}</strong><p>{learningModules[moduleIndex].items[activityIndex].why}</p><p><b>Resposta:</b> {learningModules[moduleIndex].items[activityIndex].opts[learningModules[moduleIndex].items[activityIndex].correct]}</p></div>}
        <div className="actions"><button type="button" className="secondary" onClick={()=>setStage('module-map')}>Voltar ao mapa</button>
        <button type="button" disabled={moduleChoice===null} onClick={()=>moduleChecked?advanceModule():setModuleChecked(true)}>{!moduleChecked?'Conferir resposta':activityIndex+1===learningModules[moduleIndex].items.length?'Concluir módulo →':'Próxima atividade →'}</button></div>
      </div>}
      {stage==='preparation' && <div className="training">
        <p className="progress">ETAPA 1 DE 4 • Preparação • {paths.find(p=>p.id===path)?.title}</p><div className="progress-track"><div style={{width:'25%'}}/></div>
        <h3>Seu primeiro contato com entrevistas em inglês</h3>
        <p>Você não precisa falar inglês perfeitamente para começar. Nesta jornada, vamos estudar perguntas comuns e construir respostas simples, uma etapa por vez.</p>
        <div className="learning-card"><strong>Expressões para começar</strong><p><b>Hello!</b> — Olá!</p><p><b>My name is...</b> — Meu nome é...</p><p><b>I am learning English.</b> — Estou aprendendo inglês.</p><p><b>Thank you for the opportunity.</b> — Obrigada pela oportunidade.</p><AudioControls en="Hello! My name is Ana. I am learning English. Thank you for the opportunity." pt="Olá! Meu nome é Ana. Estou aprendendo inglês. Obrigada pela oportunidade."/></div>
        <p className="tip">Dica: use respostas verdadeiras e curtas. Você pode estudar cada exemplo antes de escrever.</p>
        <div className="actions"><button type="button" className="secondary" onClick={restart}>Voltar</button><button type="button" onClick={()=>setStage('guided')}>Continuar para aprendizagem →</button></div>
      </div>}
      {stage==='guided' && <div className="training">
        <p className="progress">ETAPA 2 DE 4 • Aprendizagem guiada • {guidedIndex+1} de {available.length}</p><div className="progress-track"><div style={{width:(25+25*(guidedIndex+1)/available.length)+'%'}}/></div>
        <h3>Aprenda com uma pergunta de entrevista</h3>
        <div className="learning-card"><strong>{guided.en}</strong><p><b>Tradução:</b> {guided.pt}</p><AudioControls en={guided.en} pt={guided.pt}/></div>
        <div className="learning-card"><strong>Exemplo de resposta</strong><p>{guided.sample}</p><AudioControls en={guided.sample}/><small>Este é apenas um modelo. Use sua própria experiência na prática.</small></div>
        <p className="tip"><strong>Dica da BellaTech:</strong> {guided.tip}</p>
        <div className="actions"><button type="button" className="secondary" onClick={()=>guidedIndex===0?setStage('preparation'):setGuidedIndex(i=>i-1)}>Voltar</button><button type="button" onClick={()=>{if(guidedIndex+1>=available.length){setIndex(0);setStage('practice')}else setGuidedIndex(i=>i+1)}}>{guidedIndex+1>=available.length?'Começar a praticar →':'Próximo exemplo →'}</button></div>
      </div>}
      {stage==='practice' && <div className="training">
        <p className="progress">ETAPA 3 DE 4 • Prática {index+1} de {available.length}</p>
        <div className="progress-track"><div style={{width:(50+(index+1)/available.length*25)+'%'}}/></div>
        <h3>{current.en}</h3><p><strong>Tradução:</strong> {current.pt}</p><AudioControls en={current.en} pt={current.pt}/>
        <label htmlFor="answer">Sua resposta em inglês <span aria-hidden="true">*</span></label>
        <textarea id="answer" rows={4} required value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Escreva sua resposta em inglês. Não inclua informações pessoais."/>
        <p className="tip"><strong>Dica:</strong> {current.tip}</p>
        <button type="button" className="secondary" onClick={()=>setShowExample(v=>!v)}>{showExample?'Ocultar exemplo':'Ver resposta de exemplo'}</button>
        {showExample && <div className="output"><strong>Exemplo para estudar:</strong><p>{current.sample}</p><AudioControls en={current.sample}/><small>Adapte ao seu contexto; não invente experiências.</small></div>}
        <div className="actions"><button type="button" className="secondary" onClick={restart}>Sair do treino</button><button type="button" disabled={!answer.trim()} onClick={advancePractice}>{index+1>=available.length?'Concluir prática →':'Próxima pergunta →'}</button></div>
      </div>}
      {stage==='evaluation-intro' && <div className="training">
        <p className="progress">ETAPA 4 DE 4 • Avaliação final</p><div className="progress-track"><div style={{width:'100%'}}/></div>
        <h3>Você concluiu a prática!</h3><p>Agora você pode avaliar o que aprendeu. São dez questões sobre as expressões estudadas, com explicações ao final. A meta demonstrativa é acertar sete questões.</p>
        <p className="tip">A avaliação é opcional e aborda o conteúdo da jornada, não sua capacidade profissional ou fluência.</p>
        <div className="actions"><button type="button" className="secondary" onClick={()=>{setIndex(available.length-1);setStage('practice')}}>Revisar prática</button><button type="button" onClick={()=>setStage('quiz')}>Iniciar avaliação opcional →</button><button type="button" className="secondary" onClick={restart}>Concluir sem avaliação</button></div>
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
        <p className="privacy-note">Com uma conta, a pontuação e os módulos concluídos são sincronizados na nuvem. As respostas escritas não são armazenadas.</p>
        <div className="actions">{!passed && <button type="button" onClick={()=>{setQuizAnswers({});setStage('quiz');}}>Refazer avaliação</button>}<button type="button" className="secondary" onClick={restart}>Voltar ao início</button></div>
      </div>}
    </section>}
    {stage==='home' && <div className="home-sections">
      <section className="home-value-section" aria-labelledby="home-value-title">
        <div className="home-section-heading"><span className="home-kicker">POR QUE BELLATECH?</span><h2 id="home-value-title">Inglês que faz sentido para sua carreira</h2><p>Uma experiência prática para desenvolver comunicação profissional, no seu ritmo e com situações do mundo do trabalho.</p></div>
        <div className="home-value-grid">
          <article className="home-value-card"><span className="home-value-icon" aria-hidden="true">💬</span><h3>Inglês profissional</h3><p>Aprenda expressões e respostas para situações reais de trabalho.</p></article>
          <article className="home-value-card"><span className="home-value-icon" aria-hidden="true">✨</span><h3>Aprendizagem prática</h3><p>Estude com exemplos, traduções, atividades e orientações para evoluir.</p></article>
          <article className="home-value-card"><span className="home-value-icon" aria-hidden="true">💼</span><h3>Desenvolvimento de carreira</h3><p>Pratique a comunicação e fortaleça sua confiança para novas oportunidades.</p></article>
        </div>
      </section>
      <section className="home-path-section" aria-labelledby="home-path-title">
        <div className="home-section-heading"><span className="home-kicker">CONHEÇA A EXPERIÊNCIA</span><h2 id="home-path-title">Sua jornada em quatro módulos</h2><p>Comece pelos fundamentos e avance passo a passo até o desafio final.</p></div>
        <div className="home-path-grid">
          {learningModules.map((module,i)=><article className="home-path-card" key={i}><div className="home-path-image"><img src={'https://raw.githubusercontent.com/projetosdajheni-netizen/bellatech-mvp/main/bellatech_capa_modulo_'+(i+1)+'.jpg'} alt="" loading="lazy"/></div><div className="home-path-info"><span>0{i+1} · MÓDULO</span><h3>{module.title}</h3></div></article>)}
        </div>
        <button type="button" className="home-path-button" onClick={()=>{setStage('intro');window.scrollTo({top:0,behavior:'smooth'});}}>Explorar minha jornada <span aria-hidden="true">→</span></button>
      </section>
      <section className="home-community-section" aria-labelledby="home-community-title">
        <img src="https://raw.githubusercontent.com/projetosdajheni-netizen/bellatech-mvp/main/comunidade.png" alt="Participantes compartilhando experiências em grupo" loading="lazy"/>
        <div><span className="home-kicker">CONEXÕES QUE IMPORTAM</span><h2 id="home-community-title">Comunidade BellaTech</h2><p>Estamos planejando um espaço de troca de experiências, apoio e conexões profissionais entre participantes.</p><span className="home-future-label">Em planejamento · ainda não disponível no protótipo</span></div>
      </section>
    </div>}
    <footer className="bellatech-footer"><div className="footer-rainbow" aria-hidden="true"><span/><span/><span/><span/><span/><span/></div><div className="footer-inner"><div className="footer-brand"><div className="logo logo-shooting-star" aria-hidden="true"><svg viewBox="0 0 70 65" width="58" height="54" focusable="false"><defs><linearGradient id="bellatech-logo-trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#EAA5F5" stopOpacity="0"/><stop offset="1" stopColor="#E13DAA"/></linearGradient></defs><g className="logo-star-motion"><path d="M6 54 Q22 35 47 23" stroke="url(#bellatech-logo-trail)" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M48 10 L52 20 L63 24 L52 28 L48 39 L44 28 L33 24 L44 20Z" fill="#E13DAA"/></g><circle cx="24" cy="19" r="2" fill="#AD7AE8"/></svg></div><div className="brand-copy"><strong className="brand-name">Bella<span className="brand-tech">Tech</span></strong><small className="brand-subtitle">Desenvolvimento profissional e empregabilidade</small><span className="brand-audience">Para mulheres LGBTQIAPN+</span></div></div><p className="footer-description">Desenvolvimento profissional e empregabilidade</p><p className="footer-disclaimer">Projeto acadêmico em desenvolvimento • Não compartilhe dados pessoais • Nenhuma promessa de contratação ou fluência</p></div></footer>
  </main>;
}
