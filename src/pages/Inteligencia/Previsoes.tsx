import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Calendar, TrendingUp, DollarSign } from 'lucide-react';

export default function Previsoes() {
  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Previsões e Projeções</h1>
          <p className="text-muted-foreground">
            Análises preditivas baseadas em histórico e tendências
          </p>
        </div>

        <Tabs defaultValue="receita" className="space-y-4">
          <TabsList>
            <TabsTrigger value="receita">Receita</TabsTrigger>
            <TabsTrigger value="demanda">Demanda</TabsTrigger>
            <TabsTrigger value="capacidade">Capacidade</TabsTrigger>
            <TabsTrigger value="churn">Churn</TabsTrigger>
          </TabsList>

          <TabsContent value="receita" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Próximo Mês
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 132k</div>
                  <p className="text-xs text-muted-foreground">
                    +5.6% vs. atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Próximo Trimestre
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 415k</div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs. trimestre atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Confiança da Previsão
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">
                    Baseado em 12 meses
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Projeção de Receita</CardTitle>
                <CardDescription>
                  Previsão para os próximos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Gráfico de projeção de receita será implementado aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demanda" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Demanda</CardTitle>
                <CardDescription>
                  Projeção de volume de trabalho por setor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Previsão de demanda será implementada aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacidade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Capacidade</CardTitle>
                <CardDescription>
                  Projeção de carga de trabalho vs. capacidade disponível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Análise de capacidade será implementada aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="churn" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Churn</CardTitle>
                <CardDescription>
                  Probabilidade de cancelamento por cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Análise de churn será implementada aqui
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}
