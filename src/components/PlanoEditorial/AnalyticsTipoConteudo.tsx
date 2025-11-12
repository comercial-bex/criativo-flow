import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { getTipoConteudoIcon } from '@/lib/plano-editorial-helpers';
import { TrendingUp, Clock } from 'lucide-react';

interface AnalyticsTipoConteudoProps {
  planejamentoId: string;
}

export const AnalyticsTipoConteudo = ({ planejamentoId }: AnalyticsTipoConteudoProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['analytics-tipo-conteudo', planejamentoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts_planejamento')
        .select('*')
        .eq('planejamento_id', planejamentoId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const CORES = {
    informar: 'hsl(217, 91%, 60%)',
    inspirar: 'hsl(280, 87%, 65%)',
    entreter: 'hsl(45, 93%, 47%)',
    vender: 'hsl(142, 71%, 45%)',
    posicionar: 'hsl(239, 84%, 67%)'
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular analytics
  const analytics = posts?.reduce((acc: any[], post) => {
    const tipo = post.tipo_conteudo || 'informar';
    const existing = acc.find(a => a.tipo_conteudo === tipo);
    
    if (existing) {
      existing.total_posts++;
      if (post.status_post === 'publicado') existing.posts_publicados++;
      if (post.status_post === 'em_producao') existing.posts_producao++;
      if (post.status_post === 'a_fazer') existing.posts_pendentes++;
    } else {
      acc.push({
        tipo_conteudo: tipo,
        total_posts: 1,
        posts_publicados: post.status_post === 'publicado' ? 1 : 0,
        posts_producao: post.status_post === 'em_producao' ? 1 : 0,
        posts_pendentes: post.status_post === 'a_fazer' ? 1 : 0,
      });
    }
    
    return acc;
  }, []) || [];

  const totalPosts = analytics.reduce((sum, a) => sum + a.total_posts, 0);
  analytics.forEach(a => {
    a.percentual_tipo = totalPosts > 0 ? ((a.total_posts / totalPosts) * 100).toFixed(1) : 0;
  });

  if (analytics.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum dado de analytics disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Distribuição por Tipo */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribuição por Tipo de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={analytics}
                dataKey="total_posts"
                nameKey="tipo_conteudo"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.tipo_conteudo}: ${entry.percentual_tipo}%`}
                labelLine={false}
              >
                {analytics.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CORES[entry.tipo_conteudo as keyof typeof CORES] || CORES.informar} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status por Tipo */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Status por Tipo de Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="tipo_conteudo" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts_publicados" fill="hsl(142, 71%, 45%)" name="Publicados" radius={[4, 4, 0, 0]} />
              <Bar dataKey="posts_producao" fill="hsl(217, 91%, 60%)" name="Em Produção" radius={[4, 4, 0, 0]} />
              <Bar dataKey="posts_pendentes" fill="hsl(45, 93%, 47%)" name="Pendentes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo por Tipo */}
      <Card className="md:col-span-2 border-primary/20">
        <CardHeader>
          <CardTitle>Resumo por Tipo de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {analytics.map((tipo: any) => (
              <div 
                key={tipo.tipo_conteudo} 
                className="text-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="text-4xl mb-2">{getTipoConteudoIcon(tipo.tipo_conteudo)}</div>
                <div className="font-semibold capitalize text-sm mb-1">{tipo.tipo_conteudo}</div>
                <div className="text-3xl font-bold text-primary mb-1">{tipo.total_posts}</div>
                <div className="text-xs text-muted-foreground">
                  {tipo.percentual_tipo}% do total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
