import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search,
  RefreshCw,
  Database,
  User,
  Shield
} from 'lucide-react';
import { smartToast } from '@/lib/smart-toast';

interface DiagnosticResult {
  email: string;
  authExists: boolean;
  authId?: string;
  authConfirmed?: boolean;
  profileExists: boolean;
  profileData?: any;
  roleExists: boolean;
  roleData?: any;
  canLogin: boolean;
  errors: string[];
  warnings: string[];
}

export const LoginDiagnostic = () => {
  const [email, setEmail] = useState('wevertonnelluty@gmail.com');
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const checkUser = async () => {
    if (!email) {
      smartToast.error('Digite um email para verificar');
      return;
    }

    setChecking(true);
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Primeiro verificar se existe perfil (que tem o mesmo ID do auth)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('🔍 Profile encontrado:', profile);

      // 2. Se encontrou perfil, verificar role
      let roleData = null;
      if (profile?.id) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
        roleData = role;
        console.log('🔍 Role encontrada:', roleData);
      }

      // 3. Verificar se usuário existe no auth através da função find_orphan_auth_users
      const { data: orphanCheck } = await supabase.rpc('find_orphan_auth_users');
      
      const isOrphanInAuth = orphanCheck?.some((u: any) => u.email === email);
      const authExists = profile?.id || isOrphanInAuth;
      
      console.log('🔍 Órfãos no auth:', orphanCheck);
      console.log('🔍 Este usuário é órfão?', isOrphanInAuth);
      console.log('🔍 Auth exists:', authExists);

      // Análise de problemas
      const profileExists = !!profile;
      const roleExists = !!roleData;

      if (!authExists && !profileExists) {
        errors.push('❌ Usuário não existe no Authentication nem no sistema');
      }

      if (authExists && !profileExists) {
        errors.push('❌ Usuário existe no Auth mas não tem perfil (usuário órfão)');
        warnings.push('⚠️ Sincronização necessária para criar perfil');
      }

      if (profileExists && !roleExists) {
        errors.push('❌ Nenhuma role atribuída ao usuário');
        warnings.push('⚠️ Usuário sem permissões - login será bloqueado');
      }

      if (profile?.status === 'pendente_aprovacao') {
        warnings.push('⚠️ Usuário aguardando aprovação - login bloqueado');
        errors.push('❌ Status: pendente de aprovação');
      }

      if (profile?.status === 'suspenso') {
        errors.push('❌ Usuário está suspenso');
      }

      if (profile?.status === 'rejeitado') {
        errors.push('❌ Usuário foi rejeitado');
      }

      const canLogin = authExists && profileExists && roleExists && profile?.status === 'aprovado';

      const diagnostic: DiagnosticResult = {
        email,
        authExists: !!authExists,
        authId: profile?.id,
        authConfirmed: true,
        profileExists,
        profileData: profile,
        roleExists,
        roleData,
        canLogin,
        errors,
        warnings,
      };

      setResult(diagnostic);

      if (canLogin) {
        smartToast.success('✅ Usuário OK', 'Pode fazer login normalmente');
      } else {
        smartToast.error('❌ Problemas detectados', `${errors.length} erro(s) encontrado(s)`);
      }
    } catch (error: any) {
      console.error('Erro no diagnóstico:', error);
      smartToast.error('Erro ao verificar', error.message);
    } finally {
      setChecking(false);
    }
  };

  const syncUser = async () => {
    if (!email) return;

    setSyncing(true);
    try {
      const { data, error } = await supabase.rpc('auto_sync_orphan_users');
      
      if (error) throw error;

      smartToast.success('Sincronização concluída', 'Verifique novamente o usuário');
      await checkUser(); // Recheck
    } catch (error: any) {
      smartToast.error('Erro na sincronização', error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnóstico de Login
        </CardTitle>
        <CardDescription>
          Verifique problemas de autenticação e integridade de usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Digite o email do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkUser()}
          />
          <Button 
            onClick={checkUser}
            disabled={checking}
            size="icon"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Resultado do diagnóstico */}
        {result && (
          <div className="space-y-4 mt-6">
            {/* Status Geral */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {result.canLogin ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <div className="font-semibold">
                    {result.canLogin ? 'Login OK' : 'Login Bloqueado'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.email}
                  </div>
                </div>
              </div>
              <Badge variant={result.canLogin ? 'default' : 'destructive'}>
                {result.canLogin ? 'Liberado' : 'Bloqueado'}
              </Badge>
            </div>

            {/* Verificações individuais */}
            <div className="space-y-3">
              {/* Auth */}
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">Authentication (Supabase Auth)</div>
                    {result.authId && (
                      <div className="text-xs text-muted-foreground font-mono">
                        UID: {result.authId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
                {result.authExists ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">Perfil (profiles)</div>
                    {result.profileData && (
                      <div className="text-xs text-muted-foreground">
                        Status: {result.profileData.status}
                      </div>
                    )}
                  </div>
                </div>
                {result.profileExists ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {/* Role */}
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <div>
                    <div className="text-sm font-medium">Permissões (user_roles)</div>
                    {result.roleData && (
                      <div className="text-xs text-muted-foreground">
                        Role: {result.roleData.role}
                      </div>
                    )}
                  </div>
                </div>
                {result.roleExists ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Erros */}
            {result.errors.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Erros Detectados
                </div>
                {result.errors.map((error, i) => (
                  <div key={i} className="text-sm text-destructive pl-6">
                    {error}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-semibold text-yellow-700 dark:text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  Avisos
                </div>
                {result.warnings.map((warning, i) => (
                  <div key={i} className="text-sm text-yellow-700 dark:text-yellow-500 pl-6">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Ações */}
            {!result.canLogin && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={syncUser}
                  disabled={syncing}
                  className="flex-1"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sincronizar Automaticamente
                </Button>
              </div>
            )}

            {/* Debug Info */}
            {result.authId && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Informações de Debug
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                  {JSON.stringify({
                    authId: result.authId,
                    profileData: result.profileData,
                    roleData: result.roleData,
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
