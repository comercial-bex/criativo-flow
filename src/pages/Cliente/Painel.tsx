import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Play, DollarSign, Calendar, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useIntelligenceData } from "@/hooks/useIntelligenceData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClientePainel() {
  const navigate = useNavigate();
  const { counts, timeline, clientProfile, loading, refresh } = useClientDashboard();
  const { unreadCount } = useNotifications();
  const { alerts } = useIntelligenceData();
  const entregues = timeline.filter(item => item.status === 'entregue');
  const pendentes = timeline.filter(item => item.status === 'pendente' || item.status === 'urgente');
  const mesAtual = format(new Date(), "MMMM yyyy", { locale: ptBR });

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // FASE 4: Empty state quando usuário não tem cliente_id vinculado
  if (!clientProfile?.cliente_id) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Card className="border-warning/50">
          <CardContent className="p-12 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-warning" />
            <h2 className="text-2xl font-bold mb-2">Conta em Configuração</h2>
            <p className="text-muted-foreground mb-4">
              Sua conta está sendo configurada pela nossa equipe.
              Em breve você terá acesso a todos os recursos!
            </p>
            <p className="text-sm text-muted-foreground">
              Se você acredita que isso é um erro, entre em contato com nosso suporte.
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <Button 
                variant="outline"
                onClick={() => navigate('/atendimento/inbox')}
              >
                Abrir Chamado
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              >
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Bem-vindo, {clientProfile?.nome || 'Cliente'}!
        </h1>
        <p className="text-muted-foreground">
          {clientProfile?.cliente_nome ? `${clientProfile.cliente_nome} - ` : ''}
          Acompanhe seus projetos e aprovações de forma simples
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/cliente/projetos')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Aprovar Planejamento</h3>
            <Badge 
              variant={counts.planejamentosPendentes > 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {counts.planejamentosPendentes > 0 
                ? `${counts.planejamentosPendentes} pendentes` 
                : 'Em dia'
              }
            </Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/grs/aprovacoes')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold">Aprovar Posts</h3>
            <Badge 
              variant={counts.postsPendentes > 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {counts.postsPendentes > 0 
                ? `${counts.postsPendentes} pendentes` 
                : 'Em dia'
              }
            </Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/design/aprovacoes')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Play className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold">Aprovar Vídeos</h3>
            <Badge 
              variant={counts.videosPendentes > 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {counts.videosPendentes > 0 
                ? `${counts.videosPendentes} pendentes` 
                : 'Em dia'
              }
            </Badge>
            <Button className="w-full" size="sm" variant="outline">Acessar</Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/financeiro')}
        >
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">Pagamentos & Contrato</h3>
            <Badge 
              variant={counts.pagamentosVencendo > 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {counts.pagamentosVencendo > 0 
                ? `${counts.pagamentosVencendo} vencendo` 
                : 'Em dia'
              }
            </Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Insights do Mercado</h3>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">{alert.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.alert_type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline do mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo - {mesAtual}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entregues.length > 0 && (
              <>
                <h4 className="font-medium text-success">✓ Já Entregue</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {entregues.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-3 border border-success/20 rounded-lg bg-success/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1 border-success/30 text-success">
                            {item.tipo}
                          </Badge>
                          <p className="font-medium text-sm text-success-foreground">{item.nome}</p>
                        </div>
                        <span className="text-xs text-success">{item.data}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pendentes.length > 0 && (
              <>
                <h4 className="font-medium text-warning">⏳ Aguardando Sua Aprovação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendentes.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 border rounded-lg transition-colors cursor-pointer hover:shadow-sm ${
                        item.status === 'urgente' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-warning/30 bg-warning/5'
                      }`}
                      onClick={() => {
                        if (item.tipo === 'Post') navigate('/grs/aprovacoes');
                        else if (item.tipo.includes('Vídeo')) navigate('/design/aprovacoes');
                        else navigate('/cliente/projetos');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mb-1 ${
                              item.status === 'urgente' 
                                ? 'border-destructive/30 text-destructive'
                                : 'border-warning/30 text-warning'
                            }`}
                          >
                            {item.tipo}
                          </Badge>
                          <p className={`font-medium text-sm ${
                            item.status === 'urgente' 
                              ? 'text-destructive-foreground'
                              : 'text-warning-foreground'
                          }`}>{item.nome}</p>
                          <p className={`text-xs ${
                            item.status === 'urgente' 
                              ? 'text-destructive'
                              : 'text-warning'
                          }`}>Agendado para {item.data}</p>
                        </div>
                        <Button size="sm" variant={item.status === 'urgente' ? 'destructive' : 'default'}>
                          Revisar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {timeline.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum item na timeline para este mês</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suporte rápido */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground">
                Nossa equipe está sempre disponível
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''} notificaç{unreadCount > 1 ? 'ões' : 'ão'}
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/atendimento/inbox')}
              >
                Abrir Chamado
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}