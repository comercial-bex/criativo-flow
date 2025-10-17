import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ConnectionConfigDialogProps {
  connection: {
    id: string;
    name: string;
    config?: {
      endpoint?: string;
      method?: string;
      timeout?: number;
      headers?: Record<string, string>;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveConfig: (connectionId: string, config: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
}

export const ConnectionConfigDialog = ({
  connection,
  open,
  onOpenChange,
  onSaveConfig,
  isSaving = false
}: ConnectionConfigDialogProps) => {
  const [endpoint, setEndpoint] = useState(connection.config?.endpoint || '');
  const [method, setMethod] = useState(connection.config?.method || 'GET');
  const [timeout, setTimeout] = useState(connection.config?.timeout || 5000);

  const handleSave = async () => {
    await onSaveConfig(connection.id, {
      endpoint: endpoint.trim(),
      method,
      timeout: Number(timeout),
      headers: connection.config?.headers || {}
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Conexão</DialogTitle>
          <DialogDescription>
            Configure o endpoint e parâmetros para: <strong>{connection.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL *</Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="https://api.example.com/v1/endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Método HTTP</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                min="1000"
                max="30000"
                step="1000"
                value={timeout}
                onChange={(e) => setTimeout(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!endpoint.trim() || isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
