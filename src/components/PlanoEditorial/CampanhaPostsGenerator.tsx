import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';
import { PlanejamentoCampanha } from '@/hooks/useDatasComemoratias';

interface CampanhaPostsGeneratorProps {
  planejamentoId: string;
  clienteId: string;
  campanhas: PlanejamentoCampanha[];
  onPostsGenerated: () => void;
}

export function CampanhaPostsGenerator({
  planejamentoId,
  clienteId,
  campanhas,
  onPostsGenerated
}: CampanhaPostsGeneratorProps) {
  const [gerando, setGerando] = useState(false);
  const [campanhasSelecionadas, setCampanhasSelecionadas] = useState<string[]>([]);

  const handleGerarPosts = async () => {
    if (campanhasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma campanha');
      return;
    }

    setGerando(true);
    try {
      console.log('🎯 Gerando posts para campanhas:', campanhasSelecionadas);

      const { data, error } = await supabase.functions.invoke('generate-campaign-posts', {
        body: {
          planejamentoId,
          clienteId,
          campanhaIds: campanhasSelecionadas,
          quantidadePorPeriodo: {
            pre: 3,
            durante: 5,
            pos: 2
          }
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar posts');
      }

      // Salvar posts temporários no banco
      const postsParaSalvar = data.postsGerados.map((post: any) => ({
        planejamento_id: planejamentoId,
        titulo: post.titulo,
        legenda: post.legenda,
        data_postagem: post.data_postagem,
        tipo_criativo: post.tipo_criativo,
        formato_postagem: post.formato_postagem,
        objetivo_postagem: post.objetivo_postagem,
        call_to_action: post.call_to_action,
        hashtags: post.hashtags,
        componente_hesec: post.componente_hesec,
        contexto_estrategico: post.contexto_estrategico,
        campanha_id: post.campanha_id,
        periodo_campanha: post.periodo_campanha
      }));

      const { error: insertError } = await supabase
        .from('posts_gerados_temp')
        .insert(postsParaSalvar);

      if (insertError) throw insertError;

      toast.success(
        `🎉 ${data.postsGerados.length} posts gerados com sucesso!`,
        {
          description: `Distribuídos em ${data.metadata.total_campanhas} campanha(s)`
        }
      );

      onPostsGenerated();
      setCampanhasSelecionadas([]);

    } catch (error: any) {
      console.error('Erro ao gerar posts:', error);
      toast.error('Erro ao gerar posts de campanha', {
        description: error.message
      });
    } finally {
      setGerando(false);
    }
  };

  const toggleCampanha = (campanhaId: string) => {
    setCampanhasSelecionadas(prev =>
      prev.includes(campanhaId)
        ? prev.filter(id => id !== campanhaId)
        : [...prev, campanhaId]
    );
  };

  if (campanhas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Adicione datas comemorativas primeiro para gerar posts temáticos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gerar Posts Temáticos para Campanhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selecione as campanhas para gerar posts automáticos com IA nos períodos pré, durante e pós-campanha
        </p>

        <div className="space-y-2">
          {campanhas.map(campanha => {
            const selecionada = campanhasSelecionadas.includes(campanha.id);
            return (
              <div
                key={campanha.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selecionada ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleCampanha(campanha.id)}
              >
                <input
                  type="checkbox"
                  checked={selecionada}
                  onChange={() => toggleCampanha(campanha.id)}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{campanha.nome_campanha}</h4>
                    {campanha.data_comemorativa && (
                      <Badge variant="outline" className="text-xs">
                        {campanha.data_comemorativa.tipo}
                      </Badge>
                    )}
                    {campanha.data_comemorativa?.potencial_engajamento === 'alto' && (
                      <Badge className="bg-green-500 text-white text-xs">⭐ Alto</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(campanha.data_inicio).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(campanha.data_fim).toLocaleDateString('pt-BR')} •{' '}
                    Gera ~10 posts (3 pré + 5 durante + 2 pós)
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {campanhasSelecionadas.length > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-2">
              📊 Preview da Geração:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Campanhas selecionadas:</span>
                <span className="ml-2 font-bold">{campanhasSelecionadas.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Posts estimados:</span>
                <span className="ml-2 font-bold">~{campanhasSelecionadas.length * 10}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleGerarPosts}
          disabled={gerando || campanhasSelecionadas.length === 0}
          className="w-full"
          size="lg"
        >
          {gerando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando Posts com IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Posts para {campanhasSelecionadas.length} Campanha(s)
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Dica:</strong> A IA criará:</p>
          <ul className="ml-4 space-y-1">
            <li>• <strong>Pré-campanha:</strong> Posts de antecipação e awareness</li>
            <li>• <strong>Durante:</strong> Posts de conversão e engajamento máximo</li>
            <li>• <strong>Pós-campanha:</strong> Posts de agradecimento e prolongamento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
