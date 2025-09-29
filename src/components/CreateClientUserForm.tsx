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

  return (
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
  );
}