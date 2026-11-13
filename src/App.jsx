import { useState } from 'react';

export default function App() {
  const [area, setArea] = useState('');
  const [level, setLevel] = useState('zero');
  const [access, setAccess] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function generate(e) {
    e.preventDefault();
    setResult(null); setErr(''); setBusy(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + access },
        body: JSON.stringify({ area, level })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Não foi possível solicitar a atividade.');
      setResult(json);
    } catch (error) { setErr(error.message); }
    finally { setBusy(false); }
  }

  return <main className="container">
    <header><div className="logo">✦</div><div><strong>BellaTech</strong><small>Inglês profissional • IA • oportunidades</small></div></header>
    <section className="hero">
      <span>PROTÓTIPO EM TESTES</span>
      <h1>Treine para entrevistas em inglês, no seu ritmo.</h1>
      <p>Uma experiência de inglês aplicado ao trabalho, mesmo começando do zero.</p>
    </section>
    <section className="panel">
      <h2>Área de testes restritos</h2>
      <p>A geração por IA permanece desligada até configuração autorizada. Nenhum conteúdo é entregue automaticamente: todas as atividades passam por revisão humana.</p>
      <p className="warning">Este formulário é exclusivo da equipe de testes. Não compartilhe o código de acesso nem insira dados pessoais.</p>
      <form onSubmit={generate}>
        <label htmlFor="access">Código privado de teste</label>
        <input id="access" type="password" autoComplete="off" value={access}
          onChange={e=>setAccess(e.target.value)} placeholder="Somente equipe autorizada" required />
        <label htmlFor="area">Área profissional desejada</label>
        <input id="area" value={area} onChange={e=>setArea(e.target.value)}
          maxLength={60} placeholder="Ex.: tecnologia, atendimento" required />
        <label htmlFor="level">Nível de inglês</label>
        <select id="level" value={level} onChange={e=>setLevel(e.target.value)}>
          <option value="zero">Começando do zero</option>
          <option value="iniciante">Iniciante</option>
          <option value="basico">Básico</option>
        </select>
        <button disabled={busy || !access}>{busy ? 'Registrando...' : 'Solicitar atividade (teste privado)'}</button>
      </form>
      {err && <p className="error" role="alert">{err}</p>}
      {result && <div role="status" className="warning">
        <strong>Solicitação registrada</strong>
        <p>Identificador: <code>{result.activityId}</code></p>
        <p>Status: aguardando revisão humana. Nenhuma atividade foi publicada.</p>
      </div>}
    </section>
    <footer>Projeto acadêmico em desenvolvimento • Não utilize dados pessoais • Nenhuma promessa de contratação ou fluência</footer>
  </main>;
}
