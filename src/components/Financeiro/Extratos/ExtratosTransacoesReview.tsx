import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTransacoesExtrato, useImportarExtrato } from "@/hooks/useImportarExtrato";
import { useEntidades } from "@/hooks/useEntidades";
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, Upload, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExtratosTransacoesReviewProps {
  extratoId: string;
  onImportComplete: () => void;
  comprovantes?: File[];
}

export function ExtratosTransacoesReview({ extratoId, onImportComplete, comprovantes = [] }: ExtratosTransacoesReviewProps) {
  const { transacoes, isLoading } = useTransacoesExtrato(extratoId);
  const { importarSelecionadas, importando, atualizarTransacao, uploadComprovante } = useImportarExtrato();
  const { data: clientes = [] } = useEntidades('receber');
  const { data: fornecedores = [] } = useEntidades('pagar');
  
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [comprovantesVinculados, setComprovantesVinculados] = useState<Record<string, number>>({});

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelecionadas(transacoes.map(t => t.id));
    } else {
      setSelecionadas([]);
    }
  };

  const handleSelectTransacao = (id: string, checked: boolean) => {
    if (checked) {
      setSelecionadas([...selecionadas, id]);
    } else {
      setSelecionadas(selecionadas.filter(tid => tid !== id));
    }
  };

  const handleVincularEntidade = (transacaoId: string, entidadeId: string, tipo: 'cliente' | 'fornecedor') => {
    atualizarTransacao({
      transacaoId,
      updates: {
        [tipo === 'cliente' ? 'cliente_sugerido_id' : 'fornecedor_sugerido_id']: entidadeId,
        status_processamento: 'revisado'
      }
    });
  };

  const handleVincularComprovante = (transacaoId: string, comprovanteIndex: number) => {
    const file = comprovantes[comprovanteIndex];
    if (file) {
      uploadComprovante({ transacaoId, file });
      setComprovantesVinculados({ ...comprovantesVinculados, [transacaoId]: comprovanteIndex });
    }
  };

  const handleImportar = () => {
    importarSelecionadas(
      { extratoId, transacoesIds: selecionadas },
      {
        onSuccess: onImportComplete
      }
    );
  };

  const getConfiancaBadge = (confianca: number) => {
    if (confianca >= 80) return <Badge className="bg-success">Alta ({confianca}%)</Badge>;
    if (confianca >= 50) return <Badge className="bg-warning">Média ({confianca}%)</Badge>;
    return <Badge variant="secondary">Baixa ({confianca}%)</Badge>;
  };

  const transacoesFiltradas = transacoes.filter(t =>
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelecionado = transacoesFiltradas
    .filter(t => selecionadas.includes(t.id))
    .reduce((sum, t) => sum + (t.tipo_movimento === 'credito' ? t.valor : -t.valor), 0);

  if (isLoading) {
    return <div className="text-center py-8">Carregando transações...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {selecionadas.length} de {transacoesFiltradas.length} selecionadas
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Selecionado</p>
            <p className={`font-semibold ${totalSelecionado >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {Math.abs(totalSelecionado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            onClick={handleImportar}
            disabled={selecionadas.length === 0 || importando}
            size="lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {importando ? "Importando..." : `Importar ${selecionadas.length} Transações`}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selecionadas.length === transacoesFiltradas.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vinculação</TableHead>
              <TableHead>Confiança</TableHead>
              {comprovantes.length > 0 && <TableHead>Comprovante</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoesFiltradas.map((transacao) => (
              <TableRow key={transacao.id}>
                <TableCell>
                  <Checkbox
                    checked={selecionadas.includes(transacao.id)}
                    onCheckedChange={(checked) => handleSelectTransacao(transacao.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(transacao.data_transacao), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {transacao.tipo_movimento === 'credito' ? (
                    <div className="flex items-center gap-2 text-success">
                      <ArrowUpCircle className="w-4 h-4" />
                      <span className="text-sm">Crédito</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <ArrowDownCircle className="w-4 h-4" />
                      <span className="text-sm">Débito</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{transacao.descricao}</p>
                    {transacao.numero_documento && (
                      <p className="text-xs text-muted-foreground">Doc: {transacao.numero_documento}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Select
                    value={transacao.cliente_sugerido_id || transacao.fornecedor_sugerido_id || ""}
                    onValueChange={(value) => {
                      const tipo = transacao.tipo_movimento === 'credito' ? 'cliente' : 'fornecedor';
                      handleVincularEntidade(transacao.id, value, tipo);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {transacao.tipo_movimento === 'credito'
                        ? clientes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))
                        : fornecedores.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nome}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {transacao.confianca_vinculo > 0 && getConfiancaBadge(transacao.confianca_vinculo)}
                </TableCell>
                {comprovantes.length > 0 && (
                  <TableCell>
                    <Select
                      value={comprovantesVinculados[transacao.id]?.toString() || transacao.comprovante_url ? "uploaded" : ""}
                      onValueChange={(value) => {
                        if (value !== "uploaded") {
                          handleVincularComprovante(transacao.id, parseInt(value));
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sem comprovante" />
                      </SelectTrigger>
                      <SelectContent>
                        {comprovantes.map((file, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {file.name.slice(0, 20)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
