import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Colaborador, useColaboradores } from '@/hooks/useColaboradores';
import { usePessoas, Pessoa } from '@/hooks/usePessoas';
import { User, Briefcase, CreditCard } from 'lucide-react';

interface ColaboradorFormProps {
  colaborador?: Colaborador;
  pessoa?: Pessoa;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'legacy' | 'new';
}

export function ColaboradorForm({ colaborador, pessoa, open, onOpenChange, mode = 'legacy' }: ColaboradorFormProps) {
  const legacyHooks = useColaboradores();
  const newHooks = usePessoas();
  
  // Selecionar hooks baseado no modo
  const hooks = mode === 'new' ? newHooks : legacyHooks;
  const { criar, atualizar, isCriando, isAtualizando } = hooks;
  const [formData, setFormData] = useState<Partial<Colaborador>>(
    colaborador || {
      regime: 'clt',
      status: 'ativo',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'new') {
      // Converter para formato Pessoa
      const pessoaData = {
        nome: formData.nome_completo || '',
        cpf: formData.cpf_cnpj,
        papeis: ['colaborador'] as any,
        regime: formData.regime,
        status: formData.status,
        salario_base: formData.salario_base,
        fee_mensal: formData.fee_mensal,
        cargo_atual: formData.cargo_atual,
        data_admissao: formData.data_admissao,
        email: formData.email,
        telefones: formData.celular ? [formData.celular] : [],
        dados_bancarios: {
          banco_codigo: formData.banco_codigo,
          agencia: formData.agencia,
          conta: formData.conta,
          tipo_conta: formData.tipo_conta,
          pix_tipo: formData.tipo_chave_pix,
          pix_chave: formData.chave_pix,
        },
      };
      pessoa ? atualizar({ id: pessoa.id, ...pessoaData } as any) : criar(pessoaData as any);
    } else {
      // Modo legado - sempre envia dados completos
      const legacyData = {
        ...formData,
        nome_completo: formData.nome_completo || '',
        cpf_cnpj: formData.cpf_cnpj || '',
        data_admissao: formData.data_admissao || '',
      };
      colaborador 
        ? atualizar({ id: colaborador.id, ...legacyData } as any) 
        : criar(legacyData as any);
    }
    
    onOpenChange(false);
  };

  const handleChange = (field: keyof Colaborador, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat">
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
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
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo || ''}
                    onChange={(e) => handleChange('nome_completo', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj || ''}
                    onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg || ''}
                    onChange={(e) => handleChange('rg', e.target.value)}
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
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular || ''}
                    onChange={(e) => handleChange('celular', e.target.value)}
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
                  <Label htmlFor="centro_custo">Centro de Custo</Label>
                  <Input
                    id="centro_custo"
                    value={formData.centro_custo || ''}
                    onChange={(e) => handleChange('centro_custo', e.target.value)}
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
                    value={formData.banco_nome || ''}
                    onChange={(e) => handleChange('banco_nome', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banco_codigo">Código do Banco</Label>
                  <Input
                    id="banco_codigo"
                    value={formData.banco_codigo || ''}
                    onChange={(e) => handleChange('banco_codigo', e.target.value)}
                    placeholder="Ex: 001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    value={formData.agencia || ''}
                    onChange={(e) => handleChange('agencia', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    value={formData.conta || ''}
                    onChange={(e) => handleChange('conta', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                  <Select
                    value={formData.tipo_conta}
                    onValueChange={(value) => handleChange('tipo_conta', value)}
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
                  <Label htmlFor="tipo_chave_pix">Tipo de Chave PIX</Label>
                  <Select
                    value={formData.tipo_chave_pix}
                    onValueChange={(value) => handleChange('tipo_chave_pix', value)}
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
                  <Label htmlFor="chave_pix">Chave PIX</Label>
                  <Input
                    id="chave_pix"
                    value={formData.chave_pix || ''}
                    onChange={(e) => handleChange('chave_pix', e.target.value)}
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
              {isCriando || isAtualizando ? 'Salvando...' : colaborador ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
