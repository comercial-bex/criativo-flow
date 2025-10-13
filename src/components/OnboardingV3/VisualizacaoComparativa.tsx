import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { bexThemeV3 } from "@/styles/bex-theme";

interface Props {
  clienteId: string;
  concorrentes: any[];
}

export function VisualizacaoComparativa({ clienteId, concorrentes }: Props) {
  const [loading, setLoading] = useState(true);
  const [clienteAnalise, setClienteAnalise] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, [clienteId, concorrentes]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { data: analise } = await supabase
        .from('analise_competitiva')
        .select('cliente_analise')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analise) {
        setClienteAnalise(analise.cliente_analise);
      }

      const dados = concorrentes
        .filter(c => c.analise_ia && Object.keys(c.analise_ia).length > 0)
        .map(c => ({
          nome: c.nome,
          engajamento: c.analise_ia.engajamento_percent || 0,
          seguidores: Object.values(c.analise_ia.seguidores || {}).reduce((a: any, b: any) => (a || 0) + (b || 0), 0),
          frequencia: c.analise_ia.frequencia_posts_semana || 0,
        }));

      if (clienteAnalise) {
        dados.unshift({
          nome: 'VOCÊ',
          engajamento: clienteAnalise.engajamento_percent || 0,
          seguidores: Object.values(clienteAnalise.seguidores || {}).reduce((a: any, b: any) => (a || 0) + (b || 0), 0),
          frequencia: clienteAnalise.frequencia_posts_semana || 0,
        });
      }

      setChartData(dados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: bexThemeV3.colors.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6" style={{ color: bexThemeV3.colors.primary }} />
        <h2 className="text-2xl font-bold" style={{ fontFamily: bexThemeV3.typography.heading }}>
          Análise Comparativa
        </h2>
      </div>

      <Card style={{ background: bexThemeV3.colors.surface }}>
        <CardHeader>
          <CardTitle>Taxa de Engajamento (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="nome" stroke={bexThemeV3.colors.textMuted} />
              <YAxis stroke={bexThemeV3.colors.textMuted} />
              <Tooltip
                contentStyle={{
                  background: bexThemeV3.colors.surface,
                  border: `1px solid ${bexThemeV3.colors.primary}`,
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="engajamento" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.nome === 'VOCÊ' ? bexThemeV3.colors.accent : bexThemeV3.colors.primary}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card style={{ background: bexThemeV3.colors.surface }}>
        <CardHeader>
          <CardTitle>Seguidores × Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis 
                dataKey="seguidores" 
                name="Seguidores" 
                stroke={bexThemeV3.colors.textMuted}
                label={{ value: 'Seguidores', position: 'bottom', fill: bexThemeV3.colors.textMuted }}
              />
              <YAxis 
                dataKey="engajamento" 
                name="Engajamento" 
                stroke={bexThemeV3.colors.textMuted}
                label={{ value: 'Engajamento (%)', angle: -90, position: 'left', fill: bexThemeV3.colors.textMuted }}
              />
              <Tooltip
                contentStyle={{
                  background: bexThemeV3.colors.surface,
                  border: `1px solid ${bexThemeV3.colors.primary}`,
                  borderRadius: '8px'
                }}
              />
              <Scatter data={chartData} fill={bexThemeV3.colors.primary} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card style={{ background: bexThemeV3.colors.surface }}>
        <CardHeader>
          <CardTitle>Top Posts por Concorrente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Interações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concorrentes.flatMap(c =>
                (c.analise_ia?.top_posts || []).slice(0, 2).map((post: any, idx: number) => (
                  <TableRow key={`${c.id}-${idx}`}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>
                      <span className="capitalize">{post.plataforma}</span>
                    </TableCell>
                    <TableCell>{post.tema}</TableCell>
                    <TableCell>
                      <span className="capitalize">{post.tipo}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{post.interacoes?.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}