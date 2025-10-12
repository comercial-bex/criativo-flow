import { useState, useEffect } from 'react';
import { usePacotes, Pacote, PacoteItem } from '@/hooks/usePacotes';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Zap, Star, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CatalogoPacotesProps {
  onSelectPacote: (pacote: Pacote, itens: PacoteItem[]) => void;
}

export function CatalogoPacotes({ onSelectPacote }: CatalogoPacotesProps) {
  const { pacotes, loading, fetchPacoteItens } = usePacotes();
  const [loadingItens, setLoadingItens] = useState<string | null>(null);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'social':
        return <Package className="h-6 w-6" />;
      case 'audiovisual':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Star className="h-6 w-6" />;
      case 'avulso':
        return <Wrench className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'social':
        return 'default';
      case 'audiovisual':
        return 'secondary';
      case 'premium':
        return 'destructive';
      case 'avulso':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleSelectPacote = async (pacote: Pacote) => {
    setLoadingItens(pacote.id);
    try {
      const itens = await fetchPacoteItens(pacote.id);
      onSelectPacote(pacote, itens);
    } finally {
      setLoadingItens(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Pacotes BEX</h2>
          <p className="text-muted-foreground">
            Selecione um pacote para criar uma nova ordem de serviço
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pacotes.map((pacote) => (
          <Card
            key={pacote.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary">
                  {getTipoIcon(pacote.tipo)}
                </div>
                <Badge variant={getTipoBadgeVariant(pacote.tipo)}>
                  {pacote.tipo.toUpperCase()}
                </Badge>
              </div>
              <CardTitle>{pacote.nome}</CardTitle>
              <CardDescription>{pacote.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(pacote.preco_base)}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPacote(pacote)}
                className="w-full"
                disabled={loadingItens === pacote.id}
              >
                {loadingItens === pacote.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Usar Pacote'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
