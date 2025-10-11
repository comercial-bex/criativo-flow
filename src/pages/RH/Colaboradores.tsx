import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ColaboradorForm } from '@/components/RH/ColaboradorForm';
import { UserPlus, Search, Edit, Trash2, Users, Building2, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';

export default function Colaboradores() {
  const { colaboradores, isLoading, deletar } = useColaboradores();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { startTutorial, hasSeenTutorial } = useTutorial('colaboradores');

  const filteredColaboradores = colaboradores.filter((c) =>
    c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf_cnpj.includes(searchTerm) ||
    c.cargo_atual?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = colaboradores.filter((c) => c.status === 'ativo').length;
  const totalPayroll = colaboradores
    .filter((c) => c.status === 'ativo')
    .reduce((sum, c) => sum + (c.salario_base || c.fee_mensal || 0), 0);

  const handleEdit = (colaborador: any) => {
    setSelectedColaborador(colaborador);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedColaborador(null);
    setFormOpen(true);
  };

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
      {/* Alerta de Migração */}
      <Alert className="border-warning/50 bg-warning/10">
        <Info className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Página em Migração</AlertTitle>
        <AlertDescription className="text-sm">
          Esta página será substituída pela nova{' '}
          <a href="/rh/pessoas" className="underline font-semibold hover:text-warning/80">
            Gestão de Pessoas
          </a>
          . Novos cadastros devem ser feitos lá.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Colaboradores
          </h1>
          <p className="text-muted-foreground">
            Gerencie a equipe e dados profissionais
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
          <Button
            onClick={handleNew}
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
            data-tour="novo-colaborador"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaboradores Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                de {colaboradores.length} total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-t-4 border-t-success shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Folha Estimada (Mensal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(totalPayroll)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Base de cálculo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-t-4 border-t-warning shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(activeCount > 0 ? totalPayroll / activeCount : 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por colaborador
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filtros */}
      <Card className="shadow-md" data-tour="filtros">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Colaborador
          </CardTitle>
          <CardDescription>
            Pesquise por nome, CPF/CNPJ ou cargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Digite para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="shadow-md animate-scale-in" data-tour="tabela">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    CPF/CNPJ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Cargo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Regime
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Remuneração
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Carregando colaboradores...
                    </td>
                  </tr>
                ) : filteredColaboradores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum colaborador encontrado
                    </td>
                  </tr>
                ) : (
                  filteredColaboradores.map((colaborador) => (
                    <tr
                      key={colaborador.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {colaborador.nome_completo}
                        </div>
                        {colaborador.email && (
                          <div className="text-sm text-muted-foreground">
                            {colaborador.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {colaborador.cpf_cnpj}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {colaborador.cargo_atual || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono">
                          {getRegimeLabel(colaborador.regime)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {formatCurrency(colaborador.salario_base || colaborador.fee_mensal || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(colaborador.status)}>
                          {colaborador.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/rh/colaboradores/${colaborador.id}`}
                          >
                            Ver Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(colaborador)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Deseja realmente remover este colaborador?')) {
                                deletar(colaborador.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ColaboradorForm
        pessoa={selectedColaborador as any}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
