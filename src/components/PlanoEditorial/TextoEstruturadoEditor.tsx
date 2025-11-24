import { useState } from 'react';
import { DialogWrapper } from './DialogWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, FileText, Target, FlaskConical, Save, Loader2 } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { ABTestingManager } from './ABTestingManager';
import { useTextGenerator } from '@/hooks/useTextGenerator';

interface TextoEstruturadoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  onSave: (texto: string) => void;
  clienteId: string;
}

export function TextoEstruturadoEditor({ 
  open, 
  onOpenChange, 
  post, 
  onSave,
  clienteId 
}: TextoEstruturadoEditorProps) {
  const [texto, setTexto] = useState(post.texto_estruturado || '');
  const [saving, setSaving] = useState(false);
  const { gerarTextoEstruturado, loading: generatingTexto } = useTextGenerator();

  const handleGerarComIA = async () => {
    try {
      const textoGerado = await gerarTextoEstruturado(post);
      if (textoGerado) {
        setTexto(textoGerado);
      }
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(texto);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (templateTexto: string) => {
    setTexto(templateTexto);
  };

  return (
    <DialogWrapper 
      open={open} 
      onOpenChange={onOpenChange}
      title="Editor de Texto Estruturado"
      description="Edite ou gere conteúdo com IA"
      size="xl"
    >
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor" className="gap-2">
            <FileText className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Target className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="ia" className="gap-2">
            <Sparkles className="h-4 w-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="ab" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            A/B Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{post.formato_postagem}</Badge>
              <Badge variant="secondary">{post.tipo_conteudo}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {texto.length} caracteres
            </div>
          </div>

          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite o texto estruturado do post..."
            className="min-h-[400px] max-h-[500px] overflow-y-auto resize-none font-mono text-sm"
          />

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateSelector
            isOpen={false}
            onClose={() => {}}
            tipo_conteudo={post.tipo_conteudo}
            tipo_criativo={post.formato_postagem}
            onSelectTemplate={handleTemplateSelect}
          />
        </TabsContent>

        <TabsContent value="ia" className="space-y-4 mt-4">
          <Card className="p-6 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-primary/50" />
            <div>
              <h3 className="font-semibold mb-2">Gerar Texto com IA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A IA irá gerar um texto estruturado baseado no tipo e formato do post
              </p>
            </div>
            <Button 
              onClick={handleGerarComIA} 
              disabled={generatingTexto}
              className="gap-2"
            >
              {generatingTexto ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
            {texto && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Prévia:</p>
                <div className="text-left p-4 bg-muted rounded-lg text-sm">
                  {texto}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="ab" className="mt-4">
          <ABTestingManager 
            isOpen={false}
            onClose={() => {}}
            post={post} 
            onSelectVariacao={(texto) => setTexto(texto)}
          />
        </TabsContent>
      </Tabs>
    </DialogWrapper>
  );
}
