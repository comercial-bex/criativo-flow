import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function SecurityTestPanel() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { profiles, getProfileById } = useProfileData();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSecurityTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Teste 1: Verificar função get_filtered_profile
      try {
        const { data: filteredProfile, error } = await supabase
          .rpc('get_filtered_profile', { profile_id: user?.id || '' });
        
        if (error) {
          results.push({
            name: 'Função get_filtered_profile',
            status: 'fail',
            message: 'Erro ao executar função',
            details: error.message
          });
        } else if (filteredProfile) {
          results.push({
            name: 'Função get_filtered_profile',
            status: 'pass',
            message: 'Função executando corretamente'
          });
        }
      } catch (err) {
        results.push({
          name: 'Função get_filtered_profile',
          status: 'fail',
          message: 'Erro na função de segurança',
          details: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }

      // Teste 2: Verificar acesso direto à tabela profiles
      try {
        const { data: directAccess, error: directError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
        
        if (directError) {
          results.push({
            name: 'Acesso direto à tabela profiles',
            status: 'pass',
            message: 'RLS está bloqueando acesso não autorizado',
            details: directError.message
          });
        } else {
          const hasRestrictedData = directAccess?.some(profile => 
            role !== 'admin' && profile.id !== user?.id && (profile.email || profile.telefone)
          );
          
          if (hasRestrictedData) {
            results.push({
              name: 'Acesso direto à tabela profiles',
              status: 'warning',
              message: 'Possível vazamento de dados sensíveis',
              details: 'Dados sensíveis podem estar visíveis para usuários não autorizados'
            });
          } else {
            results.push({
              name: 'Acesso direto à tabela profiles',
              status: 'pass',
              message: 'RLS funcionando corretamente'
            });
          }
        }
      } catch (err) {
        results.push({
          name: 'Acesso direto à tabela profiles',
          status: 'fail',
          message: 'Erro ao testar acesso direto',
          details: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }

      // Teste 3: Verificar dados filtrados por role
      const roleTest = (() => {
        switch (role) {
          case 'admin':
            return {
              expected: 'Deve ver todos os dados',
              check: (profile: any) => profile.email !== undefined
            };
          case 'gestor':
          case 'atendimento':
          case 'grs':
            return {
              expected: 'Deve ver apenas dados não-sensíveis',
              check: (profile: any) => profile.email === undefined || profile.id === user?.id
            };
          default:
            return {
              expected: 'Deve ver apenas próprio perfil',
              check: (profile: any) => profile.id === user?.id
            };
        }
      })();

      const sensitiveDataVisible = profiles.some(profile => 
        profile.id !== user?.id && (profile.email || profile.telefone)
      );

      if (role === 'admin' && !sensitiveDataVisible) {
        results.push({
          name: `Teste de Role: ${role}`,
          status: 'warning',
          message: 'Admin não está vendo dados sensíveis',
          details: 'Verifique se admin tem acesso completo'
        });
      } else if (role !== 'admin' && sensitiveDataVisible) {
        results.push({
          name: `Teste de Role: ${role}`,
          status: 'fail',
          message: 'Usuário vendo dados sensíveis não autorizados',
          details: roleTest.expected
        });
      } else {
        results.push({
          name: `Teste de Role: ${role}`,
          status: 'pass',
          message: `Acesso correto para role ${role}`,
          details: roleTest.expected
        });
      }

      // Teste 4: Verificar atualização de perfil próprio
      if (user?.id) {
        try {
          const testProfile = await getProfileById(user.id);
          if (testProfile && testProfile._hasFullAccess) {
            results.push({
              name: 'Acesso ao próprio perfil',
              status: 'pass',
              message: 'Usuário tem acesso completo ao próprio perfil'
            });
          } else {
            results.push({
              name: 'Acesso ao próprio perfil',
              status: 'warning',
              message: 'Acesso limitado ao próprio perfil',
              details: 'Verifique configurações de RLS'
            });
          }
        } catch (err) {
          results.push({
            name: 'Acesso ao próprio perfil',
            status: 'fail',
            message: 'Erro ao acessar próprio perfil',
            details: err instanceof Error ? err.message : 'Erro desconhecido'
          });
        }
      }

    } catch (error) {
      results.push({
        name: 'Teste Geral',
        status: 'fail',
        message: 'Erro durante execução dos testes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Testes de Segurança - Correção RLS
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Role atual: <Badge variant="outline">{role}</Badge>
          {user && <span className="ml-2">ID: {user.id.slice(0, 8)}...</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSecurityTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Executando Testes...' : 'Executar Testes de Segurança'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
            {testResults.map((test, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{test.name}</h4>
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {test.message}
                      </p>
                      {test.details && (
                        <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Resumo</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✓ {testResults.filter(t => t.status === 'pass').length} Passou
                </span>
                <span className="text-yellow-600">
                  ⚠ {testResults.filter(t => t.status === 'warning').length} Avisos
                </span>
                <span className="text-red-600">
                  ✗ {testResults.filter(t => t.status === 'fail').length} Falhou
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}