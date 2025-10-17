import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Smile, Clock, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import { AIAssistantMessage } from './AIAssistantMessage';
import type { ChatMessage } from '@/hooks/useTeamChat';

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  isGrouped?: boolean;
  isLastInGroup?: boolean;
}

export function ChatMessage({ message, isOwn, onReaction, isGrouped = false, isLastInGroup = true }: ChatMessageProps) {
  const reactions = message.reactions || {};
  const reactionCounts: Record<string, number> = {};
  
  Object.values(reactions).forEach((userReactions: any) => {
    userReactions.forEach((emoji: string) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });
  });

  // Detectar mensagens de IA
  const isAIMessage = message.content.includes('**Briefing Gerado**') || 
                      message.content.includes('**Roteiro Gerado**') || 
                      message.content.includes('**Conteúdo Gerado**');

  if (isAIMessage) {
    const timeAgo = formatDistanceToNow(new Date(message.created_at), {
      addSuffix: true,
      locale: ptBR
    });
    return <AIAssistantMessage content={message.content} timestamp={timeAgo} />;
  }

  return (
    <div className={`flex gap-2 group ${isOwn ? 'justify-end' : 'justify-start'} ${
      isGrouped ? 'mt-0.5' : 'mt-4'
    }`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          {!isGrouped && message.sender ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {message.sender.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && !isGrouped && message.sender && (
          <span className="text-xs text-muted-foreground mb-1 ml-2">
            {message.sender.nome}
          </span>
        )}

        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <div className="text-sm prose prose-sm max-w-none break-words [&>*]:my-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            {isLastInGroup && (
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] opacity-70">
                  {format(new Date(message.created_at), 'HH:mm')}
                </span>
                {isOwn && (
                  message.id.startsWith('temp-') ? (
                    <Clock className="h-3 w-3 opacity-70" />
                  ) : (
                    <Check className="h-3 w-3 opacity-70" />
                  )
                )}
              </div>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -bottom-2 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Smile className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <EmojiPicker 
                onEmojiClick={(emojiData) => onReaction(message.id, emojiData.emoji)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex gap-1 mt-1">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReaction(message.id, emoji)}
              >
                {emoji} {count}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isOwn && !isGrouped && message.sender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
