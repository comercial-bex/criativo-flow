import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OcorrenciasPontoForm } from '@/components/RH/OcorrenciasPontoForm';
import { useOcorrenciasPonto } from '@/hooks/useOcorrenciasPonto';
import { usePessoas } from '@/hooks/usePessoas';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

export default function Ponto() {
  const [competencia, setCompetencia] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState('');

  const { pessoas } = usePessoas('colaborador');
  const { ocorrencias, isLoading, deletar } = useOcorrenciasPonto(pessoaSelecionada, competencia);

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      extra: { variant: 'default', label: 'Hora Extra' },
      folga: { variant: 'secondary', label: 'Folga' },
      falta: { variant: 'destructive', label: 'Falta' },
    };
    const config = variants[tipo] || { variant: 'default', label: tipo };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalHoras = ocorrencias.reduce((acc, o) => acc + (o.horas || 0), 0);
  const totalValor = ocorrencias.reduce((acc, o) => acc + (o.valor || 0), 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Ponto</h1>
            <p className="text-muted-foreground">Gerenciar ocorrências de ponto dos colaboradores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ocorrências Registradas</CardTitle>
                    <CardDescription>Histórico de horas extras, folgas e faltas</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{totalHoras.toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">R$ {totalValor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="filtro-pessoa">Colaborador</Label>
                      <select
                        id="filtro-pessoa"
                        className="w-full p-2 border rounded-md"
                        value={pessoaSelecionada}
                        onChange={(e) => setPessoaSelecionada(e.target.value)}
                      >
                        <option value="">Todos</option>
                        {pessoas.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filtro-competencia">Competência</Label>
                      <Input
                        id="filtro-competencia"
                        type="month"
                        value={competencia}
                        onChange={(e) => setCompetencia(e.target.value)}
                      />
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Observação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : ocorrencias.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Nenhuma ocorrência encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        ocorrencias.map((ocorrencia) => {
                          const pessoa = pessoas.find((p) => p.id === ocorrencia.pessoa_id);
                          return (
                            <TableRow key={ocorrencia.id}>
                              <TableCell>{new Date(ocorrencia.data).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>{pessoa?.nome || '-'}</TableCell>
                              <TableCell>{getTipoBadge(ocorrencia.tipo)}</TableCell>
                              <TableCell className="text-right">{ocorrencia.horas?.toFixed(1)}h</TableCell>
                              <TableCell className="text-right">
                                R$ {ocorrencia.valor?.toFixed(2) || '0.00'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                                {ocorrencia.observacao || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deletar(ocorrencia.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <OcorrenciasPontoForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
