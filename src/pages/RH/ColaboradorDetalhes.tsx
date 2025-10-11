import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useColaboradores } from '@/hooks/useColaboradores';
import { TimelineColaborador } from '@/components/RH/TimelineColaborador';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, User, Briefcase, Calendar, TrendingUp, Edit } from 'lucide-react';
import { ColaboradorForm } from '@/components/RH/ColaboradorForm';
import { toast } from 'sonner';

export default function ColaboradorDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { colaboradores, isLoading } = useColaboradores();
  const [formOpen, setFormOpen] = useState(false);

  const colaborador = colaboradores.find((c) => c.id === id);

  // Redirecionar para nova interface
  useEffect(() => {
    if (!isLoading && !colaborador && id) {
      toast.info('⚠️ Redirecionando para nova interface de Gestão de Pessoas...');
      setTimeout(() => navigate('/rh/pessoas'), 1500);
    }
  }, [id, isLoading, colaborador, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Colaborador não encontrado</p>
            <Button onClick={() => navigate('/rh/colaboradores')} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ativo: 'bg-success/10 text-success border-success/20',
      inativo: 'bg-muted text-muted-foreground border-border',
      ferias: 'bg-warning/10 text-warning border-warning/20',
      afastado: 'bg-warning/10 text-warning border-warning/20',
      desligado: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors[status] || 'bg-muted';
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      clt: 'CLT',
      estagio: 'Estágio',
      pj: 'PJ',
    };
    return labels[regime] || regime;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rh/colaboradores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-foreground">
              {colaborador.nome_completo}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {colaborador.cargo_atual || 'Sem cargo definido'}
              <Badge variant="outline" className="text-warning border-warning/50">
                Legado
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(colaborador.status)}>
            {colaborador.status}
          </Badge>
          <Button onClick={() => setFormOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Regime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getRegimeLabel(colaborador.regime)}</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Remuneração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(colaborador.salario_base || colaborador.fee_mensal || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Admissão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              CPF/CNPJ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold font-mono">{colaborador.cpf_cnpj}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="profissional">Dados Profissionais</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Dados cadastrais do colaborador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{colaborador.nome_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium font-mono">{colaborador.cpf_cnpj}</p>
                </div>
                {colaborador.rg && (
                  <div>
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="font-medium">{colaborador.rg}</p>
                  </div>
                )}
                {colaborador.data_nascimento && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {new Date(colaborador.data_nascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {colaborador.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{colaborador.email}</p>
                  </div>
                )}
                {colaborador.celular && (
                  <div>
                    <p className="text-sm text-muted-foreground">Celular</p>
                    <p className="font-medium">{colaborador.celular}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissional" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Dados contratuais e bancários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">{colaborador.cargo_atual || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Regime</p>
                  <p className="font-medium">{getRegimeLabel(colaborador.regime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Admissão</p>
                  <p className="font-medium">
                    {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(colaborador.status)}>
                    {colaborador.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {colaborador.regime === 'pj' ? 'Fee Mensal' : 'Salário Base'}
                  </p>
                  <p className="font-medium text-lg">
                    {formatCurrency(colaborador.salario_base || colaborador.fee_mensal || 0)}
                  </p>
                </div>
                {colaborador.centro_custo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Centro de Custo</p>
                    <p className="font-medium">{colaborador.centro_custo}</p>
                  </div>
                )}
                {colaborador.banco_nome && (
                  <div>
                    <p className="text-sm text-muted-foreground">Banco</p>
                    <p className="font-medium">
                      {colaborador.banco_codigo} - {colaborador.banco_nome}
                    </p>
                  </div>
                )}
                {colaborador.agencia && (
                  <div>
                    <p className="text-sm text-muted-foreground">Agência / Conta</p>
                    <p className="font-medium font-mono">
                      {colaborador.agencia} / {colaborador.conta}
                    </p>
                  </div>
                )}
                {colaborador.chave_pix && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Chave PIX ({colaborador.tipo_chave_pix})
                    </p>
                    <p className="font-medium font-mono">{colaborador.chave_pix}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <TimelineColaborador colaboradorId={colaborador.id} />
        </TabsContent>
      </Tabs>

      <ColaboradorForm
        colaborador={colaborador}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
