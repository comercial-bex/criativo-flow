import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdiantamentos } from '@/hooks/useAdiantamentos';
import { Plus, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  colaboradorId: string;
  competencia: string;
}

export function AdiantamentosManager({ colaboradorId, competencia }: Props) {
  const { adiantamentos, criar, cancelar, isCriando } = useAdiantamentos(colaboradorId, competencia);
  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState({
    valor: '',
    data_adiantamento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'pix' as const,
    chave_pix: '',
    banco_conta: '',
    observacao: '',
  });

  const totalAdiantamentos = adiantamentos
    .filter(a => a.status !== 'cancelado')
    .reduce((sum, a) => sum + Number(a.valor), 0);

  const handleSubmit = () => {
    criar({
      colaborador_id: colaboradorId,
      competencia,
      valor: Number(formData.valor),
      data_adiantamento: formData.data_adiantamento,
      forma_pagamento: formData.forma_pagamento,
      chave_pix: formData.chave_pix || undefined,
      banco_conta: formData.banco_conta || undefined,
      observacao: formData.observacao || undefined,
    });
    setModalAberto(false);
    setFormData({
      valor: '',
      data_adiantamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'pix',
      chave_pix: '',
      banco_conta: '',
      observacao: '',
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Adiantamentos do Mês</h3>
          <p className="text-sm text-muted-foreground">
            Total: R$ {totalAdiantamentos.toFixed(2)}
          </p>
        </div>
        <Button onClick={() => setModalAberto(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Adiantamento
        </Button>
      </div>

      {adiantamentos.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adiantamentos.map((adiantamento) => (
              <TableRow key={adiantamento.id}>
                <TableCell>{format(new Date(adiantamento.data_adiantamento), 'dd/MM/yyyy')}</TableCell>
                <TableCell>R$ {Number(adiantamento.valor).toFixed(2)}</TableCell>
                <TableCell className="uppercase">{adiantamento.forma_pagamento}</TableCell>
                <TableCell>
                  <Badge variant={adiantamento.status === 'registrado' ? 'default' : 'secondary'}>
                    {adiantamento.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {adiantamento.comprovante_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={adiantamento.comprovante_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {adiantamento.status === 'registrado' && (
                    <Button variant="ghost" size="sm" onClick={() => cancelar(adiantamento.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum adiantamento registrado
        </p>
      )}

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Adiantamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label>Data do Adiantamento</Label>
              <Input
                type="date"
                value={formData.data_adiantamento}
                onChange={(e) => setFormData({ ...formData, data_adiantamento: e.target.value })}
              />
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value: any) => setFormData({ ...formData, forma_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="ted">TED</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="deposito">Depósito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.forma_pagamento === 'pix' && (
              <div>
                <Label>Chave PIX</Label>
                <Input
                  value={formData.chave_pix}
                  onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                  placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                />
              </div>
            )}

            {(['ted', 'deposito'].includes(formData.forma_pagamento)) && (
              <div>
                <Label>Banco e Conta</Label>
                <Input
                  value={formData.banco_conta}
                  onChange={(e) => setFormData({ ...formData, banco_conta: e.target.value })}
                  placeholder="Ex: Banco do Brasil - Ag 1234 / CC 56789-0"
                />
              </div>
            )}

            <div>
              <Label>Observação</Label>
              <Textarea
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isCriando || !formData.valor}>
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
