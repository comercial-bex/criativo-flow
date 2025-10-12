import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProdutividadeMetas } from "@/hooks/useProdutividadeMetas";
import { Target, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MetasSmartProps {
  setor: 'grs' | 'design' | 'audiovisual';
}

export function MetasSmart({ setor }: MetasSmartProps) {
  const { metas, loading, criarMeta } = useProdutividadeMetas(setor);
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleCriarMeta = async () => {
    if (!titulo || !descricao) return;
    
    await criarMeta({ titulo, descricao });
    setTitulo("");
    setDescricao("");
    setOpen(false);
  };

  const getQualidadeColor = (qualidade: number | null) => {
    if (!qualidade) return "bg-gray-500";
    if (qualidade >= 80) return "bg-green-500";
    if (qualidade >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const metasAtivas = metas.filter(m => m.status === 'ativa');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Metas SMART
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta SMART</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Aumentar produtividade em 20%"
                />
              </div>
              <div>
                <Label>Descrição Detalhada</Label>
                <Textarea 
                  value={descricao} 
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva sua meta de forma específica, mensurável, alcançável, relevante e temporal"
                  rows={4}
                />
              </div>
              <Button onClick={handleCriarMeta} className="w-full">
                Criar e Avaliar com IA
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {metasAtivas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma meta ativa. Crie sua primeira meta!
          </p>
        ) : (
          metasAtivas.map((meta) => (
            <div key={meta.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{meta.titulo}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{meta.descricao}</p>
                </div>
                {meta.qualidade_smart && (
                  <Badge variant="outline" className="ml-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {meta.qualidade_smart}%
                  </Badge>
                )}
              </div>
              <Progress 
                value={meta.progresso} 
                className={getQualidadeColor(meta.qualidade_smart)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{meta.progresso}% concluído</span>
                {meta.data_limite && (
                  <span>Até: {new Date(meta.data_limite).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
