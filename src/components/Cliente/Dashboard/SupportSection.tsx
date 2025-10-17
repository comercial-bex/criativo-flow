import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus } from "lucide-react";
import { useState } from 'react';
import { useClientTickets, ClienteTicket } from "@/hooks/useClientTickets";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportSectionProps {
  tickets: ClienteTicket[];
  clienteId: string;
}

export function SupportSection({ tickets, clienteId }: SupportSectionProps) {
  const { createTicket } = useClientTickets(clienteId);
  const [novoTicket, setNovoTicket] = useState({ assunto: '', descricao: '', categoria: 'suporte', prioridade: 'media' });
  const [criandoTicket, setCriandoTicket] = useState(false);

  const handleCriarTicket = async () => {
    if (!novoTicket.assunto || !novoTicket.descricao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const result = await createTicket(novoTicket);
    
    if (result.success) {
      toast.success("✅ Ticket criado com sucesso!");
      setNovoTicket({ assunto: '', descricao: '', categoria: 'suporte', prioridade: 'media' });
      setCriandoTicket(false);
    } else {
      toast.error("Erro ao criar ticket");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'aberto': 'bg-blue-500',
      'em_analise': 'bg-yellow-500',
      'em_espera': 'bg-orange-500',
      'resolvido': 'bg-green-500',
      'fechado': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPrioridadeVariant = (prioridade: string): "destructive" | "default" | "secondary" | "outline" => {
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      'urgente': 'destructive',
      'alta': 'default',
      'media': 'secondary',
      'baixa': 'outline'
    };
    return variants[prioridade] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Botão Criar Ticket */}
      {!criandoTicket && (
        <Button onClick={() => setCriandoTicket(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Abrir Novo Chamado
        </Button>
      )}

      {/* Formulário Novo Ticket */}
      {criandoTicket && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Chamado de Suporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assunto*</label>
              <Input
                placeholder="Ex: Dúvida sobre aprovação de posts"
                value={novoTicket.assunto}
                onChange={(e) => setNovoTicket({ ...novoTicket, assunto: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={novoTicket.categoria} onValueChange={(v) => setNovoTicket({ ...novoTicket, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suporte">Suporte Técnico</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="aprovacao">Aprovação</SelectItem>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                    <SelectItem value="reclamacao">Reclamação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Select value={novoTicket.prioridade} onValueChange={(v) => setNovoTicket({ ...novoTicket, prioridade: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição*</label>
              <Textarea
                placeholder="Descreva sua solicitação ou problema..."
                value={novoTicket.descricao}
                onChange={(e) => setNovoTicket({ ...novoTicket, descricao: e.target.value })}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCriarTicket}>Enviar Chamado</Button>
              <Button variant="outline" onClick={() => setCriandoTicket(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{ticket.assunto}</h4>
                        <Badge variant={getPrioridadeVariant(ticket.prioridade)}>
                          {ticket.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.descricao}</p>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>#{ticket.id.slice(0, 8)}</span>
                    <span>{format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tickets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum chamado aberto</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
