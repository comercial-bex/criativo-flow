import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string, empresa?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Auth: Initializing auth provider');
    
    // Aggressive timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      console.error('🚨 Auth: TIMEOUT 1s - Forçando loading=false');
      setLoading(false);
    }, 1000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth: State change event:', event, 'Session:', !!session);
        clearTimeout(emergencyTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Auth: Initial session check:', !!session);
      clearTimeout(emergencyTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('🔐 Auth: Error getting initial session:', error);
      clearTimeout(emergencyTimeout);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(emergencyTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Auth: Iniciando login para', email);
      
      // Proceder com o login direto
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('🔐 Auth: Erro no login:', error);
        
        // Check if it's an email confirmation error
        if (error.message.includes('Email not confirmed')) {
          return { 
            error: { 
              message: 'Você ainda não confirmou seu e-mail. Verifique sua caixa de entrada ou spam para liberar seu acesso.' 
            } 
          };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Email ou senha incorretos' } };
        }
        
        return { error };
      }
      
      // ✅ FASE 5: Validação de Integridade Pós-Login
      if (authData?.session?.user) {
        const userId = authData.session.user.id;
        console.log('🔐 Auth: Validando integridade do usuário:', userId);
        
        // 1. Verificar se perfil existe
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, status')
          .eq('id', userId)
          .maybeSingle();
        
        if (profileError) {
          console.error('🔐 Auth: Erro ao buscar perfil:', profileError);
          await supabase.auth.signOut();
          return { error: { message: 'Erro ao validar perfil. Tente novamente.' } };
        }
        
        if (!profile) {
          console.error('🔐 Auth: Perfil não encontrado');
          await supabase.auth.signOut();
          return { error: { message: 'Perfil não encontrado. Entre em contato com o suporte.' } };
        }
        
        // 2. Verificar status do perfil
        if (profile.status !== 'aprovado') {
          console.warn('🔐 Auth: Status do perfil:', profile.status);
          await supabase.auth.signOut();
          
          const statusMessages = {
            'pendente_aprovacao': 'Seu cadastro está pendente de aprovação. Aguarde liberação do administrador.',
            'suspenso': 'Sua conta foi suspensa. Entre em contato com o administrador.',
            'rejeitado': 'Seu cadastro foi rejeitado. Entre em contato com o suporte.'
          };
          
          return { 
            error: { 
              message: statusMessages[profile.status as keyof typeof statusMessages] || 
                       `Seu cadastro está ${profile.status}. Entre em contato com o administrador.` 
            } 
          };
        }
        
        // 3. Verificar se role está atribuída
        const { data: role, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (roleError) {
          console.error('🔐 Auth: Erro ao buscar role:', roleError);
          await supabase.auth.signOut();
          return { error: { message: 'Erro ao validar permissões. Tente novamente.' } };
        }
        
        if (!role) {
          console.warn('🔐 Auth: Nenhuma role atribuída');
          await supabase.auth.signOut();
          return { error: { message: 'Você não tem permissões atribuídas. Entre em contato com o administrador.' } };
        }
        
        console.log('✅ Auth: Validação de integridade concluída - Role:', role.role);
      }
      
      console.log('🔐 Auth: Login realizado com sucesso');
      return { error: null };
      
    } catch (error) {
      console.error('🔐 Auth: Erro inesperado no login:', error);
      return { error: { message: 'Erro inesperado no login' } };
    }
  };

  const signUp = async (email: string, password: string, nome: string, empresa?: string) => {
    try {
      console.log('🔐 Auth: Iniciando cadastro para:', email, 'Empresa:', empresa);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome,
            empresa: empresa
          },
          emailRedirectTo: `${window.location.origin}/perfil`
        }
      });
      
      if (error) {
        console.error('🔐 Auth: Erro no cadastro:', error);
        return { error };
      }

      // Se cadastro foi bem-sucedido e há uma empresa, criar lead
      if (data.user && empresa) {
        console.log('🔐 Auth: Criando lead para empresa:', empresa);
        
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            nome: nome,
            email: email,
            empresa: empresa,
            origem: 'cadastro_sistema',
            status: 'pre_qualificacao',
            observacoes: `Lead criado automaticamente durante cadastro de usuário cliente em ${new Date().toLocaleString('pt-BR')}`
          });

        if (leadError) {
          console.error('🔐 Auth: Erro ao criar lead:', leadError);
        } else {
          console.log('🔐 Auth: Lead criado com sucesso');
        }
      }
      
      console.log('🔐 Auth: Cadastro realizado - aguardando confirmação de email');
      return { error: null };
    } catch (error) {
      console.error('🔐 Auth: Erro inesperado no cadastro:', error);
      return { error: { message: 'Erro inesperado no cadastro' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar estado local mesmo se logout falhar
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};