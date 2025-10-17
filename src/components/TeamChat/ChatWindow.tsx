import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Users } from 'lucide-react';
import { useTeamChat } from '@/hooks/useTeamChat';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { MessageInput } from './MessageInput';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  threadId: string;
  onClose: () => void;
}

export function ChatWindow({ threadId, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isSending, threads, addReaction, markAsRead } = useTeamChat(threadId);
  const { typingUsers } = useTypingIndicator(threadId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentThread = threads?.find(t => t.id === threadId);
  const typingNames = Object.values(typingUsers).map((u: any) => u.user_name);

  // Marcar como lido ao abrir
  useEffect(() => {
    markAsRead(threadId);
  }, [threadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
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
    <Card className="shadow-xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">{currentThread?.title || 'Chat'}</h3>
            <p className="text-xs opacity-90">
              {currentThread?.is_group ? 'Grupo' : '1:1'}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-primary-foreground hover:bg-white/20"
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
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              onReaction={handleReaction}
            />
          ))}
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
