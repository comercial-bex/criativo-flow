import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventarioItens, useVerificarDisponibilidade } from '@/hooks/useInventario';

interface EquipamentosSelectorProps {
  clienteId?: string;
  projetoId?: string;
  dataInicio?: Date;
  dataFim?: Date;
  onSelect: (equipamentos: any[]) => void;
}

export function EquipamentosSelector({
  clienteId,
  projetoId,
  dataInicio,
  dataFim,
  onSelect
}: EquipamentosSelectorProps) {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [equipamentosComDisp, setEquipamentosComDisp] = useState<any[]>([]);
  
  const { data: equipamentos = [] } = useInventarioItens();
  const verificarDisp = useVerificarDisponibilidade();

  useEffect(() => {
    if (dataInicio && dataFim) {
      verificarDisponibilidadeLote();
    }
  }, [equipamentos, dataInicio, dataFim]);

  const verificarDisponibilidadeLote = async () => {
    if (!dataInicio || !dataFim) {
      setEquipamentosComDisp(equipamentos.map(eq => ({ ...eq, disponibilidade: null })));
      return;
    }

    const promises = equipamentos.map(async (item) => {
      try {
        const disp = await verificarDisp.mutateAsync({
          itemId: item.id,
          inicio: dataInicio.toISOString(),
          fim: dataFim.toISOString(),
          quantidade: 1
        });
        
        return {
          ...item,
          disponibilidade: disp
        };
      } catch (error) {
        return {
          ...item,
          disponibilidade: { disponivel: false, conflitos: [] }
        };
      }
    });

    const results = await Promise.all(promises);
    setEquipamentosComDisp(results);
  };

  const toggleSelect = (itemId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelected(newSelected);
    onSelect(equipamentosComDisp.filter(eq => newSelected.has(eq.id)));
  };

  const filteredEquipamentos = equipamentosComDisp.filter(eq => {
    const matchSearch = search === '' || 
      eq.identificacao_interna?.toLowerCase().includes(search.toLowerCase()) ||
      eq.modelo?.modelo?.toLowerCase().includes(search.toLowerCase());
    
    const matchCategoria = categoriaFilter === 'todas' || 
      eq.modelo?.categoria?.nome === categoriaFilter;
    
    return matchSearch && matchCategoria;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <Input
          placeholder="🔍 Buscar equipamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Categorias</SelectItem>
            <SelectItem value="Câmeras">📷 Câmeras</SelectItem>
            <SelectItem value="Áudio">🎤 Áudio</SelectItem>
            <SelectItem value="Iluminação">💡 Iluminação</SelectItem>
            <SelectItem value="Drones">🚁 Drones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de equipamentos */}
      <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredEquipamentos.map((equipamento) => (
          <Card 
            key={equipamento.id}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              selected.has(equipamento.id) && "ring-2 ring-primary"
            )}
            onClick={() => toggleSelect(equipamento.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {equipamento.disponibilidade && (
                  <Badge variant={equipamento.disponibilidade.disponivel ? "default" : "destructive"}>
                    {equipamento.disponibilidade.disponivel ? '✅ Disponível' : '⚠️ Reservado'}
                  </Badge>
                )}
                {selected.has(equipamento.id) && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <p className="font-medium text-sm">
                {equipamento.modelo?.marca} {equipamento.modelo?.modelo}
              </p>
              <p className="text-xs text-muted-foreground">
                {equipamento.identificacao_interna}
              </p>
              
              {equipamento.disponibilidade && !equipamento.disponibilidade.disponivel && (
                <p className="text-xs text-destructive mt-2">
                  Conflitos: {equipamento.disponibilidade.conflitos?.length || 0}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipamentos.length === 0 && (
        <div className="text-center p-6 text-muted-foreground">
          Nenhum equipamento encontrado
        </div>
      )}
    </div>
  );
}
