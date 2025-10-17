import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { 
  CheckCircle, 
  X,
  Calendar,
  Clock,
  Building,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AprovacaoTarefaCardProps {
  approval: any;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, motivo: string) => Promise<void>;
  processing: boolean;
}

const tipoIcons = {
  arte: <ImageIcon className="h-5 w-5" />,
  roteiro: <FileText className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  post: <MessageCircle className="h-5 w-5" />,
  captacao: <ImageIcon className="h-5 w-5" />,
  outro: <FileText className="h-5 w-5" />
};

export function AprovacaoTarefaCard({ approval, onApprove, onReject, processing }: AprovacaoTarefaCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    await onApprove(approval.id);
    setShowApproveDialog(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await onReject(approval.id, rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Conteúdo Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header do Material */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {tipoIcons[approval.tipo]}
              </div>
              <div>
                <CardTitle className="text-xl">{approval.titulo}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enviado em {format(new Date(approval.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              {approval.tipo}
            </Badge>
          </CardHeader>
        </Card>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{approval.status}</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{approval.tipo}</span>
            </div>
          </Card>
        </div>

        {/* Descrição */}
        {approval.descricao && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>📝</span>
                <span>Descrição</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">{approval.descricao}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legenda (se for post) */}
        {approval.legenda && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>💬</span>
                <span>Legenda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{approval.legenda}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hashtags */}
        {approval.hashtags && approval.hashtags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>#️⃣</span>
                <span>Hashtags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {approval.hashtags.map((hashtag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botões de Aprovação */}
        <div className="flex space-x-4">
          <Button 
            variant="destructive" 
            size="lg" 
            className="flex-1"
            onClick={() => setShowRejectDialog(true)}
            disabled={processing}
          >
            <X className="h-5 w-5 mr-2" />
            Reprovar
          </Button>
          <Button 
            size="lg" 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => setShowApproveDialog(true)}
            disabled={processing}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Aprovar
          </Button>
        </div>
      </div>

      {/* Sidebar - Prévia */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prévia do Material</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize como aparecerá nas redes sociais
            </p>
          </CardHeader>
          <CardContent>
            {approval.anexo_url ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {/* Instagram Preview */}
                  <CarouselItem>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">Instagram</h3>
                        <Badge variant="outline" className="text-xs">1080x1350</Badge>
                      </div>
                      
                      {/* Instagram Mockup */}
                      <div className="bg-black rounded-lg p-1 shadow-lg">
                        <div className="bg-white rounded-lg overflow-hidden">
                          {/* Instagram Header */}
                          <div className="flex items-center justify-between p-3 border-b">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-0.5">
                                <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                                  <Building className="h-3 w-3" />
                                </div>
                              </div>
                              <span className="text-sm font-semibold">sua_empresa</span>
                            </div>
                            <MoreHorizontal className="h-4 w-4" />
                          </div>
                          
                          {/* Instagram Image */}
                          <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                            {approval.anexo_url && (
                              <img 
                                src={approval.anexo_url} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          {/* Instagram Actions */}
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Heart className="h-6 w-6" />
                                <MessageCircle className="h-6 w-6" />
                                <Share className="h-6 w-6" />
                              </div>
                              <Bookmark className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold">1.234 curtidas</p>
                            {approval.legenda && (
                              <div className="text-sm">
                                <span className="font-semibold">sua_empresa</span>
                                <span className="ml-1">
                                  {approval.legenda.substring(0, 100)}
                                  {approval.legenda.length > 100 && '...'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Sem prévia disponível</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              {approval.anexo_url && (
                <a
                  href={approval.anexo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver Material Completo
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar este material? O solicitante será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? 'Processando...' : 'Confirmar Aprovação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar Material</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da reprovação para que a equipe possa fazer os ajustes necessários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Descreva o motivo da reprovação..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject} 
              disabled={processing || !rejectReason.trim()} 
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? 'Processando...' : 'Confirmar Reprovação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
