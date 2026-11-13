import { useState } from 'react';

// Interface exclusivamente para avaliadoras autorizadas.
// A chave não é gravada em localStorage, cookies nem no repositório.
export default function ReviewPanel({ access }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState('');
  const [round, setRound] = useState(1);
  const [evaluatorCode, setEvaluatorCode] = useState('E1');
  const [approved, setApproved] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const chosen = items.find(x => x.id === selected);

  async function fetchReviews() {
    setMessage(''); setWorking(true);
    try {
      const response = await fetch('/api/reviews', {
        headers: { Authorization: 'Bearer ' + access }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems(data.activities || []);
      if (!selected && data.activities?.length) setSelected(data.activities[0].id);
    } catch (error) { setMessage(error.message || 'Erro ao consultar atividades.'); }
    finally { setWorking(false); }
  }

  async function saveReview(e) {
    e.preventDefault();
    if (!chosen || approved === '') return;
    setWorking(true); setMessage('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + access
        },
        body: JSON.stringify({
          activityId: chosen.id,
          round: Number(round),
          evaluatorCode,
          approved: approved === 'yes',
          notes
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage('Avaliação registrada. Rodada 1: ' + data.round1Reviews
        + '/3. Rodada 2: ' + data.round2Reviews
        + '/3. Status: ' + data.reviewStatus + '.');
      setNotes('');
      setApproved('');
      await fetchReviews();
    } catch (error) { setMessage(error.message || 'Falha ao salvar avaliação.'); }
    finally { setWorking(false); }
  }

  return <section className="panel">
    <h2>Revisão humana — área restrita</h2>
    <p>As avaliadoras devem registrar a decisão de forma independente. Os códigos E1–E3 são identificadores de teste; não comprovam, sozinhos, a identidade das avaliadoras.</p>
    <button type="button" disabled={!access || working} onClick={fetchReviews}>
      Carregar atividades restritas
    </button>
    {items.length > 0 && <>
      <label htmlFor="activity">Atividade para avaliar</label>
      <select id="activity" value={selected} onChange={e=>setSelected(e.target.value)}>
        {items.map(item => <option key={item.id} value={item.id}>
          {item.area} — {item.review_status} — {item.id.slice(0,8)}
        </option>)}
      </select>
      {chosen && <div className="output" style={{whiteSpace:'pre-wrap',marginTop:16}}>
        <strong>Texto gerado (somente para revisão):</strong>
        <p>{chosen.generated_content || 'Ainda não há conteúdo para avaliar.'}</p>
      </div>}
      {chosen?.review_status === 'pending' && chosen.generated_content && <form onSubmit={saveReview}>
        <label htmlFor="round">Rodada</label>
        <select id="round" value={round} onChange={e=>setRound(Number(e.target.value))}>
          <option value={1}>1 — avaliação inicial</option>
          <option value={2}>2 — após correções</option>
        </select>
        <label htmlFor="evaluator">Avaliadora</label>
        <select id="evaluator" value={evaluatorCode} onChange={e=>setEvaluatorCode(e.target.value)}>
          <option>E1</option><option>E2</option><option>E3</option>
        </select>
        <label htmlFor="decision">Critérios: correção do inglês, clareza, adequação ao nível e inclusão</label>
        <select id="decision" value={approved} onChange={e=>setApproved(e.target.value)} required>
          <option value="">Selecione uma decisão</option>
          <option value="yes">Aprovar</option>
          <option value="no">Solicitar correção</option>
        </select>
        <label htmlFor="notes">Justificativa da avaliação</label>
        <textarea id="notes" value={notes} onChange={e=>setNotes(e.target.value)}
          rows={4} minLength={3} maxLength={800} required
          placeholder="Indique acertos, problemas e correções necessárias."/>
        <button disabled={working || approved === ''}>Registrar avaliação privada</button>
      </form>}
    </>}
    {message && <p role="status">{message}</p>}
  </section>;
}
