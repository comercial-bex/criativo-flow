import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pessoa, usePessoas } from '@/hooks/usePessoas';
import { smartToast } from '@/lib/smart-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PessoaEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa: Pessoa;
  onSaved?: () => void;
}

export function PessoaEditModal({ open, onOpenChange, pessoa, onSaved }: PessoaEditModalProps) {
  const { atualizar, isAtualizando } = usePessoas();
  const [formData, setFormData] = useState<Partial<Pessoa>>(pessoa);
  const [cpfError, setCpfError] = useState('');

  useEffect(() => {
    setFormData(pessoa);
  }, [pessoa]);

  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos');
      return false;
    }

    if (/^(\d)\1+$/.test(cpfLimpo)) {
      setCpfError('CPF inválido');
      return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
      setCpfError('CPF inválido');
      return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
      setCpfError('CPF inválido');
      return false;
    }

    setCpfError('');
    return true;
  };

  const handleCPFChange = (value: string) => {
    const cpfLimpo = value.replace(/\D/g, '');
    
    let cpfFormatado = cpfLimpo;
    if (cpfLimpo.length >= 3) {
      cpfFormatado = cpfLimpo.substring(0, 3) + '.';
      if (cpfLimpo.length >= 6) {
        cpfFormatado += cpfLimpo.substring(3, 6) + '.';
        if (cpfLimpo.length >= 9) {
          cpfFormatado += cpfLimpo.substring(6, 9) + '-';
          cpfFormatado += cpfLimpo.substring(9, 11);
        } else {
          cpfFormatado += cpfLimpo.substring(6);
        }
      } else {
        cpfFormatado += cpfLimpo.substring(3);
      }
    }

    setFormData({ ...formData, cpf: cpfFormatado });
    
    if (cpfLimpo.length === 11) {
      validarCPF(cpfFormatado);
    } else {
      setCpfError('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
      smartToast.error('Nome é obrigatório');
      return;
    }

    // Validar especialidade
    const temEspecialidade = formData.papeis?.some(p => 
      ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor'].includes(p)
    );
    
    if (!temEspecialidade) {
      smartToast.error('Selecione uma especialidade/cargo para definir as permissões');
      return;
    }

    if (formData.cpf && !validarCPF(formData.cpf)) {
      smartToast.error('CPF inválido');
      return;
    }

    try {
      await atualizar({ id: pessoa.id, ...formData });
      
      // Sincronizar role na tabela user_roles
      if (pessoa.profile_id) {
        const especialidade = formData.papeis?.find(p => 
          ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor'].includes(p)
        );
        
        const roleMap: Record<string, string> = {
          'grs': 'grs',
          'design': 'designer',
          'audiovisual': 'filmmaker',
          'atendimento': 'atendimento',
          'financeiro': 'financeiro',
          'gestor': 'gestor'
        };
        
        const role = roleMap[especialidade || ''];
        
        if (role) {
          await supabase
            .from('user_roles')
            .upsert({ user_id: pessoa.profile_id, role: role as any }, { onConflict: 'user_id,role' });
        }
      }
      
      smartToast.success('Dados atualizados com sucesso');
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      smartToast.error('Erro ao atualizar dados');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Dados - {pessoa.nome}</DialogTitle>
          <DialogDescription>
            Atualize as informações do colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-1">
              Nome Completo
              <span className="text-destructive text-lg">*</span>
            </Label>
            <Input
              id="nome"
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome completo"
              className={!formData.nome ? 'border-destructive' : ''}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf || ''}
              onChange={(e) => handleCPFChange(e.target.value)}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {cpfError && <p className="text-sm text-destructive">{cpfError}</p>}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefones?.[0] || ''}
              onChange={(e) => setFormData({ ...formData, telefones: [e.target.value] })}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Regime */}
          <div className="space-y-2">
            <Label htmlFor="regime">Regime de Contratação</Label>
            <Select
              value={formData.regime || ''}
              onValueChange={(value) => setFormData({ ...formData, regime: value as 'clt' | 'pj' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">PJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Especialidade/Cargo */}
          <div className="space-y-2">
            <Label htmlFor="especialidade" className="flex items-center gap-1">
              Especialidade/Cargo
              <span className="text-destructive text-lg">*</span>
            </Label>
            <Select
              value={formData.papeis?.find(p => ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor'].includes(p)) || ''}
              onValueChange={(value) => {
                const novosPapeis = ['colaborador', 'especialista', value].filter((v, i, a) => a.indexOf(v) === i);
                setFormData({ 
                  ...formData, 
                  papeis: novosPapeis,
                  cargo_atual: value === 'grs' ? 'GRS' :
                               value === 'design' ? 'Designer' :
                               value === 'audiovisual' ? 'Filmmaker' :
                               value === 'atendimento' ? 'Atendimento' :
                               value === 'financeiro' ? 'Financeiro' :
                               value === 'gestor' ? 'Gestor' : ''
                });
              }}
            >
              <SelectTrigger className={!formData.papeis?.some(p => ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor'].includes(p)) ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione a especialidade *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grs">GRS (Gestão de Redes Sociais)</SelectItem>
                <SelectItem value="design">Designer</SelectItem>
                <SelectItem value="audiovisual">Filmmaker (Audiovisual)</SelectItem>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
              </SelectContent>
            </Select>
            {!formData.papeis?.some(p => ['grs', 'design', 'audiovisual', 'atendimento', 'financeiro', 'gestor'].includes(p)) && (
              <p className="text-sm text-destructive">⚠️ Especialidade é obrigatória para definir permissões</p>
            )}
          </div>

          {/* Data de Admissão */}
          <div className="space-y-2">
            <Label htmlFor="data_admissao">Data de Admissão</Label>
            <Input
              id="data_admissao"
              type="date"
              value={formData.data_admissao || ''}
              onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
            />
          </div>

          {/* Salário ou Fee */}
          {formData.regime === 'clt' && (
            <div className="space-y-2">
              <Label htmlFor="salario">Salário Base (R$)</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                value={formData.salario_base || ''}
                onChange={(e) => setFormData({ ...formData, salario_base: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          )}

          {formData.regime === 'pj' && (
            <div className="space-y-2">
              <Label htmlFor="fee">Fee Mensal (R$)</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                value={formData.fee_mensal || ''}
                onChange={(e) => setFormData({ ...formData, fee_mensal: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Dados Bancários */}
          <div className="space-y-2">
            <Label htmlFor="pix">Chave PIX</Label>
            <Input
              id="pix"
              value={formData.dados_bancarios?.pix_chave || ''}
              onChange={(e) => setFormData({
                ...formData,
                dados_bancarios: {
                  ...formData.dados_bancarios,
                  pix_chave: e.target.value
                }
              })}
              placeholder="CPF, email, telefone ou chave aleatória"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                value={formData.dados_bancarios?.banco || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: {
                    ...formData.dados_bancarios,
                    banco: e.target.value
                  }
                })}
                placeholder="Ex: 001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia">Agência</Label>
              <Input
                id="agencia"
                value={formData.dados_bancarios?.agencia || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: {
                    ...formData.dados_bancarios,
                    agencia: e.target.value
                  }
                })}
                placeholder="0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                value={formData.dados_bancarios?.conta || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  dados_bancarios: {
                    ...formData.dados_bancarios,
                    conta: e.target.value
                  }
                })}
                placeholder="00000-0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAtualizando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isAtualizando || !formData.nome || !!cpfError}
          >
            {isAtualizando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
