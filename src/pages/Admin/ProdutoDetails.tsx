import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProdutos } from "@/hooks/useProdutos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Archive } from "lucide-react";
import { toast } from '@/lib/toast-compat';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProdutoDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { produtos, inativarProduto } = useProdutos();
  const [produto, setProduto] = useState<any>(null);

  useEffect(() => {
    if (produtos && id) {
      const found = produtos.find((p) => p.id === id);
      setProduto(found);
    }
  }, [produtos, id]);

  const handleInativar = async () => {
    if (!id) return;
    try {
      await inativarProduto(id);
      toast.success("Produto inativado com sucesso");
      navigate("/admin/produtos");
    } catch (error) {
      toast.error("Erro ao inativar produto");
    }
  };

  if (!produto) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Produto não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/admin/produtos")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/produtos/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          {produto.ativo && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Archive className="w-4 h-4 mr-2" />
                  Inativar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Inativar Produto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja inativar este produto? Ele não aparecerá mais nos
                    seletores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleInativar}>Inativar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{produto.nome}</CardTitle>
              <div className="flex gap-2 mt-2">
                {produto.sku && (
                  <Badge variant="outline" className="text-xs">
                    {produto.sku}
                  </Badge>
                )}
                {produto.tipo && (
                  <Badge variant="secondary">
                    {produto.tipo === "produto" ? "Produto" : "Serviço"}
                  </Badge>
                )}
                <Badge variant={produto.ativo ? "default" : "destructive"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informações */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-semibold">{produto.nome}</p>
            </div>

            {produto.descricao && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p>{produto.descricao}</p>
              </div>
            )}

            {produto.categoria && (
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p>{produto.categoria}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Unidade</p>
              <p className="capitalize">{produto.unidade || "unidade"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço Padrão</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(produto.preco_padrao || 0)}
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
