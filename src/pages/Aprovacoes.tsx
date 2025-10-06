import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

interface Aprovacao {
  id: string;
  cliente_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  anexo_url: string | null;
  status: string;
  solicitado_por: string;
  decidido_por: string | null;
  motivo_rejeicao: string | null;
  created_at: string;
  decided_at: string | null;
  cliente_nome?: string;
  solicitante_nome?: string;
}

export default function Aprovacoes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aprovacoes, setAprovacoes] = useState<Aprovacao[]>([]);
  const [filteredAprovacoes, setFilteredAprovacoes] = useState<Aprovacao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [selectedAprovacao, setSelectedAprovacao] = useState<Aprovacao | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'aprovar' | 'reprovar'>('aprovar');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchAprovacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('aprovacoes_cliente')
        .select(`
          *,
          clientes!aprovacoes_cliente_cliente_id_fkey(nome),
          profiles!aprovacoes_cliente_solicitado_por_fkey(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((a: any) => ({
        ...a,
        cliente_nome: a.clientes?.nome,
        solicitante_nome: a.profiles?.nome
      }));

      setAprovacoes(formatted);
      setFilteredAprovacoes(formatted);
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error);
      toast({
        title: "Erro ao carregar aprovações",
        description: "Não foi possível carregar as aprovações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAprovacoes();
  }, []);

  useEffect(() => {
    let filtered = aprovacoes;

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter(a => a.tipo === tipoFilter);
    }

    setFilteredAprovacoes(filtered);
  }, [searchTerm, statusFilter, tipoFilter, aprovacoes]);

  const handleAction = async () => {
    if (!selectedAprovacao) return;
    if (actionType === 'reprovar' && !motivoRejeicao.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Informe o motivo da reprovação",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('aprovacoes_cliente')
        .update({
          status: actionType === 'aprovar' ? 'aprovado' : 'reprovado',
          decidido_por: user?.id,
          decided_at: new Date().toISOString(),
          motivo_rejeicao: actionType === 'reprovar' ? motivoRejeicao : null
        })
        .eq('id', selectedAprovacao.id);

      if (error) throw error;

      toast({
        title: actionType === 'aprovar' ? "Aprovado!" : "Reprovado",
        description: `A solicitação foi ${actionType === 'aprovar' ? 'aprovada' : 'reprovada'} com sucesso`
      });

      setActionModalOpen(false);
      setMotivoRejeicao('');
      fetchAprovacoes();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pendente: { label: 'Pendente', variant: 'secondary' },
      aprovado: { label: 'Aprovado', variant: 'default' },
      reprovado: { label: 'Reprovado', variant: 'destructive' }
    };

    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      arte: '🎨 Arte',
      roteiro: '📝 Roteiro',
      video: '🎬 Vídeo',
      captacao: '📹 Captação'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">✅ Aprovações Internas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as solicitações de aprovação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="arte">Arte</SelectItem>
                <SelectItem value="roteiro">Roteiro</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="captacao">Captação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações ({filteredAprovacoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Solicitado por</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAprovacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAprovacoes.map((aprovacao) => (
                  <TableRow key={aprovacao.id}>
                    <TableCell>{aprovacao.cliente_nome}</TableCell>
                    <TableCell className="font-medium">{aprovacao.titulo}</TableCell>
                    <TableCell>{getTipoBadge(aprovacao.tipo)}</TableCell>
                    <TableCell>{aprovacao.solicitante_nome}</TableCell>
                    <TableCell>
                      {format(new Date(aprovacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(aprovacao.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAprovacao(aprovacao);
                            setViewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {aprovacao.status === 'pendente' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedAprovacao(aprovacao);
                                setActionType('aprovar');
                                setActionModalOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedAprovacao(aprovacao);
                                setActionType('reprovar');
                                setActionModalOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedAprovacao && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{selectedAprovacao.cliente_nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-medium">{selectedAprovacao.titulo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p>{selectedAprovacao.descricao || 'Sem descrição'}</p>
              </div>
              {selectedAprovacao.anexo_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Anexo</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedAprovacao.anexo_url} target="_blank" rel="noopener noreferrer">
                      Visualizar Anexo
                    </a>
                  </Button>
                </div>
              )}
              {selectedAprovacao.motivo_rejeicao && (
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Motivo da Reprovação</p>
                  <p>{selectedAprovacao.motivo_rejeicao}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprovar' ? 'Aprovar Solicitação' : 'Reprovar Solicitação'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'reprovar' && (
              <div>
                <label className="text-sm font-medium">Motivo da Reprovação *</label>
                <Textarea
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  placeholder="Explique o motivo da reprovação..."
                  rows={4}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {actionType === 'aprovar'
                ? 'Confirma a aprovação desta solicitação?'
                : 'Confirma a reprovação desta solicitação?'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAction} disabled={processing}>
              {processing ? 'Processando...' : actionType === 'aprovar' ? 'Aprovar' : 'Reprovar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
