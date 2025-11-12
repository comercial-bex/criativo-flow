import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useAIScriptGenerator } from '@/hooks/useAIScriptGenerator';
import { toast } from '@/lib/toast-compat';

interface AIScriptGeneratorProps {
  clienteId: string;
  projetoId: string;
  onScriptGenerated?: (script: string, metadata: any) => void;
  trigger?: React.ReactNode;
}

export function AIScriptGenerator({ clienteId, projetoId, onScriptGenerated, trigger }: AIScriptGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [duracao, setDuracao] = useState('60');
  const [tom, setTom] = useState('profissional');
  const [plataforma, setPlataforma] = useState('instagram');
  const [objetivo, setObjetivo] = useState('');
  
  const { generateScript, script, loading } = useAIScriptGenerator();

  const handleGenerate = async () => {
    if (!titulo.trim() || !objetivo.trim()) return;

    const result = await generateScript({
      clienteId,
      projetoId,
      titulo,
      duracao: parseInt(duracao),
      tom,
      plataforma,
      objetivo
    });

    if (result && onScriptGenerated) {
      onScriptGenerated(result.roteiro, result.metadata);
      toast.success('🎬 Roteiro gerado e inserido na mensagem!', {
        description: 'Você pode editá-lo antes de enviar.'
      });
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDuracao('60');
    setTom('profissional');
    setPlataforma('instagram');
    setObjetivo('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Roteiro com IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Roteiro com IA
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do vídeo para gerar um roteiro completo com IA. 
            O roteiro será inserido automaticamente na mensagem do chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Vídeo</Label>
            <Input
              id="titulo"
              placeholder="Ex: Lançamento do Novo Produto X"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (segundos)</Label>
              <Input
                id="duracao"
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plataforma">Plataforma</Label>
              <Select value={plataforma} onValueChange={setPlataforma}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tom">Tom de Voz</Label>
            <Select value={tom} onValueChange={setTom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="descontraido">Descontraído</SelectItem>
                <SelectItem value="inspirador">Inspirador</SelectItem>
                <SelectItem value="educativo">Educativo</SelectItem>
                <SelectItem value="humoristico">Humorístico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo do Vídeo</Label>
            <Textarea
              id="objetivo"
              placeholder="Descreva o objetivo principal do vídeo..."
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              rows={4}
            />
          </div>

          {script && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-mono whitespace-pre-wrap">{script.substring(0, 200)}...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={loading || !titulo.trim() || !objetivo.trim()}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Roteiro
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
