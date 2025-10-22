import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Link as LinkIcon, 
  Paperclip, 
  Edit, 
  Sparkles, 
  Archive,
  TrendingUp,
  Target,
  Users,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { NotaOnboarding } from "./NotasOnboardingStep";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotaCardProps {
  nota: NotaOnboarding;
  index: number;
  onEdit: (nota: NotaOnboarding) => void;
  onArchive: (notaId: string) => void;
  onAnalyze: (nota: NotaOnboarding) => void;
}

const tipoIcons: Record<string, { icon: any; label: string; color: string }> = {
  briefing: { icon: FileText, label: "Briefing", color: "bg-blue-500/10 text-blue-500" },
  mercado: { icon: TrendingUp, label: "Mercado", color: "bg-green-500/10 text-green-500" },
  swot: { icon: Target, label: "SWOT", color: "bg-purple-500/10 text-purple-500" },
  estrategia: { icon: Lightbulb, label: "Estratégia", color: "bg-orange-500/10 text-orange-500" },
  geral: { icon: FileText, label: "Geral", color: "bg-gray-500/10 text-gray-500" },
};

export function NotaCard({ nota, index, onEdit, onArchive, onAnalyze }: NotaCardProps) {
  const tipoInfo = tipoIcons[nota.tipo_nota] || tipoIcons.geral;
  const TipoIcon = tipoInfo.icon;
  
  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return "outline";
    if (score >= 8) return "default";
    if (score >= 5) return "secondary";
    return "outline";
  };

  const hasAnalise = nota.analise_ia && Object.keys(nota.analise_ia).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card 
        variant="gaming" 
        withGlow 
        className="group hover:scale-[1.02] transition-all cursor-pointer h-full flex flex-col"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${tipoInfo.color}`}>
                <TipoIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-1">
                  {nota.titulo}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {nota.created_at && format(new Date(nota.created_at), "dd MMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            {nota.relevancia_score !== undefined && (
              <Badge variant={getScoreBadgeVariant(nota.relevancia_score)} className="shrink-0">
                {nota.relevancia_score.toFixed(1)}/10
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Conteúdo */}
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {nota.conteudo}
          </p>

          {/* Keywords */}
          {nota.keywords && nota.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nota.keywords.slice(0, 5).map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {kw}
                </Badge>
              ))}
              {nota.keywords.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{nota.keywords.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Insights Summary (se tiver análise) */}
          {hasAnalise && nota.analise_ia && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {nota.analise_ia.objetivos?.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{nota.analise_ia.objetivos.length} objetivos</span>
                </div>
              )}
              {nota.analise_ia.concorrentes?.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{nota.analise_ia.concorrentes.length} concorrentes</span>
                </div>
              )}
              {nota.analise_ia.dores?.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>{nota.analise_ia.dores.length} dores</span>
                </div>
              )}
              {nota.analise_ia.oportunidades?.length > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  <span>{nota.analise_ia.oportunidades.length} oportunidades</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {nota.link_chatgpt && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="h-8 px-2"
                >
                  <a href={nota.link_chatgpt} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              )}
              {nota.arquivo_anexo_url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="h-8 px-2"
                >
                  <a href={nota.arquivo_anexo_url} download>
                    <Paperclip className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAnalyze(nota)}
                className="h-8 px-2"
                title="Analisar com IA"
              >
                <Sparkles className={`h-3 w-3 ${hasAnalise ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(nota)}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nota.id && onArchive(nota.id)}
                className="h-8 px-2"
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}