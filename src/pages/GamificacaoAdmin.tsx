import { useState } from 'react';
import { useGamificacao } from '@/hooks/useGamificacao';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Award, Users, TrendingUp } from 'lucide-react';

export default function GamificacaoAdmin() {
  const { adicionarPontos, refetch } = useGamificacao();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [pontuacaoForm, setPontuacaoForm] = useState({
    userId: '',
    tipoAcao: '',
    pontos: '',
    descricao: '',
    isPrivado: false
  });

  const tiposAcao = [
    { value: 'feedback_positivo', label: 'Feedback Positivo (+20)', pontos: 20, setor: 'grs' },
    { value: 'entrega_prazo', label: 'Entrega no Prazo (+15)', pontos: 15, setor: 'grs' },
    { value: 'agendamento_prazo', label: 'Agendamento no Prazo (+10)', pontos: 10, setor: 'grs' },
    { value: 'relatorio_entregue', label: 'Relatório Entregue (+15)', pontos: 15, setor: 'grs' },
    { value: 'atraso_postagem', label: 'Atraso em Postagem (-10)', pontos: -10, setor: 'grs' },
    
    { value: 'meta_batida', label: 'Meta Batida no Prazo (+20)', pontos: 20, setor: 'design' },
    { value: 'pacote_concluido', label: 'Pacote Concluído (+10)', pontos: 10, setor: 'design' },
    { value: 'entrega_antecipada', label: 'Entrega Antecipada (+5)', pontos: 5, setor: 'design' },
    { value: 'aprovado_primeira', label: 'Aprovado de Primeira (+10)', pontos: 10, setor: 'design' },
    { value: 'material_reprovado', label: 'Material Reprovado (-10)', pontos: -10, setor: 'design' },
    
    { value: 'video_entregue', label: 'Vídeo Entregue no Prazo (+20)', pontos: 20, setor: 'audiovisual' },
    { value: 'entregas_semanais', label: 'Entregas Semanais (+15)', pontos: 15, setor: 'audiovisual' },
    { value: 'video_aprovado', label: 'Vídeo Aprovado de Primeira (+10)', pontos: 10, setor: 'audiovisual' },
    { value: 'video_reprovado', label: 'Vídeo Reprovado (-15)', pontos: -15, setor: 'audiovisual' }
  ];

  const handleAdicionarPontos = async () => {
    if (!pontuacaoForm.userId || !pontuacaoForm.tipoAcao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const pontos = pontuacaoForm.pontos ? parseInt(pontuacaoForm.pontos) : 
        tiposAcao.find(t => t.value === pontuacaoForm.tipoAcao)?.pontos || 0;

      const success = await adicionarPontos(
        pontuacaoForm.tipoAcao as any,
        pontos,
        pontuacaoForm.descricao,
        pontuacaoForm.isPrivado || pontos < 0
      );

      if (success) {
        toast({
          title: "Sucesso!",
          description: "Pontuação adicionada com sucesso",
        });
        
        setPontuacaoForm({
          userId: '',
          tipoAcao: '',
          pontos: '',
          descricao: '',
          isPrivado: false
        });
        
        await refetch();
      } else {
        throw new Error('Falha ao adicionar pontos');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar pontos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
            <Settings className="w-8 h-8" />
            Administração - Gamificação
          </h1>
          <p className="text-muted-foreground">
            Gerencie pontuações, selos e prêmios do sistema
          </p>
        </div>

        <Tabs defaultValue="pontuacao" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pontuacao">Pontuação</TabsTrigger>
            <TabsTrigger value="selos">Selos</TabsTrigger>
            <TabsTrigger value="premios">Prêmios</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="pontuacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Pontuação Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userId">ID do Usuário</Label>
                    <Input
                      id="userId"
                      placeholder="UUID do usuário"
                      value={pontuacaoForm.userId}
                      onChange={(e) => setPontuacaoForm(prev => ({ ...prev, userId: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipoAcao">Tipo de Ação</Label>
                    <Select value={pontuacaoForm.tipoAcao} onValueChange={(value) => {
                      const acao = tiposAcao.find(t => t.value === value);
                      setPontuacaoForm(prev => ({ 
                        ...prev, 
                        tipoAcao: value,
                        pontos: acao?.pontos.toString() || '',
                        isPrivado: (acao?.pontos || 0) < 0
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ação" />
                      </SelectTrigger>
                      <SelectContent>
                        {['grs', 'design', 'audiovisual'].map(setor => (
                          <div key={setor}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {setor.toUpperCase()}
                            </div>
                            {tiposAcao.filter(t => t.setor === setor).map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{tipo.label}</span>
                                  <Badge variant={tipo.pontos > 0 ? 'default' : 'destructive'}>
                                    {tipo.pontos > 0 ? '+' : ''}{tipo.pontos}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pontos">Pontos (personalizado)</Label>
                    <Input
                      id="pontos"
                      type="number"
                      placeholder="Deixe vazio para usar padrão"
                      value={pontuacaoForm.pontos}
                      onChange={(e) => setPontuacaoForm(prev => ({ ...prev, pontos: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Motivo da pontuação..."
                      value={pontuacaoForm.descricao}
                      onChange={(e) => setPontuacaoForm(prev => ({ ...prev, descricao: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAdicionarPontos} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Adicionando...' : 'Adicionar Pontuação'}
                </Button>
              </CardContent>
            </Card>

            {/* Guia Rápida de Pontuação */}
            <Card>
              <CardHeader>
                <CardTitle>Guia de Pontuação por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {['grs', 'design', 'audiovisual'].map(setor => (
                    <div key={setor} className="space-y-3">
                      <h3 className="font-semibold text-lg text-center">
                        {setor === 'grs' ? '📊 GRS' : 
                         setor === 'design' ? '🎨 Design' : '🎥 Audiovisual'}
                      </h3>
                      <div className="space-y-2">
                        {tiposAcao.filter(t => t.setor === setor).map(tipo => (
                          <div key={tipo.value} className="flex justify-between items-center text-sm">
                            <span>{tipo.label.split('(')[0].trim()}</span>
                            <Badge variant={tipo.pontos > 0 ? 'default' : 'destructive'}>
                              {tipo.pontos > 0 ? '+' : ''}{tipo.pontos}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Gerenciar Selos e Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Funcionalidade de gestão de selos em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Configurar Prêmios Mensais
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Funcionalidade de gestão de prêmios em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Relatórios de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Relatórios de gamificação em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}