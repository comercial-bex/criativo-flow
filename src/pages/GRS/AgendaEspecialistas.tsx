import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Evento {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  responsavel_nome: string;
  cliente_nome: string;
  is_bloqueante: boolean;
  is_automatico: boolean;
}

interface Especialista {
  id: string;
  nome: string;
  especialidade: string;
}

/**
 * ✅ SPRINT 4: Dashboard de Agenda de Especialistas
 * Visão semanal de eventos e validação de conflitos
 */
export default function AgendaEspecialistas() {
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [especialistaSelecionado, setEspecialistaSelecionado] = useState<string>('');
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflitos, setConflitos] = useState<string[]>([]);

  const inicioSemana = startOfWeek(semanaAtual, { locale: ptBR });
  const fimSemana = endOfWeek(semanaAtual, { locale: ptBR });

  // Buscar especialistas
  useEffect(() => {
    const fetchEspecialistas = async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome, papeis')
        .contains('papeis', ['especialista'])
        .eq('status', 'ativo')
        .order('nome');

      if (!error && data) {
        setEspecialistas(data.map(p => ({
          id: p.id,
          nome: p.nome,
          especialidade: p.papeis[0] || 'especialista'
        })));
      }
    };

    fetchEspecialistas();
  }, []);

  // Buscar eventos da semana
  useEffect(() => {
    const fetchEventos = async () => {
      if (!especialistaSelecionado) {
        setEventos([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('eventos_calendario')
        .select(`
          id,
          titulo,
          data_inicio,
          data_fim,
          tipo,
          is_bloqueante,
          is_automatico,
          responsavel:responsavel_id(nome),
          cliente:cliente_id(nome)
        `)
        .eq('responsavel_id', especialistaSelecionado)
        .gte('data_inicio', inicioSemana.toISOString())
        .lte('data_fim', fimSemana.toISOString())
        .order('data_inicio');

      if (!error && data) {
        setEventos(data.map(e => ({
          id: e.id,
          titulo: e.titulo,
          data_inicio: e.data_inicio,
          data_fim: e.data_fim,
          tipo: e.tipo,
          responsavel_nome: (e.responsavel as any)?.nome || 'Sem responsável',
          cliente_nome: (e.cliente as any)?.nome || '-',
          is_bloqueante: e.is_bloqueante,
          is_automatico: e.is_automatico
        })));

        // Detectar conflitos (eventos sobrepostos)
        detectarConflitos(data);
      }

      setLoading(false);
    };

    fetchEventos();
  }, [especialistaSelecionado, semanaAtual]);

  const detectarConflitos = (eventos: any[]) => {
    const conflitosDetectados: string[] = [];

    for (let i = 0; i < eventos.length; i++) {
      for (let j = i + 1; j < eventos.length; j++) {
        const e1 = eventos[i];
        const e2 = eventos[j];

        const inicio1 = new Date(e1.data_inicio);
        const fim1 = new Date(e1.data_fim);
        const inicio2 = new Date(e2.data_inicio);
        const fim2 = new Date(e2.data_fim);

        // Verificar sobreposição
        if (inicio1 < fim2 && inicio2 < fim1) {
          conflitosDetectados.push(`${e1.titulo} ↔ ${e2.titulo}`);
        }
      }
    }

    setConflitos(conflitosDetectados);
  };

  const proximaSemana = () => setSemanaAtual(addDays(semanaAtual, 7));
  const semanaAnterior = () => setSemanaAtual(addDays(semanaAtual, -7));

  const getDiasSemana = () => {
    const dias = [];
    for (let i = 0; i < 7; i++) {
      dias.push(addDays(inicioSemana, i));
    }
    return dias;
  };

  const getEventosDoDia = (dia: Date) => {
    return eventos.filter(e => {
      const dataEvento = new Date(e.data_inicio);
      return format(dataEvento, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd');
    });
  };

  if (loading && !especialistas.length) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Agenda de Especialistas
        </h1>

        <Select value={especialistaSelecionado} onValueChange={setEspecialistaSelecionado}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione um especialista" />
          </SelectTrigger>
          <SelectContent>
            {especialistas.map((esp) => (
              <SelectItem key={esp.id} value={esp.id}>
                {esp.nome} ({esp.especialidade})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {conflitos.length > 0 && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                ⚠️ {conflitos.length} Conflito(s) de Agenda Detectado(s)
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                {conflitos.map((c, idx) => (
                  <li key={idx}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {especialistaSelecionado && (
        <>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={semanaAnterior}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Semana Anterior
            </Button>

            <h2 className="text-lg font-semibold">
              {format(inicioSemana, 'dd/MM', { locale: ptBR })} - {format(fimSemana, 'dd/MM/yyyy', { locale: ptBR })}
            </h2>

            <Button variant="outline" onClick={proximaSemana}>
              Próxima Semana
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDiasSemana().map((dia) => (
              <Card key={dia.toISOString()} className="p-4">
                <div className="text-center mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {format(dia, 'EEE', { locale: ptBR })}
                  </p>
                  <p className="text-2xl font-bold">
                    {format(dia, 'dd')}
                  </p>
                </div>

                <div className="space-y-2">
                  {getEventosDoDia(dia).map((evento) => (
                    <div
                      key={evento.id}
                      className={`p-2 rounded-lg text-xs ${
                        evento.is_bloqueante 
                          ? 'bg-red-100 dark:bg-red-900/30 border border-red-300' 
                          : 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300'
                      }`}
                    >
                      <p className="font-semibold truncate">{evento.titulo}</p>
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(evento.data_inicio), 'HH:mm')} - {format(new Date(evento.data_fim), 'HH:mm')}
                      </p>
                      {evento.is_automatico && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">Auto</Badge>
                      )}
                    </div>
                  ))}

                  {getEventosDoDia(dia).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sem eventos
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {!especialistaSelecionado && (
        <Card className="p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Selecione um Especialista</h2>
          <p className="text-muted-foreground">
            Escolha um especialista acima para visualizar sua agenda semanal
          </p>
        </Card>
      )}
    </div>
  );
}
