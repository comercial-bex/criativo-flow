import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/hooks/useAuth';
import { useTeamChat } from '@/hooks/useTeamChat';
import { useIsMobile } from '@/hooks/use-mobile';

export function TeamChatWidget() {
  const { user } = useAuth();
  const { unreadCount } = useTeamChat();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const isMobile = useIsMobile();

  if (!user) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-5">
        <div className="relative">
          <Button
            size="lg"
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform relative"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold animate-pulse shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] animate-in fade-in" 
        onClick={() => {
          setIsOpen(false);
          setSelectedThreadId(undefined);
        }}
      />
      
      {/* Chat Container */}
      <div className="fixed bottom-6 md:right-6 inset-x-6 md:inset-x-auto z-[60] animate-in slide-in-from-bottom-5 slide-in-from-right-5">
        <div className="flex flex-row-reverse gap-4">
          {/* Mobile: Mostrar APENAS conversa OU sidebar */}
          {isMobile ? (
            selectedThreadId ? (
              <div className="w-full animate-in slide-in-from-right-3 duration-200">
                <ChatWindow
                  threadId={selectedThreadId}
                  onClose={() => {
                    setIsOpen(false);
                    setSelectedThreadId(undefined);
                  }}
                  onBack={() => setSelectedThreadId(undefined)}
                />
              </div>
            ) : (
              <div className="w-full h-[600px] max-h-[calc(100vh-8rem)]">
                <ChatSidebar
                  onSelectThread={setSelectedThreadId}
                  selectedThreadId={selectedThreadId}
                  onClose={() => setIsOpen(false)}
                />
              </div>
            )
          ) : (
            // Desktop: Mostrar ambos lado a lado
            <>
              {selectedThreadId && (
                <div className="w-[380px] lg:w-[450px] animate-in slide-in-from-right-3 duration-200">
                  <ChatWindow
                    threadId={selectedThreadId}
                    onClose={() => setSelectedThreadId(undefined)}
                  />
                </div>
              )}

              <div className="w-[280px] lg:w-[320px] h-[600px]">
                <ChatSidebar
                  onSelectThread={setSelectedThreadId}
                  selectedThreadId={selectedThreadId}
                  onClose={() => setIsOpen(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
