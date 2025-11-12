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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';
import { z } from 'zod';

// Schemas de validação para cada step
const missaoSchema = z.object({
  missao: z.string()
    .trim()
    .min(20, 'A missão deve ter pelo menos 20 caracteres')
    .max(1000, 'A missão deve ter no máximo 1000 caracteres')
});

const posicionamentoSchema = z.object({
  posicionamento: z.string()
    .trim()
    .min(20, 'O posicionamento deve ter pelo menos 20 caracteres')
    .max(1000, 'O posicionamento deve ter no máximo 1000 caracteres')
});

const personasSchema = z.object({
  personas: z.array(z.object({
    nome: z.string().min(1),
    idade: z.string().min(1),
    ocupacao: z.string().min(1),
    caracteristicas: z.string().min(1)
  })).min(1, 'É necessário ter pelo menos 1 persona definida')
    .max(5, 'Máximo de 5 personas permitidas')
});

const frameworksSchema = z.object({
  frameworks: z.array(z.string())
    .min(1, 'Selecione pelo menos 1 framework')
});

const conteudosSchema = z.object({
  conteudos: z.array(z.object({
    titulo: z.string().min(1),
    legenda: z.string().min(1),
    objetivo: z.string().min(1),
    tipo: z.string().min(1)
  })).min(1, 'É necessário ter pelo menos 1 conteúdo gerado')
});

// Mapeia formato de post para tipo criativo aceito pelo banco
const mapFormatoToTipoCriativo = (formato: string): 'post' | 'carrossel' | 'stories' => {
  const mapping: Record<string, 'post' | 'carrossel' | 'stories'> = {
    'post': 'post',
    'card': 'post',
    'imagem': 'post',
    'video': 'post',
    'reels': 'post',
    'motion': 'post',
    'carrossel': 'carrossel',
    'carousel': 'carrossel',
    'stories': 'stories',
    'story': 'stories',
  };
  
  return mapping[formato.toLowerCase()] || 'post';
};

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
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

  const validateCurrentStep = (): boolean => {
    setValidationErrors([]);
    const errors: string[] = [];

    try {
      switch (currentStep) {
        case 1:
          missaoSchema.parse({ missao: dadosBEX.missao });
          break;
        case 2:
          posicionamentoSchema.parse({ posicionamento: dadosBEX.posicionamento });
          break;
        case 3:
          personasSchema.parse({ personas: dadosBEX.personas });
          break;
        case 4:
          frameworksSchema.parse({ frameworks: dadosBEX.frameworks });
          break;
        case 5:
          conteudosSchema.parse({ conteudos: dadosBEX.conteudos });
          break;
        // Steps 6 e 7 são opcionais
        case 6:
        case 7:
          return true;
        default:
          return true;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message);
        setValidationErrors(messages);
        toast.error('Erro de validação', { description: messages.join(', ') });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < STEPS.length) {
      setValidationErrors([]);
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    // Validação final antes de salvar
    const validationResults = {
      missao: missaoSchema.safeParse({ missao: dadosBEX.missao }),
      posicionamento: posicionamentoSchema.safeParse({ posicionamento: dadosBEX.posicionamento }),
      personas: personasSchema.safeParse({ personas: dadosBEX.personas }),
      frameworks: frameworksSchema.safeParse({ frameworks: dadosBEX.frameworks }),
      conteudos: conteudosSchema.safeParse({ conteudos: dadosBEX.conteudos }),
    };

    const allErrors: string[] = [];
    Object.entries(validationResults).forEach(([field, result]) => {
      if (!result.success) {
        const fieldErrors = result.error.errors.map(err => `${field}: ${err.message}`);
        allErrors.push(...fieldErrors);
      }
    });

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      toast.error('Dados incompletos ou inválidos', { description: allErrors.join('; ') });
      return;
    }

    setLoading(true);
    setValidationErrors([]);
    
    try {
      // Salvar conteúdo editorial
      const { error: conteudoError } = await supabase
        .from('conteudo_editorial')
        .upsert({
          planejamento_id: planejamentoId,
          missao: dadosBEX.missao.trim(),
          posicionamento: dadosBEX.posicionamento.trim(),
          persona: JSON.stringify(dadosBEX.personas),
          frameworks_selecionados: dadosBEX.frameworks,
        });

      if (conteudoError) {
        console.error('Erro ao salvar conteúdo editorial:', conteudoError);
        throw new Error(`Falha ao salvar conteúdo: ${conteudoError.message}`);
      }

      // Inserir posts gerados
      if (dadosBEX.conteudos.length > 0) {
        const posts = dadosBEX.conteudos.map((c: any, idx: number) => {
          const post = {
            planejamento_id: planejamentoId,
            titulo: c.titulo?.trim() || '',
            legenda: c.legenda?.trim() || '',
            objetivo_postagem: c.objetivo?.trim() || '',
            formato_postagem: c.tipo?.trim() || '',
            tipo_criativo: mapFormatoToTipoCriativo(c.tipo || 'post'),
            componente_hesec: c.componente?.trim() || null,
            persona_alvo: c.persona_alvo?.trim() || null,
            call_to_action: c.call_to_action?.trim() || null,
            hashtags: c.hashtags?.trim() || null,
            contexto_estrategico: c.conceito_visual?.trim() || null,
            data_postagem: new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };

          // Validar campos obrigatórios
          if (!post.titulo || post.titulo.length < 3) {
            throw new Error(`Post ${idx + 1}: Título inválido ou muito curto`);
          }
          if (!post.objetivo_postagem || post.objetivo_postagem.length < 3) {
            throw new Error(`Post ${idx + 1}: Objetivo inválido`);
          }
          if (!post.formato_postagem) {
            throw new Error(`Post ${idx + 1}: Formato não definido`);
          }
          if (!post.tipo_criativo) {
            throw new Error(`Post ${idx + 1}: Tipo criativo inválido`);
          }

          return post;
        });

        const { error: postsError } = await supabase
          .from('posts_planejamento')
          .insert(posts);

        if (postsError) {
          console.error('Erro ao inserir posts:', postsError);
          throw new Error(`Falha ao criar posts: ${postsError.message}`);
        }
        
        toast.success(`${posts.length} posts criados com sucesso!`);
      }

      toast.success('Planejamento BEX criado com sucesso!');
      onComplete();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Erro detalhado:', error);
      const errorMessage = error.message || 'Erro desconhecido ao salvar planejamento';
      toast.error('Erro ao salvar', errorMessage);
      setValidationErrors([errorMessage]);
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

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
                  placeholder="A missão da marca... (mínimo 20 caracteres)"
                  value={dadosBEX.missao}
                  onChange={(e) => {
                    setDadosBEX(prev => ({ ...prev, missao: e.target.value }));
                    setValidationErrors([]);
                  }}
                  rows={4}
                  maxLength={1000}
                  className={validationErrors.length > 0 ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  {dadosBEX.missao.length}/1000 caracteres
                </p>
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
                  placeholder="O posicionamento da marca... (mínimo 20 caracteres)"
                  value={dadosBEX.posicionamento}
                  onChange={(e) => {
                    setDadosBEX(prev => ({ ...prev, posicionamento: e.target.value }));
                    setValidationErrors([]);
                  }}
                  rows={4}
                  maxLength={1000}
                  className={validationErrors.length > 0 ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  {dadosBEX.posicionamento.length}/1000 caracteres
                </p>
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
