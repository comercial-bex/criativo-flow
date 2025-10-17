import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useDraft } from '@/hooks/useDraft';
import { smartToast } from '@/lib/smart-toast';

interface Cliente {
  id: string;
  nome: string;
}

interface CreateClientUserFormProps {
  clientes: Cliente[];
}

export function CreateClientUserForm({ clientes }: CreateClientUserFormProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const initialFormData = {
    email: '',
    password: '',
    nome: '',
    clienteId: ''
  };

  const { draft: formData, setDraft: setFormData, clearDraft } = useDraft(
    'create-client-user-form',
    initialFormData
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ⚡ ANTI-REFRESH CRÍTICO
    
    if (!formData.email || !formData.password || !formData.nome || !formData.clienteId) {
      smartToast.error('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      // Chamar Edge Function universal signup
      const response = await fetch(
        `https://xvpqgwbktpfodbuhwqhh.supabase.co/functions/v1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            metadata: {
              nome: formData.nome,
              cliente_id: formData.clienteId
            },
            role: 'cliente'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Mensagens específicas
        if (data.error === 'EMAIL_EXISTS') {
          smartToast.error('Este email já está cadastrado no sistema');
        } else if (data.error === 'MISSING_CREDENTIALS') {
          smartToast.error('Email e senha são obrigatórios');
        } else if (data.error === 'MISSING_NAME') {
          smartToast.error('Nome é obrigatório');
        } else if (data.error === 'PROFILE_ERROR') {
          smartToast.error('Erro ao criar perfil. Tente novamente.');
        } else if (data.error === 'ROLE_ERROR') {
          smartToast.error('Erro ao atribuir permissões. Tente novamente.');
        } else {
          smartToast.error(data.message || 'Erro ao criar usuário');
        }
        setLoading(false);
        return;
      }

      smartToast.success('Usuário criado com sucesso!');
      smartToast.info(`Email: ${formData.email} | Senha: ${formData.password}`);
      
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      
      // Limpar draft e formulário
      clearDraft();
      setFormData(initialFormData);

    } catch (error) {
      smartToast.error('Erro inesperado ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Sugerir senha automática
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  // Função para criar o usuário específico da Agência Bex
  const createAgenciaBexUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://xvpqgwbktpfodbuhwqhh.supabase.co/functions/v1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cHFnd2JrdHBmb2RidWh3cWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA0MzUsImV4cCI6MjA3MzExNjQzNX0.slj0vNEGfgTFv_vB_4ieLH1zuHSP_A6dAZsMmHVWnto'
          },
          body: JSON.stringify({
            email: 'comercial@agenciabex.com.br',
            password: 'TempPass2024!',
            metadata: {
              nome: 'Comercial Agência Bex',
              cliente_id: '8c4482fc-4aa1-422c-b1fc-6441c14b6d6a'
            },
            role: 'cliente'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        smartToast.error(data.message || 'Erro ao criar usuário');
        return;
      }

      smartToast.success('Usuário comercial@agenciabex.com.br criado com sucesso!');
      smartToast.info('Email: comercial@agenciabex.com.br | Senha: TempPass2024!');
      
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
    } catch (error) {
      smartToast.error('Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão de ação rápida para Agência Bex */}
      <Card className="w-full max-w-md bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Ação Rápida - Agência Bex</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={createAgenciaBexUser}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Criando...' : 'Criar comercial@agenciabex.com.br'}
          </Button>
          <p className="text-sm text-yellow-700 mt-2">
            Email: comercial@agenciabex.com.br<br/>
            Senha: TempPass2024!
          </p>
        </CardContent>
      </Card>

      {/* Formulário geral */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Usuário Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Senha temporária"
                disabled={loading}
                required
              />
              <Button type="button" variant="outline" onClick={generatePassword} disabled={loading}>
                Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do usuário"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select 
              value={formData.clienteId} 
              onValueChange={(value) => setFormData({ ...formData, clienteId: value })} 
              disabled={loading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Criando...' : 'Criar Usuário'}
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
