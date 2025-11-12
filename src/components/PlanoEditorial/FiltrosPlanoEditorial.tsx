import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ChevronDown, X } from "lucide-react";

interface FiltrosPlanoEditorialProps {
  formatosSelecionados: string[];
  objetivosSelecionados: string[];
  statusSelecionados: string[];
  onFormatoChange: (formatos: string[]) => void;
  onObjetivoChange: (objetivos: string[]) => void;
  onStatusChange: (status: string[]) => void;
  onLimparTodos: () => void;
  totalPosts: number;
  totalPostsFiltrados: number;
}

const FORMATOS = [
  { value: "reels", label: "Vídeo (Reels)", icon: "🎥" },
  { value: "card", label: "Card", icon: "🖼️" },
  { value: "carrossel", label: "Carrossel", icon: "🧩" },
  { value: "motion", label: "Motion", icon: "🎞️" },
  { value: "story", label: "Story", icon: "📸" },
  { value: "post", label: "Post", icon: "📱" },
  { value: "outro", label: "Outro", icon: "📢" },
];

const TIPOS_CONTEUDO = [
  { value: "informar", label: "Informar", icon: "💡", descricao: "Trazer conhecimento" },
  { value: "inspirar", label: "Inspirar", icon: "✨", descricao: "Conexão emocional" },
  { value: "entreter", label: "Entreter", icon: "🎭", descricao: "Vínculo leve" },
  { value: "vender", label: "Vender", icon: "💰", descricao: "Gerar conversão" },
  { value: "posicionar", label: "Posicionar", icon: "🎯", descricao: "Identidade da marca" },
];

const STATUS = [
  { value: "rascunho", label: "Rascunho", icon: "📝" },
  { value: "aprovado", label: "Aprovado", icon: "✅" },
  { value: "publicado", label: "Publicado", icon: "🚀" },
  { value: "temporario", label: "Temporário", icon: "⏳" },
];

export const FiltrosPlanoEditorial: React.FC<FiltrosPlanoEditorialProps> = ({
  formatosSelecionados,
  objetivosSelecionados,
  statusSelecionados,
  onFormatoChange,
  onObjetivoChange,
  onStatusChange,
  onLimparTodos,
  totalPosts,
  totalPostsFiltrados,
}) => {
  const handleFormatoToggle = (formato: string) => {
    if (formatosSelecionados.includes(formato)) {
      onFormatoChange(formatosSelecionados.filter((f) => f !== formato));
    } else {
      onFormatoChange([...formatosSelecionados, formato]);
    }
  };

  const handleObjetivoToggle = (objetivo: string) => {
    if (objetivosSelecionados.includes(objetivo)) {
      onObjetivoChange(objetivosSelecionados.filter((o) => o !== objetivo));
    } else {
      onObjetivoChange([...objetivosSelecionados, objetivo]);
    }
  };

  const handleStatusToggle = (status: string) => {
    if (statusSelecionados.includes(status)) {
      onStatusChange(statusSelecionados.filter((s) => s !== status));
    } else {
      onStatusChange([...statusSelecionados, status]);
    }
  };

  const filtrosAtivos = formatosSelecionados.length + objetivosSelecionados.length + statusSelecionados.length;

  return (
    <div className="space-y-4 mb-6">
      {/* Botões de Filtro */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtrar por:
        </div>

        {/* Filtro de Formato */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Formato
              {formatosSelecionados.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {formatosSelecionados.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">Selecione os formatos</div>
              <div className="space-y-2">
                {FORMATOS.map((formato) => (
                  <div key={formato.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`formato-${formato.value}`}
                      checked={formatosSelecionados.includes(formato.value)}
                      onCheckedChange={() => handleFormatoToggle(formato.value)}
                    />
                    <label
                      htmlFor={`formato-${formato.value}`}
                      className="text-sm flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <span>{formato.icon}</span>
                      <span>{formato.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Conteúdo (Tipo de Conteúdo) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Conteúdo
              {objetivosSelecionados.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {objetivosSelecionados.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">Tipo de Conteúdo</div>
              <div className="space-y-2">
                {TIPOS_CONTEUDO.map((tipo) => (
                  <div key={tipo.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`conteudo-${tipo.value}`}
                      checked={objetivosSelecionados.includes(tipo.value)}
                      onCheckedChange={() => handleObjetivoToggle(tipo.value)}
                    />
                    <label
                      htmlFor={`conteudo-${tipo.value}`}
                      className="text-sm flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <span>{tipo.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{tipo.label}</span>
                        <span className="text-xs text-muted-foreground">{tipo.descricao}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Status
              {statusSelecionados.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {statusSelecionados.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">Selecione os status</div>
              <div className="space-y-2">
                {STATUS.map((status) => (
                  <div key={status.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={statusSelecionados.includes(status.value)}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-sm flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Contador de Posts */}
        <div className="ml-auto">
          <Badge variant="outline" className="text-sm">
            {totalPostsFiltrados} / {totalPosts} posts
          </Badge>
        </div>
      </div>

      {/* Chips de Filtros Ativos */}
      {filtrosAtivos > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {formatosSelecionados.map((formato) => {
            const formatoInfo = FORMATOS.find((f) => f.value === formato);
            return (
              <Badge key={formato} variant="secondary" className="gap-1.5 pr-1">
                <span>{formatoInfo?.icon}</span>
                <span>{formatoInfo?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFormatoToggle(formato)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          {objetivosSelecionados.map((conteudo) => {
            const conteudoInfo = TIPOS_CONTEUDO.find((o) => o.value === conteudo);
            return (
              <Badge key={conteudo} variant="secondary" className="gap-1.5 pr-1">
                <span>{conteudoInfo?.icon}</span>
                <span>{conteudoInfo?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleObjetivoToggle(conteudo)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          {statusSelecionados.map((status) => {
            const statusInfo = STATUS.find((s) => s.value === status);
            return (
              <Badge key={status} variant="secondary" className="gap-1.5 pr-1">
                <span>{statusInfo?.icon}</span>
                <span>{statusInfo?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleStatusToggle(status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          <Button variant="ghost" size="sm" onClick={onLimparTodos} className="text-xs">
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
};
