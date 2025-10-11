import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { useProjetos } from '@/hooks/useProjetos';
import { useIsMobile } from '@/hooks/use-mobile';

export default function GRSProjetos() {
  const { projetos, loading } = useProjetos();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p>Carregando projetos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Projetos GRS</h1>
        </div>

        <div className="space-y-4">
          {isMobile ? (
            projetos.map((projeto) => (
              <Card key={projeto.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{projeto.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
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
                  <div key={projeto.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{projeto.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
