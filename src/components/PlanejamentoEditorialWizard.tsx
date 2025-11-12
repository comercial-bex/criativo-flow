import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Check, 
  User, 
  Target, 
  Users as UsersIcon,
  Calendar,
  Megaphone,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  planejamentoId: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: 'Missão', icon: Target, color: 'text-blue-500' },
  { id: 2, title: 'Posicionamento', icon: User, color: 'text-purple-500' },
  { id: 3, title: 'Personas', icon: UsersIcon, color: 'text-green-500' },
  { id: 4, title: 'Frameworks', icon: Target, color: 'text-orange-500' },
  { id: 5, title: '12 Conteúdos', icon: Megaphone, color: 'text-pink-500' },
  { id: 6, title: 'Datas', icon: Calendar, color: 'text-indigo-500' },
  { id: 7, title: 'Tráfego Pago', icon: Megaphone, color: 'text-red-500' },
];

const FRAMEWORKS = ['HESEC', 'HERO', 'PEACE'];

export function PlanejamentoEditorialWizard({
  open,
  onOpenChange,
  clienteId,
  planejamentoId,
  onComplete
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [dadosBEX, setDadosBEX] = useState<any>({
    missao: '',
    posicionamento: '',
    personas: [],
    frameworks: [],
    conteudos: [],
    datasComemorativas: [],
    trafegoCreativos: []
  });

  const generateWithAI = async (step: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-editorial-content', {
        body: {
          clienteId,
          step,
          previousData: dadosBEX
        }
      });

      if (error) throw error;

      // Atualizar dados conforme step
      if (step === 'missao') {
        setDadosBEX(prev => ({ ...prev, missao: data.data.missao }));
        toast.success('Missão gerada com IA!');
      } else if (step === 'posicionamento') {
        setDadosBEX(prev => ({ ...prev, posicionamento: data.data.posicionamento }));
        toast.success('Posicionamento gerado!');
      } else if (step === 'personas') {
        setDadosBEX(prev => ({ ...prev, personas: data.data.personas }));
        toast.success(`${data.data.personas.length} personas criadas!`);
      } else if (step === 'conteudos') {
        setDadosBEX(prev => ({ ...prev, conteudos: data.data.conteudos }));
        toast.success(`${data.data.conteudos.length} conteúdos gerados!`);
      } else if (step === 'datas_comemorativas') {
        setDadosBEX(prev => ({ ...prev, datasComemorativas: data.data.datas }));
        toast.success('Datas comemorativas sugeridas!');
      } else if (step === 'trafego_pago') {
        setDadosBEX(prev => ({ ...prev, trafegoCreativos: data.data.criativos }));
        toast.success('Criativos de tráfego criados!');
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao gerar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Salvar conteúdo editorial
      const { error: conteudoError } = await supabase
        .from('conteudo_editorial')
        .upsert({
          planejamento_id: planejamentoId,
          missao: dadosBEX.missao,
          posicionamento: dadosBEX.posicionamento,
          persona: JSON.stringify(dadosBEX.personas),
          frameworks_selecionados: dadosBEX.frameworks,
        });

      if (conteudoError) throw conteudoError;

      // Inserir posts gerados
      if (dadosBEX.conteudos.length > 0) {
        const posts = dadosBEX.conteudos.map((c: any, idx: number) => ({
          planejamento_id: planejamentoId,
          titulo: c.titulo,
          legenda: c.legenda,
          objetivo_postagem: c.objetivo,
          formato_postagem: c.tipo,
          tipo_criativo: c.tipo === 'video' ? 'video' : 'imagem',
          componente_hesec: c.componente,
          persona_alvo: c.persona_alvo,
          call_to_action: c.call_to_action,
          hashtags: c.hashtags,
          contexto_estrategico: c.conceito_visual,
          data_postagem: new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));

        // Validar que todos os posts têm campos obrigatórios
        const postsValidos = posts.every(p => 
          p.planejamento_id && 
          p.titulo && 
          p.objetivo_postagem && 
          p.tipo_criativo && 
          p.formato_postagem &&
          p.data_postagem
        );

        if (!postsValidos) {
          throw new Error('Dados incompletos nos posts gerados');
        }

        const { error: postsError } = await supabase
          .from('posts_planejamento')
          .insert(posts);

        if (postsError) {
          console.error('Erro ao inserir posts:', postsError);
          throw new Error(`Falha ao criar posts: ${postsError.message}`);
        }
      }

      toast.success('Planejamento BEX criado com sucesso!');
      onComplete();
      onOpenChange(false);

    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar planejamento');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentIcon = STEPS[currentStep - 1]?.icon || Target;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Planejamento Editorial BEX - Passo {currentStep} de {STEPS.length}
          </DialogTitle>
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Missão */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Definir Missão da Marca</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  A missão define o propósito e valor que a marca entrega ao mercado.
                </p>
                <Button onClick={() => generateWithAI('missao')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar com IA
                </Button>
                <Textarea
                  placeholder="A missão da marca..."
                  value={dadosBEX.missao}
                  onChange={(e) => setDadosBEX(prev => ({ ...prev, missao: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Posicionamento */}
          {currentStep === 2 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Posicionamento em Redes Sociais</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Como a marca se comunica e se diferencia nas redes sociais.
                </p>
                <Button onClick={() => generateWithAI('posicionamento')} disabled={loading || !dadosBEX.missao}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar com IA
                </Button>
                <Textarea
                  placeholder="O posicionamento da marca..."
                  value={dadosBEX.posicionamento}
                  onChange={(e) => setDadosBEX(prev => ({ ...prev, posicionamento: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Personas */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-6 w-6 text-green-500" />
                  <h3 className="text-xl font-semibold">Definir 3 Personas</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Personas representam os diferentes perfis do público-alvo.
                </p>
                <Button onClick={() => generateWithAI('personas')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar 3 Personas com IA
                </Button>
                
                {dadosBEX.personas.length > 0 && (
                  <div className="grid gap-4">
                    {dadosBEX.personas.map((p: any, idx: number) => (
                      <Card key={idx} className="bg-accent/20">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold">{p.nome}</h4>
                          <p className="text-sm text-muted-foreground">{p.idade} • {p.ocupacao}</p>
                          <p className="text-sm mt-2">{p.caracteristicas}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Frameworks */}
          {currentStep === 4 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-semibold">Selecionar Frameworks</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha os frameworks que guiarão a criação de conteúdo.
                </p>
                <div className="space-y-2">
                  {FRAMEWORKS.map(fw => (
                    <div key={fw} className="flex items-center space-x-2">
                      <Checkbox
                        checked={dadosBEX.frameworks.includes(fw)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDadosBEX(prev => ({ ...prev, frameworks: [...prev.frameworks, fw] }));
                          } else {
                            setDadosBEX(prev => ({ ...prev, frameworks: prev.frameworks.filter(f => f !== fw) }));
                          }
                        }}
                      />
                      <Label>{fw}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: 12 Conteúdos */}
          {currentStep === 5 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-pink-500" />
                  <h3 className="text-xl font-semibold">Gerar 12 Conteúdos</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  4 posts + 4 vídeos + 4 carrosséis baseados na estratégia.
                </p>
                <Button onClick={() => generateWithAI('conteudos')} disabled={loading || dadosBEX.frameworks.length === 0}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar 12 Conteúdos com IA
                </Button>
                {dadosBEX.conteudos.length > 0 && (
                  <Badge variant="secondary">{dadosBEX.conteudos.length} conteúdos gerados</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Datas Comemorativas */}
          {currentStep === 6 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-indigo-500" />
                  <h3 className="text-xl font-semibold">Datas Comemorativas Relevantes</h3>
                </div>
                <Button onClick={() => generateWithAI('datas_comemorativas')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Sugerir Datas
                </Button>
                {dadosBEX.datasComemorativas.length > 0 && (
                  <Badge variant="secondary">{dadosBEX.datasComemorativas.length} datas sugeridas</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 7: Tráfego Pago */}
          {currentStep === 7 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-semibold">Criativos para Tráfego Pago</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  2 criativos de imagem + 2 scripts de vídeo focados em conversão.
                </p>
                <Button onClick={() => generateWithAI('trafego_pago')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gerar Criativos
                </Button>
                {dadosBEX.trafegoCreativos.length > 0 && (
                  <Badge variant="secondary">{dadosBEX.trafegoCreativos.length} criativos criados</Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {currentStep === STEPS.length ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
