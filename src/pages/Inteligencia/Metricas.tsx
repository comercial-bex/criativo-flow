import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, LineChart, Activity } from 'lucide-react';

export default function Metricas() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Métricas e KPIs</h1>
          <p className="text-muted-foreground">
            Indicadores-chave de performance em tempo real
          </p>
        </div>

        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    NPS Score
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">72</div>
                  <p className="text-xs text-muted-foreground">Excelente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    SLA Cumprido
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: 90%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Retenção
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96%</div>
                  <p className="text-xs text-muted-foreground">
                    vs. 92% ano passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Eficiência Operacional
                  </CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">88%</div>
                  <p className="text-xs text-muted-foreground">
                    +3% este mês
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Principais Métricas</CardTitle>
                  <CardDescription>
                    Indicadores consolidados do período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tempo Médio de Resposta</span>
                      <span className="text-sm text-muted-foreground">2.3h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Aprovação 1ª Tentativa</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Projetos Entregues no Prazo</span>
                      <span className="text-sm text-muted-foreground">91%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ticket Médio</span>
                      <span className="text-sm text-muted-foreground">R$ 3.2k</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendências</CardTitle>
                  <CardDescription>
                    Variações vs. período anterior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Gráfico de tendências será implementado aqui
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comercial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Comerciais</CardTitle>
                <CardDescription>
                  Indicadores de vendas e pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Métricas comerciais serão implementadas aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operacional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Operacionais</CardTitle>
                <CardDescription>
                  Indicadores de produtividade e eficiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Métricas operacionais serão implementadas aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
                <CardDescription>
                  Indicadores de satisfação e qualidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Métricas de qualidade serão implementadas aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}
