import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePessoas, Pessoa } from '@/hooks/usePessoas';
import { useColaboradorTempData } from '@/hooks/useColaboradorTempData';
import { useQueryClient } from '@tanstack/react-query';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { formatCPF, isValidCPF, cleanCPF } from '@/lib/cpf-utils';
import { Plus, User, UserCheck, UserX, Pencil, AlertCircle, Database, FileText, Briefcase, CreditCard, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import { validarColaborador } from '@/hooks/useColaboradorValidation';
import { AlertaDadosIncompletos } from './AlertaDadosIncompletos';

export function PessoasManager() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<'colaborador' | 'especialista' | 'cliente' | undefined>('colaborador');
  const [modalAberto, setModalAberto] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<Pessoa | null>(null);
  const [cpfError, setCpfError] = useState<string>('');
  const { pessoas, isLoading, criar, atualizar, desativar, isCriando, isAtualizando } = usePessoas(filtro);
  const { dadosPendentes } = useColaboradorTempData();
  const { data: especialistas = [] } = useEspecialistas();

  const [formData, setFormData] = useState<Partial<Pessoa>>({
    nome: '',
    email: '',
    cpf: '',
    telefones: [''],
    papeis: [],
    dados_bancarios: {},
    status: 'ativo',
  });

  const [tempDataSelecionado, setTempDataSelecionado] = useState<any>(null);

  // Detectar dados pendentes ao abrir modal
  useEffect(() => {
    if (modalAberto && !pessoaEditando && dadosPendentes.length > 0) {
      setTempDataSelecionado(dadosPendentes[0]);
    }
  }, [modalAberto, pessoaEditando, dadosPendentes]);

  // Pré-preencher formulário com dados temporários
  useEffect(() => {
    if (tempDataSelecionado) {
      setFormData(prev => ({
        ...prev,
        nome: tempDataSelecionado.produto_nome,
        regime: tempDataSelecionado.regime,
        cargo_atual: tempDataSelecionado.cargo_atual,
        salario_base: tempDataSelecionado.regime === 'clt' ? tempDataSelecionado.salario_ou_fee : undefined,
        fee_mensal: tempDataSelecionado.regime === 'pj' ? tempDataSelecionado.salario_ou_fee : undefined,
      }));
    }
  }, [tempDataSelecionado]);


  // FASE 2: Função para inferir papéis automaticamente
  // Sempre retorna 'colaborador' pois essa tela é só para colaboradores
  const inferirPapeis = (data: Partial<Pessoa>): string[] => {
    return ['colaborador'];
  };

  const handleSubmit = () => {
    if (!formData.nome) {
      return;
    }

    // FASE 2: Inferir papéis automaticamente
    const dadosComPapeis = {
      ...formData,
      papeis: inferirPapeis(formData)
    };

    if (pessoaEditando) {
      atualizar({ id: pessoaEditando.id, ...dadosComPapeis });
    } else {
      criar(dadosComPapeis as Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>);
      
      // Forçar atualização da lista após criar pessoa
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['pessoas'] });
      }, 500);
    }

    setModalAberto(false);
    setPessoaEditando(null);
    setFormData({ nome: '', email: '', cpf: '', telefones: [''], papeis: [], dados_bancarios: {}, status: 'ativo' });
  };

  const abrirModal = (pessoa?: Pessoa) => {
    if (pessoa) {
      setPessoaEditando(pessoa);
      setFormData(pessoa);
    } else {
      setPessoaEditando(null);
      setFormData({ nome: '', email: '', cpf: '', telefones: [''], papeis: [], dados_bancarios: {}, status: 'ativo' });
    }
    setModalAberto(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400',
        icon: <UserCheck className="h-3 w-3 mr-1" />,
        label: 'Ativo'
      },
      afastado: {
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: <User className="h-3 w-3 mr-1" />,
        label: 'Afastado'
      },
      desligado: {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400',
        icon: <UserX className="h-3 w-3 mr-1" />,
        label: 'Desligado'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center w-fit`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const pessoasComValidacao = pessoas.map((pessoa) => ({
    ...pessoa,
    validacao: validarColaborador(pessoa),
  }));

  const stats = {
    ativos: pessoas.filter((p) => p.status === 'ativo').length,
    afastados: pessoas.filter((p) => p.status === 'afastado').length,
    desligados: pessoas.filter((p) => p.status === 'desligado').length,
    completos: pessoasComValidacao.filter((p) => p.validacao.nivel === 'completo').length,
    parciais: pessoasComValidacao.filter((p) => p.validacao.nivel === 'incompleto_parcial').length,
    criticos: pessoasComValidacao.filter((p) => p.validacao.nivel === 'incompleto_critico').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Ativos - Verde */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Colaboradores Ativos
              </CardTitle>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.ativos}
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
        </Card>

        {/* Card Afastados - Amarelo */}
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Colaboradores Afastados
              </CardTitle>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {stats.afastados}
              </div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <User className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
        </Card>

        {/* Card Desligados - Vermelho */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Colaboradores Desligados
              </CardTitle>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.desligados}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Alerta de dados incompletos */}
      {stats.criticos > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>🚨 Atenção: Dados Críticos Faltando</AlertTitle>
          <AlertDescription>
            Existem <strong>{stats.criticos} colaboradores</strong> com dados essenciais incompletos que bloqueiam a folha de pagamento.
            Verifique os badges na tabela abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Card de estatísticas de validação */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">📊 Status dos Cadastros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Completos</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completos}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Parcialmente incompletos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.parciais}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Criticamente incompletos</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.criticos}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Gestão de Colaboradores</CardTitle>
              <CardDescription className="mt-1">
                {pessoas.length} {pessoas.length === 1 ? 'colaborador cadastrado' : 'colaboradores cadastrados'}
              </CardDescription>
            </div>
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => abrirModal()} 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent size="xl" height="xl" overflow="auto">
                <DialogHeader>
                  <DialogTitle>{pessoaEditando ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
                  <DialogDescription>Preencha os dados da pessoa</DialogDescription>
                </DialogHeader>

                {tempDataSelecionado && !pessoaEditando && (
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Há dados pré-cadastrados de {tempDataSelecionado.origem.toUpperCase()}. Os campos foram pré-preenchidos.
                      <Button variant="link" size="sm" onClick={() => setTempDataSelecionado(null)}>
                        Ignorar e preencher manualmente
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="pessoal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                    <TabsTrigger value="pessoal" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Pessoais</span>
                    </TabsTrigger>
                    <TabsTrigger value="profissional" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Profissional</span>
                    </TabsTrigger>
                    <TabsTrigger value="bancario" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Bancário</span>
                    </TabsTrigger>
                    <TabsTrigger value="observacoes" className="flex flex-col sm:flex-row items-center gap-1 py-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Observações</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pessoal" className="space-y-4">
                    {/* FASE 1: Select de Especialista BEX */}
                    <div>
                      <Label htmlFor="especialista_bex">Especialista BEX (opcional)</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.profile_id || undefined}
                          onValueChange={async (value) => {
                            // FASE 1: Verificar se pessoa já existe com este profile_id
                            const especialista = especialistas.find(e => e.id === value);
                            if (!especialista) return;
                            
                            const { data: pessoaExistente } = await supabase
                              .from('pessoas')
                              .select('*')
                              .eq('profile_id', value)
                              .maybeSingle();
                            
                            if (pessoaExistente) {
                              // Já existe: carregar para EDIÇÃO
                              setPessoaEditando(pessoaExistente);
                              setFormData({
                                ...pessoaExistente,
                                telefones: pessoaExistente.telefones || ['']
                              });
                              
                              smartToast.info(
                                'Pessoa já cadastrada', 
                                `${pessoaExistente.nome} já existe. Editando registro existente.`
                              );
                            } else {
                              // Não existe: importar dados para CRIAÇÃO
                              setFormData({
                                ...formData,
                                profile_id: value,
                                nome: especialista.nome,
                                email: especialista.email || '',
                                telefones: especialista.telefone ? [especialista.telefone] : ['']
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecionar especialista da equipe interna" />
                          </SelectTrigger>
                          <SelectContent>
                            {especialistas.map((esp) => (
                              <SelectItem key={esp.id} value={esp.id}>
                                {esp.nome} - {esp.papeis?.join(', ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {formData.profile_id && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                profile_id: undefined,
                                nome: '',
                                email: '',
                                telefones: ['']
                              });
                            }}
                            title="Limpar vínculo"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Vincule a um especialista da equipe para aproveitar dados já cadastrados
                      </p>
                    </div>

                    {/* FASE 3: Feedback visual melhorado */}
                    {formData.profile_id && (
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Vinculado a Especialista BEX</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <p className="font-medium mb-2">Dados importados automaticamente:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>✅ Nome: <strong>{formData.nome}</strong></li>
                            {formData.email && <li>✅ Email: <strong>{formData.email}</strong></li>}
                            {formData.telefones?.[0] && <li>✅ Telefone: <strong>{formData.telefones[0]}</strong></li>}
                          </ul>
                          <p className="text-xs mt-3 text-muted-foreground">
                            ℹ️ CPF deve ser preenchido manualmente por segurança
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome || ''}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        disabled={!!formData.profile_id}
                      />
                      {formData.profile_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ✅ Preenchido automaticamente do cadastro do especialista
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf || ''}
                          onChange={(e) => {
                            // FASE 2/4: Formatar CPF em tempo real
                            const formatted = formatCPF(e.target.value);
                            setFormData({ ...formData, cpf: formatted });
                            
                            // Limpar erro ao digitar
                            if (cpfError) setCpfError('');
                          }}
                          onBlur={() => {
                            // FASE 2: Validar CPF ao sair do campo
                            if (formData.cpf && formData.cpf.length > 0) {
                              const cpfLimpo = cleanCPF(formData.cpf);
                              if (cpfLimpo.length === 11 && !isValidCPF(formData.cpf)) {
                                setCpfError('CPF inválido');
                              } else {
                                setCpfError('');
                              }
                            }
                          }}
                          placeholder="000.000.000-00"
                          className={cpfError ? 'border-red-500' : ''}
                        />
                        {cpfError && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {cpfError}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefones?.[0] || ''}
                        onChange={(e) => setFormData({ ...formData, telefones: [e.target.value] })}
                      />
                    </div>
                    
                    {/* FASE 2: Papéis removidos - agora são inferidos automaticamente */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Papéis definidos automaticamente:</strong>
                        <ul className="text-xs mt-1 list-disc list-inside">
                          <li>Vinculado a Especialista BEX → <strong>Especialista</strong></li>
                          <li>Regime CLT/PJ/Estágio → <strong>Colaborador</strong></li>
                          <li>Regime Freelancer → <strong>Especialista</strong></li>
                          <li>Vinculado a Cliente → <strong>Cliente</strong></li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="profissional" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="regime">Regime</Label>
                        <Select
                          value={formData.regime || ''}
                          onValueChange={(value: any) => setFormData({ ...formData, regime: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clt">CLT</SelectItem>
                            <SelectItem value="pj">PJ</SelectItem>
                            <SelectItem value="estagio">Estágio</SelectItem>
                            <SelectItem value="freelancer">Freelancer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status || 'ativo'}
                          onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="afastado">Afastado</SelectItem>
                            <SelectItem value="desligado">Desligado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salario">Salário Base</Label>
                        <Input
                          id="salario"
                          type="number"
                          value={formData.salario_base || ''}
                          onChange={(e) => setFormData({ ...formData, salario_base: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fee">Fee Mensal (PJ)</Label>
                        <Input
                          id="fee"
                          type="number"
                          value={formData.fee_mensal || ''}
                          onChange={(e) => setFormData({ ...formData, fee_mensal: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="admissao">Data Admissão</Label>
                        <Input
                          id="admissao"
                          type="date"
                          value={formData.data_admissao || ''}
                          onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                        />
                      </div>
                      {formData.status === 'desligado' && (
                        <div>
                          <Label htmlFor="desligamento">Data Desligamento</Label>
                          <Input
                            id="desligamento"
                            type="date"
                            value={formData.data_desligamento || ''}
                            onChange={(e) => setFormData({ ...formData, data_desligamento: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="bancario" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="banco">Banco</Label>
                        <Input
                          id="banco"
                          value={formData.dados_bancarios?.banco_nome || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, banco_nome: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="agencia">Agência</Label>
                        <Input
                          id="agencia"
                          value={formData.dados_bancarios?.agencia || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, agencia: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="conta">Conta</Label>
                        <Input
                          id="conta"
                          value={formData.dados_bancarios?.conta || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, conta: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo_conta">Tipo Conta</Label>
                        <Select
                          value={formData.dados_bancarios?.tipo_conta || ''}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, tipo_conta: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corrente">Corrente</SelectItem>
                            <SelectItem value="poupanca">Poupança</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pix_tipo">Tipo PIX</Label>
                        <Select
                          value={formData.dados_bancarios?.pix_tipo || ''}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, pix_tipo: value },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="telefone">Telefone</SelectItem>
                            <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pix_chave">Chave PIX</Label>
                        <Input
                          id="pix_chave"
                          value={formData.dados_bancarios?.pix_chave || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dados_bancarios: { ...formData.dados_bancarios, pix_chave: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="observacoes" className="space-y-4">
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        rows={6}
                        value={formData.observacoes || ''}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setModalAberto(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isCriando || isAtualizando || !!cpfError}
                  >
                    {pessoaEditando ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Regime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Carregando colaboradores...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pessoasComValidacao.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-lg font-medium">Nenhum colaborador cadastrado</p>
                      <p className="text-sm text-muted-foreground">
                        Clique em "Novo Colaborador" para adicionar sua equipe
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pessoasComValidacao.map(({ validacao, ...pessoa }) => (
                  <TableRow 
                    key={pessoa.id} 
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{pessoa.nome}</TableCell>
                    <TableCell>
                      {pessoa.cpf ? (
                        <span className="font-mono text-sm">{formatCPF(pessoa.cpf)}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pessoa.email ? (
                        <span className="text-sm truncate max-w-[200px] block" title={pessoa.email}>
                          {pessoa.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pessoa.regime ? (
                        <Badge variant="secondary" className="uppercase text-xs">
                          {pessoa.regime}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(pessoa.status)}</TableCell>
                    <TableCell>
                      <AlertaDadosIncompletos
                        pessoa={pessoa}
                        validacao={validacao}
                        onEditar={() => abrirModal(pessoa)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => abrirModal(pessoa)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {pessoa.status === 'ativo' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => desativar(pessoa.id)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Desativar
                          </Button>
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
    </div>
  );
}
