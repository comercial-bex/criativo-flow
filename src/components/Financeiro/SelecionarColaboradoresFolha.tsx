import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, DollarSign, Car, CheckSquare, Square, Briefcase, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface ColaboradorSelecao {
  id: string;
  nome: string;
  cargo_atual?: string;
  regime?: 'clt' | 'pj' | 'estagio';
  salario_base?: number;
  fee_mensal?: number;
  veiculo_id?: string;
  status: string;
}

interface Veiculo {
  id: string;
  nome: string;
  placa?: string;
}

interface SelecionarColaboradoresFolhaProps {
  colaboradores: ColaboradorSelecao[];
  veiculos: Veiculo[];
  onConfirmar: (selecionados: { colaboradorId: string; veiculoId?: string }[]) => void;
  onCancelar: () => void;
}

export function SelecionarColaboradoresFolha({
  colaboradores,
  veiculos,
  onConfirmar,
  onCancelar
}: SelecionarColaboradoresFolhaProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"ativos" | "todos" | "desligados">("ativos");
  const [selecionados, setSelecionados] = useState<Map<string, string | undefined>>(new Map());

  const colaboradoresFiltrados = useMemo(() => {
    return colaboradores.filter(colab => {
      const matchSearch = !searchTerm || 
        colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colab.cargo_atual?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && colab.status === "ativo") ||
        (filtroStatus === "desligados" && colab.status === "desligado");
      
      return matchSearch && matchStatus;
    });
  }, [colaboradores, searchTerm, filtroStatus]);

  const totalPrevisto = useMemo(() => {
    return Array.from(selecionados.keys())
      .reduce((sum, id) => {
        const colab = colaboradores.find(c => c.id === id);
        return sum + (colab?.salario_base || colab?.fee_mensal || 0);
      }, 0);
  }, [selecionados, colaboradores]);

  const handleSelecionarTodos = () => {
    const novoMap = new Map<string, string | undefined>();
    colaboradoresFiltrados.forEach(colab => {
      novoMap.set(colab.id, undefined);
    });
    setSelecionados(novoMap);
  };

  const handleLimparSelecao = () => {
    setSelecionados(new Map());
  };

  const handleSelecionarPorRegime = (regime: string) => {
    const novoMap = new Map<string, string | undefined>();
    colaboradoresFiltrados
      .filter(c => c.regime?.toLowerCase() === regime.toLowerCase())
      .forEach(colab => novoMap.set(colab.id, undefined));
    setSelecionados(novoMap);
  };

  const handleToggleColaborador = (id: string) => {
    setSelecionados(prev => {
      const newMap = new Map(prev);
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, undefined);
      }
      return newMap;
    });
  };

  const handleSetVeiculo = (colaboradorId: string, veiculoId: string) => {
    setSelecionados(prev => {
      const newMap = new Map(prev);
      newMap.set(colaboradorId, veiculoId === "nenhum" ? undefined : veiculoId);
      return newMap;
    });
  };

  const handleConfirmar = () => {
    const dados = Array.from(selecionados.entries()).map(([colaboradorId, veiculoId]) => ({
      colaboradorId,
      veiculoId
    }));
    onConfirmar(dados);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-xl" data-tour="etapa-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="h-6 w-6" />
          Selecionar Colaboradores para Folha
        </CardTitle>
        <CardDescription>
          Escolha quais colaboradores receberão neste mês e vincule veículos se necessário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filtroStatus === "ativos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroStatus("ativos")}
            >
              ✓ Ativos
            </Button>
            <Button
              variant={filtroStatus === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroStatus("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filtroStatus === "desligados" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroStatus("desligados")}
            >
              ✗ Desligados
            </Button>
          </div>
        </div>

        {/* Botões de Seleção Rápida */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelecionarTodos}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar Todos ({colaboradoresFiltrados.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLimparSelecao}
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Limpar Seleção
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelecionarPorRegime('CLT')}
            className="flex items-center gap-2"
          >
            <Briefcase className="h-4 w-4" />
            Apenas CLT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSelecionarPorRegime('PJ')}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Apenas PJ
          </Button>
        </div>

        {/* Grid de Cards de Colaboradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2" data-tour="veiculo">
          {colaboradoresFiltrados.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum colaborador encontrado
            </div>
          ) : (
            colaboradoresFiltrados.map((colab, index) => (
              <motion.div
                key={colab.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => handleToggleColaborador(colab.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selecionados.has(colab.id) 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selecionados.has(colab.id)}
                    onCheckedChange={() => handleToggleColaborador(colab.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{colab.nome}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {colab.regime?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {colab.cargo_atual || 'Sem cargo'}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(colab.salario_base || colab.fee_mensal || 0)}
                    </p>
                    
                    {selecionados.has(colab.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Veículo (opcional):
                        </label>
                        <Select
                          value={selecionados.get(colab.id) || "nenhum"}
                          onValueChange={(value) => handleSetVeiculo(colab.id, value)}
                        >
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue placeholder="Sem veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nenhum">
                              <span className="flex items-center gap-2">
                                <Car className="h-3 w-3" />
                                Sem veículo
                              </span>
                            </SelectItem>
                            {veiculos.map(veiculo => (
                              <SelectItem key={veiculo.id} value={veiculo.id}>
                                <span className="flex items-center gap-2">
                                  <Car className="h-3 w-3" />
                                  {veiculo.nome} {veiculo.placa ? `(${veiculo.placa})` : ''}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Resumo */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Previsto</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(totalPrevisto)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                <p className="text-2xl font-bold">{selecionados.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3" data-tour="processar">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={selecionados.size === 0}
            size="lg"
            className="min-w-40"
          >
            Processar Folha →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
