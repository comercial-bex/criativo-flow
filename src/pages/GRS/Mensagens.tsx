import { useState, useEffect } from 'react';
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ApprovalButtons } from "@/components/ApprovalButtons";
import { 
  Inbox, 
  AlertCircle, 
  User, 
  Calendar, 
  MessageSquare,
  Send,
  Filter,
  Search,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ReviewItem {
  id: string;
  tipo: string;
  titulo: string;
  cliente: string;
  origem: string;
  prazo: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: string;
  data_envio: string;
  observacoes?: string;
}

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
  priority: 'alta' | 'media' | 'baixa';
}

export default function Mensagens() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'reviews' | 'messages'>('reviews');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // New message form
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'media' as 'alta' | 'media' | 'baixa'
  });

  useEffect(() => {
    fetchReviewItems();
    fetchMessages();
  }, []);

  const fetchReviewItems = async () => {
    try {
      // Mock data for now - this would be integrated with actual approval system
      const mockReviews: ReviewItem[] = [
        {
          id: '1',
          tipo: "Post",
          titulo: "Promoção Black Friday - Tech Solutions",
          cliente: "Tech Solutions",
          origem: "GRS",
          prazo: "2 horas",
          prioridade: "alta",
          status: "em_revisao",
          data_envio: new Date().toISOString()
        },
        {
          id: '2',
          tipo: "Vídeo",
          titulo: "Reels institucional - Fashion Store",
          cliente: "Fashion Store", 
          origem: "Produção",
          prazo: "1 dia",
          prioridade: "media",
          status: "em_revisao",
          data_envio: new Date().toISOString()
        },
        {
          id: '3',
          tipo: "Stories",
          titulo: "Cardápio semanal - Local Café",
          cliente: "Local Café",
          origem: "Designer",
          prazo: "4 horas",
          prioridade: "baixa",
          status: "em_revisao",
          data_envio: new Date().toISOString()
        }
      ];
      
      setReviewItems(mockReviews);
    } catch (error) {
      console.error('Erro ao carregar itens de revisão:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      // Mock data for internal messaging system
      const mockMessages: Message[] = [
        {
          id: '1',
          sender: 'Designer',
          recipient: 'GRS',
          subject: 'Dúvida sobre briefing do cliente X',
          content: 'Preciso de esclarecimentos sobre as cores da marca...',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'media'
        },
        {
          id: '2',
          sender: 'Filmmaker',
          recipient: 'GRS',
          subject: 'Material aprovado para produção',
          content: 'O roteiro foi aprovado pelo cliente, começando gravação...',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'baixa'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (itemId: string, action: 'approve' | 'reject' | 'adjust', reason?: string) => {
    console.log(`${action.toUpperCase()} item ${itemId}:`, reason);
    
    setReviewItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, status: action === 'approve' ? 'aprovado' : action === 'reject' ? 'reprovado' : 'ajuste_solicitado' }
          : item
      )
    );

    toast({
      title: `Item ${action === 'approve' ? 'aprovado' : action === 'reject' ? 'reprovado' : 'ajuste solicitado'}!`,
      description: "O status foi atualizado com sucesso.",
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: 'GRS',
      recipient: newMessage.recipient,
      subject: newMessage.subject,
      content: newMessage.content,
      created_at: new Date().toISOString(),
      read: false,
      priority: newMessage.priority
    };

    setMessages([message, ...messages]);
    setNewMessage({ recipient: '', subject: '', content: '', priority: 'media' });

    toast({
      title: "Mensagem enviada!",
      description: "Sua mensagem foi enviada com sucesso.",
    });
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredReviews = reviewItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || item.prioridade === priorityFilter;
    const matchesClient = clientFilter === 'all' || item.cliente === clientFilter;
    
    return matchesSearch && matchesPriority && matchesClient;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Mensagens & Revisões
          </h1>
          <p className="text-muted-foreground">Central de comunicação e controle de qualidade</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'reviews' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reviews')}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Revisões ({reviewItems.length})
          </Button>
          <Button 
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens ({messages.filter(m => !m.read).length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
                <SelectItem value="media">🟡 Média</SelectItem>
                <SelectItem value="baixa">🟢 Baixa</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === 'messages' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mensagem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Mensagem</DialogTitle>
                    <DialogDescription>
                      Envie uma mensagem para um departamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipient">Destinatário</Label>
                      <Select value={newMessage.recipient} onValueChange={(value) => setNewMessage({...newMessage, recipient: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o destinatário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="designer">Designer</SelectItem>
                          <SelectItem value="filmmaker">Filmmaker</SelectItem>
                          <SelectItem value="atendimento">Atendimento</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                        placeholder="Assunto da mensagem"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={newMessage.priority} onValueChange={(value: 'alta' | 'media' | 'baixa') => setNewMessage({...newMessage, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">🟢 Baixa</SelectItem>
                          <SelectItem value="media">🟡 Média</SelectItem>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Mensagem</Label>
                      <Textarea
                        id="content"
                        value={newMessage.content}
                        onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                        placeholder="Digite sua mensagem..."
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={handleSendMessage} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'reviews' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Inbox de Revisões
              <Badge className="ml-2">{filteredReviews.length} pendentes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton showHeader={false} lines={5} />
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.prioridade)}`} />
                      
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
                      <Badge variant={getPriorityBadge(item.prioridade)}>
                        {item.prioridade}
                      </Badge>
                      <ApprovalButtons
                        onApprove={() => handleApproval(item.id, 'approve')}
                        onReject={(reason) => handleApproval(item.id, 'reject', reason)}
                        onRequestAdjustment={(reason) => handleApproval(item.id, 'adjust', reason)}
                      />
                    </div>
                  </div>
                ))}
                
                {filteredReviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum item para revisão</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensagens Internas
              <Badge className="ml-2">{messages.filter(m => !m.read).length} não lidas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton showHeader={false} lines={5} />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`p-4 border rounded-lg ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{message.sender}</Badge>
                          <span className="font-medium">{message.subject}</span>
                          {!message.read && <Badge variant="destructive" className="text-xs">Nova</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString('pt-BR')} às {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant={getPriorityBadge(message.priority)}>
                        {message.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}