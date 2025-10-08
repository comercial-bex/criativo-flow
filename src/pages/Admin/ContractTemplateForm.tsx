import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useContractTemplates } from "@/hooks/useContractTemplates";
import { smartToast } from "@/lib/smart-toast";
import { ArrowLeft, Save, FileText, Copy, Eye, EyeOff, Bold, Italic, Strikethrough, List, ListOrdered, Table2, Plus, Trash2, Quote, Minus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { UploadPDF } from "@/components/Admin/UploadPDF";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

// Toolbar do Editor
const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  
  return (
    <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
      {/* Formatação de texto */}
      <Button
        type="button"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="h-8 px-2"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="h-8 px-2"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className="h-8 px-2"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Headings */}
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="h-8 px-2"
      >
        H1
      </Button>
      
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="h-8 px-2"
      >
        H2
      </Button>
      
      <Button
        type="button"
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="h-8 px-2"
      >
        H3
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Listas */}
      <Button
        type="button"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="h-8 px-2"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-8 px-2"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Tabelas */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="h-8 px-2"
      >
        <Table2 className="h-4 w-4" />
      </Button>
      
      {editor.isActive('table') && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="h-8 px-2"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
      
      <div className="w-px h-6 bg-border mx-1" />
      
      {/* Outros */}
      <Button
        type="button"
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className="h-8 px-2"
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="h-8 px-2"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
};

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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showItemsTabelaWarning, setShowItemsTabelaWarning] = useState(false);
  const [previousHtml, setPreviousHtml] = useState("");
  
  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ 
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: formData.corpo_html,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const hadItemsTable = previousHtml.includes('{{itens_tabela}}');
      const hasItemsTable = html.includes('{{itens_tabela}}');
      
      // Se tinha e não tem mais, alertar
      if (hadItemsTable && !hasItemsTable) {
        setShowItemsTabelaWarning(true);
        // Reverter temporariamente
        editor.commands.setContent(previousHtml);
        return;
      }
      
      setPreviousHtml(html);
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
    
    // Validações
    if (!formData.nome.trim()) {
      smartToast.error("Nome obrigatório", "Digite um nome para o template");
      return;
    }
    
    if (!formData.corpo_html || formData.corpo_html === '<p></p>') {
      smartToast.error("Conteúdo obrigatório", "O template não pode estar vazio");
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
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        await createTemplate({
          nome: formData.nome,
          categoria: formData.categoria,
          tipo_original: formData.tipo_original,
          corpo_html: formData.corpo_html,
          arquivo_original_url: formData.arquivo_original_url,
        });
        smartToast.success("Template criado com sucesso");
        navigate("/admin/contratos/templates");
      }
    } catch (error: any) {
      smartToast.error("Erro ao salvar template", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDuplicate = async () => {
    if (!templateId) return;
    
    try {
      const template = await fetchTemplate(templateId);
      if (template) {
        // Adicionar " (Cópia)" ao nome
        const newName = `${template.nome} (Cópia)`;
        
        await createTemplate({
          nome: newName,
          categoria: template.categoria,
          tipo_original: template.tipo_original,
          corpo_html: template.corpo_html,
          arquivo_original_url: template.arquivo_original_url || "",
        });
        
        smartToast.success("Template duplicado com sucesso");
        navigate("/admin/contratos/templates");
      }
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
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {isEditMode ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
            {loading && <Badge variant="secondary" className="animate-pulse">Salvando...</Badge>}
            {saveSuccess && <Badge variant="default" className="bg-green-600">✓ Salvo</Badge>}
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
              <CardContent className="p-0">
                <EditorToolbar editor={editor} />
                <div className="border-t p-4 min-h-[400px] prose max-w-none">
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
        
        {/* Dialog de Confirmação - Remoção de {{itens_tabela}} */}
        <AlertDialog open={showItemsTabelaWarning} onOpenChange={setShowItemsTabelaWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Atenção: Remoção de Tag Crítica
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Você está removendo a tag <code className="bg-muted px-1 py-0.5 rounded">&#123;&#123;itens_tabela&#125;&#125;</code></p>
                <p className="font-semibold">Esta tag é essencial para contratos que possuem múltiplos itens/produtos.</p>
                <p>Tem certeza que deseja continuar?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                // Manter HTML anterior
                editor?.commands.setContent(previousHtml);
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  // Confirmar remoção
                  const newHtml = editor?.getHTML() || "";
                  setPreviousHtml(newHtml);
                  setFormData(prev => ({
                    ...prev,
                    corpo_html: newHtml,
                    variaveis_disponiveis: detectMergeTags(newHtml)
                  }));
                  setShowItemsTabelaWarning(false);
                }}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Confirmar Remoção
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  );
}
