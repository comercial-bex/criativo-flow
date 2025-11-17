import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, ExternalLink, Mail, Paperclip, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmailPreviewTabProps {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent: string;
  attachmentName?: string;
  attachmentSize?: number;
  scheduledDate?: Date;
  fromName?: string;
  fromEmail?: string;
}

export function EmailPreviewTab({
  to,
  cc = [],
  bcc = [],
  subject,
  htmlContent,
  attachmentName,
  attachmentSize,
  scheduledDate,
  fromName = "Sistema",
  fromEmail = "noreply@sistema.com"
}: EmailPreviewTabProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const toArray = Array.isArray(to) ? to : [to];
  const allRecipients = [...toArray, ...cc, ...bcc];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const openInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com informações do email */}
      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">De:</span>
                <span className="text-sm text-muted-foreground">
                  {fromName} &lt;{fromEmail}&gt;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Para:</span>
                <span className="text-sm text-muted-foreground">
                  {toArray.join(', ')}
                  {toArray.length > 1 && (
                    <Badge variant="secondary" className="ml-2">
                      +{toArray.length - 1}
                    </Badge>
                  )}
                </span>
              </div>
              {cc.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CC:</span>
                  <span className="text-sm text-muted-foreground">{cc.join(', ')}</span>
                </div>
              )}
              {bcc.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CCO:</span>
                  <span className="text-sm text-muted-foreground">{bcc.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Assunto:</span>
              <span className="text-sm font-semibold">{subject}</span>
            </div>
          </div>

          {scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Calendar className="w-4 h-4" />
              <span>
                Agendado para: {format(scheduledDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}

          {attachmentName && (
            <div className="flex items-center gap-2 p-2 bg-background rounded border border-border">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{attachmentName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachmentSize)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Controles de visualização */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="desktop" className="gap-2">
              <Monitor className="w-4 h-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir em nova aba
        </Button>
      </div>

      {/* Preview do email */}
      <Card className="overflow-hidden">
        <div className={`transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
        }`}>
          <div className="bg-muted/30 p-2 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {viewMode === 'mobile' ? 'Mobile (375px)' : 'Desktop (600px)'}
            </span>
          </div>

          <div className="bg-background">
            <iframe
              srcDoc={htmlContent}
              className="w-full border-0"
              style={{
                height: '600px',
                maxHeight: '70vh'
              }}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </Card>

      {/* Informações adicionais */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{allRecipients.length} destinatário(s)</Badge>
        {attachmentName && <Badge variant="outline">1 anexo</Badge>}
        {scheduledDate && <Badge variant="outline">Agendado</Badge>}
      </div>
    </div>
  );
}
