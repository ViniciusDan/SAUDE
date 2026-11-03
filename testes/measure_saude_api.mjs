/**
 * Medição básica da API do projeto SAÚDE
 * Requer Node.js 18+ e backend rodando.
 *
 * Uso padrão:
 *   node measure-saude-api.mjs
 *
 * Variáveis opcionais:
 *   BASE_URL=http://localhost:3333
 *   CPF=10000000000
 *   PASSWORD=12345
 *   ITERATIONS=20
 *   WARMUP=3
 */

import { performance } from 'node:perf_hooks';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3333';
const CPF = process.env.CPF ?? '10000000011';
const PASSWORD = process.env.PASSWORD ?? '12345';
const ITERATIONS = Number(process.env.ITERATIONS ?? '20');
const WARMUP = Number(process.env.WARMUP ?? '3');

if (!Number.isInteger(ITERATIONS) || ITERATIONS < 1) {
  throw new Error('ITERATIONS deve ser um inteiro maior que zero.');
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  return {
    requisicoes: sorted.length,
    minimoMs: round(sorted[0] ?? 0),
    maximoMs: round(sorted.at(-1) ?? 0),
    mediaMs: round(sum / sorted.length),
    medianaMs: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
  };
}

async function timedRequest(url, options = {}) {
  const start = performance.now();
  const response = await fetch(url, options);
  const bodyText = await response.text();
  const elapsedMs = performance.now() - start;

  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status} em ${url}: ${JSON.stringify(body)}`);
  }

  return { elapsedMs, body };
}

async function login() {
  return timedRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf: CPF, password: PASSWORD }),
  });
}

async function summary(token, patientId) {
  return timedRequest(`${BASE_URL}/patients/${patientId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function duplicateIds(items = []) {
  const ids = items.map((item) => item?.id).filter(Boolean);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
}

function summaryIntegrity(summaryBody) {
  const collections = [
    'encounters',
    'observations',
    'allergies',
    'conditions',
    'procedures',
    'medications',
  ];

  const rows = collections.map((name) => {
    const records = Array.isArray(summaryBody?.[name]) ? summaryBody[name] : [];
    const duplicates = [...new Set(duplicateIds(records))];
    return {
      recurso: name,
      quantidade: records.length,
      idsDuplicados: duplicates.length,
      resultado: duplicates.length === 0 ? 'Sem duplicação aparente' : 'Revisar duplicações',
    };
  });

  return {
    pacientePresente: Boolean(summaryBody?.patient),
    rows,
  };
}

function markdownPerformanceTable(loginStats, summaryStats) {
  return [
    '| Endpoint | Quantidade de requisições | Menor tempo | Maior tempo | Tempo médio | Mediana | p95 |',
    '|---|---:|---:|---:|---:|---:|---:|',
    `| /auth/login | ${loginStats.requisicoes} | ${loginStats.minimoMs} ms | ${loginStats.maximoMs} ms | ${loginStats.mediaMs} ms | ${loginStats.medianaMs} ms | ${loginStats.p95Ms} ms |`,
    `| /patients/:patientId/summary | ${summaryStats.requisicoes} | ${summaryStats.minimoMs} ms | ${summaryStats.maximoMs} ms | ${summaryStats.mediaMs} ms | ${summaryStats.medianaMs} ms | ${summaryStats.p95Ms} ms |`,
  ].join('\n');
}

function markdownIntegrityTable(integrity) {
  const lines = [
    '| Recurso | Quantidade retornada | IDs duplicados | Resultado |',
    '|---|---:|---:|---|',
  ];

  for (const row of integrity.rows) {
    lines.push(`| ${row.recurso} | ${row.quantidade} | ${row.idsDuplicados} | ${row.resultado} |`);
  }

  return lines.join('\n');
}

async function main() {
  console.log(`API: ${BASE_URL}`);
  console.log(`CPF de teste: ${CPF}`);
  console.log(`Aquecimento: ${WARMUP} requisições | Medição: ${ITERATIONS} requisições por endpoint\n`);

  // Health check
  await timedRequest(`${BASE_URL}/health`);

  // Requisição inicial para obter token e patientId
  const initialLogin = await login();
  const token = initialLogin.body?.accessToken;
  const patientId = initialLogin.body?.user?.id;

  if (!token || !patientId) {
    throw new Error('A resposta do login não contém accessToken e user.id.');
  }

  // Warm-up para reduzir influência da primeira chamada
  for (let i = 0; i < WARMUP; i += 1) {
    await login();
    await summary(token, patientId);
  }

  const loginTimes = [];
  for (let i = 0; i < ITERATIONS; i += 1) {
    const result = await login();
    loginTimes.push(result.elapsedMs);
  }

  const summaryTimes = [];
  let firstSummaryBody;
  for (let i = 0; i < ITERATIONS; i += 1) {
    const result = await summary(token, patientId);
    summaryTimes.push(result.elapsedMs);
    firstSummaryBody ??= result.body;
  }

  const loginStats = stats(loginTimes);
  const summaryStats = stats(summaryTimes);
  const integrity = summaryIntegrity(firstSummaryBody);

  console.log('## Tabela de desempenho\n');
  console.log(markdownPerformanceTable(loginStats, summaryStats));

  console.log('\n\n## Verificação básica de integridade\n');
  console.log(`Paciente presente na resposta: ${integrity.pacientePresente ? 'Sim' : 'Não'}\n`);
  console.log(markdownIntegrityTable(integrity));

  console.log('\n\n## JSON completo\n');
  console.log(JSON.stringify({
    ambiente: {
      baseUrl: BASE_URL,
      cpfTeste: CPF,
      iteracoes: ITERATIONS,
      aquecimento: WARMUP,
      executadoEm: new Date().toISOString(),
    },
    desempenho: {
      login: loginStats,
      resumoClinico: summaryStats,
    },
    integridade: integrity,
  }, null, 2));
}

main().catch((error) => {
  console.error('\nErro ao executar medição:');
  console.error(error.message);
  process.exitCode = 1;
});
