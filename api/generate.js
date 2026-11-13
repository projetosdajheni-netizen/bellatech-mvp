// BellaTech — bloqueio temporário de geração de IA.
// A rota ficará desativada até existir autenticação/autorização no servidor,
// limite de uso e um fluxo de revisão humana. Não coloque chaves no frontend.
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Allow', 'POST');
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  // Nenhuma solicitação ao Gemini é realizada neste estágio.
  return response.status(503).json({
    error: 'A geração de atividades está temporariamente desativada para configuração de segurança e revisão humana.',
    code: 'AI_DISABLED'
  });
}
