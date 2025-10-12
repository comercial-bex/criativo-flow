import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Smile, Meh, Frown, Loader2 } from "lucide-react";
import { useProdutividadeReflexao } from "@/hooks/useProdutividadeReflexao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineReflexoesProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

const humorIcons = {
  feliz: { icon: Smile, color: 'text-green-500' },
  neutro: { icon: Meh, color: 'text-yellow-500' },
  triste: { icon: Frown, color: 'text-red-500' }
};

export function TimelineReflexoes({ setor }: TimelineReflexoesProps) {
  const { reflexoes, loading } = useProdutividadeReflexao(setor);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Timeline de Reflexões
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Timeline de Reflexões ({reflexoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reflexoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma reflexão registrada ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Comece escrevendo sua primeira reflexão
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-4 relative">
              {/* Linha vertical */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-500/30" />
              
              {reflexoes.map((reflexao, index) => {
                const HumorIcon = reflexao.humor ? humorIcons[reflexao.humor].icon : Meh;
                const humorColor = reflexao.humor ? humorIcons[reflexao.humor].color : 'text-gray-500';
                
                return (
                  <div key={reflexao.id} className="relative pl-10 pb-4">
                    {/* Dot na timeline */}
                    <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full ${reflexao.humor ? 'bg-purple-500' : 'bg-gray-500'} ring-4 ring-background`} />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <HumorIcon className={`h-4 w-4 ${humorColor}`} />
                        <span className="text-xs text-muted-foreground font-medium">
                          {format(new Date(reflexao.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <p className="text-sm line-clamp-2">
                        {reflexao.texto}
                      </p>
                      
                      {reflexao.resumo_ia && (
                        <p className="text-xs text-purple-400 italic line-clamp-1">
                          IA: {reflexao.resumo_ia.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
