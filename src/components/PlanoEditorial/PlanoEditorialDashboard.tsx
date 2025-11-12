import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Images, Play } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface PlanoEditorialDashboardProps {
  posts: any[];
  planejamento: any;
}

export function PlanoEditorialDashboard({ posts }: PlanoEditorialDashboardProps) {
  // Estatísticas por tipo de criativo
  const tipoStats = posts.reduce((acc, post) => {
    const tipo = post.tipo_criativo || 'outro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataCreativos = Object.entries(tipoStats).map(([name, value]) => ({
    name,
    value,
    color: {
      'card': '#006BFF',
      'reels': '#FF6384',
      'carrossel': '#9333EA',
      'story': '#FF9500',
      'outro': '#6B7280'
    }[name] || '#6B7280'
  }));

  // Estatísticas por objetivo
  const objetivoStats = posts.reduce((acc, post) => {
    const objetivo = post.objetivo_postagem || 'outro';
    acc[objetivo] = (acc[objetivo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataObjetivos = Object.entries(objetivoStats).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantidade: value
  }));

  // Cards de resumo
  const statCards = [
    {
      title: 'Total de Posts',
      value: posts.length,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Reels',
      value: tipoStats.reels || 0,
      icon: Video,
      color: 'text-pink-500'
    },
    {
      title: 'Cards',
      value: tipoStats.card || 0,
      icon: Images,
      color: 'text-purple-500'
    },
    {
      title: 'Stories',
      value: tipoStats.story || 0,
      icon: Play,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6 mt-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Distribuição por Tipo de Criativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataCreativos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataCreativos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Objetivos */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Distribuição por Objetivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataObjetivos}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#006BFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Postagens */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">📅 Timeline de Postagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {posts
              .sort((a, b) => new Date(a.data_postagem).getTime() - new Date(b.data_postagem).getTime())
              .map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="font-bold text-muted-foreground min-w-[30px]">#{index + 1}</div>
                  <div className="min-w-[100px] font-medium">
                    {new Date(post.data_postagem).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                  <div className="flex-1 truncate">{post.titulo || 'Sem título'}</div>
                  <div className="text-sm text-muted-foreground">{post.tipo_criativo}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
