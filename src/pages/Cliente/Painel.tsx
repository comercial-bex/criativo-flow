import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Play, DollarSign, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function ClientePainel() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Bem-vindo à sua área cliente</h1>
        <p className="text-muted-foreground">Acompanhe seus projetos e aprovações de forma simples</p>
      </div>

      {/* Cards de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Aprovar Planejamento</h3>
            <Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">2 pendentes</Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Aprovar Layouts</h3>
            <Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700">5 pendentes</Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto">
              <Play className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Aprovar Vídeos</h3>
            <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">Em dia</Badge>
            <Button className="w-full" size="sm" variant="outline">Acessar</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/50 rounded-full flex items-center justify-center mx-auto">
              <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="font-semibold">Pagamentos & Contrato</h3>
            <Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">1 vencendo</Badge>
            <Button className="w-full" size="sm">Acessar</Button>
          </CardContent>
        </Card>
      </div>

      {/* Timeline do mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Linha do Tempo - Dezembro 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium text-green-600 dark:text-green-400">✓ Já Entregue</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { tipo: "Planejamento", nome: "Calendário dezembro", data: "01/12" },
                { tipo: "Posts", nome: "5 posts promocionais", data: "05/12" },
                { tipo: "Stories", nome: "10 stories interativos", data: "08/12" }
              ].map((item, index) => (
                <div key={index} className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-xs mb-1 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">{item.tipo}</Badge>
                      <p className="font-medium text-sm text-green-800 dark:text-green-200">{item.nome}</p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">{item.data}</span>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="font-medium text-orange-600 dark:text-orange-400">⏳ Aguardando Sua Aprovação</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { tipo: "Vídeo", nome: "Reels Black Friday", data: "Há 2 dias", urgente: true },
                { tipo: "Posts", nome: "3 posts fim de ano", data: "Há 1 dia", urgente: false }
              ].map((item, index) => (
                <div key={index} className={`p-3 border rounded-lg transition-colors ${
                  item.urgente 
                    ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50' 
                    : 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className={`text-xs mb-1 ${
                        item.urgente 
                          ? 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                          : 'border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                      }`}>{item.tipo}</Badge>
                      <p className={`font-medium text-sm ${
                        item.urgente 
                          ? 'text-red-800 dark:text-red-200'
                          : 'text-orange-800 dark:text-orange-200'
                      }`}>{item.nome}</p>
                      <p className={`text-xs ${
                        item.urgente 
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>Pendente {item.data}</p>
                    </div>
                    <Button size="sm">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suporte rápido */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground">Nossa equipe está sempre disponível</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Abrir Chamado
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}