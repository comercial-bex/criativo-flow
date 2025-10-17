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
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 flex gap-4">
      {/* Sidebar */}
      <div className="w-[320px] h-[600px]">
        <ChatSidebar
          onSelectThread={setSelectedThreadId}
          selectedThreadId={selectedThreadId}
        />
      </div>

      {/* Chat Window */}
      {selectedThreadId && (
        <div className="w-[450px]">
          <ChatWindow
            threadId={selectedThreadId}
            onClose={() => setSelectedThreadId(undefined)}
          />
        </div>
      )}
    </div>
  );
}
