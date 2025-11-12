import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Save, X, Edit, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCreativeColor, getCreativeIcon, getObjetivoColor, formatarDataPorExtenso } from "@/lib/plano-editorial-helpers";

interface LinhaPostProps {
  post: any;
  index: number;
  responsaveis: any[];
  onSave: (post: any) => Promise<void>;
  onGerarLegenda: (post: any) => Promise<string>;
  onDelete?: (postId: string) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export const LinhaPost: React.FC<LinhaPostProps> = ({
  post,
  index,
  responsaveis,
  onSave,
  onGerarLegenda,
  onDelete,
  isEditing,
  setIsEditing,
}) => {
  const [editedPost, setEditedPost] = useState(post);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGerarLegenda = async () => {
    setGenerating(true);
    try {
      const legenda = await onGerarLegenda(editedPost);
      setEditedPost({ ...editedPost, legenda });
    } catch (error) {
      console.error('Erro ao gerar legenda:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPost(post);
    setIsEditing(false);
  };

  return (
    <TableRow className="hover:bg-accent/30 transition-colors">
      {/* POST # */}
      <TableCell className="font-mono text-center font-semibold">
        {String(index + 1).padStart(2, '0')}
      </TableCell>

      {/* DIA DA SEMANA */}
      <TableCell>
        {isEditing ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left text-sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {editedPost.data_postagem
                  ? formatarDataPorExtenso(editedPost.data_postagem)
                  : "Selecione..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={editedPost.data_postagem ? new Date(editedPost.data_postagem + 'T00:00:00') : undefined}
                onSelect={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setEditedPost({ ...editedPost, data_postagem: `${year}-${month}-${day}` });
                  }
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="text-sm">
            {post.data_postagem ? formatarDataPorExtenso(post.data_postagem) : '-'}
          </div>
        )}
      </TableCell>

      {/* CRIATIVO */}
      <TableCell>
        {isEditing ? (
          <Select
            value={editedPost.formato_postagem}
            onValueChange={(value) => setEditedPost({ ...editedPost, formato_postagem: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reels">🎥 Vídeo (Reels)</SelectItem>
              <SelectItem value="card">🖼️ Card</SelectItem>
              <SelectItem value="carrossel">🧩 Carrossel</SelectItem>
              <SelectItem value="motion">🎞️ Motion</SelectItem>
              <SelectItem value="story">📸 Story</SelectItem>
              <SelectItem value="post">📱 Post</SelectItem>
              <SelectItem value="outro">📢 Outro</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getCreativeColor(post.formato_postagem)}>
            {getCreativeIcon(post.formato_postagem)} {post.formato_postagem}
          </Badge>
        )}
      </TableCell>

      {/* OBJETIVO */}
      <TableCell>
        {isEditing ? (
          <Select
            value={editedPost.objetivo_postagem}
            onValueChange={(value) => setEditedPost({ ...editedPost, objetivo_postagem: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="humanizar">Humanizar</SelectItem>
              <SelectItem value="educar">Educar</SelectItem>
              <SelectItem value="resolver">Resolver</SelectItem>
              <SelectItem value="entreter">Entreter</SelectItem>
              <SelectItem value="converter">Converter</SelectItem>
              <SelectItem value="engajamento">Engajamento</SelectItem>
              <SelectItem value="awareness">Awareness</SelectItem>
              <SelectItem value="relacionamento">Relacionamento</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge className={getObjetivoColor(post.objetivo_postagem)}>
            {post.objetivo_postagem}
          </Badge>
        )}
      </TableCell>

      {/* LEGENDA */}
      <TableCell className="max-w-[300px]">
        {isEditing ? (
          <div className="relative">
            <Textarea
              value={editedPost.legenda || ''}
              onChange={(e) => setEditedPost({ ...editedPost, legenda: e.target.value })}
              placeholder="Digite ou gere sua legenda..."
              className="min-h-[80px] pr-12 text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-1 right-1"
              onClick={handleGerarLegenda}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
            </Button>
          </div>
        ) : (
          <div className="text-sm line-clamp-3">
            {post.legenda || <span className="text-muted-foreground italic">Sem legenda</span>}
          </div>
        )}
      </TableCell>

      {/* RESPONSÁVEL */}
      <TableCell>
        {isEditing ? (
          <Select
            value={editedPost.responsavel_id || ''}
            onValueChange={(value) => setEditedPost({ ...editedPost, responsavel_id: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {responsaveis.map((pessoa) => (
                <SelectItem key={pessoa.id} value={pessoa.id}>
                  {pessoa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm">
            {responsaveis.find((p) => p.id === post.responsavel_id)?.nome || '-'}
          </div>
        )}
      </TableCell>

      {/* OBSERVAÇÕES */}
      <TableCell className="max-w-[200px]">
        {isEditing ? (
          <Textarea
            value={editedPost.contexto_estrategico || ''}
            onChange={(e) => setEditedPost({ ...editedPost, contexto_estrategico: e.target.value })}
            placeholder="Análises, instruções ou feedback..."
            className="min-h-[60px] text-sm"
          />
        ) : (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {post.contexto_estrategico || '-'}
          </div>
        )}
      </TableCell>

      {/* AÇÕES */}
      <TableCell>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
