import { useState, useEffect } from "react";
import { Plus, MapPin, User, Palette, Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AddressSearch } from "@/components/AddressSearch";
import { toast } from "@/hooks/use-toast";

interface EventFormData {
  titulo: string;
  descricao: string;
  data_inicio: Date | undefined;
  data_fim: Date | undefined;
  tipo: string;
  cor: string;
  participantes: string[];
  endereco: string;
  coordenadas?: { lat: number; lng: number };
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

const eventTypes = [
  { value: "evento", label: "Evento Geral" },
  { value: "captacao", label: "Captação" },
  { value: "deadline", label: "Deadline" },
  { value: "reuniao", label: "Reunião" }
];

const eventColors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

export function NewEventModal({ onEventCreated }: { onEventCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<EventFormData>({
    titulo: "",
    descricao: "",
    data_inicio: undefined,
    data_fim: undefined,
    tipo: "evento",
    cor: eventColors[0],
    participantes: [],
    endereco: "",
    coordenadas: undefined
  });

  // Load users for participants
  useEffect(() => {
    const fetchUsuarios = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nome, email")
        .limit(20);
      
      setUsuarios(data || []);
    };

    if (isOpen) {
      fetchUsuarios();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.data_inicio || !formData.data_fim) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, data de início e data de fim",
        variant: "destructive"
      });
      return;
    }

    if (formData.data_inicio >= formData.data_fim) {
      toast({
        title: "Datas inválidas",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("eventos_agenda")
        .insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          data_inicio: formData.data_inicio.toISOString(),
          data_fim: formData.data_fim.toISOString(),
          tipo: formData.tipo,
          cor: formData.cor,
          responsavel_id: (await supabase.auth.getUser()).data.user?.id,
          // Store additional data as JSON in a metadata column if needed
        });

      if (error) throw error;

      // Create notifications for participants
      if (selectedParticipants.length > 0) {
        const notifications = selectedParticipants.map(participantId => ({
          user_id: participantId,
          titulo: `Novo Evento: ${formData.titulo}`,
          mensagem: `Você foi convidado para o evento "${formData.titulo}" em ${format(formData.data_inicio!, "dd/MM/yyyy 'às' HH:mm")}`,
          tipo: 'info' as const,
          data_evento: formData.data_inicio!.toISOString(),
        }));

        await supabase
          .from("notificacoes")
          .insert(notifications);
      }

      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado ao calendário com sucesso"
      });

      // Reset form
      setFormData({
        titulo: "",
        descricao: "",
        data_inicio: undefined,
        data_fim: undefined,
        tipo: "evento",
        cor: eventColors[0],
        participantes: [],
        endereco: "",
        coordenadas: undefined
      });
      setSelectedParticipants([]);
      
      setIsOpen(false);
      onEventCreated?.();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "Erro ao criar evento",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const removeParticipant = (userId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== userId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>
            Adicione um novo evento ao calendário da agência
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Evento *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Reunião de planejamento"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Evento</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva os detalhes do evento..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="datetime-local"
                value={formData.data_inicio ? format(formData.data_inicio, "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFormData(prev => ({ ...prev, data_inicio: new Date(value) }));
                  }
                }}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim *</Label>
              <Input
                id="data_fim"
                type="datetime-local"
                value={formData.data_fim ? format(formData.data_fim, "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFormData(prev => ({ ...prev, data_fim: new Date(value) }));
                  }
                }}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>
              <Palette className="inline w-4 h-4 mr-1" />
              Cor do Evento
            </Label>
            <div className="flex space-x-2">
              {eventColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-gray-200",
                    formData.cor === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
                />
              ))}
            </div>
          </div>

          {/* Location with Google Maps Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="endereco">
              <MapPin className="inline w-4 h-4 mr-1" />
              Endereço/Local
            </Label>
            <AddressSearch
              value={formData.endereco}
              onAddressSelect={(address, coordinates) => {
                setFormData(prev => ({ 
                  ...prev, 
                  endereco: address,
                  coordenadas: coordinates 
                }));
              }}
              placeholder="Digite o endereço e selecione uma sugestão..."
              className="w-full"
            />
            {formData.coordenadas && (
              <div className="text-xs text-muted-foreground">
                📍 Localização: {formData.coordenadas.lat.toFixed(6)}, {formData.coordenadas.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>
              <User className="inline w-4 h-4 mr-1" />
              Participantes
            </Label>
            
            {/* Selected Participants */}
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedParticipants.map(participantId => {
                  const usuario = usuarios.find(u => u.id === participantId);
                  return usuario ? (
                    <Badge key={participantId} variant="secondary" className="flex items-center gap-1">
                      {usuario.nome}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeParticipant(participantId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Participant Selection */}
            <Card>
              <CardContent className="p-3">
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {usuarios.map(usuario => (
                    <div
                      key={usuario.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => toggleParticipant(usuario.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(usuario.id)}
                        onChange={() => toggleParticipant(usuario.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{usuario.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">({usuario.email})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}