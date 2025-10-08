import { useState } from "react";
import { useProdutosFinanceiro } from "@/hooks/useProdutosFinanceiro";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package, Plus, X } from "lucide-react";

interface ProdutoSelectorProps {
  value: string | null;
  onChange: (produtoId: string | null, produtoData?: any) => void;
  onCreateNew: () => void;
}

export function ProdutoSelector({ value, onChange, onCreateNew }: ProdutoSelectorProps) {
  const { produtosDisponiveis, loadingProdutos } = useProdutosFinanceiro();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const produtoSelecionado = value
    ? produtosDisponiveis.find((p) => p.id === value)
    : null;

  const filteredProdutos = produtosDisponiveis.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {produtoSelecionado ? (
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {produtoSelecionado.nome}
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-2">
                <Search className="h-4 w-4" />
                Selecionar produto/serviço...
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar por nome, SKU ou categoria..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhum produto encontrado
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onCreateNew();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar novo produto
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredProdutos.map((produto) => (
                <CommandItem
                  key={produto.id}
                  value={produto.id}
                  onSelect={() => {
                    onChange(produto.id, produto);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {produto.categoria} • SKU: {produto.sku}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      R$ {Number(produto.preco_padrao).toFixed(2)}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Preview do produto selecionado */}
      {produtoSelecionado && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="font-medium">{produtoSelecionado.nome}</p>
                </div>
                {produtoSelecionado.categoria && (
                  <Badge variant="outline" className="text-xs">
                    {produtoSelecionado.categoria}
                  </Badge>
                )}
                <p className="text-2xl font-bold text-primary">
                  R$ {Number(produtoSelecionado.preco_padrao).toFixed(2)}
                </p>
                {produtoSelecionado.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {produtoSelecionado.descricao}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(null)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
