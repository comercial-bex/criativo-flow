import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function TestClientUserCreation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testUserCreation = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Test: Iniciando criação do usuário comercial@agenciabex.com.br');
      
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { 
          email: 'comercial@agenciabex.com.br',
          password: 'TempPass2024!',
          nome: 'Comercial Agência Bex',
          cliente_id: '8c4482fc-4aa1-422c-b1fc-6441c14b6d6a',
          role: 'cliente'
        }
      });

      console.log('🧪 Test: Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('🧪 Test: Erro na Edge Function:', error);
        toast.error(`Erro: ${error.message}`);
        setResult({ error: error.message });
        return;
      }

      if (data?.success) {
        console.log('🧪 Test: Usuário criado com sucesso!');
        toast.success('Usuário comercial@agenciabex.com.br criado com sucesso!');
        setResult(data);
      } else {
        console.log('🧪 Test: Falha na criação:', data);
        toast.error(data?.error || 'Erro ao criar usuário');
        setResult(data);
      }
      
    } catch (error) {
      console.error('🧪 Test: Erro inesperado:', error);
      toast.error('Erro inesperado ao criar usuário');
      setResult({ error: 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  };

  const testUserValidation = async () => {
    try {
      console.log('🧪 Test: Testando validação do usuário');
      
      const { data, error } = await supabase.rpc('validate_user_for_login', {
        p_email: 'comercial@agenciabex.com.br'
      });

      console.log('🧪 Test: Resultado da validação:', { data, error });
      
      if (error) {
        toast.error(`Erro na validação: ${error.message}`);
      } else {
        toast.info(`Validação: ${JSON.stringify(data)}`);
        setResult({ validation: data });
      }
      
    } catch (error) {
      console.error('🧪 Test: Erro na validação:', error);
      toast.error('Erro inesperado na validação');
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">
          🧪 Teste: Criação do Usuário Agência Bex
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testUserCreation}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar comercial@agenciabex.com.br'}
          </Button>
          
          <Button 
            onClick={testUserValidation}
            variant="outline"
            className="w-full"
          >
            Validar Usuário
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Resultado:</h4>
            {result.success && (
              <div className="space-y-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Sucesso
                </Badge>
                <div className="text-sm">
                  <p><strong>Email:</strong> {result.email}</p>
                  <p><strong>Método:</strong> {result.method || 'edge-function'}</p>
                  <p><strong>Mensagem:</strong> {result.message}</p>
                </div>
              </div>
            )}
            
            {result.error && (
              <div className="space-y-2">
                <Badge variant="destructive">
                  ❌ Erro
                </Badge>
                <p className="text-sm text-red-600">{result.error}</p>
              </div>
            )}
            
            {result.validation && (
              <div className="space-y-2">
                <Badge variant="secondary">
                  🔍 Validação
                </Badge>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.validation, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <h5 className="font-medium text-yellow-800 mb-1">Credenciais de Teste:</h5>
          <p className="text-yellow-700">Email: comercial@agenciabex.com.br</p>
          <p className="text-yellow-700">Senha: TempPass2024!</p>
        </div>
      </CardContent>
    </Card>
  );
}