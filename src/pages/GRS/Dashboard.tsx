import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, Clock, AlertCircle, TrendingUp, BarChart3, Plus, Send } from "lucide-react";

export default function GRSDashboard() {
  const summaryData = [
    {
      title: "Planejamentos do Mês",
      value: "12",
      icon: Calendar,
      change: "+2 desde ontem",
      color: "text-blue-600"
    },
    {
      title: "Em Aprovação do Cliente",
      value: "5",
      icon: Clock,
      change: "Aguardando feedback",
      color: "text-orange-500"
    },
    {
      title: "Reprovados com Pendência",
      value: "3",
      icon: AlertCircle,
      change: "Requer atenção",
      color: "text-red-500"
    },
    {
      title: "Prazos Esta Semana",
      value: "8",
      icon: TrendingUp,
      change: "6 entregas importantes",
      color: "text-green-600"
    }
  ];

  const clientesAtivos = [
    {
      id: 1,
      nome: "Empresa ABC",
      avatar: "EA",
      proximoMarco: "Aprovação de posts",
      status: "em_aprovacao",
      statusLabel: "Em Aprovação"
    },
    {
      id: 2,
      nome: "Tech Solutions",
      avatar: "TS",
      proximoMarco: "Criação de conteúdo",
      status: "producao",
      statusLabel: "Produção"
    },
    {
      id: 3,
      nome: "Startup XYZ",
      avatar: "SX",
      proximoMarco: "Planejamento mensal",
      status: "planejamento",
      statusLabel: "Planejamento"
    },
    {
      id: 4,
      nome: "Loja Virtual",
      avatar: "LV",
      proximoMarco: "Review final",
      status: "revisao",
      statusLabel: "Revisão"
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'em_aprovacao': return 'secondary';
      case 'producao': return 'default';
      case 'planejamento': return 'outline';
      case 'revisao': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Dashboard GRS
          </h1>
          <p className="text-muted-foreground">Gestão de Relacionamento com o Cliente</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Criar Planejamento
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Enviar para Aprovação
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meus Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Meus Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientesAtivos.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>{cliente.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{cliente.nome}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Próximo: {cliente.proximoMarco}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(cliente.status)}>
                    {cliente.statusLabel}
                  </Badge>
                  <Button size="sm">Entrar no Plano</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}