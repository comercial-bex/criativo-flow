import { useState, useEffect } from "react";
import { useProdutos } from "@/hooks/useProdutos";
import { useProdutosFinanceiro } from "@/hooks/useProdutosFinanceiro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Search, GripVertical, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Item {
  id?: string;
  produto_id?: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  desconto_percent?: number;
  imposto_percent?: number;
  subtotal_item: number;
  ordem: number;
}

interface ItemSelectorProps {
  items: Item[];
  onChange: (items: Item[]) => void;
  showDesconto?: boolean;
  showImposto?: boolean;
  clienteId?: string;
}

export default function ItemSelector({
  items,
  onChange,
  showDesconto = true,
  showImposto = false,
  clienteId,
}: ItemSelectorProps) {
  const { produtos } = useProdutos();
  const { fetchTempDataByCliente, markAsUsed } = useProdutosFinanceiro();
  const [searchOpen, setSearchOpen] = useState(false);
  const [produtosSugeridos, setProdutosSugeridos] = useState<any[]>([]);

  const produtosAtivos = produtos?.filter((p) => p.ativo) || [];

  useEffect(() => {
    if (clienteId) {
      loadProdutosSugeridos();
    }
  }, [clienteId]);

  const loadProdutosSugeridos = async () => {
    if (!clienteId) return;
    try {
      const data = await fetchTempDataByCliente(clienteId);
      setProdutosSugeridos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos sugeridos:", error);
    }
  };

  const addItemFromSugestao = (sugestao: any) => {
    const newItem: Item = {
      produto_id: sugestao.produto_id,
      descricao: sugestao.produto_nome,
      quantidade: 1,
      unidade: "unidade",
      preco_unitario: sugestao.valor_unitario || 0,
      desconto_percent: 0,
      imposto_percent: 0,
      subtotal_item: sugestao.valor_unitario || 0,
      ordem: items.length,
    };
    onChange([...items, newItem]);
  };

  const addProduto = (produto: any) => {
    const newItem: Item = {
      produto_id: produto.id,
      descricao: produto.nome,
      quantidade: 1,
      unidade: produto.unidade || "unidade",
      preco_unitario: produto.preco_padrao || 0,
      desconto_percent: 0,
      imposto_percent: 0,
      subtotal_item: produto.preco_padrao || 0,
      ordem: items.length,
    };
    onChange([...items, newItem]);
    setSearchOpen(false);
  };

  const addItemLivre = () => {
    const newItem: Item = {
      descricao: "",
      quantidade: 1,
      unidade: "unidade",
      preco_unitario: 0,
      desconto_percent: 0,
      imposto_percent: 0,
      subtotal_item: 0,
      ordem: items.length,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // Recalcular subtotal
    const item = updated[index];
    const subtotal = item.quantidade * item.preco_unitario;
    const desconto = showDesconto ? (subtotal * (item.desconto_percent || 0)) / 100 : 0;
    const afterDesconto = subtotal - desconto;
    const imposto = showImposto ? (afterDesconto * (item.imposto_percent || 0)) / 100 : 0;
    updated[index].subtotal_item = afterDesconto + imposto;

    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const calcularTotais = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);
    const descontos = showDesconto
      ? items.reduce(
          (sum, item) =>
            sum + (item.quantidade * item.preco_unitario * (item.desconto_percent || 0)) / 100,
          0
        )
      : 0;
    const impostos = showImposto
      ? items.reduce(
          (sum, item) =>
            sum +
            ((item.quantidade * item.preco_unitario - (item.quantidade * item.preco_unitario * (item.desconto_percent || 0)) / 100) *
              (item.imposto_percent || 0)) /
              100,
          0
        )
      : 0;
    const total = subtotal - descontos + impostos;

    return { subtotal, descontos, impostos, total };
  };

  const totais = calcularTotais();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Itens</CardTitle>
          <div className="flex gap-2">
            {produtosSugeridos.length > 0 && (
              <div className="mr-auto flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Produtos recentes do cliente:</span>
                {produtosSugeridos.slice(0, 3).map((sugestao) => (
                  <Button
                    key={sugestao.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addItemFromSugestao(sugestao)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {sugestao.produto_nome}
                  </Button>
                ))}
              </div>
            )}
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Produto
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Buscar produto..." />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                    <CommandGroup>
                      {produtosAtivos.map((produto) => (
                        <CommandItem
                          key={produto.id}
                          onSelect={() => addProduto(produto)}
                          className="cursor-pointer"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{produto.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(produto.preco_padrao || 0)}{" "}
                              / {produto.unidade}
                            </p>
                          </div>
                          {produto.sku && (
                            <Badge variant="outline" className="text-xs">
                              {produto.sku}
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={addItemLivre}>
              <Plus className="w-4 h-4 mr-2" />
              Item Livre
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum item adicionado</p>
            <p className="text-sm mt-2">Use os botões acima para adicionar itens</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
              <div className="col-span-4">Descrição</div>
              <div className="col-span-1 text-center">Qtd</div>
              <div className="col-span-1 text-center">Un.</div>
              <div className="col-span-2 text-right">Preço Unit.</div>
              {showDesconto && <div className="col-span-1 text-right">Desc%</div>}
              {showImposto && <div className="col-span-1 text-right">Imp%</div>}
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input
                    value={item.descricao}
                    onChange={(e) => updateItem(index, "descricao", e.target.value)}
                    placeholder="Descrição do item..."
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantidade}
                    onChange={(e) =>
                      updateItem(index, "quantidade", parseFloat(e.target.value) || 0)
                    }
                    className="text-center"
                  />
                </div>

                <div className="col-span-1">
                  <Input
                    value={item.unidade}
                    onChange={(e) => updateItem(index, "unidade", e.target.value)}
                    className="text-center text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.preco_unitario}
                    onChange={(e) =>
                      updateItem(index, "preco_unitario", parseFloat(e.target.value) || 0)
                    }
                    className="text-right"
                  />
                </div>

                {showDesconto && (
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.desconto_percent || 0}
                      onChange={(e) =>
                        updateItem(index, "desconto_percent", parseFloat(e.target.value) || 0)
                      }
                      className="text-right"
                    />
                  </div>
                )}

                {showImposto && (
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.imposto_percent || 0}
                      onChange={(e) =>
                        updateItem(index, "imposto_percent", parseFloat(e.target.value) || 0)
                      }
                      className="text-right"
                    />
                  </div>
                )}

                <div className="col-span-2 text-right font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.subtotal_item)}
                </div>

                <div className="col-span-1 flex gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totais */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totais.subtotal)}
                </span>
              </div>

              {showDesconto && totais.descontos > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descontos:</span>
                  <span className="font-semibold">
                    -
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totais.descontos)}
                  </span>
                </div>
              )}

              {showImposto && totais.impostos > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Impostos:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totais.impostos)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totais.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
