import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePessoas, Pessoa } from '@/hooks/usePessoas';
import { User, Briefcase, CreditCard } from 'lucide-react';

interface ColaboradorFormProps {
  pessoa?: Pessoa;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Formulário UNIFICADO para criar/editar pessoas com papel 'colaborador'
 * - Removido modo legado (useColaboradores deprecated)
 * - Usa estrutura JSONB para telefones e dados_bancarios
 * - Suporta múltiplos papéis via array
 */
export function ColaboradorForm({ pessoa, open, onOpenChange }: ColaboradorFormProps) {
  const { criar, atualizar, isCriando, isAtualizando } = usePessoas();
  
  // Estado inicial do formulário (converter JSONB de volta para campos)
  const [formData, setFormData] = useState<Partial<Pessoa>>(() => {
    if (!pessoa) return { papeis: ['colaborador'], regime: 'clt', status: 'ativo' };
    
    const dadosBancarios = pessoa.dados_bancarios as any || {};
    const telefones = Array.isArray(pessoa.telefones) ? pessoa.telefones : [];
    
    return {
      ...pessoa,
      telefones,
      dados_bancarios: dadosBancarios,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados no formato Pessoa com campos JSONB
    const dadosBancarios = formData.dados_bancarios as any || {};
    const telefones = Array.isArray(formData.telefones) ? formData.telefones : [];
    
    const pessoaData: Partial<Pessoa> = {
      nome: formData.nome || '',
      cpf: formData.cpf,
      email: formData.email,
      telefones,
      papeis: formData.papeis || ['colaborador'],
      regime: formData.regime,
      status: formData.status,
      salario_base: formData.salario_base,
      fee_mensal: formData.fee_mensal,
      cargo_atual: formData.cargo_atual,
      data_admissao: formData.data_admissao,
      data_nascimento: formData.data_nascimento,
      dados_bancarios: {
        banco_codigo: dadosBancarios.banco_codigo,
        banco_nome: dadosBancarios.banco_nome,
        agencia: dadosBancarios.agencia,
        conta: dadosBancarios.conta,
        tipo_conta: dadosBancarios.tipo_conta,
        pix_tipo: dadosBancarios.pix_tipo,
        pix_chave: dadosBancarios.pix_chave,
      },
      observacoes: formData.observacoes,
    };
    
    pessoa 
      ? atualizar({ id: pessoa.id, ...pessoaData } as any) 
      : criar(pessoaData as any);
    
    onOpenChange(false);
  };

  const handleChange = (field: keyof Pessoa, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleBankChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      dados_bancarios: {
        ...(prev.dados_bancarios as any || {}),
        [field]: value,
      },
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones: value ? [value] : [],
    }));
  };

  const dadosBancarios = (formData.dados_bancarios as any) || {};
  const telefone = Array.isArray(formData.telefones) && formData.telefones[0] || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" height="xl" overflow="auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">
            {pessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="profissional" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Profissional
              </TabsTrigger>
              <TabsTrigger value="bancario" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dados Bancários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento || ''}
                    onChange={(e) => handleChange('data_nascimento', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profissional" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo_atual">Cargo/Função</Label>
                  <Input
                    id="cargo_atual"
                    value={formData.cargo_atual || ''}
                    onChange={(e) => handleChange('cargo_atual', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regime">Regime *</Label>
                  <Select
                    value={formData.regime}
                    onValueChange={(value) => handleChange('regime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="estagio">Estágio</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_admissao">Data de Admissão *</Label>
                  <Input
                    id="data_admissao"
                    type="date"
                    value={formData.data_admissao || ''}
                    onChange={(e) => handleChange('data_admissao', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                      <SelectItem value="desligado">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">
                    {formData.regime === 'pj' ? 'Fee Mensal (R$)' : 'Salário Base (R$)'}
                  </Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.regime === 'pj' ? formData.fee_mensal || '' : formData.salario_base || ''}
                    onChange={(e) =>
                      handleChange(
                        formData.regime === 'pj' ? 'fee_mensal' : 'salario_base',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes || ''}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    placeholder="Centro de custo, unidade, etc."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bancario" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco_nome">Banco</Label>
                  <Input
                    id="banco_nome"
                    value={dadosBancarios.banco_nome || ''}
                    onChange={(e) => handleBankChange('banco_nome', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banco_codigo">Código do Banco</Label>
                  <Input
                    id="banco_codigo"
                    value={dadosBancarios.banco_codigo || ''}
                    onChange={(e) => handleBankChange('banco_codigo', e.target.value)}
                    placeholder="Ex: 001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    value={dadosBancarios.agencia || ''}
                    onChange={(e) => handleBankChange('agencia', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    value={dadosBancarios.conta || ''}
                    onChange={(e) => handleBankChange('conta', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                  <Select
                    value={dadosBancarios.tipo_conta}
                    onValueChange={(value) => handleBankChange('tipo_conta', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Corrente</SelectItem>
                      <SelectItem value="poupanca">Poupança</SelectItem>
                      <SelectItem value="pme">PME</SelectItem>
                      <SelectItem value="salario">Salário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pix_tipo">Tipo de Chave PIX</Label>
                  <Select
                    value={dadosBancarios.pix_tipo}
                    onValueChange={(value) => handleBankChange('pix_tipo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="aleatoria">Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pix_chave">Chave PIX</Label>
                  <Input
                    id="pix_chave"
                    value={dadosBancarios.pix_chave || ''}
                    onChange={(e) => handleBankChange('pix_chave', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isCriando || isAtualizando}
            >
              {isCriando || isAtualizando ? 'Salvando...' : pessoa ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
