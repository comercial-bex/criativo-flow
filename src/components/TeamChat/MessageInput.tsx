import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Paperclip, Loader2, Sparkles } from 'lucide-react';
import { MentionAutocomplete } from './MentionAutocomplete';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AIQuickActions } from './AIQuickActions';

interface MessageInputProps {
  onSend: (content: string, mentionedUsers: string[]) => void;
  isSending: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSend, isSending, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Detectar @menção
    const lastWord = value.split(/\s/).pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: any) => {
    const words = message.split(/\s/);
    words[words.length - 1] = `@${user.nome} `;
    setMessage(words.join(' '));
    setMentionedUsers([...mentionedUsers, user.id]);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message, mentionedUsers);
    setMessage('');
    setMentionedUsers([]);
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative space-y-2">
      <AIQuickActions 
        onActionSelect={(content) => {
          setMessage(prev => prev ? prev + '\n\n' + content : content);
        }}
      />
      
      {showMentions && (
        <MentionAutocomplete 
          query={mentionQuery} 
          onSelect={handleMentionSelect} 
        />
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem... (@mencione alguém)"
            value={message}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            disabled={disabled || isSending}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                disabled={disabled || isSending}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon"
            disabled={disabled || isSending}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          size="sm"
          className="gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
