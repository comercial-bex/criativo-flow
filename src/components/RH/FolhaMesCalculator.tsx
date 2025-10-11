import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFolhaMes } from '@/hooks/useFolhaMes';
import { usePessoas } from '@/hooks/usePessoas';
import { useAdiantamentos } from '@/hooks/useAdiantamentos';
import { useOcorrenciasPonto } from '@/hooks/useOcorrenciasPonto';
import { Calculator, DollarSign, Check } from 'lucide-react';

export function FolhaMesCalculator() {
  const [competencia, setCompetencia] = useState('');
  const [pessoaSelecionada, setPessoaSelecionada] = useState<string | null>(null);
  const [previewAberto, setPreviewAberto] = useState(false);

  const { pessoas } = usePessoas('colaborador');
  const { folhas, calcularFolha, fecharFolha, marcarComoPaga, isCalculando, isFechando } = useFolhaMes(undefined, competencia);
  
  const pessoasAtivas = pessoas.filter((p) => p.status === 'ativo');

  const handleCalcularPreview = async (pessoaId: string) => {
    if (!competencia) {
      return;
    }
    
    setPessoaSelecionada(pessoaId);
    setPreviewAberto(true);
    calcularFolha({ pessoaId, competencia });
  };

  const handleFecharFolha = () => {
    if (!pessoaSelecionada || !competencia) return;
    
    fecharFolha({ pessoaId: pessoaSelecionada, competencia });
    setPreviewAberto(false);
    setPessoaSelecionada(null);
  };

  const getFolhaPessoa = (pessoaId: string) => {
    return folhas.find((f) => f.pessoa_id === pessoaId && f.competencia === competencia);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      aberta: 'outline',
      fechada: 'default',
      paga: 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Folha Mensal</CardTitle>
          <CardDescription>Calcule e feche a folha de pagamento do mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-sm">
              <Label htmlFor="competencia">Competência (Mês/Ano)</Label>
              <Input
                id="competencia"
                type="month"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
              />
            </div>

            {competencia && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{pessoasAtivas.length} colaboradores ativos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>{folhas.filter((f) => f.status === 'fechada').length} folhas fechadas</span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Salário Base</TableHead>
                      <TableHead>Extras</TableHead>
                      <TableHead>Descontos</TableHead>
                      <TableHead>Adiantamentos</TableHead>
                      <TableHead className="text-right">Total a Pagar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pessoasAtivas.map((pessoa) => {
                      const folha = getFolhaPessoa(pessoa.id);
                      const salarioBase = pessoa.salario_base || pessoa.fee_mensal || 0;

                      return (
                        <TableRow key={pessoa.id}>
                          <TableCell className="font-medium">{pessoa.nome}</TableCell>
                          <TableCell>R$ {salarioBase.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            {folha ? `R$ ${folha.total_extras.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {folha ? `R$ ${folha.total_descontos.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-orange-600">
                            {folha ? `R$ ${folha.total_adiantamentos.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {folha ? `R$ ${folha.total_a_pagar.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>{folha ? getStatusBadge(folha.status) : '-'}</TableCell>
                          <TableCell className="text-right">
                            {!folha || folha.status === 'aberta' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCalcularPreview(pessoa.id)}
                                disabled={isCalculando}
                              >
                                <Calculator className="h-3 w-3 mr-1" />
                                {folha ? 'Recalcular' : 'Calcular'}
                              </Button>
                            ) : folha.status === 'fechada' ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => marcarComoPaga(folha.id)}
                              >
                                Marcar Paga
                              </Button>
                            ) : (
                              <Badge variant="secondary">Paga</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewAberto} onOpenChange={setPreviewAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview de Cálculo de Folha</DialogTitle>
            <DialogDescription>
              Revise os cálculos antes de fechar a folha
            </DialogDescription>
          </DialogHeader>

          {pessoaSelecionada && (() => {
            const pessoa = pessoas.find((p) => p.id === pessoaSelecionada);
            const folha = getFolhaPessoa(pessoaSelecionada);
            
            if (!pessoa || !folha) return null;

            return (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{pessoa.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    Competência: {new Date(competencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span>Salário Base:</span>
                    <span className="font-medium">R$ {folha.salario_base.toFixed(2)}</span>
                  </div>
                  
                  {folha.total_extras > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>Horas Extras:</span>
                      <span className="font-medium">+ R$ {folha.total_extras.toFixed(2)}</span>
                    </div>
                  )}

                  {folha.resumo && (
                    <>
                      {folha.resumo.inss && (
                        <div className="flex justify-between py-2 text-red-600">
                          <span>INSS:</span>
                          <span className="font-medium">- R$ {folha.resumo.inss.toFixed(2)}</span>
                        </div>
                      )}
                      {folha.resumo.irrf && (
                        <div className="flex justify-between py-2 text-red-600">
                          <span>IRRF:</span>
                          <span className="font-medium">- R$ {folha.resumo.irrf.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {folha.total_adiantamentos > 0 && (
                    <div className="flex justify-between py-2 text-orange-600">
                      <span>Adiantamentos:</span>
                      <span className="font-medium">- R$ {folha.total_adiantamentos.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a Pagar:</span>
                      <span className="text-primary">R$ {folha.total_a_pagar.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFecharFolha} disabled={isFechando}>
              {isFechando ? 'Fechando...' : 'Fechar Folha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
