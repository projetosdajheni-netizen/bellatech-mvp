import { useState } from 'react';

export default function App() {
  const [area, setArea] = useState('');
  const [level, setLevel] = useState('zero');

  return <main className="container">
    <header><div className="logo">✦</div><div><strong>BellaTech</strong><small>Inglês profissional • IA • oportunidades</small></div></header>
    <section className="hero"><span>PROTÓTIPO INICIAL</span><h1>Treine para entrevistas em inglês, no seu ritmo.</h1><p>Uma experiência de inglês aplicado ao trabalho, mesmo começando do zero.</p></section>
    <section className="panel"><h2>Monte sua atividade</h2>
      <p>Estamos preparando os testes de segurança e a revisão humana. A geração por IA está temporariamente desativada.</p>
      <form onSubmit={e=>e.preventDefault()}>
        <label htmlFor="area">Área profissional desejada</label>
        <input id="area" maxLength="80" value={area} onChange={e=>setArea(e.target.value)} placeholder="Ex.: tecnologia, atendimento" />
        <label htmlFor="level">Seu nível de inglês</label>
        <select id="level" value={level} onChange={e=>setLevel(e.target.value)}>
          <option value="zero">Começando do zero</option>
          <option value="iniciante">Iniciante</option>
          <option value="basico">Básico</option>
        </select>
        <button type="button" disabled aria-disabled="true">Geração em preparação</button>
      </form>
      <p className="warning">Não informe dados pessoais. Este protótipo ainda não recebe solicitações nem gera atividades.</p>
    </section>
    <footer>Projeto acadêmico em desenvolvimento • Nenhuma promessa de contratação ou fluência</footer>
  </main>;
}
