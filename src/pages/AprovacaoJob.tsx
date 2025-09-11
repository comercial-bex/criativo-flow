import { useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  X,
  Calendar,
  User,
  Building,
  Clock,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AprovacaoJob = () => {
  const { toast } = useToast();

  const jobInfo = {
    projeto: 'Lx Solar: Projeto Fictício',
    periodo: 'Maio de 2025',
    progresso: '50% Completo',
    responsavel: {
      nome: 'Vitória Cardoso',
      avatar: 'VC'
    },
    prioridade: 'Moderado',
    tarefa: 'VT Cartelado',
    prazo: '20 de Maio, 2025'
  };

  const [objetivos, setObjetivos] = useState([
    {
      id: 1,
      texto: 'Orientar pais e responsáveis sobre os sinais de atraso na fala infantil e apresentar como a fonoaudiologia da Clínica pode ajudar no desenvolvimento da comunicação das crianças',
      editando: false
    }
  ]);

  const [legendas, setLegendas] = useState([
    {
      id: 1,
      texto: '🧒 Seu filho está demorando a falar ou trocar muitos sons na hora de se comunicar?',
      editando: false
    },
    {
      id: 2,
      texto: '⚠️ Isso pode ser um sinal de que ele precisa de um acompanhamento fonoaudiológico!',
      editando: false
    },
    {
      id: 3,
      texto: '📞 Agende uma avaliação e venha entender como podemos ajudar seu pequeno 💙 a se comunicar melhor todos os dias! 🗣️📢',
      editando: false
    }
  ]);

  const hashtags = [
    '#ClinicaReintegrar 🏥',
    '#FonoaudiologiaInfantil 👶',
    '#DesenvolvimentoDaFala 🗣️',
    '#TerapiaInfantil 💙',
    '#IntervencaoPrecoce 🕐'
  ];

  const handleApprovar = () => {
    toast({
      title: "Job Aprovado!",
      description: "O job foi aprovado e encaminhado para produção",
      variant: "default",
    });
  };

  const handleReprovar = () => {
    toast({
      title: "Job Reprovado",
      description: "O job foi reprovado e retornará para revisão",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6 space-y-8">
      <SectionHeader
        title="Aprovação de Job"
        description="Revise e aprove os materiais antes da publicação"
        icon={CheckCircle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header do Projeto */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{jobInfo.projeto}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Período: {jobInfo.periodo} • {jobInfo.progresso}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-yellow-100 text-yellow-800">{jobInfo.prioridade}</Badge>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {jobInfo.responsavel.avatar}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
          </Card>

          {/* Detalhes da Tarefa */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tarefa:</span>
                <span className="font-medium">{jobInfo.tarefa}</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data de Entrega:</span>
                <span className="font-medium">{jobInfo.prazo}</span>
              </div>
            </Card>
          </div>

          {/* Objetivo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>📝</span>
                <span>Objetivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {objetivos.map((objetivo) => (
                <div key={objetivo.id} className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{objetivo.texto}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>💬</span>
                <span>Legenda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {legendas.map((legenda) => (
                <div key={legenda.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{legenda.texto}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>📱</span>
                <span>Conteúdo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                Com o LX SOLAR , você investe uma vez e colhe os benefícios todos os dias! 
                Vem conhecer como economizar de verdade. ☀️⚡
              </p>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Hashtags:</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 border-2 border-dashed border-primary/20 rounded-lg text-center">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Conteúdo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Aprovação */}
          <div className="flex space-x-4">
            <Button 
              variant="destructive" 
              size="lg" 
              className="flex-1"
              onClick={handleReprovar}
            >
              <X className="h-5 w-5 mr-2" />
              Reprovado
            </Button>
            <Button 
              size="lg" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprovar}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Aprovado
            </Button>
          </div>
        </div>

        {/* Sidebar - Prévia do Criativo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prévia do Criativo</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mockup do criativo baseado no Figma */}
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20"></div>
                <div className="relative z-10">
                  <div className="text-xs font-medium mb-2">COMPLASTA</div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-white/20 rounded"></div>
                    <div className="w-3/4 h-2 bg-white/20 rounded"></div>
                    <div className="w-1/2 h-2 bg-white/20 rounded"></div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground text-center">
                ♡ 9813 | 🔄 ⚲ | ⊆ (/complasta
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AprovacaoJob;