import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SectionHeader } from "@/components/SectionHeader";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  endereco: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'arquivado';
  responsavel_id?: string;
  assinatura_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface Assinatura {
  id: string;
  nome: string;
  preco: number;
}


export default function ClienteEditar() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    cnpj_cpf: "",
    endereco: "",
    status: "ativo",
    assinatura_id: ""
  });

  // Carregar dados do cliente e assinaturas
  useEffect(() => {
    fetchAssinaturas();
    if (clienteId) {
      fetchCliente();
    }
  }, [clienteId]);

  const fetchAssinaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAssinaturas(data || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    }
  };

  const fetchCliente = async () => {
    if (!clienteId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) {
        console.error('Erro ao buscar cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
        navigate('/clientes');
        return;
      }

      setFormData(data);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados para o banco
      const clienteData = {
        nome: formData.nome!,
        email: formData.email!,
        telefone: formData.telefone || null,
        cnpj_cpf: formData.cnpj_cpf || null,
        endereco: formData.endereco || null,
        status: formData.status!,
        assinatura_id: (formData.assinatura_id && formData.assinatura_id !== 'none') ? formData.assinatura_id : null
      };

      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', clienteId);

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente');
        return;
      }

      toast.success("Cliente atualizado com sucesso!");
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const getAssinaturaNome = (assinaturaId?: string) => {
    if (!assinaturaId) return 'Sem assinatura';
    const assinatura = assinaturas.find(a => a.id === assinaturaId);
    return assinatura ? assinatura.nome : 'Plano não encontrado';
  };

  if (loading && !formData.nome) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <SectionHeader
          title="Editar Cliente"
          description="Atualize as informações do cliente"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razão Social</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={formData.cnpj_cpf}
                  onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'ativo' | 'inativo' | 'pendente' | 'arquivado' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assinatura">Plano de Assinatura</Label>
                <Select 
                  value={formData.assinatura_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, assinatura_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem assinatura</SelectItem>
                    {assinaturas.map((assinatura) => (
                      <SelectItem key={assinatura.id} value={assinatura.id}>
                        {assinatura.nome} - R$ {assinatura.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Atualizar Cliente"}
              </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/clientes')}
                >
                  Cancelar
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}