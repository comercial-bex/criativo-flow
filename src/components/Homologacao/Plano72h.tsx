import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Zap, Calendar } from 'lucide-react';
import { TarefaPlano72h } from '@/hooks/useHomologacao';

interface Plano72hProps {
  tarefas: TarefaPlano72h[];
  onPreencherAuto: () => void;
}

export function Plano72h({ tarefas, onPreencherAuto }: Plano72hProps) {
  const tarefasPorDia = {
    D0: tarefas.filter(t => t.dia === 'D0'),
    D1: tarefas.filter(t => t.dia === 'D1'),
    D2: tarefas.filter(t => t.dia === 'D2')
  };

  const bloqueadores = tarefas.filter(t => t.bloqueador).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Plano de Ação 72 Horas
          </CardTitle>
          <CardDescription>
            {tarefas.length} tarefas prioritárias | {bloqueadores} bloqueadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Gerado automaticamente com base nas pendências marcadas como "Alta prioridade"
            </div>
            <Button onClick={onPreencherAuto} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Preencher Automaticamente
            </Button>
          </div>
        </CardContent>
      </Card>

      {tarefas.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma tarefa no plano ainda</p>
          <p className="text-sm mt-1">Clique em "Preencher Automaticamente" ou marque pendências no Checklist</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* D0 */}
          {tarefasPorDia.D0.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge variant="destructive">D0 - Hoje</Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  {tarefasPorDia.D0.length} tarefas urgentes
                </span>
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tarefasPorDia.D0.map((tarefa, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {tarefa.bloqueador && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{tarefa.tarefa}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tarefa.modulo}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tarefa.responsavel || 'A definir'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tarefa.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* D1 */}
          {tarefasPorDia.D1.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-yellow-500/10 text-yellow-600">D1 - Amanhã</Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  {tarefasPorDia.D1.length} tarefas
                </span>
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tarefasPorDia.D1.map((tarefa, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {tarefa.bloqueador && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{tarefa.tarefa}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tarefa.modulo}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tarefa.responsavel || 'A definir'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tarefa.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* D2 */}
          {tarefasPorDia.D2.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-blue-500/10 text-blue-600">D2 - Depois de Amanhã</Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  {tarefasPorDia.D2.length} tarefas
                </span>
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Tarefa</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tarefasPorDia.D2.map((tarefa, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {tarefa.bloqueador && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{tarefa.tarefa}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tarefa.modulo}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tarefa.responsavel || 'A definir'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tarefa.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
