import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCalendarioMultidisciplinar } from '@/hooks/useCalendarioMultidisciplinar';
import { useEspecialistas } from '@/hooks/useEspecialistas';
import { useProjetos } from '@/hooks/useProjetos';
import { EquipamentosSelector } from '@/components/Inventario/EquipamentosSelector';
import { AddressSearch } from '@/components/AddressSearch';
import { smartToast } from '@/lib/smart-toast';
import { Loader2, AlertTriangle, Lightbulb, PartyPopper } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ModalCriarEventoProps {
  open: boolean;
  onClose: () => void;
  dataInicial?: Date;
  responsavelIdInicial?: string;
}

const tiposEvento = [
  { value: 'criacao_avulso', label: 'Criação Avulso' },
  { value: 'criacao_lote', label: 'Criação em Lote' },
  { value: 'edicao_curta', label: 'Edição Curta' },
  { value: 'edicao_longa', label: 'Edição Longa' },
  { value: 'captacao_interna', label: 'Captação Interna' },
  { value: 'captacao_externa', label: 'Captação Externa' },
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'reuniao', label: 'Reunião' },
];

export const ModalCriarEvento = ({ open, onClose, dataInicial, responsavelIdInicial }: ModalCriarEventoProps) => {
  const [tipo, setTipo] = useState('criacao_avulso');
  const [titulo, setTitulo] = useState('');
  const [projetoId, setProjetoId] = useState('');
  const [responsavelId, setResponsavelId] = useState(responsavelIdInicial || '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modoCriativo, setModoCriativo] = useState<'avulso' | 'lote'>('avulso');
  const [quantidadePecas, setQuantidadePecas] = useState(12);
  const [local, setLocal] = useState('');
  const [equipamentos, setEquipamentos] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [conflitos, setConflitos] = useState<any[]>([]);
  const [verificandoConflito, setVerificandoConflito] = useState(false);

  const { criarEvento, isCriandoEvento, verificarConflito, sugerirSlot } = useCalendarioMultidisciplinar({
    responsavelId,
    dataInicio: dataInicial || new Date(),
    dataFim: dataInicial || new Date(),
  });

  const { data: especialistas } = useEspecialistas();
  const { projetos } = useProjetos();

  // Verificar feriados na data selecionada
  const { data: feriadosNoDia = [] } = useQuery({
    queryKey: ['feriado', dataInicio],
    queryFn: async () => {
      if (!dataInicio) return [];
      const dataEvento = new Date(dataInicio);
      const { data } = await supabase
        .from('feriados_nacionais')
        .select('*')
        .eq('data', format(dataEvento, 'yyyy-MM-dd'));
      return data || [];
    },
    enabled: !!dataInicio
  });

  useEffect(() => {
    if (dataInicial) {
      const inicio = new Date(dataInicial);
      setDataInicio(format(inicio, "yyyy-MM-dd'T'HH:mm"));
      
      // Definir fim automático baseado no tipo
      const duracoes: Record<string, number> = {
        criacao_avulso: 35,
        criacao_lote: 210,
        edicao_curta: 120,
        edicao_longa: 240,
        planejamento: 120,
        reuniao: 60,
        captacao_interna: 120,
        captacao_externa: 180,
      };
      
      const fim = new Date(inicio);
      fim.setMinutes(fim.getMinutes() + (duracoes[tipo] || 60));
      setDataFim(format(fim, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [dataInicial, tipo]);

  useEffect(() => {
    if (responsavelIdInicial) {
      setResponsavelId(responsavelIdInicial);
    }
  }, [responsavelIdInicial]);

  useEffect(() => {
    if (dataInicio && dataFim && responsavelId) {
      verificarConflitos();
    }
  }, [dataInicio, dataFim, responsavelId]);

  const verificarConflitos = async () => {
    if (!dataInicio || !dataFim || !responsavelId) return;

    setVerificandoConflito(true);
    try {
      const resultado = await verificarConflito({
        responsavelId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      }) as any;

      if (resultado?.tem_conflito) {
        setConflitos(resultado.conflitos || []);
      } else {
        setConflitos([]);
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    } finally {
      setVerificandoConflito(false);
    }
  };

  const handleSugerirHorario = async () => {
    if (!responsavelId || !dataInicio) {
      smartToast.error('Selecione um responsável e uma data');
      return;
    }

    const duracoes: Record<string, number> = {
      criacao_avulso: 35,
      criacao_lote: 210,
      edicao_curta: 120,
      edicao_longa: 240,
      planejamento: 120,
      reuniao: 60,
      captacao_interna: 120,
      captacao_externa: 180,
    };

    try {
      const sugestao = await sugerirSlot({
        responsavelId,
        duracaoMinutos: duracoes[tipo] || 60,
        dataPreferida: format(new Date(dataInicio), 'yyyy-MM-dd'),
        tipoEvento: tipo,
      }) as any;

      if (sugestao?.slot_sugerido) {
        setDataInicio(sugestao.slot_sugerido.inicio);
        setDataFim(sugestao.slot_sugerido.fim);
        smartToast.success('Horário sugerido aplicado');
      } else {
        smartToast.info('Nenhum slot disponível encontrado para esta data');
      }
    } catch (error) {
      smartToast.error('Erro ao sugerir horário');
    }
  };

  const handleSubmit = async () => {
    if (!titulo || !projetoId || !responsavelId || !dataInicio || !dataFim) {
      smartToast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (conflitos.length > 0) {
      smartToast.error('Existem conflitos de agenda. Resolva antes de criar o evento.');
      return;
    }

    if (modoCriativo === 'lote' && (quantidadePecas < 1 || quantidadePecas > 12)) {
      smartToast.error('Quantidade de peças deve estar entre 1 e 12');
      return;
    }

    try {
      await criarEvento({
        projetoId,
        responsavelId,
        titulo,
        tipo,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        modoCriativo: ['criacao_avulso', 'criacao_lote', 'edicao_curta', 'edicao_longa'].includes(tipo) 
          ? modoCriativo 
          : null,
        local: ['captacao_interna', 'captacao_externa'].includes(tipo) ? local : null,
        equipamentosIds: equipamentos.length > 0 ? equipamentos : null,
        observacoes: observacoes || null,
        quantidadePecas: modoCriativo === 'lote' ? quantidadePecas : null,
      });

      handleClose();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const handleClose = () => {
    setTipo('criacao_avulso');
    setTitulo('');
    setProjetoId('');
    setResponsavelId(responsavelIdInicial || '');
    setDataInicio('');
    setDataFim('');
    setModoCriativo('avulso');
    setQuantidadePecas(12);
    setLocal('');
    setEquipamentos([]);
    setObservacoes('');
    setConflitos([]);
    onClose();
  };

  const mostrarDetalhesCreativos = ['criacao_avulso', 'criacao_lote', 'edicao_curta', 'edicao_longa'].includes(tipo);
  const mostrarLogistica = ['captacao_interna', 'captacao_externa'].includes(tipo);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" height="xl" overflow="auto">
        <DialogHeader className="modal-header-gaming">
          <DialogTitle className="modal-title-gaming">Criar Novo Evento</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="criativo" disabled={!mostrarDetalhesCreativos}>
              Detalhes Criativos
            </TabsTrigger>
            <TabsTrigger value="logistica" disabled={!mostrarLogistica}>
              Logística
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basico" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Criação de posts para campanha X"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projeto">Projeto *</Label>
                <Select value={projetoId} onValueChange={setProjetoId}>
                  <SelectTrigger id="projeto">
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável *</Label>
                <Select value={responsavelId} onValueChange={setResponsavelId}>
                  <SelectTrigger id="responsavel">
                    <SelectValue placeholder="Selecione um especialista" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialistas?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome} - {e.especialidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data/Hora Início *</Label>
                <Input
                  id="dataInicio"
                  type="datetime-local"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data/Hora Fim *</Label>
                <Input
                  id="dataFim"
                  type="datetime-local"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>

            {/* ALERTA DE FERIADO */}
            {feriadosNoDia.length > 0 && (
              <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <PartyPopper className="h-5 w-5 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-300 font-semibold">
                  ⚠️ Atenção: Feriado nesta data!
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                  {feriadosNoDia.map(f => (
                    <div key={f.id} className="mt-1">
                      <strong>{f.nome}</strong> ({f.tipo === 'facultativo' ? 'Ponto Facultativo' : 
                        f.tipo === 'nacional' ? 'Feriado Nacional' : 
                        f.tipo === 'estadual' ? 'Feriado Estadual' : 
                        f.tipo === 'municipal' ? 'Feriado Municipal' : 
                        'Data Comemorativa'})
                      {f.descricao && <p className="text-xs mt-0.5">{f.descricao}</p>}
                    </div>
                  ))}
                  <p className="text-xs mt-2 font-medium">
                    Considere reagendar para evitar baixa produtividade ou conflitos de agenda.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSugerirHorario}
                disabled={!responsavelId || !dataInicio}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Sugerir Horário
              </Button>

              {verificandoConflito && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Verificando...
                </Badge>
              )}

              {conflitos.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge variant="destructive" className="cursor-pointer">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {conflitos.length} Conflito(s)
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Eventos Conflitantes:</h4>
                      {conflitos.map((c, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-destructive pl-2">
                          <p className="font-medium">{c.titulo}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(c.data_inicio), 'dd/MM HH:mm')} - 
                            {format(new Date(c.data_fim), 'HH:mm')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </TabsContent>

          <TabsContent value="criativo" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modo Criativo</Label>
                <RadioGroup value={modoCriativo} onValueChange={(v) => setModoCriativo(v as 'avulso' | 'lote')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="avulso" id="avulso" />
                    <Label htmlFor="avulso">Avulso (peça única)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lote" id="lote" />
                    <Label htmlFor="lote">Lote (múltiplas peças)</Label>
                  </div>
                </RadioGroup>
              </div>

              {modoCriativo === 'lote' && (
                <div className="space-y-2">
                  <Label htmlFor="quantidadePecas">Quantidade de Peças</Label>
                  <Input
                    id="quantidadePecas"
                    type="number"
                    min="1"
                    max="12"
                    value={quantidadePecas}
                    onChange={(e) => setQuantidadePecas(parseInt(e.target.value) || 12)}
                  />
                  <p className="text-xs text-muted-foreground">Máximo: 12 peças por lote</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Briefing / Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva os detalhes do trabalho criativo..."
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logistica" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Local</Label>
                <AddressSearch
                  value={local}
                  onAddressSelect={(address) => setLocal(typeof address === 'string' ? address : (address as any).description)}
                  placeholder="Digite o endereço da captação..."
                />
              </div>

              <div className="space-y-2">
                <Label>Equipamentos</Label>
                <EquipamentosSelector
                  dataInicio={dataInicio ? new Date(dataInicio) : undefined}
                  dataFim={dataFim ? new Date(dataFim) : undefined}
                  onSelect={setEquipamentos}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoesLog">Observações Adicionais</Label>
                <Textarea
                  id="observacoesLog"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre logística, transporte, etc..."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isCriandoEvento || conflitos.length > 0}
          >
            {isCriandoEvento && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Criar Evento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
