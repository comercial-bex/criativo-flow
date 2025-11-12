import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { PlanejamentoCampanha } from '@/hooks/useDatasComemoratias';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineCampanhasProps {
  campanhas: PlanejamentoCampanha[];
}

export function TimelineCampanhas({ campanhas }: TimelineCampanhasProps) {
  const campanhasPorMes = useMemo(() => {
    const grupos: { [key: string]: PlanejamentoCampanha[] } = {};
    
    campanhas.forEach(campanha => {
      const mes = format(new Date(campanha.data_inicio), 'MMMM yyyy', { locale: ptBR });
      if (!grupos[mes]) {
        grupos[mes] = [];
      }
      grupos[mes].push(campanha);
    });

    // Ordenar campanhas dentro de cada mês por data
    Object.keys(grupos).forEach(mes => {
      grupos[mes].sort((a, b) => 
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
      );
    });

    return grupos;
  }, [campanhas]);

  const getEngajamentoBadge = (nivel: string) => {
    switch (nivel) {
      case 'alto':
        return <Badge className="bg-green-500 text-white text-xs">⭐ Alto</Badge>;
      case 'medio':
        return <Badge variant="secondary" className="text-xs">📊 Médio</Badge>;
      case 'baixo':
        return <Badge variant="outline" className="text-xs">📉 Baixo</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejada':
        return <Badge variant="outline" className="text-xs">📋 Planejada</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-500 text-white text-xs">🔄 Em Andamento</Badge>;
      case 'concluida':
        return <Badge className="bg-green-500 text-white text-xs">✅ Concluída</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  if (campanhas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma campanha programada</h3>
          <p className="text-sm text-muted-foreground">
            Adicione datas comemorativas para visualizar a timeline
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline de Campanhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(campanhasPorMes).map(([mes, campanhasMes]) => (
          <div key={mes} className="space-y-3">
            <h3 className="font-semibold text-lg capitalize border-b pb-2">
              {mes}
            </h3>
            
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              {campanhasMes.map(campanha => (
                <div key={campanha.id} className="relative">
                  <div className="absolute -left-[25px] top-3 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  
                  <Card className="ml-4">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{campanha.nome_campanha}</h4>
                            {campanha.data_comemorativa && getEngajamentoBadge(campanha.data_comemorativa.potencial_engajamento)}
                            {getStatusBadge(campanha.status)}
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(campanha.data_inicio), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(campanha.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Período:</span>
                              <span>
                                {campanha.periodo_pre_campanha} dias antes + {campanha.periodo_pos_campanha} dias depois
                              </span>
                            </div>

                            {campanha.orcamento_sugerido && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                <span>Orçamento: R$ {campanha.orcamento_sugerido.toLocaleString('pt-BR')}</span>
                              </div>
                            )}

                            {campanha.objetivos && campanha.objetivos.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                <span className="font-medium">Objetivos:</span>
                                {campanha.objetivos.map(obj => (
                                  <Badge key={obj} variant="secondary" className="text-xs">
                                    {obj}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {campanha.data_comemorativa?.sugestao_campanha && (
                            <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                              💡 {campanha.data_comemorativa.sugestao_campanha}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
