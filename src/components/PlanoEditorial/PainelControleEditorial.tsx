import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Lightbulb, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Post {
  id: string;
  formato_postagem: string;
  objetivo_postagem: string;
  status_post?: string;
}

interface PainelControleEditorialProps {
  posts: Post[];
}

export const PainelControleEditorial = ({ posts }: PainelControleEditorialProps) => {
  // Estatísticas
  const totalPosts = posts.length;
  const statusCounts = {
    a_fazer: posts.filter(p => (p.status_post || 'a_fazer') === 'a_fazer').length,
    em_producao: posts.filter(p => p.status_post === 'em_producao').length,
    pronto: posts.filter(p => p.status_post === 'pronto').length,
    publicado: posts.filter(p => p.status_post === 'publicado').length,
  };

  const formatoCounts = posts.reduce((acc, post) => {
    acc[post.formato_postagem] = (acc[post.formato_postagem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const objetivoCounts = posts.reduce((acc, post) => {
    acc[post.objetivo_postagem] = (acc[post.objetivo_postagem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Análise de equilíbrio
  const getObjetivoPercentage = (objetivo: string) => {
    return totalPosts > 0 ? Math.round((objetivoCounts[objetivo] || 0) / totalPosts * 100) : 0;
  };

  const conversaoPercent = getObjetivoPercentage('converter');
  const humanizacaoPercent = getObjetivoPercentage('humanizar');
  const educacaoPercent = getObjetivoPercentage('educar');

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Painel de Controle</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Total de Posts</h4>
              <p className="text-3xl font-bold text-primary">{totalPosts}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>A Fazer</span>
                  <Badge variant="secondary">{statusCounts.a_fazer}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Em Produção</span>
                  <Badge variant="secondary" className="bg-blue-100">{statusCounts.em_producao}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pronto</span>
                  <Badge variant="secondary" className="bg-green-100">{statusCounts.pronto}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Publicado</span>
                  <Badge variant="secondary" className="bg-purple-100">{statusCounts.publicado}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Formatos</h4>
              <div className="space-y-2">
                {Object.entries(formatoCounts).map(([formato, count]) => (
                  <div key={formato} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{formato}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Conversão</span>
                  <span className="font-semibold">{conversaoPercent}%</span>
                </div>
                <Progress value={conversaoPercent} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Humanização</span>
                  <span className="font-semibold">{humanizacaoPercent}%</span>
                </div>
                <Progress value={humanizacaoPercent} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Educação</span>
                  <span className="font-semibold">{educacaoPercent}%</span>
                </div>
                <Progress value={educacaoPercent} className="h-2" />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recomendação
              </h4>
              <p className="text-xs text-muted-foreground">
                {conversaoPercent > 50 
                  ? "Você tem muitos posts de conversão. Considere aumentar conteúdo de humanização e educação para criar mais conexão com a audiência."
                  : humanizacaoPercent < 20
                  ? "Aumente o conteúdo de humanização para criar conexão emocional com seu público."
                  : "Boa distribuição de conteúdo! Continue balanceando entre educação, humanização e conversão."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Análise de performance estará disponível após a publicação dos posts.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Conecte suas redes sociais para importar métricas de engajamento automaticamente.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
