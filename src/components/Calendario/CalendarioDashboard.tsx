import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BexCard, BexCardContent, BexCardHeader, BexCardTitle } from '@/components/ui/bex-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, AlertCircle, Box } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';

interface CalendarioDashboardProps {
  responsavelId?: string;
}

export const CalendarioDashboard = ({ responsavelId }: CalendarioDashboardProps) => {
  const { data: stats } = useQuery({
    queryKey: ['calendario_stats', responsavelId],
    queryFn: async () => {
      const inicioMes = startOfMonth(new Date());
      const fimMes = endOfMonth(new Date());

      let query = supabase
        .from('eventos_calendario')
        .select('*')
        .gte('data_inicio', inicioMes.toISOString())
        .lte('data_fim', fimMes.toISOString());

      if (responsavelId) {
        query = query.eq('responsavel_id', responsavelId);
      }

      const { data: eventos, error } = await query;
      if (error) throw error;

      const eventosProdutivos = eventos?.filter(e => 
        ['criacao_avulso', 'criacao_lote', 'edicao_curta', 'edicao_longa'].includes(e.tipo)
      ) || [];

      const taxaOcupacao = eventos && eventos.length > 0
        ? ((eventosProdutivos.length / eventos.length) * 100).toFixed(1)
        : '0';

      const eventosHoje = eventos?.filter(e => {
        const hoje = new Date();
        const inicio = new Date(e.data_inicio);
        return inicio.toDateString() === hoje.toDateString();
      }).length || 0;

      const conflitosResolvidos = eventos?.filter(e => e.is_extra).length || 0;

      const equipamentosReservados = eventos?.reduce((acc, e) => {
        if (e.equipamentos_ids && Array.isArray(e.equipamentos_ids)) {
          return acc + e.equipamentos_ids.length;
        }
        return acc;
      }, 0) || 0;

      return {
        taxaOcupacao: `${taxaOcupacao}%`,
        eventosHoje,
        conflitosResolvidos,
        equipamentosReservados,
        totalEventos: eventos?.length || 0,
      };
    },
  });

  const { data: eventosPorTipo } = useQuery({
    queryKey: ['eventos_por_tipo', responsavelId],
    queryFn: async () => {
      const inicioMes = startOfMonth(new Date());

      let query = supabase
        .from('eventos_calendario')
        .select('tipo')
        .gte('data_inicio', inicioMes.toISOString());

      if (responsavelId) {
        query = query.eq('responsavel_id', responsavelId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const contagem = data?.reduce((acc: any, e) => {
        acc[e.tipo] = (acc[e.tipo] || 0) + 1;
        return acc;
      }, {}) || {};

      return Object.entries(contagem).map(([tipo, quantidade]) => ({
        tipo: tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        quantidade,
      })).sort((a, b) => (b.quantidade as number) - (a.quantidade as number));
    },
  });

  const { data: capacidadeVsUso } = useQuery({
    queryKey: ['capacidade_vs_uso', responsavelId],
    queryFn: async () => {
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const hoje = new Date();
      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(hoje);
        dia.setDate(dia.getDate() - (6 - i));
        return dia;
      });

      const dados = await Promise.all(
        ultimos7Dias.map(async (dia) => {
          const inicioDia = new Date(dia);
          inicioDia.setHours(0, 0, 0, 0);
          const fimDia = new Date(dia);
          fimDia.setHours(23, 59, 59, 999);

          let query = supabase
            .from('eventos_calendario')
            .select('*')
            .gte('data_inicio', inicioDia.toISOString())
            .lte('data_fim', fimDia.toISOString());

          if (responsavelId) {
            query = query.eq('responsavel_id', responsavelId);
          }

          const { data: eventos } = await query;

          return {
            dia: diasSemana[dia.getDay()],
            eventos: eventos?.length || 0,
            capacidade: dia.getDay() === 6 ? 12 : 24,
          };
        })
      );

      return dados;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BexCard variant="glow">
          <BexCardHeader className="flex flex-row items-center justify-between pb-2">
            <BexCardTitle className="text-sm font-medium">Taxa de Ocupação</BexCardTitle>
            <TrendingUp className="h-4 w-4 text-bex" />
          </BexCardHeader>
          <BexCardContent>
            <div className="text-2xl font-bold">{stats?.taxaOcupacao || '0%'}</div>
            <p className="text-xs text-muted-foreground">Eventos produtivos este mês</p>
          </BexCardContent>
        </BexCard>

        <BexCard variant="glow">
          <BexCardHeader className="flex flex-row items-center justify-between pb-2">
            <BexCardTitle className="text-sm font-medium">Eventos Hoje</BexCardTitle>
            <Calendar className="h-4 w-4 text-bex" />
          </BexCardHeader>
          <BexCardContent>
            <div className="text-2xl font-bold">{stats?.eventosHoje || 0}</div>
            <p className="text-xs text-muted-foreground">Agendados para hoje</p>
          </BexCardContent>
        </BexCard>

        <BexCard variant="glow">
          <BexCardHeader className="flex flex-row items-center justify-between pb-2">
            <BexCardTitle className="text-sm font-medium">Eventos Extra</BexCardTitle>
            <AlertCircle className="h-4 w-4 text-bex" />
          </BexCardHeader>
          <BexCardContent>
            <div className="text-2xl font-bold">{stats?.conflitosResolvidos || 0}</div>
            <p className="text-xs text-muted-foreground">Fora do expediente</p>
          </BexCardContent>
        </BexCard>

        <BexCard variant="glow">
          <BexCardHeader className="flex flex-row items-center justify-between pb-2">
            <BexCardTitle className="text-sm font-medium">Equipamentos</BexCardTitle>
            <Box className="h-4 w-4 text-bex" />
          </BexCardHeader>
          <BexCardContent>
            <div className="text-2xl font-bold">{stats?.equipamentosReservados || 0}</div>
            <p className="text-xs text-muted-foreground">Reservados este mês</p>
          </BexCardContent>
        </BexCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BexCard variant="default">
          <BexCardHeader>
            <BexCardTitle>Distribuição por Tipo</BexCardTitle>
          </BexCardHeader>
          <BexCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventosPorTipo || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="tipo" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </BexCardContent>
        </BexCard>

        <BexCard variant="default">
          <BexCardHeader>
            <BexCardTitle>Capacidade vs. Uso Real (Últimos 7 dias)</BexCardTitle>
          </BexCardHeader>
          <BexCardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={capacidadeVsUso || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="capacidade" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  name="Capacidade"
                />
                <Line 
                  type="monotone" 
                  dataKey="eventos" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Eventos Criados"
                />
              </LineChart>
            </ResponsiveContainer>
          </BexCardContent>
        </BexCard>
      </div>
    </div>
  );
};