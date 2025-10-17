import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Plus, Search, X, Users } from 'lucide-react';
import { useTeamChat } from '@/hooks/useTeamChat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewThreadDialog } from './NewThreadDialog';

interface ChatSidebarProps {
  onSelectThread: (threadId: string) => void;
  selectedThreadId?: string;
  onClose?: () => void;
}

export function ChatSidebar({ onSelectThread, selectedThreadId, onClose }: ChatSidebarProps) {
  const { threads, loadingThreads } = useTeamChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);

  const filteredThreads = threads?.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Conversas</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowNewThread(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Thread List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingThreads ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                </div>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                {searchQuery ? (
                  <>
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Nenhuma conversa encontrada
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Tente buscar com outros termos
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Nenhuma conversa ainda
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Quando alguém iniciar uma conversa com você, ela aparecerá aqui.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowNewThread(true)}
                    >
                      Iniciar nova conversa
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const unreadCount = thread.unread_count || 0;
                
                return (
                  <button
                    key={thread.id}
                    onClick={() => onSelectThread(thread.id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-all ${
                      selectedThreadId === thread.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {thread.is_group ? (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        ) : (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={thread.participant_avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {thread.title[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* Badge de mensagens não lidas */}
                        {unreadCount > 0 && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-lg">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <p className={`text-sm truncate flex-1 ${
                            unreadCount > 0 ? 'font-bold' : 'font-medium'
                          }`}>
                            {thread.title}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(thread.last_message_at), {
                              addSuffix: false,
                              locale: ptBR
                            }).replace('cerca de ', '')}
                          </span>
                        </div>
                        
                        {/* Preview da última mensagem */}
                        <p className={`text-xs truncate ${
                          unreadCount > 0 
                            ? 'text-foreground font-medium' 
                            : 'text-muted-foreground'
                        }`}>
                          {thread.last_message_preview || 'Nenhuma mensagem ainda'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </Card>

      <NewThreadDialog
        open={showNewThread}
        onOpenChange={setShowNewThread}
        onThreadCreated={onSelectThread}
      />
    </>
  );
}
