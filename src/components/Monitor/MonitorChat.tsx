import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, X, Bot, User, AlertTriangle, BookOpen } from 'lucide-react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';
import { useMonitorChat } from '@/hooks/useMonitorChat';

export function MonitorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { criticalEvents } = useSystemMonitor();
  const { messages, sendMessage, isSending } = useMonitorChat(selectedConnectionId || undefined);

  // Auto-selecionar primeiro evento crítico
  useEffect(() => {
    if (criticalEvents && criticalEvents.length > 0 && !selectedConnectionId) {
      setSelectedConnectionId(criticalEvents[0].connection_id);
      setIsOpen(true);
    }
  }, [criticalEvents, selectedConnectionId]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedConnectionId) return;
    
    sendMessage(message);
    setMessage('');
  };

  const criticalCount = criticalEvents?.length || 0;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg relative"
        >
          <MessageSquare className="h-6 w-6" />
          {criticalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center"
            >
              {criticalCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px]">
      <Card className="shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Assistente de Diagnóstico</h3>
              {criticalCount > 0 && (
                <p className="text-xs opacity-90">{criticalCount} evento(s) crítico(s)</p>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Eventos Críticos */}
        {criticalEvents && criticalEvents.length > 0 && (
          <div className="p-3 bg-destructive/10 border-b space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Eventos Recentes
            </p>
            {criticalEvents.slice(0, 3).map((event: any) => (
              <div
                key={event.id}
                className="text-xs p-2 bg-background rounded cursor-pointer hover:bg-muted"
                onClick={() => setSelectedConnectionId(event.connection_id)}
              >
                <p className="font-semibold">{event.system_connections?.name}</p>
                <p className="text-muted-foreground truncate">
                  {event.payload?.error || 'Status alterado'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Mensagens */}
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Olá! Selecione um evento crítico acima ou descreva um problema para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t space-y-2">
          <Textarea
            placeholder="Descreva o problema ou faça uma pergunta..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            disabled={!selectedConnectionId}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending || !selectedConnectionId}
              size="sm"
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Enviando...' : 'Enviar'}
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Playbooks
            </Button>
          </div>

          {!selectedConnectionId && (
            <p className="text-xs text-muted-foreground text-center">
              Selecione um evento crítico para iniciar
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
