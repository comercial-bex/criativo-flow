/**
 * Teste de Carga K6 - Criativo Flow
 * Execute: k6 run tests/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');

// Configuração do teste
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp-up para 20 usuários
    { duration: '1m', target: 50 },    // Ramp-up para 50 usuários
    { duration: '2m', target: 100 },   // Pico: 100 usuários simultâneos
    { duration: '1m', target: 50 },    // Ramp-down
    { duration: '30s', target: 0 },    // Finalização
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições < 1s
    http_req_failed: ['rate<0.01'],    // Taxa de erro < 1%
    errors: ['rate<0.01'],             // Taxa de erro customizada < 1%
  },
};

const BASE_URL = 'https://xvpqgwbktpfodbuhwqhh.supabase.co/rest/v1';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto';

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

// Cenários de teste
export default function () {
  const scenario = Math.random();

  if (scenario < 0.3) {
    // 30%: Consultar projetos
    testListProjects();
  } else if (scenario < 0.6) {
    // 30%: Consultar tarefas
    testListTasks();
  } else if (scenario < 0.8) {
    // 20%: Consultar clientes
    testListClients();
  } else {
    // 20%: Consultar eventos de calendário
    testListEvents();
  }

  sleep(1); // Pausa de 1s entre requisições
}

function testListProjects() {
  const res = http.get(`${BASE_URL}/projetos?select=*&limit=50&order=created_at.desc`, {
    headers,
  });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
    'has data': (r) => JSON.parse(r.body).length > 0,
  });

  errorRate.add(!success);
}

function testListTasks() {
  const res = http.get(`${BASE_URL}/tarefa?select=*&limit=50&order=created_at.desc`, {
    headers,
  });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
}

function testListClients() {
  const res = http.get(`${BASE_URL}/clientes?select=id,nome,status&limit=50`, {
    headers,
  });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
}

function testListEvents() {
  const res = http.get(`${BASE_URL}/eventos_calendario?select=*&limit=50&order=data_inicio.desc`, {
    headers,
  });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
}

// Teste de warmup
export function setup() {
  console.log('🔥 Iniciando testes de carga...');
  console.log(`📊 Configuração: 100 usuários simultâneos por 2 minutos`);
  console.log(`🎯 Meta: 95% das requisições < 1s, Taxa de erro < 1%`);
}

// Resumo final
export function teardown(data) {
  console.log('✅ Testes de carga concluídos!');
  console.log('📈 Verifique as métricas acima para análise de performance');
}
