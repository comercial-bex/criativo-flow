import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, Loader2, Trophy, TrendingUp, Copy } from 'lucide-react';
import { useABTesting } from '@/hooks/useABTesting';
import { toast } from '@/lib/toast-compat';

interface ABTestingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onSelectVariacao: (texto: string) => void;
}

export const ABTestingManager = ({ isOpen, onClose, post, onSelectVariacao }: ABTestingManagerProps) => {
  const { loading, variacoes, gerarVariacoes, buscarVariacoes, marcarVencedora } = useABTesting();
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    if (isOpen && post.id) {
      buscarVariacoes(post.id);
    }
  }, [isOpen, post.id]);

  const handleGerarVariacoes = async () => {
    setGerando(true);
    await gerarVariacoes({
      post_id: post.id,
      texto_original: post.texto_estruturado || post.texto_ia || '',
      tipo_conteudo: post.tipo_conteudo || 'informar',
      objetivo: 'gerar engajamento'
    });
    setGerando(false);
  };

  const handleCopiar = (texto: string, letra: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`Variação ${letra} copiada!`);
  };

  const handleAplicar = (texto: string, letra: string) => {
    onSelectVariacao(texto);
    toast.success(`Variação ${letra} aplicada ao post!`);
    onClose();
  };

  const getAbordagemColor = (abordagem: string) => {
    const colors: any = {
      emocional: 'bg-purple-100 text-purple-700',
      racional: 'bg-blue-100 text-blue-700',
      urgencia_social: 'bg-orange-100 text-orange-700'
    };
    return colors[abordagem] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Testes A/B - Variações de Copywriting
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Gere e teste diferentes abordagens de texto para maximizar o engajamento
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">

        {variacoes.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <p className="text-muted-foreground mb-6">
              Crie variações do texto usando diferentes frameworks de copywriting
            </p>
            <Button onClick={handleGerarVariacoes} disabled={gerando} className="gap-2">
              {gerando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando Variações...
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4" />
                  Gerar 3 Variações A/B
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={variacoes[0]?.variacao_letra || 'A'} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {variacoes.slice(0, 3).map((v) => (
                  <TabsTrigger key={v.id} value={v.variacao_letra} className="gap-2">
                    Variação {v.variacao_letra}
                    {v.is_vencedora && <Trophy className="h-4 w-4 text-yellow-500" />}
                  </TabsTrigger>
                ))}
              </TabsList>

              {variacoes.slice(0, 3).map((variacao) => (
                <TabsContent key={variacao.id} value={variacao.variacao_letra} className="space-y-4">
                  {/* Badges de Framework e Abordagem */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      📋 {variacao.framework_usado}
                    </Badge>
                    <Badge className={getAbordagemColor(variacao.abordagem)}>
                      {variacao.abordagem === 'emocional' && '💜 Emocional'}
                      {variacao.abordagem === 'racional' && '🧠 Racional'}
                      {variacao.abordagem === 'urgencia_social' && '⚡ Urgência + Social Proof'}
                    </Badge>
                    {variacao.is_vencedora && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        🏆 Vencedora
                      </Badge>
                    )}
                  </div>

                  {/* Destaque */}
                  {variacao.destaque && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-3">
                        <p className="text-sm">
                          <strong>✨ Destaque:</strong> {variacao.destaque}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Texto da Variação */}
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {variacao.texto_estruturado}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Métricas de Performance */}
                  {(variacao.impressoes > 0 || variacao.engajamentos > 0) && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Performance Atual
                        </h5>
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Impressões</p>
                            <p className="text-lg font-bold">{variacao.impressoes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Engajamentos</p>
                            <p className="text-lg font-bold">{variacao.engajamentos}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Conversões</p>
                            <p className="text-lg font-bold">{variacao.conversoes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                            <p className="text-lg font-bold text-primary">{variacao.taxa_conversao.toFixed(2)}%</p>
                          </div>
                        </div>
                        <Progress value={variacao.taxa_conversao} className="h-2" />
                      </CardContent>
                    </Card>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleCopiar(variacao.texto_estruturado, variacao.variacao_letra)}
                      className="flex-1 gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </Button>
                    <Button
                      onClick={() => handleAplicar(variacao.texto_estruturado, variacao.variacao_letra)}
                      className="flex-1"
                    >
                      Aplicar ao Post
                    </Button>
                    {!variacao.is_vencedora && (
                      <Button
                        variant="outline"
                        onClick={() => marcarVencedora(variacao.id, post.id)}
                        className="gap-2"
                      >
                        <Trophy className="h-4 w-4" />
                        Marcar Vencedora
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Botão para Gerar Novas Variações */}
            <Button onClick={handleGerarVariacoes} variant="outline" className="w-full gap-2">
              <FlaskConical className="h-4 w-4" />
              Gerar Novas Variações
            </Button>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
