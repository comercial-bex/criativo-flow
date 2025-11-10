import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProdutosFinanceiro } from "@/hooks/useProdutosFinanceiro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Building, Calendar } from "lucide-react";

export default function ProdutoHistorico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchHistoricoUso } = useProdutosFinanceiro();
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHistorico();
    }
  }, [id]);

  const loadHistorico = async () => {
    try {
      const data = await fetchHistoricoUso(id!);
      setHistorico(data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "orcamento":
        return "Orçamento";
      case "proposta":
        return "Proposta";
      case "contrato":
        return "Contrato";
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Carregando histórico...</div>;
  }

  const produto = historico[0]?.produtos;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/produtos")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Histórico de Uso</h1>
          <p className="text-muted-foreground">{produto?.nome}</p>
        </div>
      </div>

      {/* Produto Info */}
      {produto && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{produto.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="outline">{produto.categoria || "Sem categoria"}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Usos</p>
                <p className="font-bold text-2xl">{historico.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vinculações</CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum uso registrado</p>
              <p className="text-muted-foreground">
                Este produto ainda não foi utilizado em nenhum documento administrativo
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Aplicado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        {item.clientes?.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.origem}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {Number(item.valor_unitario).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {item.used_at ? (
                        <Badge variant="secondary">
                          Usado em {new Date(item.used_at).toLocaleDateString("pt-BR")}
                        </Badge>
                      ) : (
                        <Badge variant="default">Disponível para uso</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.used_in_document_type ? (
                        <Badge>
                          {getDocumentTypeLabel(item.used_in_document_type)} #{item.used_in_document_id?.slice(0, 8)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
