import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Calendar, Target, Eye, Loader2, CheckCircle2, Zap, Megaphone, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/toast-compat';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { supabase } from '@/integrations/supabase/client';
import { EspecialistasSelector } from '@/components/EspecialistasSelector';
import { gerarPostsAutomaticos } from '@/utils/gerarPostsAutomaticos';

interface CreatePlanejamentoUnificadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  tipoInicial?: 'estrategico' | 'mensal' | 'campanha';
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  onCreated?: (planejamentoId: string, clienteId: string) => void;
}

type TipoPlano = 'estrategico' | 'mensal' | 'campanha';
type EtapaModal = 'tipo' | 'dados' | 'ia' | 'posts' | 'especialistas';

export function CreatePlanejamentoUnificadoModal({ 
  open,
  onOpenChange,
  clienteId, 
  tipoInicial,
  trigger, 
  onSuccess,
  onCreated 
}: CreatePlanejamentoUnificadoModalProps) {
  const { createStrategicPlan, generateWithAI } = useStrategicPlans(clienteId);
  
  const [etapaAtual, setEtapaAtual] = useState<EtapaModal>(tipoInicial ? 'dados' : 'tipo');
  const [tipoPlano, setTipoPlano] = useState<TipoPlano>(tipoInicial || 'estrategico');
  const [loading, setLoading] = useState(false);
  
  // Dados básicos
  const [clienteSelecionado, setClienteSelecionado] = useState(clienteId || '');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState(new Date().toISOString().slice(0, 10));
  const [periodoFim, setPeriodoFim] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  
  // Dados da IA
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'gpt4'>('gemini');
  const [dadosIA, setDadosIA] = useState<any>(null);
  const [missao, setMissao] = useState('');
  const [visao, setVisao] = useState('');
  const [valores, setValores] = useState<string[]>([]);
  const [swot, setSwot] = useState<any>(null);
  
  // Configuração de posts
  const [gerarPostsAuto, setGerarPostsAuto] = useState(true);
  const [quantidadePostsCampanha, setQuantidadePostsCampanha] = useState(8);
  const [assinatura, setAssinatura] = useState<any>(null);
  
  // Especialistas
  const [especialistas, setEspecialistas] = useState({
    grs_id: null as string | null,
    designer_id: null as string | null,
    filmmaker_id: null as string | null,
    gerente_id: null as string | null
  });

  const handleGerarComIA = async () => {
    setLoading(true);
    try {
      const { data, error } = await generateWithAI(clienteSelecionado, selectedModel);
      
      if (error) throw error;
      
      setDadosIA(data);
      setMissao(data.missao);
      setVisao(data.visao);
      setValores(data.valores);
      setSwot(data.analise_swot);
      
      toast.success('✨ Plano estratégico gerado com IA!', {
        description: `Gerado com ${selectedModel === 'gemini' ? 'Lovable AI (Gemini)' : 'OpenAI GPT-4.1'}`
      });
      
      setEtapaAtual('posts');
    } catch (error: any) {
      toast.error('Erro ao gerar plano', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      if (tipoPlano === 'estrategico' && dadosIA) {
        // Salvar plano estratégico
        const { data: plano, error: planoError } = await createStrategicPlan({
          cliente_id: clienteSelecionado,
          titulo,
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          missao,
          visao,
          valores,
          analise_swot: swot,
          origem_ia: true,
          dados_onboarding: null
        });

        if (planoError) throw planoError;

        // Se checkbox marcada, gerar planejamento mensal + posts
        if (gerarPostsAuto && assinatura) {
          const { data: planejamento, error: planejamentoError } = await supabase
            .from('planejamentos')
            .insert({
              cliente_id: clienteSelecionado,
              titulo: `Planejamento ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
              mes_referencia: periodoInicio,
              descricao: JSON.stringify({
                descricao_original: descricao,
                especialistas,
                plano_estrategico_id: plano.id
              }),
              status: 'rascunho',
              responsavel_grs_id: especialistas.grs_id
            })
            .select()
            .single();

          if (planejamentoError) throw planejamentoError;

          // Gerar posts automaticamente
          await gerarPostsAutomaticos(
            planejamento.id,
            assinatura.posts_mensais,
            { missao, visao, valores },
            clienteSelecionado
          );

          toast.success('🎯 Plano estratégico criado com sucesso!', {
            description: `${assinatura.posts_mensais} posts gerados automaticamente.`
          });
        } else {
          toast.success('🎯 Plano estratégico criado com sucesso!');
        }
      } else if (tipoPlano === 'mensal') {
        // Salvar direto em planejamentos (fluxo atual)
        const { data: planejamento, error } = await supabase
          .from('planejamentos')
          .insert({
            cliente_id: clienteSelecionado,
            titulo,
            mes_referencia: periodoInicio,
            descricao: JSON.stringify({
              descricao_original: descricao,
              especialistas
            }),
            status: 'rascunho',
            responsavel_grs_id: especialistas.grs_id
          })
          .select()
          .single();

        if (error) throw error;

        // Criar registro base em conteudo_editorial
        const { error: conteudoError } = await supabase
          .from('conteudo_editorial')
          .insert({
            planejamento_id: planejamento.id,
            missao: '',
            posicionamento: '',
            persona: null,
            frameworks_selecionados: [],
            especialistas_selecionados: []
          });

        if (conteudoError) {
          console.error('Erro ao criar conteúdo editorial base:', conteudoError);
        }

        if (assinatura && gerarPostsAuto) {
          await gerarPostsAutomaticos(
            planejamento.id,
            assinatura.posts_mensais,
            undefined,
            clienteSelecionado
          );
          
          toast.success('📅 Planejamento mensal criado!', {
            description: `${assinatura.posts_mensais} posts gerados.`
          });
        } else {
          toast.success('📅 Planejamento mensal criado!');
        }

        // Chamar callback onCreated para navegação automática
        onCreated?.(planejamento.id, clienteSelecionado);
      } else if (tipoPlano === 'campanha') {
        // Salvar como projeto tipo campanha
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('projetos')
          .insert({
            cliente_id: clienteSelecionado,
            titulo,
            descricao,
            data_inicio: periodoInicio,
            data_fim: periodoFim,
            status: 'ativo',
            tipo_projeto: 'campanha',
            responsavel_id: user?.id || ''
          });

        if (error) throw error;
        
        toast.success('📢 Campanha criada com sucesso!');
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error('Erro ao salvar', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar assinatura do cliente quando seleciona
  const buscarAssinatura = async (clienteId: string) => {
    const { data } = await supabase
      .from('clientes')
      .select('assinatura_id, assinaturas:assinatura_id(posts_mensais, nome)')
      .eq('id', clienteId)
      .single();
    
    if (data?.assinaturas) {
      setAssinatura(data.assinaturas);
    }
  };

  const renderEtapaTipo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Que tipo de planejamento deseja criar?</h3>
        <p className="text-sm text-muted-foreground">
          Escolha uma das opções abaixo para começar
        </p>
      </div>

      <div className="grid gap-4">
        <div
          onClick={() => {
            setTipoPlano('estrategico');
            setEtapaAtual('dados');
            setTitulo(`Plano Estratégico ${new Date().getFullYear()}`);
          }}
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
            tipoPlano === 'estrategico' ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">🎯 Plano Estratégico</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Planejamento de longo prazo (6-12 meses) com missão, visão, valores e SWOT
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Geração com IA</Badge>
                <Badge variant="secondary">Missão/Visão</Badge>
                <Badge variant="secondary">Análise SWOT</Badge>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            setTipoPlano('mensal');
            setEtapaAtual('dados');
            setTitulo(`Planejamento ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`);
          }}
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
            tipoPlano === 'mensal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">📅 Planejamento Mensal</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Plano editorial de conteúdo para o mês (posts, stories, reels)
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Posts automáticos</Badge>
                <Badge variant="secondary">Cronograma</Badge>
                <Badge variant="secondary">Editorial</Badge>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            setTipoPlano('campanha');
            setEtapaAtual('dados');
            setTitulo('Nova Campanha');
          }}
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
            tipoPlano === 'campanha' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-border'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">📢 Campanha Especial</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Campanha pontual para evento, lançamento ou ação promocional
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Temporária</Badge>
                <Badge variant="secondary">Customizável</Badge>
                <Badge variant="secondary">Objetivo único</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEtapaDados = () => (
    <div className="space-y-6">
      <div>
        <Label>Cliente</Label>
        <Input
          value={clienteSelecionado}
          onChange={(e) => {
            setClienteSelecionado(e.target.value);
            buscarAssinatura(e.target.value);
          }}
          placeholder="ID do cliente"
          disabled={!!clienteId}
        />
      </div>

      <div>
        <Label>Título</Label>
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Plano Estratégico 2025"
        />
      </div>

      {tipoPlano !== 'mensal' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Início</Label>
            <Input
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
            />
          </div>
          <div>
            <Label>Término</Label>
            <Input
              type="date"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
            />
          </div>
        </div>
      )}

      {tipoPlano === 'mensal' && (
        <div>
          <Label>Mês de Referência</Label>
          <Input
            type="month"
            value={periodoInicio.slice(0, 7)}
            onChange={(e) => setPeriodoInicio(`${e.target.value}-01`)}
          />
        </div>
      )}

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva brevemente o objetivo deste planejamento"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setEtapaAtual(tipoInicial ? 'tipo' : 'tipo')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={() => {
            if (tipoPlano === 'estrategico') {
              setEtapaAtual('ia');
            } else {
              setEtapaAtual('posts');
            }
          }}
          disabled={!titulo || !clienteSelecionado}
          className="flex-1"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderEtapaIA = () => (
    <div className="space-y-6">
      {!dadosIA ? (
        <>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Geração Inteligente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nossa IA analisará dados de onboarding, Hub de Inteligência e concorrentes para criar:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Missão empresarial clara e inspiradora</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Visão de longo prazo (3-5 anos)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>5 valores fundamentais alinhados ao negócio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Análise SWOT com contexto de mercado</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Modelo de IA</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedModel === 'gemini' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('gemini')}
                className="h-auto flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold">Lovable AI</span>
                </div>
                <span className="text-xs opacity-70 text-left">Gemini 2.5 - Rápido</span>
              </Button>
              <Button
                type="button"
                variant={selectedModel === 'gpt4' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('gpt4')}
                className="h-auto flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">GPT-4.1</span>
                </div>
                <span className="text-xs opacity-70 text-left">Mais criativo</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedModel === 'gemini' 
                ? '⚡ Recomendado para planos padrão'
                : '🎯 Recomendado para planos complexos'}
            </p>
          </div>

          <Button
            onClick={handleGerarComIA}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Gerando com {selectedModel === 'gemini' ? 'Gemini' : 'GPT-4.1'}...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Gerar com {selectedModel === 'gemini' ? 'Lovable AI' : 'OpenAI'}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setEtapaAtual('dados')}
            disabled={loading}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <Label>Missão</Label>
              <Textarea
                value={missao}
                onChange={(e) => setMissao(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Visão</Label>
              <Textarea
                value={visao}
                onChange={(e) => setVisao(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Valores</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {valores.map((valor, idx) => (
                  <Badge key={idx} variant="secondary">{valor}</Badge>
                ))}
              </div>
            </div>

            {swot && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-600">Forças</Label>
                  <ul className="text-sm list-disc list-inside">
                    {swot.forcas?.slice(0, 3).map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-red-600">Fraquezas</Label>
                  <ul className="text-sm list-disc list-inside">
                    {swot.fraquezas?.slice(0, 3).map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDadosIA(null)}
            >
              Gerar novamente
            </Button>
            <Button
              onClick={() => setEtapaAtual('posts')}
              className="flex-1"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderEtapaPosts = () => (
    <div className="space-y-6">
      {tipoPlano === 'estrategico' && (
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Checkbox
            id="gerar-posts"
            checked={gerarPostsAuto}
            onCheckedChange={(checked) => setGerarPostsAuto(checked as boolean)}
          />
          <div className="flex-1">
            <label
              htmlFor="gerar-posts"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Gerar posts automaticamente baseado na assinatura
            </label>
            {assinatura && (
              <p className="text-sm text-muted-foreground mt-1">
                Serão gerados {assinatura.posts_mensais} posts/mês conforme plano {assinatura.nome}
              </p>
            )}
          </div>
        </div>
      )}

      {tipoPlano === 'mensal' && assinatura && (
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <p className="text-sm font-medium mb-2">
            📅 Plano de {assinatura.posts_mensais} posts
          </p>
          <p className="text-sm text-muted-foreground">
            Posts serão distribuídos ao longo do mês (seg/qua/sex)
          </p>
        </div>
      )}

      {tipoPlano === 'campanha' && (
        <div>
          <Label>Quantidade de posts da campanha</Label>
          <Input
            type="number"
            value={quantidadePostsCampanha}
            onChange={(e) => setQuantidadePostsCampanha(Number(e.target.value))}
            min={1}
            max={30}
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setEtapaAtual(tipoPlano === 'estrategico' ? 'ia' : 'dados')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={() => setEtapaAtual('especialistas')}
          className="flex-1"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderEtapaEspecialistas = () => (
    <div className="space-y-6">
      <EspecialistasSelector
        value={especialistas}
        onChange={setEspecialistas}
      />

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setEtapaAtual('posts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={handleSalvar}
          disabled={loading || !especialistas.grs_id}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Criar Planejamento
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {tipoPlano === 'estrategico' && <Target className="h-6 w-6 text-primary" />}
            {tipoPlano === 'mensal' && <Calendar className="h-6 w-6 text-blue-500" />}
            {tipoPlano === 'campanha' && <Megaphone className="h-6 w-6 text-purple-500" />}
            
            {tipoPlano === 'estrategico' && 'Criar Plano Estratégico'}
            {tipoPlano === 'mensal' && 'Criar Planejamento Mensal'}
            {tipoPlano === 'campanha' && 'Criar Campanha'}
          </DialogTitle>
          <DialogDescription>
            {etapaAtual === 'tipo' && 'Escolha o tipo de planejamento que deseja criar'}
            {etapaAtual === 'dados' && 'Preencha as informações básicas'}
            {etapaAtual === 'ia' && 'Gere o plano estratégico com inteligência artificial'}
            {etapaAtual === 'posts' && 'Configure a geração de posts'}
            {etapaAtual === 'especialistas' && 'Selecione os especialistas responsáveis'}
          </DialogDescription>
        </DialogHeader>

        {etapaAtual === 'tipo' && renderEtapaTipo()}
        {etapaAtual === 'dados' && renderEtapaDados()}
        {etapaAtual === 'ia' && renderEtapaIA()}
        {etapaAtual === 'posts' && renderEtapaPosts()}
        {etapaAtual === 'especialistas' && renderEtapaEspecialistas()}
      </DialogContent>
    </Dialog>
  );
}
