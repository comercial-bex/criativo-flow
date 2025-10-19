import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, DollarSign, Car } from "lucide-react";
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
    <Card className="w-full max-w-5xl mx-auto shadow-xl">
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

        {/* Lista de Colaboradores */}
        <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
          {colaboradoresFiltrados.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum colaborador encontrado
            </div>
          ) : (
            colaboradoresFiltrados.map((colab, index) => (
              <motion.div
                key={colab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selecionados.has(colab.id)}
                    onCheckedChange={() => handleToggleColaborador(colab.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{colab.nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {colab.regime?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{colab.cargo_atual || 'Sem cargo'}</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(colab.salario_base || colab.fee_mensal || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {selecionados.has(colab.id) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-48"
                    >
                      <Select
                        value={selecionados.get(colab.id) || "nenhum"}
                        onValueChange={(value) => handleSetVeiculo(colab.id, value)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Veículo..." />
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
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={selecionados.size === 0}
            className="min-w-32"
          >
            Continuar →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
