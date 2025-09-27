import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Share2,
  Download,
  Calendar,
  Facebook,
  Instagram,
  Clock,
  Target,
  DollarSign,
  ArrowUpRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubMenuGRS } from "@/components/SubMenuGRS";

interface RelatorioMetricas {
  plataforma: string;
  alcance: number;
  impressoes: number;
  engajamento: number;
  clicks: number;
  cpm: number;
  cpc: number;
  conversoes: number;
  gastoTotal: number;
}

interface Cliente {
  id: string;
  nome: string;
}

const mockData: RelatorioMetricas[] = [
  { plataforma: "Facebook", alcance: 15420, impressoes: 28345, engajamento: 1250, clicks: 342, cpm: 12.50, cpc: 0.85, conversoes: 28, gastoTotal: 485.60 },
  { plataforma: "Instagram", alcance: 12890, impressoes: 22156, engajamento: 1890, clicks: 298, cpm: 8.30, cpc: 0.95, conversoes: 35, gastoTotal: 425.30 },
  { plataforma: "Google My Business", alcance: 5670, impressoes: 8945, engajamento: 456, clicks: 189, cpm: 0, cpc: 0, conversoes: 12, gastoTotal: 0 },
  { plataforma: "TikTok", alcance: 8950, impressoes: 18200, engajamento: 2340, clicks: 156, cpm: 6.80, cpc: 1.20, conversoes: 18, gastoTotal: 280.90 }
];

const engajamentoPorDia = [
  { data: "01/11", facebook: 420, instagram: 580, tiktok: 320 },
  { data: "02/11", facebook: 380, instagram: 620, tiktok: 280 },
  { data: "03/11", facebook: 450, instagram: 690, tiktok: 380 },
  { data: "04/11", facebook: 520, instagram: 750, tiktok: 420 },
  { data: "05/11", facebook: 480, instagram: 820, tiktok: 390 },
  { data: "06/11", facebook: 590, instagram: 890, tiktok: 450 },
  { data: "07/11", facebook: 640, instagram: 950, tiktok: 520 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function GRSRelatorios() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>("todos");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [relatórioData, setRelatorioData] = useState<RelatorioMetricas[]>(mockData);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Simular integração com APIs externas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Relatório Atualizado",
        description: "Dados coletados das redes sociais com sucesso!",
      });

      // Em produção, aqui seriam feitas as chamadas para as APIs:
      // - Meta Business API (Facebook/Instagram)
      // - Google My Business API
      // - TikTok Marketing API
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAlcance = relatórioData.reduce((acc, curr) => acc + curr.alcance, 0);
  const totalEngajamento = relatórioData.reduce((acc, curr) => acc + curr.engajamento, 0);
  const totalConversoes = relatórioData.reduce((acc, curr) => acc + curr.conversoes, 0);
  const totalGasto = relatórioData.reduce((acc, curr) => acc + curr.gastoTotal, 0);

  return (
    <div className="space-y-6">
      <SubMenuGRS />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Relatórios Integrados
          </h1>
          <p className="text-muted-foreground">
            Analytics unificado de todas as plataformas sociais
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Coletando...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Atualizar Dados
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={selectedCliente} onValueChange={setSelectedCliente}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Clientes</SelectItem>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          className="w-auto"
        />

        <Badge variant="outline" className="text-xs">
          Última atualização: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </Badge>
      </div>

      {/* KPIs Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlcance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +12.5% vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEngajamento.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +8.3% vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversoes}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              +23.1% vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalGasto.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ROI: {((totalConversoes * 50 / totalGasto) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engajamento por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engajamentoPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="facebook" stroke="#1877f2" strokeWidth={2} />
                <Line type="monotone" dataKey="instagram" stroke="#e4405f" strokeWidth={2} />
                <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Alcance */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Alcance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={relatórioData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="alcance"
                  label={({ plataforma, percent }) => `${plataforma}: ${(percent * 100).toFixed(0)}%`}
                >
                  {relatórioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Plataforma */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Detalhada por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Plataforma</th>
                  <th className="text-right p-2">Alcance</th>
                  <th className="text-right p-2">Impressões</th>
                  <th className="text-right p-2">Engajamento</th>
                  <th className="text-right p-2">Clicks</th>
                  <th className="text-right p-2">CPM</th>
                  <th className="text-right p-2">CPC</th>
                  <th className="text-right p-2">Conversões</th>
                  <th className="text-right p-2">Gasto Total</th>
                </tr>
              </thead>
              <tbody>
                {relatórioData.map((plataforma, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {plataforma.plataforma === 'Facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                        {plataforma.plataforma === 'Instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                        {plataforma.plataforma === 'Google My Business' && <div className="h-4 w-4 bg-green-600 rounded" />}
                        {plataforma.plataforma === 'TikTok' && <div className="h-4 w-4 bg-black rounded" />}
                        {plataforma.plataforma}
                      </div>
                    </td>
                    <td className="text-right p-2 font-medium">{plataforma.alcance.toLocaleString()}</td>
                    <td className="text-right p-2">{plataforma.impressoes.toLocaleString()}</td>
                    <td className="text-right p-2">{plataforma.engajamento.toLocaleString()}</td>
                    <td className="text-right p-2">{plataforma.clicks}</td>
                    <td className="text-right p-2">
                      {plataforma.cpm > 0 ? `R$ ${plataforma.cpm.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right p-2">
                      {plataforma.cpc > 0 ? `R$ ${plataforma.cpc.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right p-2 font-bold text-green-600">{plataforma.conversoes}</td>
                    <td className="text-right p-2 font-bold">
                      {plataforma.gastoTotal > 0 ? `R$ ${plataforma.gastoTotal.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status das Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Meta Ads</span>
              </div>
              <Badge variant="default">Conectado</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-green-600 rounded" />
                <span className="font-medium">Google My Business</span>
              </div>
              <Badge variant="default">Conectado</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-black rounded" />
                <span className="font-medium">TikTok Ads</span>
              </div>
              <Badge variant="default">Conectado</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Analytics</span>
              </div>
              <Badge variant="secondary">Configurando</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}