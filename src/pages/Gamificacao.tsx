import { useState } from 'react';
import { useGamificacao } from '@/hooks/useGamificacao';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Zap, Target, Medal, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Gamificacao() {
  const { user } = useAuth();
  const { 
    loading, 
    meuPerfil, 
    ranking, 
    selos,
    historico,
    getRankingPorSetor,
    getSelosPorSetor,
    getMensagemMotivacional 
  } = useGamificacao();

  const [tabAtiva, setTabAtiva] = useState('ranking');

  const setorColors = {
    grs: 'bg-gradient-to-r from-blue-500 to-blue-600',
    design: 'bg-gradient-to-r from-purple-500 to-purple-600', 
    audiovisual: 'bg-gradient-to-r from-red-500 to-red-600'
  };

  const setorIcons = {
    grs: '📊',
    design: '🎨',
    audiovisual: '🎥'
  };

  const setorNames = {
    grs: 'GRS',
    design: 'Criativo/Design',
    audiovisual: 'Audiovisual/Filmmaker'
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const renderRankingCard = (usuario: any, posicao: number, setor: string) => {
    const isVencedor = posicao === 1;
    const initials = usuario.profiles?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
      <Card key={usuario.id} className={`${isVencedor ? 'ring-2 ring-primary ring-offset-2' : ''} hover-lift`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                posicao === 1 ? 'bg-yellow-500' : 
                posicao === 2 ? 'bg-gray-400' : 
                posicao === 3 ? 'bg-amber-600' : 'bg-muted'
              }`}>
                {posicao}
              </div>
              <Avatar className="w-12 h-12">
                <AvatarImage src={usuario.profiles?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{usuario.profiles?.nome || 'Usuário'}</h3>
                {isVencedor && <Trophy className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{setorIcons[setor as keyof typeof setorIcons]} {setorNames[setor as keyof typeof setorNames]}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{usuario.pontos_mes_atual}</div>
              <div className="text-sm text-muted-foreground">pontos</div>
            </div>
          </div>
          
          {isVencedor && (
            <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">🏆 Top 1 do Setor - Candidato ao Prêmio Mensal!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMeuDesempenho = () => (
    <div className="space-y-6">
      {/* Card do Meu Perfil */}
      <Card className="overflow-hidden">
        <div className={`h-24 ${meuPerfil?.setor ? setorColors[meuPerfil.setor] : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
          <div className="h-full flex items-end justify-end p-4">
            <span className="text-white text-3xl">
              {meuPerfil?.setor ? setorIcons[meuPerfil.setor] : '👤'}
            </span>
          </div>
        </div>
        <CardContent className="p-6 -mt-12 relative">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={meuPerfil?.profiles?.avatar_url} />
              <AvatarFallback className="text-lg font-bold">
                {meuPerfil?.profiles?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 mt-4">
              <h2 className="text-xl font-bold text-foreground">
                {meuPerfil?.profiles?.nome || 'Meu Perfil'}
              </h2>
              <p className="text-muted-foreground">
                {meuPerfil?.setor ? setorNames[meuPerfil.setor] : 'Setor não definido'}
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{meuPerfil?.pontos_mes_atual || 0}</div>
                  <div className="text-sm text-muted-foreground">Pontos do Mês</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{meuPerfil?.pontos_totais || 0}</div>
                  <div className="text-sm text-muted-foreground">Total de Pontos</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mensagem Motivacional */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{getMensagemMotivacional()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selos Conquistados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Medal className="w-5 h-5" />
            <span>Meus Selos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selos.slice(0, 8).map(selo => (
              <div key={selo.id} className="text-center p-4 border rounded-lg hover-lift">
                <div className="text-3xl mb-2">{selo.icone}</div>
                <div className="font-medium text-sm">{selo.nome}</div>
                <div className="text-xs text-muted-foreground mt-1">{selo.descricao}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Histórico de Pontos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.slice(0, 10).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.descricao || item.tipo_acao}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Badge variant={item.pontos > 0 ? 'default' : 'destructive'}>
                  {item.pontos > 0 ? '+' : ''}{item.pontos} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text">🏆 Sistema de Gamificação</h1>
          <p className="text-muted-foreground">
            Reconheça conquistas, motive equipes e celebre excelência
          </p>
        </div>

        <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ranking">Ranking por Setores</TabsTrigger>
            <TabsTrigger value="meu-desempenho">Meu Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {(['grs', 'design', 'audiovisual'] as const).map(setor => {
                const rankingSetor = getRankingPorSetor(setor);
                const topPerformer = rankingSetor[0];

                return (
                  <Card key={setor} className="overflow-hidden">
                    <div className={`h-16 ${setorColors[setor]} flex items-center justify-between px-6`}>
                      <div className="text-white">
                        <h3 className="font-bold text-lg">{setorNames[setor]}</h3>
                        <p className="text-white/80 text-sm">Ranking Mensal</p>
                      </div>
                      <span className="text-white text-2xl">{setorIcons[setor]}</span>
                    </div>
                    
                    <CardContent className="p-6">
                      {topPerformer ? (
                        <div className="space-y-4">
                          {renderRankingCard(topPerformer, 1, setor)}
                          
                          {rankingSetor.slice(1, 3).map((usuario, index) => (
                            <div key={usuario.id} className="ml-4">
                              {renderRankingCard(usuario, index + 2, setor)}
                            </div>
                          ))}
                          
                          {rankingSetor.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhum colaborador cadastrado ainda</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Seja o primeiro do ranking!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="meu-desempenho">
            {renderMeuDesempenho()}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}