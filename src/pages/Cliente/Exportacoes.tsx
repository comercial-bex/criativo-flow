import { useState, useEffect } from 'react';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, File, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Export {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'pptx' | 'excel';
  arquivo_url: string;
  created_at: string;
}

const tipoLabels = {
  pdf: 'PDF',
  pptx: 'PowerPoint',
  excel: 'Excel'
};

const tipoIcons = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  pptx: <File className="h-5 w-5 text-orange-500" />,
  excel: <File className="h-5 w-5 text-green-500" />
};

export default function ClienteExportacoes() {
  const { clientProfile, loading: clienteLoading } = useClientDashboard();
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExports = async () => {
      if (!clientProfile?.cliente_id) return;

      try {
        const { data, error } = await supabase
          .from('exportacoes')
          .select('*')
          .eq('cliente_id', clientProfile.cliente_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExports((data || []) as Export[]);
      } catch (error) {
        console.error('Erro ao carregar exportações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExports();
  }, [clientProfile]);

  if (clienteLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Exportações</h1>
        <p className="text-muted-foreground">
          Acesse e faça download dos seus relatórios e planos exportados
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Exportações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documentos PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {exports.filter(e => e.tipo === 'pdf').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Apresentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {exports.filter(e => e.tipo === 'pptx').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Exportações */}
      {exports.length > 0 ? (
        <div className="grid gap-4">
          {exports.map((exportItem) => (
            <Card key={exportItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {tipoIcons[exportItem.tipo]}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exportItem.titulo}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        Gerado em {format(new Date(exportItem.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {tipoLabels[exportItem.tipo]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <a
                    href={exportItem.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Fazer Download
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Exportação</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Você ainda não possui documentos exportados. Quando a equipe gerar relatórios ou planos para você, eles aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
