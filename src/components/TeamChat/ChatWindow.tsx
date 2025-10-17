import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Users, ArrowLeft } from 'lucide-react';
import { useTeamChat } from '@/hooks/useTeamChat';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageInput } from './MessageInput';
import { ChatMessage } from './ChatMessage';
import { format } from 'date-fns';

interface ChatWindowProps {
  threadId: string;
  onClose: () => void;
  onBack?: () => void;
}

export function ChatWindow({ threadId, onClose, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isSending, threads, addReaction, markAsRead } = useTeamChat(threadId);
  const { typingUsers } = useTypingIndicator(threadId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentThread = threads?.find(t => t.id === threadId);
  const typingNames = Object.values(typingUsers).map((u: any) => u.user_name);

  // Marcar como lido ao abrir
  useEffect(() => {
    markAsRead(threadId);
  }, [threadId, markAsRead]);

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const scrollElement = scrollRef.current;
      const isNearBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;
      
      if (isNearBottom) {
        setTimeout(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages]);

  const handleSend = (content: string, mentionedUsers: string[]) => {
    sendMessage({
      content,
      mentionedUsers
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction({ messageId, emoji });
  };

  return (
    <Card className="shadow-xl h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-primary text-primary-foreground shrink-0">
        {/* Botão voltar (mobile) */}
        {onBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="text-primary-foreground hover:bg-white/20 shrink-0 md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {/* Avatar do participante/grupo */}
        {currentThread?.is_group ? (
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
        ) : (
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={currentThread?.participant_avatar} />
            <AvatarFallback className="bg-white/20 text-primary-foreground">
              {currentThread?.title?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{currentThread?.title || 'Chat'}</h3>
          <p className="text-xs opacity-90 truncate">
            {currentThread?.is_group 
              ? `${currentThread.participant_count || currentThread.participants?.length || 0} participantes` 
              : 'Ativo agora'
            }
          </p>
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <div className="px-4 py-2 border-b bg-muted/50 text-xs text-muted-foreground animate-pulse">
          <span className="inline-flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            {typingNames.join(', ')} {typingNames.length === 1 ? 'está' : 'estão'} digitando...
          </span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-1">
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
            
            // Detectar se deve agrupar mensagens do mesmo usuário
            const isGrouped = prevMessage?.sender_id === message.sender_id;
            const isLastInGroup = nextMessage?.sender_id !== message.sender_id;
            
            // Verificar se mudou de dia
            const showDateSeparator = !prevMessage || 
              format(new Date(message.created_at), 'yyyy-MM-dd') !== 
              format(new Date(prevMessage.created_at), 'yyyy-MM-dd');
            
            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'dd/MM/yyyy')}
                    </div>
                  </div>
                )}
                <ChatMessage
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  onReaction={handleReaction}
                  isGrouped={isGrouped}
                  isLastInGroup={isLastInGroup}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <MessageInput 
          threadId={threadId}
          onSend={handleSend}
          isSending={isSending}
        />
      </div>
    </Card>
  );
}
