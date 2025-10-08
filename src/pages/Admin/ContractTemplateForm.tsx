import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { smartToast } from "@/lib/smart-toast";
import { ArrowLeft, Save, Upload, FileText, Copy, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { UploadPDF } from "@/components/Admin/UploadPDF";

export default function ContractTemplateForm() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditMode = Boolean(templateId);
  
  const {
    templates,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    toggleAtivo,
    uploadOriginalFile,
    convertDocxToHtml,
    detectMergeTags,
    fetchTemplate,
    loading: templatesLoading
  } = useContractTemplates();
  
  const [formData, setFormData] = useState<{
    nome: string;
    categoria: string;
    tipo_original: "html" | "docx";
    corpo_html: string;
    variaveis_disponiveis: string[];
    arquivo_original_url: string;
  }>({
    nome: "",
    categoria: "servico",
    tipo_original: "html",
    corpo_html: "",
    variaveis_disponiveis: [],
    arquivo_original_url: "",
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMergeTags, setShowMergeTags] = useState(true);
  
  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: formData.corpo_html,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        corpo_html: html,
        variaveis_disponiveis: detectMergeTags(html)
      }));
    },
  });
  
  useEffect(() => {
    if (isEditMode && templateId) {
      loadTemplate();
    }
  }, [templateId]);
  
  const loadTemplate = async () => {
    if (!templateId) return;
    
    const template = await fetchTemplate(templateId);
    if (template) {
      setFormData({
        nome: template.nome,
        categoria: template.categoria || "servico",
        tipo_original: template.tipo_original || "html",
        corpo_html: template.corpo_html,
        variaveis_disponiveis: template.variaveis_disponiveis || [],
        arquivo_original_url: template.arquivo_original_url || "",
      });
      
      editor?.commands.setContent(template.corpo_html);
    }
  };
  
  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadedFile(file);
    setLoading(true);
    
    try {
      let htmlContent = "";
      
      if (file.name.endsWith(".docx")) {
        // Converter DOCX para HTML
        htmlContent = await convertDocxToHtml(file);
        setFormData(prev => ({ ...prev, tipo_original: "docx" }));
      } else if (file.name.endsWith(".html")) {
        // Ler HTML diretamente
        htmlContent = await file.text();
        setFormData(prev => ({ ...prev, tipo_original: "html" }));
      } else {
        smartToast.error("Formato não suportado", "Use arquivos .html ou .docx");
        return "";
      }
      
      // Upload do arquivo original
      const fileUrl = await uploadOriginalFile(file);
      
      // Detectar merge tags
      const tags = detectMergeTags(htmlContent);
      
      setFormData(prev => ({
        ...prev,
        corpo_html: htmlContent,
        variaveis_disponiveis: tags,
        arquivo_original_url: fileUrl,
      }));
      
      editor?.commands.setContent(htmlContent);
      
      smartToast.success("Arquivo carregado com sucesso", `${tags.length} variáveis detectadas`);
      
      return fileUrl;
    } catch (error: any) {
      smartToast.error("Erro ao processar arquivo", error.message);
      return "";
    } finally {
      setLoading(false);
    }
  };
  
  const handleInsertTag = (tag: string) => {
    editor?.commands.insertContent(`{{${tag}}}`);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.corpo_html) {
      smartToast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode && templateId) {
        await updateTemplate({
          ...formData,
          id: templateId,
        });
        smartToast.success("Template atualizado com sucesso");
      } else {
        await createTemplate({
          nome: formData.nome,
          categoria: formData.categoria,
          tipo_original: formData.tipo_original,
          corpo_html: formData.corpo_html,
          arquivo_original_url: formData.arquivo_original_url,
        });
        smartToast.success("Template criado com sucesso");
      }
      
      navigate("/admin/contratos/templates");
    } catch (error: any) {
      smartToast.error("Erro ao salvar template", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDuplicate = async () => {
    if (!templateId) return;
    
    try {
      await duplicateTemplate(templateId);
      smartToast.success("Template duplicado com sucesso");
      navigate("/admin/contratos/templates");
    } catch (error: any) {
      smartToast.error("Erro ao duplicar template", error.message);
    }
  };
  
  const commonTags = [
    "cliente_nome", "cliente_cnpj", "cliente_endereco", "cliente_email",
    "contrato_numero", "data_inicio", "data_fim", "data_atual",
    "valor_total", "valor_mensal", "escopo", "sla",
    "condicoes_pagamento", "renovacao", "rescisao", "foro"
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/contratos/templates")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditMode && (
            <>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (templateId) {
                    const currentTemplate = templates.find(t => t.id === templateId);
                    if (currentTemplate) {
                      toggleAtivo({ id: templateId, ativo: !currentTemplate.ativo });
                    }
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ativar/Desativar
              </Button>
            </>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-6">
          {/* Coluna Esquerda - 2/3 da tela */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Modelo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Contrato de Serviços de Marketing"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
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
                
                {!isEditMode && (
                  <div>
                    <Label>Upload de Arquivo</Label>
                    <UploadPDF
                      onUpload={handleFileUpload}
                      currentUrl={formData.arquivo_original_url}
                      label="Arraste um arquivo .html ou .docx"
                      accept=".html,.docx"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Suporta HTML e DOCX. Variáveis no formato &#123;&#123;variavel&#125;&#125; serão detectadas automaticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Editor de Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 min-h-[400px] prose max-w-none">
                  <EditorContent editor={editor} />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/contratos/templates")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Salvando..." : "Salvar Template"}
              </Button>
            </div>
          </div>
          
          {/* Coluna Direita - 1/3 da tela */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Campos Detectados</CardTitle>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowMergeTags(!showMergeTags)}
                  >
                    {showMergeTags ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              {showMergeTags && (
                <CardContent className="space-y-2">
                  {formData.variaveis_disponiveis.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formData.variaveis_disponiveis.length} variáveis encontradas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {formData.variaveis_disponiveis.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma variável detectada. Use &#123;&#123;nome_variavel&#125;&#125;
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inserir Campos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Campos comuns para contratos:
                </p>
                <div className="flex flex-wrap gap-1">
                  {commonTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleInsertTag(tag)}
                      className="text-xs h-7"
                    >
                      +{tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {formData.arquivo_original_url && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Arquivo original: <br />
                  <a 
                    href={formData.arquivo_original_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {formData.tipo_original === "docx" ? "Baixar DOCX" : "Ver HTML"}
                  </a>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
