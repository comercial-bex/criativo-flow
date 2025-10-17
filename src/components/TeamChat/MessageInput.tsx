import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Paperclip, Loader2, Sparkles } from 'lucide-react';
import { MentionAutocomplete } from './MentionAutocomplete';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AIQuickActions } from './AIQuickActions';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useDebounce } from '@/hooks/useDebounce';

interface MessageInputProps {
  threadId?: string;
  onSend: (content: string, mentionedUsers: string[]) => void;
  isSending: boolean;
  disabled?: boolean;
}

export function MessageInput({ threadId, onSend, isSending, disabled }: MessageInputProps) {
  const { setTyping } = useTypingIndicator(threadId);
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounce para não enviar typing a cada tecla
  const debouncedMessage = useDebounce(message, 300);
  
  useEffect(() => {
    if (message.length > 0) {
      setTyping(true);
      
      // Parar typing indicator após 3s de inatividade
      const timeout = setTimeout(() => setTyping(false), 3000);
      return () => clearTimeout(timeout);
    } else {
      setTyping(false);
    }
  }, [debouncedMessage]);

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
            placeholder={
              isSending 
                ? "Enviando mensagem..." 
                : "Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            }
            value={message}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  return;
                } else if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  handleSend();
                } else {
                  e.preventDefault();
                  handleSend();
                }
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
          {/* Quick emoji shortcuts */}
          <div className="flex gap-1 items-center">
            {['👍', '❤️', '😊', '🎉', '👏'].map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-base hover:scale-125 transition-transform"
                onClick={() => {
                  setMessage(prev => prev + emoji);
                  textareaRef.current?.focus();
                }}
                disabled={disabled || isSending}
              >
                {emoji}
              </Button>
            ))}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                disabled={disabled || isSending}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0" 
              side="top" 
              align="end"
              sideOffset={8}
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick}
                searchPlaceholder="Buscar emoji..."
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
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
