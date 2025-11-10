import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, CreditCard, Save } from "lucide-react";

export default function ConfiguracoesEmpresa() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    endereco_completo: '',
    telefone: '',
    email: '',
    website: '',
    banco_nome: '',
    banco_codigo: '',
    agencia: '',
    conta: '',
    pix_tipo: 'email',
    pix_chave: '',
    texto_rodape: '',
    termos_condicoes: '',
    logo_url: '/logo-bex-apk.svg'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('configuracoes_empresa')
        .upsert(formData);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "Os dados da empresa foram atualizados.",
      });
      
      // Recarregar dados
      fetchConfig();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Configurações da Empresa
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure os dados da sua empresa que serão exibidos em orçamentos, propostas e contratos.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dados Gerais */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados Gerais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                placeholder="Nome completo da empresa"
              />
            </div>
            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia || ''}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                placeholder="Nome comercial"
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ''}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div>
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <Input
                id="inscricao_estadual"
                value={formData.inscricao_estadual || ''}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                placeholder="000.000.000.000"
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.empresa.com.br"
              />
            </div>
            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url || ''}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="/logo-bex-apk.svg"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="endereco_completo">Endereço Completo</Label>
            <Textarea
              id="endereco_completo"
              value={formData.endereco_completo || ''}
              onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
              rows={2}
              placeholder="Rua, número, bairro, cidade, estado, CEP"
            />
          </div>
        </Card>

        {/* Dados Bancários */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dados Bancários
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="banco_nome">Banco</Label>
              <Input
                id="banco_nome"
                value={formData.banco_nome || ''}
                onChange={(e) => setFormData({ ...formData, banco_nome: e.target.value })}
                placeholder="Ex: Banco do Brasil"
              />
            </div>
            <div>
              <Label htmlFor="banco_codigo">Código do Banco</Label>
              <Input
                id="banco_codigo"
                value={formData.banco_codigo || ''}
                onChange={(e) => setFormData({ ...formData, banco_codigo: e.target.value })}
                placeholder="Ex: 001"
              />
            </div>
            <div>
              <Label htmlFor="agencia">Agência</Label>
              <Input
                id="agencia"
                value={formData.agencia || ''}
                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                placeholder="Ex: 1234"
              />
            </div>
            <div>
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                value={formData.conta || ''}
                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                placeholder="Ex: 12345-6"
              />
            </div>
            <div>
              <Label htmlFor="pix_tipo">Tipo de Chave PIX</Label>
              <select
                id="pix_tipo"
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={formData.pix_tipo}
                onChange={(e) => setFormData({ ...formData, pix_tipo: e.target.value })}
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatória</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pix_chave">Chave PIX</Label>
              <Input
                id="pix_chave"
                value={formData.pix_chave || ''}
                onChange={(e) => setFormData({ ...formData, pix_chave: e.target.value })}
                placeholder="Digite a chave PIX"
              />
            </div>
          </div>
        </Card>

        {/* Textos Adicionais */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Textos Adicionais</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="texto_rodape">Texto do Rodapé</Label>
              <Textarea
                id="texto_rodape"
                value={formData.texto_rodape || ''}
                onChange={(e) => setFormData({ ...formData, texto_rodape: e.target.value })}
                rows={2}
                placeholder="Texto que aparecerá no rodapé dos documentos"
              />
            </div>
            <div>
              <Label htmlFor="termos_condicoes">Termos e Condições</Label>
              <Textarea
                id="termos_condicoes"
                value={formData.termos_condicoes || ''}
                onChange={(e) => setFormData({ ...formData, termos_condicoes: e.target.value })}
                rows={4}
                placeholder="Termos e condições gerais de serviço"
              />
            </div>
          </div>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
