import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Eye, CheckCircle, XCircle, Clock, MessageSquare, Image as ImageIcon } from "lucide-react";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

interface AprovacaoComTarefa {
  id: string;
  tarefa_id: string;
  status_aprovacao: 'pendente' | 'aprovado' | 'reprovado' | 'ajustes';
  comentarios: string | null;
  aprovado_por: string | null;
  data_aprovacao: string | null;
  created_at: string;
  tarefa: {
    id: string;
    titulo: string;
    tipo: string;
    cliente_id: string;
    kpis: any;
  };
  anexos: Array<{
    id: string;
    arquivo_url: string;
    legenda: string | null;
    tipo: string;
  }>;
}

export default function DesignAprovacoes() {
  const { startTutorial, hasSeenTutorial } = useTutorial('design-aprovacoes');
  const { toast } = useToast();
  const { user } = useAuth();
  const [aprovacoes, setAprovacoes] = useState<AprovacaoComTarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("pendentes");
  const [comentario, setComentario] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAprovacoes();
  }, [activeTab]);

  const fetchAprovacoes = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Aprovações] Buscando aprovações...');

      let query = supabase
        .from('aprovacao_tarefa')
        .select(`
          *,
          tarefa:tarefa_id (
            id,
            titulo,
            tipo,
            cliente_id,
            kpis
          )
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'pendentes') {
        query = query.eq('status_aprovacao', 'pendente');
      } else if (activeTab === 'aprovados') {
        query = query.eq('status_aprovacao', 'aprovado');
      } else if (activeTab === 'rejeitados') {
        query = query.in('status_aprovacao', ['reprovado', 'ajustes']);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Buscar anexos para cada tarefa
      const aprovacoesComAnexos = await Promise.all(
        (data || []).map(async (apr: any) => {
          const { data: anexos } = await supabase
            .from('anexo')
            .select('id, arquivo_url, legenda, tipo')
            .eq('tarefa_id', apr.tarefa_id)
            .order('created_at', { ascending: false })
            .limit(5);

          return {
            ...apr,
            anexos: anexos || []
          };
        })
      );

      setAprovacoes(aprovacoesComAnexos as AprovacaoComTarefa[]);
      console.log(`✅ [Aprovações] ${aprovacoesComAnexos.length} aprovações carregadas`);
    } catch (error) {
      console.error('❌ [Aprovações] Erro:', error);
      toast({
        title: "Erro ao carregar aprovações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (aprovacaoId: string) => {
    try {
      const { error } = await supabase
        .from('aprovacao_tarefa')
        .update({
          status_aprovacao: 'aprovado',
          aprovado_por: user?.id,
          data_aprovacao: new Date().toISOString(),
          comentarios: comentario[aprovacaoId] || null
        })
        .eq('id', aprovacaoId);

      if (error) throw error;

      toast({ title: "✅ Design aprovado com sucesso!" });
      fetchAprovacoes();
      setComentario(prev => ({ ...prev, [aprovacaoId]: '' }));
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error);
      toast({ title: "Erro ao aprovar design", variant: "destructive" });
    }
  };

  const handleRejeitar = async (aprovacaoId: string) => {
    if (!comentario[aprovacaoId]?.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, explique o motivo da rejeição",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('aprovacao_tarefa')
        .update({
          status_aprovacao: 'reprovado',
          aprovado_por: user?.id,
          data_aprovacao: new Date().toISOString(),
          comentarios: comentario[aprovacaoId]
        })
        .eq('id', aprovacaoId);

      if (error) throw error;

      toast({ title: "❌ Design rejeitado" });
      fetchAprovacoes();
      setComentario(prev => ({ ...prev, [aprovacaoId]: '' }));
    } catch (error) {
      console.error('❌ Erro ao rejeitar:', error);
      toast({ title: "Erro ao rejeitar design", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pendente': { variant: 'secondary' as const, icon: Clock, label: 'Aguardando' },
      'aprovado': { variant: 'default' as const, icon: CheckCircle, label: 'Aprovado' },
      'reprovado': { variant: 'destructive' as const, icon: XCircle, label: 'Reprovado' },
      'ajustes': { variant: 'outline' as const, icon: MessageSquare, label: 'Ajustes' }
    };
    const config = variants[status as keyof typeof variants] || variants.pendente;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    pendentes: aprovacoes.filter(a => a.status_aprovacao === 'pendente').length,
    aprovados: aprovacoes.filter(a => a.status_aprovacao === 'aprovado').length,
    rejeitados: aprovacoes.filter(a => a.status_aprovacao === 'reprovado' || a.status_aprovacao === 'ajustes').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-8 w-8 text-primary" />
            Aprovações de Design
          </h1>
          <p className="text-muted-foreground">Revise e aprove trabalhos criativos</p>
        </div>
        <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold">{stats.aprovados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold">{stats.rejeitados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({stats.pendentes})</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados ({stats.aprovados})</TabsTrigger>
          <TabsTrigger value="rejeitados">Rejeitados ({stats.rejeitados})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando aprovações...</p>
              </CardContent>
            </Card>
          ) : aprovacoes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma aprovação nesta categoria</p>
              </CardContent>
            </Card>
          ) : (
            aprovacoes.map((aprovacao) => (
              <Card key={aprovacao.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {aprovacao.tarefa?.titulo || 'Sem título'}
                        {getStatusBadge(aprovacao.status_aprovacao)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tipo: {aprovacao.tarefa?.tipo || 'N/A'} • Criado em{' '}
                        {format(new Date(aprovacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Anexos */}
                  {aprovacao.anexos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Arquivos ({aprovacao.anexos.length})</p>
                      <div className="grid grid-cols-5 gap-2">
                        {aprovacao.anexos.map((anexo) => (
                          <a
                            key={anexo.id}
                            href={anexo.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                          >
                            {anexo.tipo === 'imagem' ? (
                              <img
                                src={anexo.arquivo_url}
                                alt={anexo.legenda || 'Anexo'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comentários anteriores */}
                  {aprovacao.comentarios && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Comentários</p>
                      <p className="text-sm text-muted-foreground">{aprovacao.comentarios}</p>
                    </div>
                  )}

                  {/* Ações para pendentes */}
                  {aprovacao.status_aprovacao === 'pendente' && (
                    <div className="space-y-3 border-t pt-4">
                      <Textarea
                        placeholder="Adicione comentários (opcional para aprovar, obrigatório para rejeitar)"
                        value={comentario[aprovacao.id] || ''}
                        onChange={(e) => setComentario(prev => ({ ...prev, [aprovacao.id]: e.target.value }))}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAprovar(aprovacao.id)}
                          className="flex-1"
                          variant="default"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleRejeitar(aprovacao.id)}
                          className="flex-1"
                          variant="destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Data de aprovação/rejeição */}
                  {aprovacao.data_aprovacao && (
                    <p className="text-xs text-muted-foreground">
                      {aprovacao.status_aprovacao === 'aprovado' ? 'Aprovado' : 'Rejeitado'} em{' '}
                      {format(new Date(aprovacao.data_aprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}