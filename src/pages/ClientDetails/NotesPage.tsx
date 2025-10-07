import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";
import { smartToast } from "@/lib/smart-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StickyNote, Plus, Trash2 } from "lucide-react";

interface Nota {
  id: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  profiles?: {
    nome: string;
  };
}

export default function NotesPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [novaNotaConteudo, setNovaNotaConteudo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConteudo, setEditConteudo] = useState("");
  
  const debouncedEditConteudo = useDebounce(editConteudo, 500);

  if (!clientId) return null;

  // Buscar notas
  const { data: notas, isLoading } = useQuery({
    queryKey: ['notas-cliente', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notas_cliente')
        .select(`
          *,
          created_by_profile:profiles!created_by(nome)
        `)
        .eq('cliente_id', clientId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data?.map(d => ({
        ...d,
        profiles: d.created_by_profile as any,
      })) as Nota[];
    },
  });

  // Criar nota
  const createMutation = useMutation({
    mutationFn: async (conteudo: string) => {
      const { error } = await supabase
        .from('notas_cliente')
        .insert({
          cliente_id: clientId,
          conteudo,
          created_by: user?.id,
        });
      
      if (error) throw error;

      // Log da criação (opcional - pode falhar se função criar_log_atividade não existir)
      try {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: clientId,
          p_usuario_id: user?.id,
          p_acao: 'insert',
          p_entidade_tipo: 'nota',
          p_entidade_id: clientId,
          p_descricao: `Nota criada: "${conteudo.substring(0, 50)}..."`,
        });
      } catch (e) {
        console.warn('Log não criado:', e);
      }
    },
    onSuccess: () => {
      smartToast.success('Nota criada com sucesso');
      setNovaNotaConteudo("");
      queryClient.invalidateQueries({ queryKey: ['notas-cliente', clientId] });
      queryClient.invalidateQueries({ queryKey: ['logs', clientId] });
    },
    onError: (error: Error) => {
      smartToast.error('Erro ao criar nota', error.message);
    },
  });

  // Atualizar nota (autosave)
  const updateMutation = useMutation({
    mutationFn: async ({ id, conteudo }: { id: string; conteudo: string }) => {
      const { error } = await supabase
        .from('notas_cliente')
        .update({
          conteudo,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;

      // Log da atualização (opcional)
      try {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: clientId,
          p_usuario_id: user?.id,
          p_acao: 'update',
          p_entidade_tipo: 'nota',
          p_entidade_id: id,
          p_descricao: `Nota atualizada`,
        });
      } catch (e) {
        console.warn('Log não criado:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-cliente', clientId] });
      queryClient.invalidateQueries({ queryKey: ['logs', clientId] });
    },
  });

  // Deletar nota
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notas_cliente')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Log da exclusão (opcional)
      try {
        await supabase.rpc('criar_log_atividade', {
          p_cliente_id: clientId,
          p_usuario_id: user?.id,
          p_acao: 'delete',
          p_entidade_tipo: 'nota',
          p_entidade_id: id,
          p_descricao: `Nota removida`,
        });
      } catch (e) {
        console.warn('Log não criado:', e);
      }
    },
    onSuccess: () => {
      smartToast.success('Nota removida');
      queryClient.invalidateQueries({ queryKey: ['notas-cliente', clientId] });
      queryClient.invalidateQueries({ queryKey: ['logs', clientId] });
    },
    onError: (error: Error) => {
      smartToast.error('Erro ao remover nota', error.message);
    },
  });

  // Autosave quando o conteúdo editado muda (debounced)
  useEffect(() => {
    if (editingId && debouncedEditConteudo) {
      updateMutation.mutate({ id: editingId, conteudo: debouncedEditConteudo });
    }
  }, [debouncedEditConteudo, editingId]);

  const handleCreateNota = () => {
    if (!novaNotaConteudo.trim()) {
      smartToast.error('Erro', 'O conteúdo da nota não pode estar vazio');
      return;
    }
    createMutation.mutate(novaNotaConteudo);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notas Internas</h2>
        <Badge variant="outline">
          {notas?.length || 0} {notas?.length === 1 ? 'nota' : 'notas'}
        </Badge>
      </div>

      {/* Nova Nota */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Nota
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={novaNotaConteudo}
            onChange={(e) => setNovaNotaConteudo(e.target.value)}
            placeholder="Digite sua nota aqui..."
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleCreateNota}
              disabled={!novaNotaConteudo.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar Nota'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notas */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando notas...</p>
        </div>
      ) : !notas || notas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma nota criada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notas.map((nota) => (
            <Card key={nota.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {nota.profiles?.nome?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{nota.profiles?.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(nota.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        {nota.updated_at !== nota.created_at && (
                          <span className="ml-2">(editado)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(nota.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {editingId === nota.id ? (
                  <Textarea
                    value={editConteudo}
                    onChange={(e) => setEditConteudo(e.target.value)}
                    onBlur={() => setEditingId(null)}
                    rows={4}
                    className="resize-none"
                    autoFocus
                  />
                ) : (
                  <p 
                    className="text-sm whitespace-pre-wrap cursor-pointer hover:bg-muted/50 p-2 rounded"
                    onClick={() => {
                      setEditingId(nota.id);
                      setEditConteudo(nota.conteudo);
                    }}
                  >
                    {nota.conteudo}
                  </p>
                )}

                {updateMutation.isPending && editingId === nota.id && (
                  <p className="text-xs text-muted-foreground mt-2">Salvando...</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
