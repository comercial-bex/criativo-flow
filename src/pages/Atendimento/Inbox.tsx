import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, AlertCircle, User, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ApprovalButtons } from "@/components/ApprovalButtons";

export default function AtendimentoInbox() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inbox de Revisões</h1>
          <p className="text-muted-foreground">Defesa do Cliente & Controle de Fluxo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Filtros
          </Button>
        </div>
      </div>

      {/* Fila de revisões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Itens A Revisar
            <Badge className="ml-2">8 pendentes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                tipo: "Post",
                titulo: "Promoção Black Friday - Tech Solutions",
                cliente: "Tech Solutions",
                origem: "GRS",
                prazo: "2 horas",
                prioridade: "alta",
                status: "em_revisao"
              },
              {
                tipo: "Vídeo",
                titulo: "Reels institucional - Fashion Store",
                cliente: "Fashion Store", 
                origem: "Produção",
                prazo: "1 dia",
                prioridade: "média",
                status: "em_revisao"
              },
              {
                tipo: "Stories",
                titulo: "Cardápio semanal - Local Café",
                cliente: "Local Café",
                origem: "Designer",
                prazo: "4 horas",
                prioridade: "baixa",
                status: "em_revisao"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    item.prioridade === 'alta' ? 'bg-red-500' :
                    item.prioridade === 'média' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.tipo}</Badge>
                      <span className="font-medium">{item.titulo}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.cliente}
                      </span>
                      <span>De: {item.origem}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prazo: {item.prazo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status as any} />
                  <ApprovalButtons
                    onApprove={() => console.log('Aprovado')}
                    onReject={(reason) => console.log('Reprovado:', reason)}
                    onRequestAdjustment={(reason) => console.log('Ajuste solicitado:', reason)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sidebar com regras do cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Regras do Cliente Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">Tom de Comunicação</h4>
              <p className="text-sm text-muted-foreground">Jovem, descontraído, use emojis</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Produtos Vetados</h4>
              <p className="text-sm text-muted-foreground">Concorrentes diretos, bebidas alcoólicas</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">CTAs Preferenciais</h4>
              <p className="text-sm text-muted-foreground">"Confira", "Saiba mais", "Acesse o link"</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Observações</h4>
              <p className="text-sm text-muted-foreground">Sempre incluir logo no canto inferior direito</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}