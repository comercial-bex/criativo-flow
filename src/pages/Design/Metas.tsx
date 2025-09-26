import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Clock, 
  CheckCircle2,
  Award,
  BarChart3,
  Calendar,
  Palette
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetaDesign {
  id: string;
  especialista_id: string;
  mes_ano: string;
  meta_projetos: number;
  meta_horas: number;
  projetos_concluidos: number;
  horas_trabalhadas: number;
  created_at: string;
  updated_at: string;
}

interface DesignerStats {
  id: string;
  nome: string;
  avatar_url?: string;
  tarefasConcluidas: number;
  tarefasEmAndamento: number;
  tempoMedioProducao: number;
  taxaAprovacao: number;
  meta?: MetaDesign;
}

export default function DesignMetas() {
  const [designers, setDesigners] = useState<DesignerStats[]>([]);
  const [metas, setMetas] = useState<MetaDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual] = useState(new Date());
  const [isCreatingMeta, setIsCreatingMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState({
    designer_id: '',
    meta_entregas: '',
    meta_tempo_medio: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const mesAnoAtual = format(mesAtual, 'yyyy-MM');
      
      // Buscar designers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('especialidade', 'design');

      if (profilesError) throw profilesError;

      // Buscar metas do mês atual
      const { data: metasData, error: metasError } = await supabase
        .from('audiovisual_metas')
        .select('*')
        .eq('mes_ano', `${mesAnoAtual}-01`);

      if (metasError) throw metasError;
      setMetas(metasData || []);

      // Buscar estatísticas de cada designer
      const designersStats = await Promise.all(
        (profilesData || []).map(async (designer) => {
          // Tarefas concluídas no mês
          const { data: tarefasConcluidas } = await supabase
            .from('tarefas')
            .select('*')
            .eq('responsavel_id', designer.id)
            .eq('tipo', 'design')
            .eq('status', 'entregue')
            .gte('updated_at', format(startOfMonth(mesAtual), 'yyyy-MM-dd'))
            .lte('updated_at', format(endOfMonth(mesAtual), 'yyyy-MM-dd'));

          // Tarefas em andamento
          const { data: tarefasEmAndamento } = await supabase
            .from('tarefas')
            .select('*')
            .eq('responsavel_id', designer.id)
            .eq('tipo', 'design')
            .in('status', ['briefing', 'em_criacao', 'revisao_interna', 'aprovacao_cliente']);

          // Calcular tempo médio (placeholder - implementar baseado em dados reais)
          const tempoMedioProducao = 2.5;
          const taxaAprovacao = 85;

          const meta = metasData?.find(m => m.especialista_id === designer.id);

          return {
            id: designer.id,
            nome: designer.nome,
            avatar_url: designer.avatar_url,
            tarefasConcluidas: tarefasConcluidas?.length || 0,
            tarefasEmAndamento: tarefasEmAndamento?.length || 0,
            tempoMedioProducao,
            taxaAprovacao,
            meta
          };
        })
      );

      setDesigners(designersStats);

    } catch (error) {
      console.error('Erro ao buscar dados das metas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das metas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMeta = async () => {
    if (!novaMeta.designer_id || !novaMeta.meta_entregas || !novaMeta.meta_tempo_medio) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingMeta(true);
      const mesAnoAtual = format(mesAtual, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('audiovisual_metas')
        .insert({
          especialista_id: novaMeta.designer_id,
          mes_ano: mesAnoAtual,
          meta_projetos: parseInt(novaMeta.meta_entregas),
          meta_horas: parseInt(novaMeta.meta_tempo_medio),
          projetos_concluidos: 0,
          horas_trabalhadas: 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchData();
      setNovaMeta({
        designer_id: '',
        meta_entregas: '',
        meta_tempo_medio: ''
      });

      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar meta.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMeta(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPerformanceIcon = (atual: number, meta: number) => {
    const percentage = meta > 0 ? (atual / meta) * 100 : 0;
    if (percentage >= 100) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Metas Design
          </h1>
          <p className="text-muted-foreground">
            Performance da equipe criativa - {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir Meta para Designer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="designer">Designer</Label>
                <Select
                  value={novaMeta.designer_id}
                  onValueChange={(value) => setNovaMeta(prev => ({ ...prev, designer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar designer" />
                  </SelectTrigger>
                  <SelectContent>
                    {designers.filter(d => !d.meta).map((designer) => (
                      <SelectItem key={designer.id} value={designer.id}>
                        {designer.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meta_entregas">Meta de Entregas (mês)</Label>
                <Input
                  id="meta_entregas"
                  type="number"
                  value={novaMeta.meta_entregas}
                  onChange={(e) => setNovaMeta(prev => ({ ...prev, meta_entregas: e.target.value }))}
                  placeholder="20"
                />
              </div>
              <div>
                <Label htmlFor="meta_tempo">Meta Tempo Médio (horas)</Label>
                <Input
                  id="meta_tempo"
                  type="number"
                  step="0.1"
                  value={novaMeta.meta_tempo_medio}
                  onChange={(e) => setNovaMeta(prev => ({ ...prev, meta_tempo_medio: e.target.value }))}
                  placeholder="2.5"
                />
              </div>
              <Button onClick={createMeta} disabled={isCreatingMeta} className="w-full">
                {isCreatingMeta ? "Criando..." : "Criar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {designers.reduce((acc, d) => acc + d.tarefasConcluidas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {designers.reduce((acc, d) => acc + d.tarefasEmAndamento, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tarefas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">
              -0.2h vs. meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% vs. mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Designer Performance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designers.map((designer) => {
          const metaEntregas = designer.meta?.meta_projetos || 0;
          const metaTempo = designer.meta?.meta_horas || 0;
          const progressEntregas = metaEntregas > 0 ? (designer.tarefasConcluidas / metaEntregas) * 100 : 0;
          const progressTempo = metaTempo > 0 ? (designer.tempoMedioProducao / metaTempo) * 100 : 0;

          return (
            <Card key={designer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={designer.avatar_url} />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-white">
                      {designer.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{designer.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Designer
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {designer.meta ? (
                  <>
                    {/* Meta de Entregas */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Entregas</span>
                        <div className="flex items-center gap-1">
                          {getPerformanceIcon(designer.tarefasConcluidas, metaEntregas)}
                          <span className="text-sm text-muted-foreground">
                            {designer.tarefasConcluidas}/{metaEntregas}
                          </span>
                        </div>
                      </div>
                      <Progress value={Math.min(progressEntregas, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(progressEntregas)}% da meta
                      </p>
                    </div>

                    {/* Tempo Médio */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tempo Médio</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {designer.tempoMedioProducao}h
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={designer.tempoMedioProducao <= metaTempo ? "default" : "destructive"}>
                          Meta: {metaTempo}h
                        </Badge>
                      </div>
                    </div>

                    {/* Taxa de Aprovação */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Taxa de Aprovação</span>
                        <span className="text-sm font-bold text-green-600">
                          {designer.taxaAprovacao}%
                        </span>
                      </div>
                      <Progress value={designer.taxaAprovacao} className="h-2" />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhuma meta definida para este mês
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Definir Meta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Definir Meta - {designer.nome}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="meta_entregas">Meta de Entregas (mês)</Label>
                            <Input
                              id="meta_entregas"
                              type="number"
                              placeholder="20"
                            />
                          </div>
                          <div>
                            <Label htmlFor="meta_tempo">Meta Tempo Médio (horas)</Label>
                            <Input
                              id="meta_tempo"
                              type="number"
                              step="0.1"
                              placeholder="2.5"
                            />
                          </div>
                          <Button className="w-full">
                            Criar Meta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Stats Atuais */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {designer.tarefasConcluidas}
                      </div>
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        {designer.tarefasEmAndamento}
                      </div>
                      <div className="text-xs text-muted-foreground">Em Andamento</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Gráfico de evolução em desenvolvimento</p>
            <p className="text-sm">Mostrará a progressão das entregas ao longo do mês</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}