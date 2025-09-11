import { useState } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { 
  CheckCircle, 
  X,
  Calendar,
  User,
  Building,
  Clock,
  Plus,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal
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
              <CardTitle className="text-lg">Prévias do Criativo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualize como o conteúdo aparecerá nas redes sociais
              </p>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full">
                <CarouselContent>
                  {/* Instagram Preview */}
                  <CarouselItem>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">Instagram</h3>
                        <Badge variant="outline" className="text-xs">1080x1350</Badge>
                      </div>
                      
                      {/* Instagram Mockup */}
                      <div className="bg-black rounded-lg p-1 shadow-lg">
                        <div className="bg-white rounded-lg overflow-hidden">
                          {/* Instagram Header */}
                          <div className="flex items-center justify-between p-3 border-b">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-0.5">
                                <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                                  <span className="text-xs font-bold">LX</span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold">lxsolar</span>
                            </div>
                            <MoreHorizontal className="h-4 w-4" />
                          </div>
                          
                          {/* Instagram Image */}
                          <div className="aspect-[4/5] bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                              <div className="text-center space-y-4 p-6">
                                <h2 className="text-2xl font-bold">LX SOLAR</h2>
                                <p className="text-lg">Invista uma vez</p>
                                <p className="text-lg">Economize sempre</p>
                                <div className="w-16 h-16 mx-auto bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-2xl">☀️</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Instagram Actions */}
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Heart className="h-6 w-6" />
                                <MessageCircle className="h-6 w-6" />
                                <Share className="h-6 w-6" />
                              </div>
                              <Bookmark className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold">1.234 curtidas</p>
                            <div className="text-sm">
                              <span className="font-semibold">lxsolar</span>
                              <span className="ml-1">
                                🧒 Seu filho está demorando a falar ou trocar muitos sons na hora de se comunicar?
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  
                  {/* Facebook Preview */}
                  <CarouselItem>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">Facebook</h3>
                        <Badge variant="outline" className="text-xs">1080x1350</Badge>
                      </div>
                      
                      {/* Facebook Mockup */}
                      <div className="bg-gray-100 rounded-lg p-1 shadow-lg">
                        <div className="bg-white rounded-lg overflow-hidden">
                          {/* Facebook Header */}
                          <div className="flex items-center space-x-3 p-3 border-b">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">LX</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">LX Solar</p>
                              <p className="text-xs text-gray-500">2h • 🌐</p>
                            </div>
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </div>
                          
                          {/* Facebook Text */}
                          <div className="p-3">
                            <p className="text-sm leading-relaxed">
                              Com o LX SOLAR, você investe uma vez e colhe os benefícios todos os dias! 
                              Vem conhecer como economizar de verdade. ☀️⚡
                            </p>
                          </div>
                          
                          {/* Facebook Image */}
                          <div className="aspect-[4/5] bg-gradient-to-br from-blue-400 to-blue-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                              <div className="text-center space-y-4 p-6">
                                <h2 className="text-2xl font-bold">LX SOLAR</h2>
                                <p className="text-lg">Energia Solar</p>
                                <p className="text-lg">para sua casa</p>
                                <div className="w-16 h-16 mx-auto bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-2xl">⚡</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Facebook Actions */}
                          <div className="p-3">
                            <div className="flex items-center justify-between text-gray-500 text-sm border-t pt-3">
                              <div className="flex items-center space-x-1">
                                <span>👍</span>
                                <span>❤️</span>
                                <span className="ml-1">126</span>
                              </div>
                              <span>15 comentários • 8 compartilhamentos</span>
                            </div>
                            
                            <div className="flex items-center justify-around text-gray-600 text-sm pt-3 border-t mt-3">
                              <button className="flex items-center space-x-2 py-2">
                                <span>👍</span>
                                <span>Curtir</span>
                              </button>
                              <button className="flex items-center space-x-2 py-2">
                                <span>💬</span>
                                <span>Comentar</span>
                              </button>
                              <button className="flex items-center space-x-2 py-2">
                                <span>↗️</span>
                                <span>Compartilhar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Use as setas para navegar entre as prévias das redes sociais
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AprovacaoJob;