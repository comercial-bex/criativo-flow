import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nome: string;
}

interface CreateClientUserFormProps {
  clientes: Cliente[];
}

export function CreateClientUserForm({ clientes }: CreateClientUserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !nome || !clienteId) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email,
          password,
          nome,
          cliente_id: clienteId,
          role: 'cliente'
        }
      });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast.error(`Erro ao criar usuário: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success('Usuário criado com sucesso!');
        toast.info('O usuário ficará pendente até a aprovação do administrador.');
        toast.info(`Email: ${data.email} | Senha: ${data.password}`);
        
        // Limpar formulário
        setEmail('');
        setPassword('');
        setNome('');
        setClienteId('');
      } else {
        toast.error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Erro na requisição');
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
    setPassword(password);
  };

  // Função para criar o usuário específico da Agência Bex
  const createAgenciaBexUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: { 
          email: 'comercial@agenciabex.com.br',
          password: 'TempPass2024!',
          nome: 'Comercial Agência Bex',
          cliente_id: '8c4482fc-4aa1-422c-b1fc-6441c14b6d6a',
          role: 'cliente'
        }
      });

      if (error) {
        console.error('Erro ao criar usuário da Agência Bex:', error);
        toast.error(`Erro ao criar usuário: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success('Usuário comercial@agenciabex.com.br criado com sucesso!');
        toast.info('O usuário ficará pendente até a aprovação do administrador.');
        toast.info('Email: comercial@agenciabex.com.br | Senha: TempPass2024!');
      } else {
        toast.error(data?.error || 'Erro ao criar usuário');
      }
      
    } catch (error) {
      console.error('Erro ao criar usuário da Agência Bex:', error);
      toast.error('Erro ao criar usuário. Tente novamente.');
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha temporária"
                required
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Gerar
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do usuário"
              required
            />
          </div>

          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId} required>
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
            {loading ? 'Criando...' : 'Criar Usuário'}
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}