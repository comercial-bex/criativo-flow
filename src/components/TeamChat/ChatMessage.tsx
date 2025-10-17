import { BexAvatar, BexAvatarFallback, BexAvatarImage } from '@/components/ui/bex-avatar';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import type { ChatMessage } from '@/hooks/useTeamChat';

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  onReaction: (messageId: string, emoji: string) => void;
}

export function ChatMessage({ message, isOwn, onReaction }: ChatMessageProps) {
  const reactions = message.reactions || {};
  const reactionCounts: Record<string, number> = {};
  
  Object.values(reactions).forEach((userReactions: any) => {
    userReactions.forEach((emoji: string) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });
  });

  return (
    <div className={`flex gap-3 group ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && message.sender && (
        <BexAvatar className="h-8 w-8 flex-shrink-0">
          <BexAvatarImage src={message.sender.avatar_url} />
          <BexAvatarFallback>
            {message.sender.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </BexAvatarFallback>
        </BexAvatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && message.sender && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.nome}
          </span>
        )}

        <div className="relative">
          <div
            className={`rounded-lg p-3 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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

        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: ptBR
          })}
        </span>
      </div>

      {isOwn && message.sender && (
        <BexAvatar className="h-8 w-8 flex-shrink-0">
          <BexAvatarImage src={message.sender.avatar_url} />
          <BexAvatarFallback>
            {message.sender.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </BexAvatarFallback>
        </BexAvatar>
      )}
    </div>
  );
}
