import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
}

export function ChecklistGTD() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [novoItem, setNovoItem] = useState("");

  const handleAdicionar = () => {
    if (!novoItem.trim()) return;
    
    setItems([...items, {
      id: crypto.randomUUID(),
      texto: novoItem,
      concluido: false
    }]);
    setNovoItem("");
  };

  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, concluido: !item.concluido } : item
    ));
  };

  const handleRemover = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const itemsAtivos = items.filter(i => !i.concluido);
  const itemsConcluidos = items.filter(i => i.concluido);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-green-500" />
          Checklist GTD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Nova Tarefa */}
        <div className="flex gap-2">
          <Input 
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Nova tarefa rápida..."
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
          />
          <Button size="icon" onClick={handleAdicionar}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de Itens */}
        <div className="space-y-2">
          {itemsAtivos.length === 0 && itemsConcluidos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Adicione tarefas rápidas para organizar seu dia
            </p>
          ) : (
            <>
              {/* Itens Ativos */}
              {itemsAtivos.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded">
                  <Checkbox 
                    checked={item.concluido}
                    onCheckedChange={() => handleToggle(item.id)}
                  />
                  <span className="flex-1 text-sm">{item.texto}</span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6"
                    onClick={() => handleRemover(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Itens Concluídos */}
              {itemsConcluidos.length > 0 && (
                <>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Concluídos</p>
                  </div>
                  {itemsConcluidos.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 opacity-50">
                      <Checkbox 
                        checked={item.concluido}
                        onCheckedChange={() => handleToggle(item.id)}
                      />
                      <span className="flex-1 text-sm line-through">{item.texto}</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => handleRemover(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
