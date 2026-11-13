import { useState } from 'react';
export default function App() {
  const [area, setArea] = useState('');
  const [level, setLevel] = useState('zero');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setLoading(true); setResult(''); setError('');
    try {
      const res = await fetch('/api/generate', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({area:area.trim(),level})});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar atividade.');
      setResult(data.activity);
    } catch (err) {setError(err.message)} finally {setLoading(false)}
  }
  return <main className="container">
    <header><div className="logo">✦</div><div><strong>BellaTech</strong><small>Inglês profissional • IA • oportunidades</small></div></header>
    <section className="hero"><span>PROTÓTIPO INICIAL</span><h1>Treine para entrevistas em inglês, no seu ritmo.</h1><p>Uma experiência de inglês aplicado ao trabalho, mesmo começando do zero.</p></section>
    <section className="panel"><h2>Monte sua atividade</h2><p>Não informe nome completo, contato ou dados pessoais.</p>
      <form onSubmit={submit}><label htmlFor="area">Área profissional desejada</label><input id="area" required maxLength="80" value={area} onChange={e=>setArea(e.target.value)} placeholder="Ex.: tecnologia, atendimento" />
        <label htmlFor="level">Seu nível de inglês</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}><option value="zero">Começando do zero</option><option value="iniciante">Iniciante</option><option value="basico">Básico</option></select>
        <button disabled={loading}>{loading?'Preparando atividade...':'Gerar atividade demonstrativa'}</button></form>
      {error&&<p role="alert" className="error">{error}</p>}</section>
    {result&&<section className="panel"><h2>Sua atividade</h2><p className="warning">Resultado ainda não revisado por uma pessoa. Apenas para testes, não para uso real.</p><div className="output">{result}</div></section>}
    <footer>Projeto acadêmico em desenvolvimento • Nenhuma promessa de contratação ou fluência</footer>
  </main>;
}
