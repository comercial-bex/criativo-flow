import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProdutos } from "@/hooks/useProdutos";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CadastroProdutoRapidoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (produtoId: string) => void;
}

export function CadastroProdutoRapido({
  open,
  onOpenChange,
  onSuccess,
}: CadastroProdutoRapidoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco_padrao: "",
    descricao: "",
    tipo: "servico" as "servico" | "produto",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const novoProduto = {
        ...formData,
        preco_padrao: parseFloat(formData.preco_padrao),
        sku: `TEMP-${Date.now()}`,
        unidade: "unidade",
        imposto_percent: 0,
        custo: 0,
        ativo: true,
      };

      const { data, error } = await supabase
        .from("produtos")
        .insert([novoProduto])
        .select()
        .single();

      if (error) throw error;

      onOpenChange(false);
      setFormData({ nome: "", categoria: "", preco_padrao: "", descricao: "", tipo: "servico" });
      onSuccess(data.id);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" height="auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastro Rápido de Produto</DialogTitle>
            <DialogDescription>
              Crie um novo produto/serviço para vincular ao lançamento financeiro
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Produto/Serviço *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Gestão de Redes Sociais"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "servico" | "produto") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="produto">Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preco_padrao">Valor Unitário *</Label>
                <Input
                  id="preco_padrao"
                  type="number"
                  step="0.01"
                  value={formData.preco_padrao}
                  onChange={(e) => setFormData({ ...formData, preco_padrao: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Marketing Digital"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição Curta</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Breve descrição do produto/serviço"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar e Vincular"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
