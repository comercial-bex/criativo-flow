import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, TestTube, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { useHomologacao } from '@/hooks/useHomologacao';
import { HeaderStatus } from '@/components/Homologacao/HeaderStatus';
import { ChecklistModulo } from '@/components/Homologacao/ChecklistModulo';
import { DependenciasFK } from '@/components/Homologacao/DependenciasFK';
import { TestesE2E } from '@/components/Homologacao/TestesE2E';
import { Plano72h } from '@/components/Homologacao/Plano72h';

export default function HomologacaoMVP() {
  const {
    loading,
    resultados,
    varrerSistema,
    executarE2E,
    gerarPlano72h,
    atualizarStatus,
    anexarEvidencia,
    exportar,
    calcularMVPReady
  } = useHomologacao();

  useEffect(() => {
    // Carregar dados iniciais
    varrerSistema();
  }, []);

  const itensPorModulo = resultados.checklist.reduce((acc, item) => {
    if (!acc[item.modulo]) acc[item.modulo] = { passou: 0, falhou: 0, total: 0 };
    acc[item.modulo].total++;
    if (item.status === 'passou') acc[item.modulo].passou++;
    if (item.status === 'falhou') acc[item.modulo].falhou++;
    return acc;
  }, {} as Record<string, { passou: number; falhou: number; total: number }>);

  const bloqueadores = resultados.checklist.filter(
    c => c.status === 'falhou' && c.impacto === 'alto'
  ).length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <HeaderStatus
        mvpReady={calcularMVPReady()}
        stats={resultados.unificacao}
        onVarrer={varrerSistema}
        onExecutarE2E={() => executarE2E(resultados.testes.map(t => t.id))}
        onGerarPlano={gerarPlano72h}
        onExportar={exportar}
        loading={loading}
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unificação Funcionario</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {resultados.unificacao.fks_corretas}
                  </span>
                  <span className="text-muted-foreground">/ {resultados.unificacao.fks_pendentes}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {resultados.unificacao.tabela_existe ? '✅ Tabela criada' : '❌ Tabela pendente'}
                </p>
              </div>
              <Users className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pendências Bloqueadoras</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${bloqueadores > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {bloqueadores}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Impacto ALTO + Status FALHOU
                </p>
              </div>
              <AlertTriangle className={`w-10 h-10 opacity-50 ${bloqueadores > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Módulos Validados</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {resultados.checklist.filter(c => c.status === 'passou').length}
                  </span>
                  <span className="text-muted-foreground">/ {resultados.checklist.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(itensPorModulo).length} módulos no total
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Checklist por Módulo
          </TabsTrigger>
          <TabsTrigger value="dependencias" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Dependências & FKs
          </TabsTrigger>
          <TabsTrigger value="testes" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testes E2E
          </TabsTrigger>
          <TabsTrigger value="plano" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Plano 72h
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <ChecklistModulo
            itens={resultados.checklist}
            onToggleStatus={atualizarStatus}
            onAnexarEvidencia={anexarEvidencia}
          />
        </TabsContent>

        <TabsContent value="dependencias">
          <DependenciasFK
            dependencias={resultados.dependencias}
            onGerarScript={() => {}}
          />
        </TabsContent>

        <TabsContent value="testes">
          <TestesE2E
            cenarios={resultados.testes}
            onExecutar={executarE2E}
          />
        </TabsContent>

        <TabsContent value="plano">
          <Plano72h
            tarefas={resultados.plano72h}
            onPreencherAuto={gerarPlano72h}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
