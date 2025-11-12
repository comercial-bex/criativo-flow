import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, Search, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { DataComemorativa } from '@/hooks/useDatasComemoratias';
import { toast } from '@/lib/toast-compat';

interface DatasComemoriativasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datas: DataComemorativa[];
  mesReferencia: string;
  onSalvar: (campanhasSelecionadas: CampanhaSelecionada[]) => void;
}

interface CampanhaSelecionada {
  data_comemorativa_id: string;
  nome_campanha: string;
  data_inicio: string;
  data_fim: string;
  periodo_pre_campanha: number;
  periodo_pos_campanha: number;
  objetivos: string[];
  status: string;
  orcamento_sugerido: number | null;
}

export function DatasComemoriativasDialog({
  open,
  onOpenChange,
  datas,
  mesReferencia,
  onSalvar
}: DatasComemoriativasDialogProps) {
  const [busca, setBusca] = useState('');
  const [filtroEngajamento, setFiltroEngajamento] = useState<string>('todos');
  const [campanhasSelecionadas, setCampanhasSelecionadas] = useState<Map<string, CampanhaSelecionada>>(new Map());

  const mes = new Date(mesReferencia).getMonth() + 1;
  const ano = new Date(mesReferencia).getFullYear();

  const datasNacionais = useMemo(() => 
    datas.filter(d => d.tipo === 'nacional' && d.mes_referencia === mes),
    [datas, mes]
  );

  const datasRegionais = useMemo(() => 
    datas.filter(d => d.tipo === 'regional' && d.mes_referencia === mes),
    [datas, mes]
  );

  const datasSegmento = useMemo(() => 
    datas.filter(d => d.tipo === 'segmento' && d.mes_referencia === mes),
    [datas, mes]
  );

  const filtrarDatas = (datasList: DataComemorativa[]) => {
    return datasList.filter(d => {
      const matchBusca = busca === '' || 
        d.nome.toLowerCase().includes(busca.toLowerCase()) ||
        d.descricao?.toLowerCase().includes(busca.toLowerCase());
      
      const matchEngajamento = filtroEngajamento === 'todos' || 
        d.potencial_engajamento === filtroEngajamento;
      
      return matchBusca && matchEngajamento;
    });
  };

  const calcularDataInicio = (dataFixa: string | null, diasPre: number) => {
    if (!dataFixa) return '';
    const [dia] = dataFixa.split('/').map(Number);
    const date = new Date(ano, mes - 1, dia);
    date.setDate(date.getDate() - diasPre);
    return date.toISOString().split('T')[0];
  };

  const calcularDataFim = (dataFixa: string | null, diasPos: number) => {
    if (!dataFixa) return '';
    const [dia] = dataFixa.split('/').map(Number);
    const date = new Date(ano, mes - 1, dia);
    date.setDate(date.getDate() + diasPos);
    return date.toISOString().split('T')[0];
  };

  const toggleCampanha = (data: DataComemorativa, incluir: boolean) => {
    const novasCampanhas = new Map(campanhasSelecionadas);
    
    if (incluir) {
      const diasPre = 7;
      const diasPos = 3;
      novasCampanhas.set(data.id, {
        data_comemorativa_id: data.id,
        nome_campanha: data.nome,
        data_inicio: calcularDataInicio(data.data_fixa, diasPre),
        data_fim: calcularDataFim(data.data_fixa, diasPos),
        periodo_pre_campanha: diasPre,
        periodo_pos_campanha: diasPos,
        objetivos: ['awareness', 'engajamento'],
        status: 'planejada',
        orcamento_sugerido: null
      });
    } else {
      novasCampanhas.delete(data.id);
    }
    
    setCampanhasSelecionadas(novasCampanhas);
  };

  const atualizarPeriodo = (dataId: string, campo: 'data_inicio' | 'data_fim', valor: string) => {
    const novasCampanhas = new Map(campanhasSelecionadas);
    const campanha = novasCampanhas.get(dataId);
    if (campanha) {
      campanha[campo] = valor;
      novasCampanhas.set(dataId, campanha);
      setCampanhasSelecionadas(novasCampanhas);
    }
  };

  const handleSalvar = () => {
    if (campanhasSelecionadas.size === 0) {
      toast.error('Selecione ao menos uma data comemorativa');
      return;
    }

    const campanhasArray = Array.from(campanhasSelecionadas.values());
    onSalvar(campanhasArray);
    onOpenChange(false);
    setCampanhasSelecionadas(new Map());
  };

  const renderDataCard = (data: DataComemorativa) => {
    const selecionada = campanhasSelecionadas.has(data.id);
    const campanha = campanhasSelecionadas.get(data.id);

    return (
      <Card key={data.id} className={`transition-all ${selecionada ? 'border-primary shadow-md' : ''}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id={`data-${data.id}`}
                  checked={selecionada}
                  onCheckedChange={(checked) => toggleCampanha(data, checked as boolean)}
                />
                <Label htmlFor={`data-${data.id}`} className="font-semibold cursor-pointer">
                  {data.nome} {data.data_fixa && `(${data.data_fixa})`}
                </Label>
              </div>
              
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {data.potencial_engajamento === 'alto' && (
                  <Badge className="bg-green-500 text-white text-xs">⭐ Alto</Badge>
                )}
                {data.potencial_engajamento === 'medio' && (
                  <Badge variant="secondary" className="text-xs">📊 Médio</Badge>
                )}
                {data.potencial_engajamento === 'baixo' && (
                  <Badge variant="outline" className="text-xs">📉 Baixo</Badge>
                )}
              </div>

              {data.sugestao_campanha && (
                <p className="text-sm text-muted-foreground">💡 {data.sugestao_campanha}</p>
              )}
            </div>
          </div>

          {selecionada && campanha && (
            <div className="space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Data Início</Label>
                  <Input
                    type="date"
                    value={campanha.data_inicio}
                    onChange={(e) => atualizarPeriodo(data.id, 'data_inicio', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Data Fim</Label>
                  <Input
                    type="date"
                    value={campanha.data_fim}
                    onChange={(e) => atualizarPeriodo(data.id, 'data_fim', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                📅 Período: {campanha.periodo_pre_campanha} dias antes + {campanha.periodo_pos_campanha} dias depois
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Selecionar Datas Comemorativas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar datas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={filtroEngajamento}
              onChange={(e) => setFiltroEngajamento(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="todos">Todos Engajamentos</option>
              <option value="alto">⭐ Alto</option>
              <option value="medio">📊 Médio</option>
              <option value="baixo">📉 Baixo</option>
            </select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="nacionais" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nacionais">
                🇧🇷 Nacionais ({datasNacionais.length})
              </TabsTrigger>
              <TabsTrigger value="regionais">
                📍 Regionais ({datasRegionais.length})
              </TabsTrigger>
              <TabsTrigger value="segmentos">
                🎯 Segmentos ({datasSegmento.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="nacionais" className="space-y-3 m-0">
                {filtrarDatas(datasNacionais).map(renderDataCard)}
                {filtrarDatas(datasNacionais).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma data nacional encontrada para este mês
                  </p>
                )}
              </TabsContent>

              <TabsContent value="regionais" className="space-y-3 m-0">
                {filtrarDatas(datasRegionais).map(renderDataCard)}
                {filtrarDatas(datasRegionais).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma data regional encontrada para este mês
                  </p>
                )}
              </TabsContent>

              <TabsContent value="segmentos" className="space-y-3 m-0">
                {filtrarDatas(datasSegmento).map(renderDataCard)}
                {filtrarDatas(datasSegmento).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma data de segmento encontrada para este mês
                  </p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {campanhasSelecionadas.size} data(s) selecionada(s)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={campanhasSelecionadas.size === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar ao Planejamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
