import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase, Plus } from 'lucide-react';
import { useProjetos } from '@/hooks/useProjetos';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export default function GRSProjetos() {
  const { projetos, loading } = useProjetos();
  const isMobile = useIsMobile();
  const [showCreateModal, setShowCreateModal] = useState(false);

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
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {projetos.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Briefcase}
                title="Nenhum projeto encontrado"
                description="Comece criando seu primeiro projeto GRS para gerenciar as demandas dos clientes"
                action={{
                  label: "Criar Primeiro Projeto",
                  onClick: () => setShowCreateModal(true)
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isMobile ? (
              projetos.map((projeto) => (
                <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{projeto.titulo}</h3>
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
                    {projetos.map((projeto) => (
                      <div key={projeto.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{projeto.titulo}</h3>
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
          </div>
        )}
      </div>
    </Layout>
  );
}
