import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, Users, Award, Zap, BarChart3, CheckCircle } from "lucide-react";

interface Objetivo {
  categoria: string;
  titulo: string;
  descricao: string;
  postsNecessarios: number;
  prioridade: 'alta' | 'media' | 'baixa';
  icon: any;
}

interface AssinaturaInfo {
  id: string;
  nome: string;
  posts_mensais: number;
}

interface ObjetivosAssinaturaProps {
  clienteId: string;
  assinaturaId?: string;
  objetivos?: any;
  onObjetivosUpdate?: (objetivos: any) => void;
}

const objetivosDisponiveis: Objetivo[] = [
  {
    categoria: "Reconhecimento de Marca",
    titulo: "Aumentar Visibilidade da Marca",
    descricao: "Criar conteúdo consistente para fortalecer o reconhecimento da marca no mercado",
    postsNecessarios: 8,
    prioridade: 'alta',
    icon: Award
  },
  {
    categoria: "Reconhecimento de Marca", 
    titulo: "Posicionamento de Autoridade",
    descricao: "Estabelecer a empresa como referência no segmento através de conteúdo educativo",
    postsNecessarios: 6,
    prioridade: 'alta',
    icon: Target
  },
  {
    categoria: "Crescimento de Seguidores",
    titulo: "Expansão da Base de Seguidores",
    descricao: "Atrair novos seguidores qualificados através de conteúdo envolvente",
    postsNecessarios: 10,
    prioridade: 'media',
    icon: Users
  },
  {
    categoria: "Crescimento de Seguidores",
    titulo: "Engajamento da Audiência",
    descricao: "Aumentar a interação e engajamento com a audiência existente",
    postsNecessarios: 8,
    prioridade: 'media',
    icon: Zap
  },
  {
    categoria: "Aquisição de Leads Orgânicos",
    titulo: "Captação de Leads Qualificados",
    descricao: "Gerar leads qualificados através de conteúdo estratégico e CTAs efetivos",
    postsNecessarios: 12,
    prioridade: 'alta',
    icon: BarChart3
  },
  {
    categoria: "Aquisição de Leads Orgânicos",
    titulo: "Conversão de Audiência",
    descricao: "Converter seguidores em leads através de ofertas de valor e conteúdo direcionado",
    postsNecessarios: 10,
    prioridade: 'alta',
    icon: CheckCircle
  }
];

export function ObjetivosAssinatura({ clienteId, assinaturaId, objetivos: objetivosIniciais, onObjetivosUpdate }: ObjetivosAssinaturaProps) {
  const [assinatura, setAssinatura] = useState<AssinaturaInfo | null>(null);
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assinaturaId) {
      carregarAssinatura();
    }
  }, [assinaturaId]);

  useEffect(() => {
    if (objetivosIniciais?.objetivos_selecionados) {
      setObjetivosSelecionados(objetivosIniciais.objetivos_selecionados);
    }
  }, [objetivosIniciais]);

  const carregarAssinatura = async () => {
    // Para este exemplo, usaremos dados mockados das assinaturas
    const assinaturasMock = [
      { id: '1', nome: 'Plano 90º', posts_mensais: 12 },
      { id: '2', nome: 'Plano 180º', posts_mensais: 16 },
      { id: '3', nome: 'Plano 360º', posts_mensais: 24 }
    ];

    const assinaturaEncontrada = assinaturasMock.find(a => a.id === assinaturaId);
    if (assinaturaEncontrada) {
      setAssinatura(assinaturaEncontrada);
    }
  };

  const calcularDistribuicaoPosts = () => {
    if (!assinatura || objetivosSelecionados.length === 0) return [];

    const objetivosAtivos = objetivosDisponiveis.filter(obj => 
      objetivosSelecionados.includes(obj.titulo)
    );

    const totalPostsNecessarios = objetivosAtivos.reduce((total, obj) => 
      total + obj.postsNecessarios, 0
    );

    return objetivosAtivos.map(objetivo => {
      const proporcao = objetivo.postsNecessarios / totalPostsNecessarios;
      const postsAtribuidos = Math.round(assinatura.posts_mensais * proporcao);
      
      return {
        ...objetivo,
        postsAtribuidos,
        percentual: Math.round(proporcao * 100)
      };
    });
  };

  const toggleObjetivo = (tituloObjetivo: string) => {
    setObjetivosSelecionados(prev => {
      const isSelected = prev.includes(tituloObjetivo);
      if (isSelected) {
        return prev.filter(t => t !== tituloObjetivo);
      } else {
        return [...prev, tituloObjetivo];
      }
    });
  };

  const salvarObjetivos = async () => {
    setLoading(true);
    try {
      const distribuicao = calcularDistribuicaoPosts();
      const dadosObjetivos = {
        cliente_id: clienteId,
        objetivos: {
          objetivos_selecionados: objetivosSelecionados,
          distribuicao_posts: distribuicao,
          assinatura_id: assinaturaId,
          total_posts_mensais: assinatura?.posts_mensais
        }
      };

      const { error } = await supabase
        .from('cliente_objetivos')
        .upsert(dadosObjetivos, { 
          onConflict: 'cliente_id'
        });

      if (error) throw error;

      toast({
        title: "Objetivos salvos com sucesso!",
        description: "Os objetivos foram integrados com a assinatura do cliente.",
      });

      onObjetivosUpdate?.(dadosObjetivos.objetivos);
    } catch (error) {
      console.error('Erro ao salvar objetivos:', error);
      toast({
        title: "Erro ao salvar objetivos",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const distribuicao = calcularDistribuicaoPosts();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos Integrados à Assinatura
          </CardTitle>
          {assinatura && (
            <div className="text-sm text-muted-foreground">
              {assinatura.nome} - {assinatura.posts_mensais} posts mensais
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <h4 className="font-medium text-sm">Selecione os objetivos prioritários:</h4>
            
            {/* Reconhecimento de Marca */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-primary">1. Reconhecimento de Marca</h5>
              {objetivosDisponiveis
                .filter(obj => obj.categoria === "Reconhecimento de Marca")
                .map((objetivo) => {
                  const IconComponent = objetivo.icon;
                  const isSelected = objetivosSelecionados.includes(objetivo.titulo);
                  
                  return (
                    <div
                      key={objetivo.titulo}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleObjetivo(objetivo.titulo)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h6 className="font-medium text-sm">{objetivo.titulo}</h6>
                            <Badge variant={objetivo.prioridade === 'alta' ? 'default' : 'secondary'} className="text-xs">
                              {objetivo.prioridade}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{objetivo.descricao}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Requer ~{objetivo.postsNecessarios} posts mensais
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Crescimento de Seguidores */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-primary">2. Crescimento de Seguidores</h5>
              {objetivosDisponiveis
                .filter(obj => obj.categoria === "Crescimento de Seguidores")
                .map((objetivo) => {
                  const IconComponent = objetivo.icon;
                  const isSelected = objetivosSelecionados.includes(objetivo.titulo);
                  
                  return (
                    <div
                      key={objetivo.titulo}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleObjetivo(objetivo.titulo)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h6 className="font-medium text-sm">{objetivo.titulo}</h6>
                            <Badge variant={objetivo.prioridade === 'alta' ? 'default' : 'secondary'} className="text-xs">
                              {objetivo.prioridade}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{objetivo.descricao}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Requer ~{objetivo.postsNecessarios} posts mensais
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Aquisição de Leads */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-primary">3. Aquisição de Leads Orgânicos</h5>
              {objetivosDisponiveis
                .filter(obj => obj.categoria === "Aquisição de Leads Orgânicos")
                .map((objetivo) => {
                  const IconComponent = objetivo.icon;
                  const isSelected = objetivosSelecionados.includes(objetivo.titulo);
                  
                  return (
                    <div
                      key={objetivo.titulo}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleObjetivo(objetivo.titulo)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h6 className="font-medium text-sm">{objetivo.titulo}</h6>
                            <Badge variant={objetivo.prioridade === 'alta' ? 'default' : 'secondary'} className="text-xs">
                              {objetivo.prioridade}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{objetivo.descricao}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            Requer ~{objetivo.postsNecessarios} posts mensais
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {distribuicao.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Distribuição de Posts Mensais</h4>
              <div className="space-y-3">
                {distribuicao.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{item.titulo}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.postsAtribuidos} posts ({item.percentual}%)
                          </span>
                        </div>
                        <Progress value={item.percentual} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button 
            onClick={salvarObjetivos} 
            disabled={loading || objetivosSelecionados.length === 0}
            className="w-full"
          >
            {loading ? "Salvando..." : "Salvar Objetivos"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}