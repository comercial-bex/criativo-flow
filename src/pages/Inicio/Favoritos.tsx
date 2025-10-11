import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FavoritoItem {
  id: string;
  tipo: 'cliente' | 'projeto' | 'tarefa' | 'planejamento';
  titulo: string;
  descricao?: string;
  url: string;
  acessos: number;
  ultimoAcesso: Date;
}

export default function Favoritos() {
  const navigate = useNavigate();

  // Mock data - substituir por dados reais do banco
  const favoritos: FavoritoItem[] = [
    {
      id: '1',
      tipo: 'cliente',
      titulo: 'Cliente Premium',
      descricao: 'Cliente de alto valor',
      url: '/clientes/1',
      acessos: 45,
      ultimoAcesso: new Date(),
    },
    {
      id: '2',
      tipo: 'projeto',
      titulo: 'Campanha Digital Q1',
      descricao: 'Projeto estratégico',
      url: '/grs/projetos/2',
      acessos: 32,
      ultimoAcesso: new Date(),
    },
  ];

  const getIcon = (tipo: FavoritoItem['tipo']) => {
    switch (tipo) {
      case 'cliente':
        return <Users className="h-5 w-5" />;
      case 'projeto':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <p className="text-muted-foreground">
            Acesso rápido aos seus itens mais importantes
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favoritos.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(item.url)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(item.tipo)}
                    <CardTitle className="text-lg">{item.titulo}</CardTitle>
                  </div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                {item.descricao && (
                  <CardDescription>{item.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.acessos} acessos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {favoritos.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum item favoritado ainda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
}
