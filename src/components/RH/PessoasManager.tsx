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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePessoas, Pessoa } from '@/hooks/usePessoas';
import { useColaboradorTempData } from '@/hooks/useColaboradorTempData';
import { useQueryClient } from '@tanstack/react-query';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { Plus, Search, User, UserCheck, UserX, Pencil, AlertCircle, Database } from 'lucide-react';

export function PessoasManager() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<'colaborador' | 'especialista' | 'cliente' | undefined>();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<Pessoa | null>(null);
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

  const pessoasFiltradas = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.cpf?.includes(busca) ||
    p.email?.toLowerCase().includes(busca.toLowerCase())
  );

  // FASE 2: Função para inferir papéis automaticamente
  const inferirPapeis = (data: Partial<Pessoa>): string[] => {
    // Se vinculado a especialista BEX
    if (data.profile_id) {
      return ['especialista'];
    }
    
    // Se tem cliente_id
    if (data.cliente_id) {
      return ['cliente'];
    }
    
    // Baseado no regime
    if (data.regime === 'freelancer') {
      return ['especialista'];
    }
    
    if (['clt', 'pj', 'estagio'].includes(data.regime || '')) {
      return ['colaborador'];
    }
    
    // Padrão
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
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ativo: 'default',
      afastado: 'secondary',
      desligado: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const stats = {
    ativos: pessoas.filter((p) => p.status === 'ativo').length,
    afastados: pessoas.filter((p) => p.status === 'afastado').length,
    desligados: pessoas.filter((p) => p.status === 'desligado').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Afastados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.afastados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Desligados</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.desligados}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão de Pessoas</CardTitle>
              <CardDescription>Gerenciar colaboradores, especialistas e clientes</CardDescription>
            </div>
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button onClick={() => abrirModal()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Pessoa
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
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="profissional">Profissional</TabsTrigger>
                    <TabsTrigger value="bancario">Bancário</TabsTrigger>
                    <TabsTrigger value="observacoes">Observações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pessoal" className="space-y-4">
                    {/* FASE 1: Select de Especialista BEX */}
                    <div>
                      <Label htmlFor="especialista_bex">Especialista BEX (opcional)</Label>
                      <Select
                        value={formData.profile_id || ''}
                        onValueChange={(value) => {
                          if (!value) {
                            // Limpar vínculo
                            setFormData({ 
                              ...formData, 
                              profile_id: undefined,
                              nome: '',
                              email: '',
                              telefones: ['']
                            });
                            return;
                          }
                          
                          // Auto-preencher dados do especialista
                          const especialista = especialistas.find(e => e.id === value);
                          if (especialista) {
                            setFormData({
                              ...formData,
                              profile_id: value,
                              nome: especialista.nome,
                              email: '', // Profiles não expõem email
                              telefones: formData.telefones || ['']
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar especialista da equipe interna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum (cadastro manual)</SelectItem>
                          {especialistas.map((esp) => (
                            <SelectItem key={esp.id} value={esp.id}>
                              {esp.nome} - {esp.especialidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Vincule a um especialista da equipe para aproveitar dados já cadastrados
                      </p>
                    </div>

                    {/* FASE 3: Badge de vínculo */}
                    {formData.profile_id && (
                      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          <strong>Vinculado a Especialista BEX</strong>
                          <br />
                          Esta pessoa está conectada ao cadastro interno. Dados sincronizados automaticamente.
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
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        />
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
                  <Button onClick={handleSubmit} disabled={isCriando || isAtualizando}>
                    {pessoaEditando ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtro || 'todos'} onValueChange={(v) => setFiltro(v === 'todos' ? undefined : v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="colaborador">Colaboradores</SelectItem>
                  <SelectItem value="especialista">Especialistas</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : pessoasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma pessoa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  pessoasFiltradas.map((pessoa) => (
                    <TableRow key={pessoa.id}>
                      <TableCell className="font-medium">{pessoa.nome}</TableCell>
                      <TableCell>{pessoa.cpf}</TableCell>
                      <TableCell>{pessoa.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {pessoa.papeis.map((papel) => (
                            <Badge key={papel} variant="outline" className="text-xs capitalize">
                              {papel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(pessoa.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => abrirModal(pessoa)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {pessoa.status === 'ativo' && (
                            <Button size="sm" variant="destructive" onClick={() => desativar(pessoa.id)}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
