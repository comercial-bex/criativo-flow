import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kanban } from 'lucide-react';

export default function OperacoesKanban() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Kanban className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Kanban Operacional</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Kanban Unificado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Visão centralizada de todas as tarefas operacionais do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
