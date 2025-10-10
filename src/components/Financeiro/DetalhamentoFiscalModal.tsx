import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FolhaItem } from '@/hooks/useFolhaPagamento';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, FileText, Calculator } from 'lucide-react';

interface DetalhamentoFiscalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FolhaItem | null;
}

export function DetalhamentoFiscalModal({
  open,
  onOpenChange,
  item,
}: DetalhamentoFiscalModalProps) {
  if (!item) return null;

  const proventos = Array.isArray(item.proventos) ? item.proventos : [];
  const descontos = Array.isArray(item.descontos) ? item.descontos : [];
  const encargos = Array.isArray(item.encargos) ? item.encargos : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Detalhamento Fiscal Completo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com info do colaborador */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Colaborador</p>
                  <p className="font-semibold">{item.colaborador?.nome_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium">{item.colaborador?.cpf_cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">{item.colaborador?.cargo_atual || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Regime</p>
                  <Badge variant="outline" className="font-mono">
                    {item.colaborador?.regime?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Proventos */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Proventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {proventos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum provento registrado</p>
                ) : (
                  proventos.map((prov: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{prov.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Rubrica: {prov.rubrica_id}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(prov.valor)}
                      </p>
                    </div>
                  ))
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>Total Proventos</span>
                  <span className="text-green-600">
                    {formatCurrency(item.total_proventos)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Descontos */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Descontos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {descontos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum desconto aplicado</p>
                ) : (
                  descontos.map((desc: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{desc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Rubrica: {desc.rubrica_id}
                          </p>
                        </div>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(desc.valor)}
                        </p>
                      </div>
                      
                      {/* Detalhamento INSS progressivo */}
                      {desc.nome === 'INSS' && desc.faixas && Array.isArray(desc.faixas) && (
                        <div className="ml-4 mt-2 p-3 bg-muted/50 rounded-md space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            📊 Cálculo Progressivo INSS:
                          </p>
                          {desc.faixas.map((faixa: any, fIdx: number) => (
                            <div key={fIdx} className="text-xs flex justify-between">
                              <span>
                                Faixa {faixa.faixa}: {formatCurrency(faixa.base)} × {faixa.aliquota}%
                              </span>
                              <span className="font-medium">
                                {formatCurrency(faixa.valor)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold">
                  <span>Total Descontos</span>
                  <span className="text-red-600">
                    - {formatCurrency(item.total_descontos)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Encargos Patronais */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-orange-600" />
                Encargos Patronais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {encargos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum encargo calculado</p>
              ) : (
                encargos.map((enc: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{enc.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Rubrica: {enc.rubrica_id}
                      </p>
                    </div>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(enc.valor)}
                    </p>
                  </div>
                ))
              )}
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total Encargos</span>
                <span className="text-orange-600">
                  {formatCurrency(item.total_encargos)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Final */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Base de Cálculo</span>
                  <span className="font-semibold">
                    {formatCurrency(item.base_calculo)}
                  </span>
                </div>
                <div className="flex justify-between text-lg text-green-600">
                  <span className="font-medium">Total Proventos</span>
                  <span className="font-semibold">
                    + {formatCurrency(item.total_proventos)}
                  </span>
                </div>
                <div className="flex justify-between text-lg text-red-600">
                  <span className="font-medium">Total Descontos</span>
                  <span className="font-semibold">
                    - {formatCurrency(item.total_descontos)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Valor Líquido</span>
                  <span className="text-primary">
                    {formatCurrency(item.liquido)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg text-orange-600">
                  <span className="font-medium">Custo Total Empresa</span>
                  <span className="font-semibold">
                    {formatCurrency(item.total_proventos + item.total_encargos)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
