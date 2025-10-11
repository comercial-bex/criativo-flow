import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, FolderKanban, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecenteItem {
  id: string;
  tipo: 'cliente' | 'projeto' | 'tarefa' | 'planejamento';
  titulo: string;
  descricao?: string;
  url: string;
  acessadoEm: Date;
}

export default function Recentes() {
  const navigate = useNavigate();

  // Mock data - substituir por dados reais do banco
  const recentes: RecenteItem[] = [
    {
      id: '1',
      tipo: 'cliente',
      titulo: 'Cliente ABC',
      descricao: 'Atualizado perfil',
      url: '/clientes/1',
      acessadoEm: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
    },
    {
      id: '2',
      tipo: 'projeto',
      titulo: 'Projeto Marketing',
      descricao: 'Revisão de briefing',
      url: '/grs/projetos/2',
      acessadoEm: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
    },
    {
      id: '3',
      tipo: 'tarefa',
      titulo: 'Criar posts Instagram',
      descricao: 'Em andamento',
      url: '/grs/tarefas/3',
      acessadoEm: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
    },
  ];

  const getIcon = (tipo: RecenteItem['tipo']) => {
    switch (tipo) {
      case 'cliente':
        return <Users className="h-5 w-5" />;
      case 'projeto':
        return <FolderKanban className="h-5 w-5" />;
      case 'tarefa':
        return <FileText className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Recentes</h1>
          <p className="text-muted-foreground">
            Histórico dos itens acessados recentemente
          </p>
        </div>

        <div className="space-y-3">
          {recentes.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(item.url)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(item.tipo)}
                    <div>
                      <CardTitle className="text-base">{item.titulo}</CardTitle>
                      {item.descricao && (
                        <CardDescription className="text-sm">
                          {item.descricao}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(item.acessadoEm, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {recentes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum item acessado recentemente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
}
