import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { smartToast } from '@/lib/smart-toast';

export interface SignUpData {
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  password: string;
  empresa?: string;
}

export interface ValidationResult {
  pessoaExiste: boolean;
  loginExiste: boolean;
  pessoaId?: string;
  canProceed: boolean;
  message: string;
}

export function useSignUpWithValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const { signUp } = useAuth();

  const validateSignUp = async (data: SignUpData): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      // 1. Verificar se pessoa existe (por CPF ou email)
      let pessoaQuery = supabase
        .from('pessoas')
        .select('id, profile_id, email, cpf');

      if (data.cpf) {
        pessoaQuery = pessoaQuery.eq('cpf', data.cpf);
      } else if (data.email) {
        pessoaQuery = pessoaQuery.eq('email', data.email);
      }

      const { data: pessoaData, error: pessoaError } = await pessoaQuery.maybeSingle();

      if (pessoaError && pessoaError.code !== 'PGRST116') {
        throw pessoaError;
      }

      // 2. Verificar se já tem login (profile)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', data.email)
        .maybeSingle();

      const pessoaExiste = !!pessoaData;
      const loginExiste = !!profileData;

      // 3. Determinar fluxo
      if (loginExiste) {
        return {
          pessoaExiste,
          loginExiste: true,
          canProceed: false,
          message: 'Este email já possui um login cadastrado. Use a recuperação de senha se esqueceu suas credenciais.',
        };
      }

      if (pessoaExiste && pessoaData.profile_id) {
        return {
          pessoaExiste: true,
          loginExiste: true,
          pessoaId: pessoaData.id,
          canProceed: false,
          message: 'Esta pessoa já possui acesso ao sistema. Entre em contato com o administrador.',
        };
      }

      if (pessoaExiste && !pessoaData.profile_id) {
        return {
          pessoaExiste: true,
          loginExiste: false,
          pessoaId: pessoaData.id,
          canProceed: true,
          message: 'Pessoa encontrada! Um login será criado e vinculado ao seu cadastro existente.',
        };
      }

      // Pessoa nova
      return {
        pessoaExiste: false,
        loginExiste: false,
        canProceed: true,
        message: 'Novo cadastro será criado. Aguarde aprovação do administrador.',
      };

    } finally {
      setIsValidating(false);
    }
  };

  const processSignUp = async (data: SignUpData, validationResult: ValidationResult) => {
    try {
      // 1. Criar login via Auth
      const { error: authError } = await signUp(
        data.email,
        data.password,
        data.nome,
        data.empresa
      );

      if (authError) {
        throw authError;
      }

      // 2. Se pessoa já existe, atualizar profile_id
      if (validationResult.pessoaExiste && validationResult.pessoaId) {
        // Aguardar um pouco para garantir que o profile foi criado
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Buscar o profile recém-criado
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single();

        if (newProfile) {
          // Atualizar pessoa com profile_id
          await supabase
            .from('pessoas')
            .update({ 
              profile_id: newProfile.id,
              email: data.email,
            })
            .eq('id', validationResult.pessoaId);
        }
      } else {
        // 3. Criar nova pessoa se não existe
        // O trigger handle_new_user já criou o profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: newProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single();

        if (newProfile) {
          await supabase
            .from('pessoas')
            .insert({
              nome: data.nome,
              email: data.email,
              cpf: data.cpf,
              telefones: data.telefone ? [data.telefone] : null,
              papeis: ['cliente'],
              profile_id: newProfile.id,
              cliente_id: null, // Será definido pelo admin
            });
        }
      }

      smartToast.success(
        'Cadastro realizado com sucesso!',
        'Verifique seu email para confirmar o cadastro. Após confirmação, aguarde aprovação do administrador.'
      );

      return { success: true };

    } catch (error: any) {
      console.error('Erro no processamento do cadastro:', error);
      smartToast.error(
        'Erro ao processar cadastro',
        error.message || 'Tente novamente mais tarde'
      );
      return { success: false, error };
    }
  };

  return {
    validateSignUp,
    processSignUp,
    isValidating,
  };
}
