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
      console.log('🚨 Auth: Emergency timeout - setting loading to false');
      setLoading(false);
    }, 1500);

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
      const { error } = await supabase.auth.signInWithPassword({
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