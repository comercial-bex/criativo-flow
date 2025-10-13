import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePessoas } from '@/hooks/usePessoas';
import { useColaboradorTempData } from '@/hooks/useColaboradorTempData';
import { Loader2 } from 'lucide-react';

interface ColaboradorQuickCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempData?: any;
  onSuccess?: () => void;
}

export function ColaboradorQuickCreate({ open, onOpenChange, tempData, onSuccess }: ColaboradorQuickCreateProps) {
  const { criar, isCriando } = usePessoas();
  const { consumeTempData } = useColaboradorTempData();

  const [formData, setFormData] = useState({
    nome: tempData?.produto_nome || '',
    cpf: '',
    email: '',
    telefones: [''],
    regime: tempData?.regime || 'clt',
    cargo_atual: tempData?.cargo_atual || '',
    salario_base: tempData?.regime === 'clt' ? tempData?.salario_ou_fee : undefined,
    fee_mensal: tempData?.regime === 'pj' ? tempData?.salario_ou_fee : undefined,
  });

  const handleSubmit = async () => {
    const novaPessoa = {
      nome: formData.nome,
      cpf: formData.cpf,
      email: formData.email || undefined,
      telefones: formData.telefones,
      papeis: ['colaborador'] as any[],
      regime: formData.regime as any,
      cargo_atual: formData.cargo_atual,
      salario_base: formData.salario_base,
      fee_mensal: formData.fee_mensal,
      status: 'ativo' as any,
      dados_bancarios: {},
    };

    criar(novaPessoa as any);

    // Se veio de temp_data, marcar como usado
    if (tempData?.id) {
      // Nota: precisaríamos do ID da pessoa criada aqui
      // Por simplicidade, vamos ignorar por enquanto
    }

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" height="auto">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Colaborador</DialogTitle>
          <DialogDescription>
            {tempData ? 'Dados pré-preenchidos do Financeiro' : 'Preencha os dados básicos'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regime">Regime</Label>
              <Select value={formData.regime} onValueChange={(value) => setFormData({ ...formData, regime: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="pj">PJ</SelectItem>
                  <SelectItem value="estagio">Estágio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo_atual}
                onChange={(e) => setFormData({ ...formData, cargo_atual: e.target.value })}
              />
            </div>
          </div>

          {formData.regime === 'clt' ? (
            <div>
              <Label htmlFor="salario">Salário Base</Label>
              <Input
                id="salario"
                type="number"
                value={formData.salario_base || ''}
                onChange={(e) => setFormData({ ...formData, salario_base: parseFloat(e.target.value) })}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="fee">Fee Mensal (PJ)</Label>
              <Input
                id="fee"
                type="number"
                value={formData.fee_mensal || ''}
                onChange={(e) => setFormData({ ...formData, fee_mensal: parseFloat(e.target.value) })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCriando || !formData.nome || !formData.cpf}>
            {isCriando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Colaborador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
