import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Briefcase, Plus, ChevronDown, FileText, Zap, Megaphone } from 'lucide-react';
import { useProjetos } from '@/hooks/useProjetos';
import { useIsMobile } from '@/hooks/use-mobile';
import { CriarProjetoAvulsoModal } from '@/components/CriarProjetoAvulsoModal';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function GRSProjetos() {
  const { projetos, loading } = useProjetos();
  const isMobile = useIsMobile();
  const [tipoModal, setTipoModal] = useState<'avulso' | 'campanha' | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const getProjetoBadge = (tipo: string) => {
    switch(tipo) {
      case 'avulso':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">⚡ Avulso</Badge>;
      case 'campanha':
        return <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white">📢 Campanha</Badge>;
      default:
        return <Badge variant="outline">📋 Plano Editorial</Badge>;
    }
  };

  const getProjetoBorderColor = (tipo: string) => {
    switch(tipo) {
      case 'avulso': return 'border-l-4 border-l-green-500';
      case 'campanha': return 'border-l-4 border-l-purple-500';
      default: return 'border-l-4 border-l-blue-500';
    }
  };

  const projetosFiltrados = projetos.filter(projeto => {
    if (filtroTipo === 'todos') return true;
    return projeto.tipo_projeto === filtroTipo;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Projetos GRS</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTipoModal('avulso')}>
                <Zap className="w-4 h-4 mr-2 text-green-500" />
                Projeto Avulso
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTipoModal('campanha')}>
                <Megaphone className="w-4 h-4 mr-2 text-purple-500" />
                Campanha Publicitária
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Modal de Criação */}
        {tipoModal && (
          <CriarProjetoAvulsoModal
            open={!!tipoModal}
            onOpenChange={(open) => !open && setTipoModal(null)}
            tipo={tipoModal}
          />
        )}

        {projetos.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Briefcase}
                title="Nenhum projeto encontrado"
                description="Comece criando seu primeiro projeto GRS para gerenciar as demandas dos clientes"
                action={{
                  label: "Criar Primeiro Projeto",
                  onClick: () => setTipoModal('avulso')
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={filtroTipo} onValueChange={setFiltroTipo} className="space-y-4">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="avulso">Avulsos</TabsTrigger>
              <TabsTrigger value="campanha">Campanhas</TabsTrigger>
              <TabsTrigger value="plano_editorial">Planos Editoriais</TabsTrigger>
            </TabsList>

            <TabsContent value={filtroTipo} className="space-y-4">
              {isMobile ? (
                projetosFiltrados.map((projeto) => (
                  <Card key={projeto.id} className={cn("hover:shadow-md transition-shadow", getProjetoBorderColor(projeto.tipo_projeto))}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{projeto.titulo}</h3>
                        {getProjetoBadge(projeto.tipo_projeto)}
                      </div>
                      <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                      {projeto.clientes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Cliente: {projeto.clientes.nome}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Projetos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projetosFiltrados.map((projeto) => (
                        <div key={projeto.id} className={cn("p-4 border rounded-lg hover:border-primary transition-colors", getProjetoBorderColor(projeto.tipo_projeto))}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{projeto.titulo}</h3>
                                {getProjetoBadge(projeto.tipo_projeto)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{projeto.descricao}</p>
                              {projeto.clientes && (
                                <p className="text-xs text-muted-foreground">
                                  Cliente: {projeto.clientes.nome}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {projeto.status && (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  {projeto.status}
                                </span>
                              )}
                              {projeto.prioridade && (
                                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                  {projeto.prioridade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
