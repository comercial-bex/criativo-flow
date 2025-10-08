import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useContracts } from "@/hooks/useContracts";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function ContratoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createContract, renderizarTemplate } = useContracts();
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    titulo: "",
    cliente_id: "",
    projeto_id: "",
    tipo: "servico" as const,
    descricao: "",
    escopo: "",
    sla: "",
    confidencialidade: false,
    propriedade_intelectual: "",
    rescisao: "",
    foro: "",
    condicoes_comerciais: "",
    valor_mensal: 0,
    valor_avulso: 0,
    valor_recorrente: 0,
    renovacao: "nenhuma",
    reajuste_indice: "",
    data_inicio: "",
    data_fim: "",
  });

  useEffect(() => {
    fetchClientes();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (formData.cliente_id) {
      fetchProjetos(formData.cliente_id);
    }
  }, [formData.cliente_id]);

  const fetchClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, cnpj_cpf, endereco")
      .order("nome");
    
    setClientes(data || []);
  };

  const fetchProjetos = async (clienteId: string) => {
    const { data } = await supabase
      .from("projetos")
      .select("id, titulo")
      .eq("cliente_id", clienteId)
      .order("titulo");
    
    setProjetos(data || []);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("contrato_templates")
      .select("*")
      .eq("ativo", true)
      .order("nome");
    
    setTemplates(data || []);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      const contratoData = {
        ...formData,
        status: "rascunho" as const,
        created_by: user?.id,
      };

      createContract(contratoData);
      navigate("/admin/contratos");
    } catch (error: any) {
      smartToast.error("Erro ao salvar contrato", error.message);
    }
  };

  const cliente = clientes.find(c => c.id === formData.cliente_id);
  const previewData = {
    cliente_nome: cliente?.nome || "[Cliente]",
    cliente_cnpj: cliente?.cnpj_cpf || "[CNPJ]",
    cliente_endereco: cliente?.endereco || "[Endereço]",
    escopo: formData.escopo || "[Escopo do serviço]",
    valor_total: `R$ ${(formData.valor_mensal || formData.valor_avulso || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    condicoes_pagamento: formData.condicoes_comerciais || "[Condições de pagamento]",
    data_inicio: formData.data_inicio || "[Data início]",
    data_fim: formData.data_fim || "[Data fim]",
    renovacao: formData.renovacao || "nenhuma",
    rescisao: formData.rescisao || "[Condições de rescisão]",
    foro: formData.foro || "[Foro]",
    data_atual: new Date().toLocaleDateString('pt-BR'),
  };

  const previewHtml = selectedTemplate ? renderizarTemplate(selectedTemplate.corpo_html, previewData) : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/contratos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">{id ? "Editar Contrato" : "Novo Contrato"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="escopo">Escopo & SLA</TabsTrigger>
            <TabsTrigger value="clausulas">Cláusulas</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Aba Resumo */}
          <TabsContent value="resumo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Contrato</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="confidencialidade">Confidencialidade</SelectItem>
                        <SelectItem value="termo_uso">Termo de Uso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente_id">Cliente</Label>
                    <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
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
                  <div>
                    <Label htmlFor="projeto_id">Projeto (Opcional)</Label>
                    <Select value={formData.projeto_id} onValueChange={(value) => setFormData({ ...formData, projeto_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projetos.map((projeto) => (
                          <SelectItem key={projeto.id} value={projeto.id}>
                            {projeto.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data de Término</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Escopo & SLA */}
          <TabsContent value="escopo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escopo do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="escopo">Descrição do Escopo</Label>
                  <Textarea
                    id="escopo"
                    value={formData.escopo}
                    onChange={(e) => setFormData({ ...formData, escopo: e.target.value })}
                    rows={6}
                    placeholder="Descreva em detalhes o escopo dos serviços prestados..."
                  />
                </div>
                <div>
                  <Label htmlFor="sla">SLA (Acordo de Nível de Serviço)</Label>
                  <Textarea
                    id="sla"
                    value={formData.sla}
                    onChange={(e) => setFormData({ ...formData, sla: e.target.value })}
                    rows={4}
                    placeholder="Defina os SLAs: tempo de resposta, atendimento, etc..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cláusulas */}
          <TabsContent value="clausulas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cláusulas Legais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="propriedade_intelectual">Propriedade Intelectual</Label>
                  <Textarea
                    id="propriedade_intelectual"
                    value={formData.propriedade_intelectual}
                    onChange={(e) => setFormData({ ...formData, propriedade_intelectual: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="rescisao">Condições de Rescisão</Label>
                  <Textarea
                    id="rescisao"
                    value={formData.rescisao}
                    onChange={(e) => setFormData({ ...formData, rescisao: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="foro">Foro</Label>
                  <Input
                    id="foro"
                    value={formData.foro}
                    onChange={(e) => setFormData({ ...formData, foro: e.target.value })}
                    placeholder="Ex: Comarca de São Paulo/SP"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Comercial */}
          <TabsContent value="comercial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Condições Comerciais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valor_mensal">Valor Mensal</Label>
                    <Input
                      id="valor_mensal"
                      type="number"
                      step="0.01"
                      value={formData.valor_mensal}
                      onChange={(e) => setFormData({ ...formData, valor_mensal: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_avulso">Valor Avulso</Label>
                    <Input
                      id="valor_avulso"
                      type="number"
                      step="0.01"
                      value={formData.valor_avulso}
                      onChange={(e) => setFormData({ ...formData, valor_avulso: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_recorrente">Valor Recorrente</Label>
                    <Input
                      id="valor_recorrente"
                      type="number"
                      step="0.01"
                      value={formData.valor_recorrente}
                      onChange={(e) => setFormData({ ...formData, valor_recorrente: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="renovacao">Renovação</Label>
                    <Select value={formData.renovacao} onValueChange={(value) => setFormData({ ...formData, renovacao: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        <SelectItem value="automatica">Automática</SelectItem>
                        <SelectItem value="condicional">Condicional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reajuste_indice">Índice de Reajuste</Label>
                    <Input
                      id="reajuste_indice"
                      value={formData.reajuste_indice}
                      onChange={(e) => setFormData({ ...formData, reajuste_indice: e.target.value })}
                      placeholder="Ex: IGPM, IPCA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="condicoes_comerciais">Outras Condições</Label>
                  <Textarea
                    id="condicoes_comerciais"
                    value={formData.condicoes_comerciais}
                    onChange={(e) => setFormData({ ...formData, condicoes_comerciais: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Template */}
          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seleção de Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nome} - {template.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTemplate && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Variáveis disponíveis:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTemplate.variaveis_disponiveis as string[]).map((variavel: string) => (
                        <code key={variavel} className="px-2 py-1 bg-background rounded text-sm">
                          {`{{${variavel}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Preview */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                {previewHtml ? (
                  <div 
                    className="prose max-w-none p-6 bg-white border rounded-lg"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Selecione um template para visualizar o preview
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Assinatura */}
          <TabsContent value="assinatura" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assinatura Eletrônica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de assinatura eletrônica será implementada após criação do contrato
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alterações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Nenhum histórico disponível para novo contrato</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/contratos")}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Salvar Contrato
          </Button>
        </div>
      </form>
    </div>
  );
}
