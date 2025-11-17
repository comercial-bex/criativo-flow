import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DialogWrapper } from './DialogWrapper';
import { Hash, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HashtagGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  onHashtagsGenerated: (hashtags: string) => void;
}

export function HashtagGenerator({ open, onOpenChange, post, onHashtagsGenerated }: HashtagGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<any>(null);
  const [plataforma, setPlataforma] = useState<'instagram' | 'facebook' | 'linkedin' | 'twitter'>('instagram');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-hashtags-inteligentes', {
        body: {
          texto: post.texto_estruturado || post.texto_ia || post.titulo,
          plataforma,
          objetivo: post.objetivo_postagem,
          nicho: post.tipo_conteudo,
        }
      });

      if (error) throw error;

      if (data.success) {
        setHashtags(data);
        toast.success('✅ Hashtags geradas com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao gerar hashtags');
      }
    } catch (error: any) {
      console.error('Erro ao gerar hashtags:', error);
      toast.error(error.message || 'Erro ao gerar hashtags');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hashtags: string[]) => {
    const texto = hashtags.join(' ');
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Hashtags copiadas!');
  };

  const handleApply = () => {
    if (!hashtags) return;
    
    const todasHashtags = [
      ...hashtags.hashtags_principais,
      ...hashtags.hashtags_nicho,
      ...hashtags.hashtags_trending
    ].join(' ');
    
    onHashtagsGenerated(todasHashtags);
    onOpenChange(false);
    toast.success('Hashtags aplicadas ao post!');
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Gerador Inteligente de Hashtags"
      description="Use IA para gerar hashtags estratégicas para seu post"
      size="lg"
    >
      <div className="space-y-6">
        {/* Seletor de Plataforma */}
        <div>
          <label className="text-sm font-medium mb-2 block">Plataforma de Destino</label>
          <Select value={plataforma} onValueChange={(v: any) => setPlataforma(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram (30 hashtags)</SelectItem>
              <SelectItem value="facebook">Facebook (15 hashtags)</SelectItem>
              <SelectItem value="linkedin">LinkedIn (10 hashtags)</SelectItem>
              <SelectItem value="twitter">Twitter (7 hashtags)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview do Post */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.texto_estruturado?.substring(0, 200) || post.texto_ia?.substring(0, 200) || 'Sem texto'}...
            </p>
          </CardContent>
        </Card>

        {/* Botão Gerar */}
        {!hashtags && (
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando hashtags com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Hashtags com IA
              </>
            )}
          </Button>
        )}

        {/* Resultados */}
        {hashtags && (
          <div className="space-y-4">
            {/* Principais */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Principais ({hashtags.hashtags_principais.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hashtags.hashtags_principais)}
                  className="gap-2"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copiar
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {hashtags.hashtags_principais.map((h: string) => (
                  <Badge key={h} variant="default" className="text-xs">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Nicho */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4 text-secondary" />
                  Nicho ({hashtags.hashtags_nicho.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hashtags.hashtags_nicho)}
                  className="gap-2"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copiar
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {hashtags.hashtags_nicho.map((h: string) => (
                  <Badge key={h} variant="secondary" className="text-xs">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4 text-accent" />
                  Trending ({hashtags.hashtags_trending.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hashtags.hashtags_trending)}
                  className="gap-2"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copiar
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {hashtags.hashtags_trending.map((h: string) => (
                  <Badge key={h} variant="outline" className="text-xs">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Justificativa */}
            {hashtags.justificativa && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Estratégia:</strong> {hashtags.justificativa}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setHashtags(null)} className="flex-1">
                Gerar Novamente
              </Button>
              <Button onClick={handleApply} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Aplicar ao Post ({hashtags.total})
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}
