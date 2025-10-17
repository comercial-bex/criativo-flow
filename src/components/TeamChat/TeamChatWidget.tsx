import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';

export function TeamChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in" 
        onClick={() => {
          setIsOpen(false);
          setSelectedThreadId(undefined);
        }}
      />
      
      {/* Chat Container */}
      <div className="fixed bottom-6 md:right-6 inset-x-6 md:inset-x-auto z-50 flex flex-row-reverse gap-4 animate-in slide-in-from-bottom-5 slide-in-from-right-5">
        {/* Chat Window */}
        {selectedThreadId && (
          <div className="w-full md:w-[380px] lg:w-[450px] animate-in slide-in-from-right-3">
            <ChatWindow
              threadId={selectedThreadId}
              onClose={() => setSelectedThreadId(undefined)}
            />
          </div>
        )}

        {/* Sidebar */}
        <div className="w-full md:w-[280px] lg:w-[320px] h-[600px] max-h-[calc(100vh-8rem)] md:max-h-[600px]">
          <ChatSidebar
            onSelectThread={setSelectedThreadId}
            selectedThreadId={selectedThreadId}
          />
        </div>
      </div>
    </>
  );
}
