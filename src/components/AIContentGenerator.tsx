import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void;
  type: 'post' | 'legenda' | 'hashtags' | 'swot';
  clienteInfo?: {
    nome: string;
    segmento?: string;
    objetivos?: string;
  };
  trigger?: React.ReactNode;
}

export function AIContentGenerator({ onContentGenerated, type, clienteInfo, trigger }: AIContentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tipoConteudo, setTipoConteudo] = useState("educativo");
  const [tomVoz, setTomVoz] = useState("profissional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const getTypeConfig = () => {
    switch (type) {
      case 'post':
        return {
          title: "🚀 Gerar Post com IA",
          placeholder: "Descreva o post que você quer criar...",
          promptPrefix: "Crie um post para redes sociais sobre:"
        };
      case 'legenda':
        return {
          title: "✨ Gerar Legenda com IA", 
          placeholder: "Descreva o conteúdo da imagem/vídeo...",
          promptPrefix: "Crie uma legenda envolvente para:"
        };
      case 'hashtags':
        return {
          title: "# Gerar Hashtags com IA",
          placeholder: "Descreva o conteúdo para gerar hashtags relevantes...",
          promptPrefix: "Gere hashtags relevantes para:"
        };
      case 'swot':
        return {
          title: "📊 Análise SWOT com IA",
          placeholder: "Descreva a empresa/produto para análise...",
          promptPrefix: "Faça uma análise SWOT para:"
        };
      default:
        return {
          title: "✨ Gerar Conteúdo com IA",
          placeholder: "Descreva o que você quer criar...",
          promptPrefix: "Crie conteúdo sobre:"
        };
    }
  };

  const config = getTypeConfig();

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Por favor, descreva o que você quer gerar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Build enhanced prompt with context
      let enhancedPrompt = `${config.promptPrefix} ${prompt}`;
      
      if (clienteInfo) {
        enhancedPrompt += `\n\nContexto do cliente:
- Nome: ${clienteInfo.nome}
- Segmento: ${clienteInfo.segmento || 'Não especificado'}
- Objetivos: ${clienteInfo.objetivos || 'Não especificado'}`;
      }

      if (type !== 'swot') {
        enhancedPrompt += `\n\nTipo de conteúdo: ${tipoConteudo}
Tom de voz: ${tomVoz}`;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-content-with-ai', {
        body: { 
          prompt: enhancedPrompt,
          type: type === 'hashtags' ? 'hashtags' : 'text'
        }
      });

      if (error) throw error;

      const content = data.content || "Erro ao gerar conteúdo";
      setGeneratedContent(content);
      
      toast({
        title: "Conteúdo gerado!",
        description: "IA criou o conteúdo com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const useContent = () => {
    onContentGenerated(generatedContent);
    setOpen(false);
    toast({
      title: "Conteúdo aplicado!",
      description: "O conteúdo foi inserido no campo",
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="text-purple-600 border-purple-600 hover:bg-purple-50">
      <Sparkles className="h-4 w-4 mr-2" />
      ✨ Gerar com IA
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent size="xl" height="lg">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {config.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {clienteInfo && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Cliente: {clienteInfo.nome}</p>
              {clienteInfo.segmento && (
                <p className="text-xs text-blue-600">Segmento: {clienteInfo.segmento}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt">Descreva o que você quer gerar</Label>
            <Textarea
              id="prompt"
              placeholder={config.placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {type !== 'swot' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <Select value={tipoConteudo} onValueChange={setTipoConteudo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educativo">Educativo</SelectItem>
                    <SelectItem value="promocional">Promocional</SelectItem>
                    <SelectItem value="engajamento">Engajamento</SelectItem>
                    <SelectItem value="inspiracional">Inspiracional</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tom de Voz</Label>
                <Select value={tomVoz} onValueChange={setTomVoz}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="descontraido">Descontraído</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="criativo">Criativo</SelectItem>
                    <SelectItem value="amigavel">Amigável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button 
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando conteúdo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Conteúdo
              </>
            )}
          </Button>

          {generatedContent && (
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label className="text-green-800 font-medium">Conteúdo Gerado:</Label>
                <div className="mt-2 text-sm text-green-700 whitespace-pre-wrap">
                  {generatedContent}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={useContent} className="flex-1">
                  Usar este Conteúdo
                </Button>
                <Button variant="outline" onClick={copyContent} className="px-3">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}