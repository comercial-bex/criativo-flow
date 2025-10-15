import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Projeto {
  id: string;
  titulo: string;
  descricao: string | null;
  status: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  orcamento: number | null;
  responsavel_id: string | null;
}

interface EditProjetoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
  onSave: (id: string, updates: Partial<Projeto>) => Promise<boolean>;
}

export function EditProjetoModal({ open, onOpenChange, projeto, onSave }: EditProjetoModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "ativo",
    data_inicio: null as Date | null,
    data_fim: null as Date | null,
    orcamento: "",
  });

  useEffect(() => {
    if (projeto) {
      setFormData({
        titulo: projeto.titulo || "",
        descricao: projeto.descricao || "",
        status: projeto.status || "ativo",
        data_inicio: projeto.data_inicio ? new Date(projeto.data_inicio) : null,
        data_fim: projeto.data_fim ? new Date(projeto.data_fim) : null,
        orcamento: projeto.orcamento?.toString() || "",
      });
    }
  }, [projeto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projeto) return;
    
    if (!formData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const updates: Partial<Projeto> = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim() || null,
      status: formData.status,
      data_inicio: formData.data_inicio?.toISOString() || null,
      data_fim: formData.data_fim?.toISOString() || null,
      orcamento: formData.orcamento ? parseFloat(formData.orcamento) : null,
    };

    const success = await onSave(projeto.id, updates);
    
    setLoading(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Nome do projeto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o projeto..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento (R$)</Label>
              <Input
                id="orcamento"
                type="number"
                step="0.01"
                min="0"
                value={formData.orcamento}
                onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_inicio ? (
                      format(formData.data_inicio, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_inicio || undefined}
                    onSelect={(date) => setFormData({ ...formData, data_inicio: date || null })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_fim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_fim ? (
                      format(formData.data_fim, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_fim || undefined}
                    onSelect={(date) => setFormData({ ...formData, data_fim: date || null })}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
