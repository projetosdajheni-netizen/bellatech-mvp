// Diagnóstico seguro: consulta apenas metadados do modelo; não gera texto e não grava dados.
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('BELLA_GEMINI_METADATA: MISSING_KEY');
  process.exitCode = 1;
} else {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite', {
      headers: { 'x-goog-api-key': key },
      signal: AbortSignal.timeout(10000)
    });
    if (response.ok) {
      const info = await response.json();
      console.log('BELLA_GEMINI_METADATA_OK: ' + String(info.name || 'MODEL_FOUND') +
        '; canGenerate=' + Boolean(info.supportedGenerationMethods?.includes('generateContent')));
    } else {
      const json = await response.json().catch(() => null);
      const category = String(json?.error?.status || 'HTTP_ERROR').replace(/[^A-Z_]/g, '').slice(0,40);
      console.error('BELLA_GEMINI_METADATA_FAILURE: HTTP_' + response.status + ' / ' + category);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('BELLA_GEMINI_METADATA_FAILURE: NETWORK_ERROR');
    process.exitCode = 1;
  }
}
