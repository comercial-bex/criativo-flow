import { supabase } from "@/integrations/supabase/client";

export const testUsers = [
  {
    email: "atendimento@teste.com",
    password: "123456",
    nome: "Atendimento Teste", 
    telefone: "(11) 99999-9999",
    especialidade: "atendimento",
    role: "atendimento"
  },
  {
    email: "trafego@teste.com",
    password: "123456",
    nome: "Tráfego Teste",
    telefone: "(11) 99999-9999", 
    especialidade: "trafego",
    role: "trafego"
  },
  {
    email: "financeiro@teste.com",
    password: "123456",
    nome: "Financeiro Teste",
    telefone: "(11) 99999-9999",
    especialidade: "financeiro", 
    role: "financeiro"
  },
  {
    email: "cliente@teste.com",
    password: "123456",
    nome: "Cliente Teste",
    telefone: "(11) 99999-9999",
    especialidade: "cliente",
    role: "cliente"
  },
  {
    email: "fornecedor@teste.com", 
    password: "123456",
    nome: "Fornecedor Teste",
    telefone: "(11) 99999-9999",
    especialidade: "fornecedor",
    role: "fornecedor"
  },
  {
    email: "gestor@teste.com",
    password: "123456",
    nome: "Gestor Teste", 
    telefone: "(11) 99999-9999",
    especialidade: "gestor",
    role: "gestor"
  }
];

export async function createTestUsers() {
  console.log('🚀 Iniciando criação de usuários de teste...');
  
  const results = [];
  
  for (const user of testUsers) {
    try {
      console.log(`📝 Criando usuário: ${user.email}`);
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: user
      });
      
      if (error) {
        console.error(`❌ Erro ao criar ${user.email}:`, error);
        results.push({ email: user.email, success: false, error });
      } else {
        console.log(`✅ Usuário ${user.email} criado com sucesso`);
        results.push({ email: user.email, success: true, data });
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar ${user.email}:`, err);
      results.push({ email: user.email, success: false, error: err });
    }
  }
  
  console.log('🎉 Processo de criação concluído!');
  return results;
}