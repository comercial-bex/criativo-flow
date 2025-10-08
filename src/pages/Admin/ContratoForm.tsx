import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useContracts } from "@/hooks/useContracts";
import { useDraft } from "@/hooks/useDraft";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";
import { ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContratoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { role } = usePermissions();
  const { contracts, createContract, renderizarTemplate } = useContracts();
  
  const clienteIdPrefill = searchParams.get("cliente_id");
  const projetoIdPrefill = searchParams.get("projeto_id");
  const isEditMode = Boolean(id);
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [currentContract, setCurrentContract] = useState<any>(null);
  
  const [formData, setFormData] = useState<{
    titulo: string;
    cliente_id: string;
    projeto_id: string;
    tipo: "servico" | "confidencialidade" | "termo_uso";
    descricao: string;
    escopo: string;
    sla: string;
    confidencialidade: boolean;
    propriedade_intelectual: string;
    rescisao: string;
    foro: string;
    condicoes_comerciais: string;
    valor_mensal: number;
    valor_avulso: number;
    valor_recorrente: number;
    renovacao: string;
    reajuste_indice: string;
    data_inicio: string;
    data_fim: string;
    status: string;
  }>({
    titulo: "",
    cliente_id: clienteIdPrefill || "",
    projeto_id: projetoIdPrefill || "",
    tipo: "servico",
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
    status: "rascunho",
  });

  const { draft, setDraft, clearDraft } = useDraft(`contrato-${id || 'new'}`, formData);

  const canEdit = !isEditMode || (
    currentContract?.status !== "assinado" && 
    currentContract?.status !== "vigente"
  );

  const canDelete = role === 'admin' || role === 'gestor';

  useEffect(() => {
    fetchClientes();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const contract = contracts.find(c => c.id === id);
      if (contract) {
        setCurrentContract(contract);
        setFormData({
          titulo: contract.titulo || "",
          cliente_id: contract.cliente_id || "",
          projeto_id: contract.projeto_id || "",
          tipo: contract.tipo || "servico",
          descricao: contract.descricao || "",
          escopo: contract.escopo || "",
          sla: contract.sla || "",
          confidencialidade: contract.confidencialidade || false,
          propriedade_intelectual: contract.propriedade_intelectual || "",
          rescisao: contract.rescisao || "",
          foro: contract.foro || "",
          condicoes_comerciais: contract.condicoes_comerciais || "",
          valor_mensal: contract.valor_mensal || 0,
          valor_avulso: contract.valor_avulso || 0,
          valor_recorrente: contract.valor_recorrente || 0,
          renovacao: contract.renovacao || "nenhuma",
          reajuste_indice: contract.reajuste_indice || "",
          data_inicio: contract.data_inicio || "",
          data_fim: contract.data_fim || "",
          status: contract.status || "rascunho",
        });
      }
    }
  }, [id, contracts, isEditMode]);

  useEffect(() => {
    if (formData.cliente_id) {
      fetchProjetos(formData.cliente_id);
    }
  }, [formData.cliente_id]);

  useEffect(() => {
    setDraft(formData);
  }, [formData]);

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
    
    if (!formData.cliente_id) {
      smartToast.error("Selecione um cliente");
      return;
    }

    setLoading(true);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (isEditMode && id) {
        // Update
        const updateData: any = { ...formData };
        delete updateData.status; // Não atualizar status diretamente pelo form
        updateData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from("contratos")
          .update(updateData)
          .eq("id", id);

        if (error) throw error;

        // Log de atividade
        await supabase.rpc("criar_log_atividade", {
          p_cliente_id: formData.cliente_id,
          p_usuario_id: user?.id,
          p_acao: "update",
          p_entidade_tipo: "contrato",
          p_entidade_id: id,
          p_descricao: `Contrato "${formData.titulo}" atualizado`,
          p_metadata: {},
        });

        smartToast.success("Contrato atualizado com sucesso");
      } else {
        // Create
        const contratoData: any = {
          ...formData,
          created_by: user?.id,
          status: "rascunho",
        };
        
        delete contratoData.status; // Use o valor padrão do backend

        createContract(contratoData);
      }

      clearDraft();
      navigate("/admin/contratos");
    } catch (error: any) {
      smartToast.error("Erro ao salvar contrato", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log de atividade
      await supabase.rpc("criar_log_atividade", {
        p_cliente_id: formData.cliente_id,
        p_usuario_id: (await supabase.auth.getUser()).data.user?.id,
        p_acao: "delete",
        p_entidade_tipo: "contrato",
        p_entidade_id: id,
        p_descricao: `Contrato "${formData.titulo}" excluído`,
        p_metadata: {},
      });

      smartToast.success("Contrato excluído com sucesso");
      clearDraft();
      navigate("/admin/contratos");
    } catch (error: any) {
      smartToast.error("Erro ao excluir contrato", error.message);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/contratos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{isEditMode ? "Editar Contrato" : "Novo Contrato"}</h1>
        </div>
        <div className="flex gap-2">
          {isEditMode && canDelete && (
            <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {!canEdit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este contrato está assinado ou vigente e não pode ser editado. Apenas campos permitidos estão disponíveis.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="escopo">Escopo & SLA</TabsTrigger>
            <TabsTrigger value="clausulas">Cláusulas</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Aba Resumo */}
          <TabsContent value="resumo" forceMount className="data-[state=inactive]:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Contrato *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                      disabled={!canEdit}
                    >
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
                    <Label htmlFor="cliente_id">Cliente *</Label>
                    <Select 
                      value={formData.cliente_id} 
                      onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                      disabled={!canEdit}
                    >
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
                    <Select 
                      value={formData.projeto_id} 
                      onValueChange={(value) => setFormData({ ...formData, projeto_id: value })}
                      disabled={!canEdit}
                    >
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
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data de Término</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Escopo & SLA */}
          <TabsContent value="escopo" forceMount className="data-[state=inactive]:hidden space-y-4">
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
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                    rows={4}
                    placeholder="Defina os SLAs: tempo de resposta, atendimento, etc..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cláusulas */}
          <TabsContent value="clausulas" forceMount className="data-[state=inactive]:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cláusulas Legais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="confidencialidade"
                    checked={formData.confidencialidade}
                    onCheckedChange={(checked) => setFormData({ ...formData, confidencialidade: Boolean(checked) })}
                    disabled={!canEdit}
                  />
                  <Label htmlFor="confidencialidade">Acordo de Confidencialidade</Label>
                </div>

                <div>
                  <Label htmlFor="propriedade_intelectual">Propriedade Intelectual</Label>
                  <Textarea
                    id="propriedade_intelectual"
                    value={formData.propriedade_intelectual}
                    onChange={(e) => setFormData({ ...formData, propriedade_intelectual: e.target.value })}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="rescisao">Condições de Rescisão</Label>
                  <Textarea
                    id="rescisao"
                    value={formData.rescisao}
                    onChange={(e) => setFormData({ ...formData, rescisao: e.target.value })}
                    disabled={!canEdit}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="foro">Foro</Label>
                  <Input
                    id="foro"
                    value={formData.foro}
                    onChange={(e) => setFormData({ ...formData, foro: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Ex: Comarca de São Paulo/SP"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Comercial */}
          <TabsContent value="comercial" forceMount className="data-[state=inactive]:hidden space-y-4">
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="renovacao">Renovação</Label>
                    <Select 
                      value={formData.renovacao} 
                      onValueChange={(value) => setFormData({ ...formData, renovacao: value })}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        <SelectItem value="automatica">Automática</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reajuste_indice">Índice de Reajuste</Label>
                    <Input
                      id="reajuste_indice"
                      value={formData.reajuste_indice}
                      onChange={(e) => setFormData({ ...formData, reajuste_indice: e.target.value })}
                      disabled={!canEdit}
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
                    disabled={!canEdit}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Preview */}
          <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template</Label>
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

                {previewHtml ? (
                  <div 
                    className="prose max-w-none p-6 bg-background border rounded-lg"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div className="text-center p-12 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Selecione um template para visualizar o preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/contratos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !canEdit}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : isEditMode ? "Salvar Alterações" : "Criar Contrato"}
          </Button>
        </div>
      </form>

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir este contrato? Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
