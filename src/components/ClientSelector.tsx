import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useClientContext } from "@/hooks/useClientContext";

interface Cliente {
  id: string;
  nome: string;
  status: string;
  responsavel_id?: string;
}

interface ClientSelectorProps {
  onClientSelect: (clienteId: string | null) => void;
  selectedClientId?: string;
  showContext?: boolean;
}

export function ClientSelector({ onClientSelect, selectedClientId, showContext = true }: ClientSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { clienteId, clienteName, isInClientContext } = useClientContext();

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (isInClientContext && clienteId && !selectedClientId) {
      onClientSelect(clienteId);
    }
  }, [isInClientContext, clienteId, selectedClientId, onClientSelect]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, status, responsavel_id')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clientes.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-4">
      {/* Context Display */}
      {showContext && isInClientContext && clienteName && (
        <Card className="bg-bex-green/10 border-bex-green/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-bex-green">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Contexto Atual:</span>
              <Badge variant="secondary" className="bg-bex-green/20 text-bex-green">
                {clienteName}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Filtrar por Cliente
        </label>
        <Select 
          value={selectedClientId || "todos"} 
          onValueChange={(value) => {
            const clienteId = value === "todos" ? null : value;
            console.log('🔄 ClientSelector: selecionado', clienteId);
            onClientSelect(clienteId);
          }}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Carregando..." : "Selecione um cliente"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Todos os Clientes
              </div>
            </SelectItem>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {cliente.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Client Summary */}
      {selectedClient && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bex-green/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-bex-green" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedClient.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedClient.status}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
