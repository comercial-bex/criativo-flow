import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, Medal, Target } from "lucide-react";
import { useGamificacao } from "@/hooks/useGamificacao";
import { useAuth } from "@/hooks/useAuth";

interface GamificationWidgetProps {
  setor: 'grs' | 'design' | 'audiovisual';
  className?: string;
  compact?: boolean;
}

export function GamificationWidget({ setor, className = "", compact = false }: GamificationWidgetProps) {
  const { user } = useAuth();
  const { meuPerfil, ranking, loading, getMensagemMotivacional, getRankingPorSetor } = useGamificacao();
  
  const setorRanking = getRankingPorSetor(setor);
  const minhaPosicao = setorRanking.findIndex(u => u.user_id === user?.id) + 1;
  const topTres = setorRanking.slice(0, 3);

  if (loading || !meuPerfil) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{meuPerfil.pontos_mes_atual} pts</p>
                <p className="text-xs text-muted-foreground">
                  {minhaPosicao > 0 ? `#${minhaPosicao}` : 'Não ranqueado'} no {setor.toUpperCase()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {meuPerfil.pontos_totais} total
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Seu Desempenho - {setor.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pontuação Atual */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="text-3xl font-bold text-primary mb-1">
            {meuPerfil.pontos_mes_atual}
          </div>
          <p className="text-sm text-muted-foreground">pontos este mês</p>
          <Badge variant="outline" className="mt-2">
            {meuPerfil.pontos_totais} total acumulado
          </Badge>
        </div>

        {/* Posição no Ranking */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">Posição no Ranking</span>
          </div>
          <Badge variant={minhaPosicao <= 3 ? "default" : "secondary"}>
            {minhaPosicao > 0 ? `#${minhaPosicao}` : 'Não ranqueado'}
          </Badge>
        </div>

        {/* Top 3 do Setor */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Top 3 do {setor.toUpperCase()}
          </h4>
          {topTres.map((usuario, index) => (
            <div key={usuario.user_id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  'bg-orange-400 text-white'
                }`}>
                  {index + 1}
                </div>
                <span className={usuario.user_id === user?.id ? 'font-bold text-primary' : ''}>
                  {usuario.profiles?.nome || 'Usuário'}
                </span>
              </div>
              <span className="font-medium">{usuario.pontos_mes_atual} pts</span>
            </div>
          ))}
        </div>

        {/* Mensagem Motivacional */}
        <div className="p-3 bg-accent/20 rounded-lg border border-accent/30">
          <p className="text-sm text-center italic">
            {getMensagemMotivacional()}
          </p>
        </div>

        {/* Progresso para o próximo nível (exemplo) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progresso do mês</span>
            <span>{Math.min(Math.round((meuPerfil.pontos_mes_atual / 100) * 100), 100)}%</span>
          </div>
          <Progress value={Math.min((meuPerfil.pontos_mes_atual / 100) * 100, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Meta: 100 pontos/mês
          </p>
        </div>
      </CardContent>
    </Card>
  );
}