/**
 * TESTE DE CARGA K6 - DIA 3 HOMOLOGAÇÃO
 * 
 * Simula 100 usuários simultâneos acessando o sistema
 * Testa endpoints críticos: projetos, tarefas, financeiro
 * 
 * Como executar:
 * 1. Instalar k6: https://k6.io/docs/getting-started/installation/
 * 2. Executar: k6 run tests/load-test.k6.js
 * 
 * Métricas esperadas:
 * - Tempo médio de resposta < 1s
 * - Taxa de erro < 1%
 * - Throughput > 1000 req/s
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');

// Configuração do teste
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm-up: 20 usuários em 30s
    { duration: '1m', target: 100 },   // Ramp-up: 100 usuários em 1min
    { duration: '2m', target: 100 },   // Carga sustentada: 100 usuários por 2min
    { duration: '30s', target: 0 },    // Ramp-down: reduzir para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% das requisições < 1s
    errors: ['rate<0.01'],               // Taxa de erro < 1%
    http_reqs: ['rate>1000'],           // > 1000 req/s
  },
};

// URL base do Supabase
const BASE_URL = 'https://xvpqgwbktpfodbuhwqhh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto';

// Headers padrão
const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

export default function () {
  // ===========================
  // TESTE 1: Listar Projetos
  // ===========================
  {
    const res = http.get(
      `${BASE_URL}/rest/v1/projetos?select=*&limit=50`,
      { headers, tags: { name: 'ListarProjetos' } }
    );
    
    check(res, {
      'Projetos: status 200': (r) => r.status === 200,
      'Projetos: tempo < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    
    apiResponseTime.add(res.timings.duration, { endpoint: 'projetos' });
  }
  
  sleep(0.5);
  
  // ===========================
  // TESTE 2: Listar Tarefas
  // ===========================
  {
    const res = http.get(
      `${BASE_URL}/rest/v1/tarefa?select=*&limit=50&order=created_at.desc`,
      { headers, tags: { name: 'ListarTarefas' } }
    );
    
    check(res, {
      'Tarefas: status 200': (r) => r.status === 200,
      'Tarefas: tempo < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    
    apiResponseTime.add(res.timings.duration, { endpoint: 'tarefas' });
  }
  
  sleep(0.5);
  
  // ===========================
  // TESTE 3: Listar Clientes
  // ===========================
  {
    const res = http.get(
      `${BASE_URL}/rest/v1/clientes?select=*&limit=50`,
      { headers, tags: { name: 'ListarClientes' } }
    );
    
    check(res, {
      'Clientes: status 200': (r) => r.status === 200,
      'Clientes: tempo < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
    
    apiResponseTime.add(res.timings.duration, { endpoint: 'clientes' });
  }
  
  sleep(0.5);
  
  // ===========================
  // TESTE 4: Dashboard Analytics
  // ===========================
  {
    const res = http.get(
      `${BASE_URL}/rest/v1/rpc/fn_dashboard_analytics`,
      { headers, tags: { name: 'DashboardAnalytics' } }
    );
    
    check(res, {
      'Analytics: tempo < 2s': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
    
    apiResponseTime.add(res.timings.duration, { endpoint: 'analytics' });
  }
  
  sleep(1);
}

/**
 * INTERPRETAÇÃO DOS RESULTADOS
 * 
 * 1. http_req_duration (p95):
 *    - < 500ms: Excelente
 *    - 500-1000ms: Bom
 *    - > 1000ms: Precisa otimização
 * 
 * 2. errors:
 *    - < 0.01%: Excelente
 *    - 0.01-1%: Aceitável
 *    - > 1%: Crítico
 * 
 * 3. http_reqs:
 *    - > 1500/s: Excelente
 *    - 1000-1500/s: Bom
 *    - < 1000/s: Precisa otimização
 * 
 * AÇÕES RECOMENDADAS SE FALHAR:
 * - Revisar índices SQL
 * - Adicionar cache em endpoints críticos
 * - Otimizar queries complexas
 * - Escalar recursos do Supabase
 */
