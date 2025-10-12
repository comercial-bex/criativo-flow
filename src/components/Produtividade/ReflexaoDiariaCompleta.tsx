import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Smile, Meh, Frown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useProdutividadeReflexao } from "@/hooks/useProdutividadeReflexao";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReflexaoDiariaCompletaProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

const humorIcons = {
  feliz: { icon: Smile, color: 'text-green-500', label: 'Feliz' },
  neutro: { icon: Meh, color: 'text-yellow-500', label: 'Neutro' },
  triste: { icon: Frown, color: 'text-red-500', label: 'Triste' }
};

export function ReflexaoDiariaCompleta({ setor }: ReflexaoDiariaCompletaProps) {
  const { reflexaoHoje, reflexoes, loading, saving, salvarReflexao, gerarInsightIA } = useProdutividadeReflexao(setor);
  const [texto, setTexto] = useState(reflexaoHoje?.texto || '');
  const [humor, setHumor] = useState<'feliz' | 'neutro' | 'triste'>(reflexaoHoje?.humor || 'neutro');
  const [gerandoInsight, setGerandoInsight] = useState(false);

  const handleSalvar = async () => {
    await salvarReflexao(texto, humor);
  };

  const handleGerarInsight = async () => {
    setGerandoInsight(true);
    await gerarInsightIA();
    setGerandoInsight(false);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Reflexão Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card de Reflexão */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Reflexão Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Humor */}
          <div className="flex gap-2 justify-center">
            {Object.entries(humorIcons).map(([key, { icon: Icon, color, label }]) => (
              <Button
                key={key}
                variant={humor === key ? "default" : "outline"}
                size="sm"
                onClick={() => setHumor(key as 'feliz' | 'neutro' | 'triste')}
                className={humor === key ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Icon className={`h-4 w-4 mr-2 ${color}`} />
                {label}
              </Button>
            ))}
          </div>

          {/* Textarea */}
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Como foi seu dia? Escreva suas reflexões..."
            className="min-h-[120px] resize-none"
          />

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSalvar} 
              disabled={saving || !texto.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Reflexão'
              )}
            </Button>
            <Button 
              onClick={handleGerarInsight} 
              disabled={gerandoInsight || reflexoes.length === 0}
              variant="outline"
            >
              {gerandoInsight ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Insight IA
                </>
              )}
            </Button>
          </div>

          {/* Insight IA do Dia */}
          {reflexaoHoje?.resumo_ia && (
            <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/20">
              <h4 className="text-sm font-semibold mb-2 text-purple-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Insight do Dia
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {reflexaoHoje.resumo_ia}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Reflexões */}
      {reflexoes.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-900/10 to-purple-800/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-base">Histórico (últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reflexoes.slice(0, 7).map((reflexao) => {
              const HumorIcon = reflexao.humor ? humorIcons[reflexao.humor].icon : Meh;
              const humorColor = reflexao.humor ? humorIcons[reflexao.humor].color : 'text-gray-500';
              
              return (
                <div key={reflexao.id} className="p-3 bg-muted/30 rounded-lg border border-muted">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reflexao.data), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <HumorIcon className={`h-4 w-4 ${humorColor}`} />
                  </div>
                  <p className="text-sm line-clamp-2">{reflexao.texto}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
