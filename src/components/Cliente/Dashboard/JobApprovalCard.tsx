import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CreativePreviewMockup } from './CreativePreviewMockup';
import { ClientApprovalWithDetails } from '@/hooks/useClientApprovals';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  FileText, 
  Calendar,
  User,
  Hash,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JobApprovalCardProps {
  approval: ClientApprovalWithDetails;
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onApprove: () => void;
  onReject: (motivo: string) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const MOTIVOS_REPROVACAO = [
  { value: 'cores', label: '🎨 Cores inadequadas' },
  { value: 'layout', label: '📐 Layout precisa ajustes' },
  { value: 'texto', label: '✍️ Texto precisa correção' },
  { value: 'qualidade', label: '🖼️ Qualidade da imagem' },
  { value: 'briefing', label: '📋 Fora do briefing' },
  { value: 'outro', label: '💬 Outro motivo' },
];

const PRIORIDADE_COLORS = {
  alta: 'bg-red-500 text-white',
  media: 'bg-yellow-500 text-white',
  baixa: 'bg-gray-400 text-white',
};

export function JobApprovalCard({
  approval,
  currentIndex,
  total,
  onNext,
  onPrevious,
  onApprove,
  onReject,
  hasNext,
  hasPrevious,
}: JobApprovalCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [detalhesReprovacao, setDetalhesReprovacao] = useState('');

  const handleReject = () => {
    const motivo = motivoSelecionado === 'outro' 
      ? detalhesReprovacao 
      : `${MOTIVOS_REPROVACAO.find(m => m.value === motivoSelecionado)?.label || ''}\n\n${detalhesReprovacao}`;
    
    onReject(motivo);
    setShowRejectModal(false);
    setMotivoSelecionado('');
    setDetalhesReprovacao('');
  };

  const projeto = approval.projeto;
  const tarefa = approval.tarefa;
  const prioridade = projeto?.prioridade || 'media';

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header com contador */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Aprovação de Job</h2>
            <Badge variant="outline" className="text-base px-4 py-1">
              {currentIndex + 1} de {total}
            </Badge>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Coluna Esquerda - Informações */}
            <div className="p-6 space-y-6 border-r">
              {/* Projeto Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {projeto?.cliente?.logo_url && (
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={projeto.cliente.logo_url} />
                      <AvatarFallback>{projeto.cliente.nome?.[0] || 'C'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">
                      {projeto?.titulo || approval.titulo}
                    </h3>
                    {projeto?.cliente?.nome && (
                      <p className="text-sm text-muted-foreground">
                        {projeto.cliente.nome}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta informações */}
                <div className="grid grid-cols-2 gap-3">
                  {tarefa?.responsavel && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{tarefa.responsavel.nome}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-xs', PRIORIDADE_COLORS[prioridade as keyof typeof PRIORIDADE_COLORS])}>
                      Prioridade {prioridade}
                    </Badge>
                  </div>

                  {tarefa?.titulo && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tarefa.titulo}</span>
                      {tarefa.tipo && (
                        <Badge variant="outline" className="text-xs">
                          {tarefa.tipo}
                        </Badge>
                      )}
                    </div>
                  )}

                  {tarefa?.data_prazo && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(tarefa.data_prazo), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Objetivo */}
              {(approval.objetivo_postagem || approval.descricao) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Objetivo</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {approval.objetivo_postagem || approval.descricao}
                  </p>
                </div>
              )}

              {/* Legenda */}
              {approval.legenda && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Legenda</h4>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {approval.legenda}
                  </p>
                </div>
              )}

              {/* Hashtags */}
              {approval.hashtags && approval.hashtags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Hashtags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {approval.hashtags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta informações adicionais */}
              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <Badge variant="outline" className="text-xs">{approval.tipo}</Badge>
                </div>
                {approval.formato_postagem && (
                  <div className="flex justify-between">
                    <span>Formato:</span>
                    <span className="font-medium">{approval.formato_postagem}</span>
                  </div>
                )}
                {approval.rede_social && (
                  <div className="flex justify-between">
                    <span>Rede Social:</span>
                    <span className="font-medium capitalize">{approval.rede_social}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Direita - Preview */}
            <div className="p-6 flex flex-col">
              <h4 className="text-lg font-semibold mb-4">🎨 Prévia do Criativo</h4>
              
              <div className="flex-1 flex items-center justify-center">
                <CreativePreviewMockup
                  anexoUrl={approval.anexo_url}
                  anexosArray={approval.anexos_array as string[] || []}
                  clienteNome={projeto?.cliente?.nome || 'Cliente'}
                  clienteLogoUrl={projeto?.cliente?.logo_url}
                  legenda={approval.legenda || undefined}
                  redeSocial={approval.rede_social || 'instagram'}
                />
              </div>

              {/* Botões de Ação */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Reprovar
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={onApprove}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Aprovar
                </Button>
              </div>

              {/* Navegação */}
              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={onNext}
                  disabled={!hasNext}
                >
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Reprovação */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da Reprovação</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da reprovação para que o especialista possa fazer os ajustes necessários.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoria do Problema</Label>
              <Select value={motivoSelecionado} onValueChange={setMotivoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_REPROVACAO.map((motivo) => (
                    <SelectItem key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Detalhes (opcional)</Label>
              <Textarea
                placeholder="Descreva os ajustes necessários..."
                value={detalhesReprovacao}
                onChange={(e) => setDetalhesReprovacao(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!motivoSelecionado}
            >
              Confirmar Reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
