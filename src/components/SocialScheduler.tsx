import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Send, Image, Facebook, Instagram, Linkedin } from "lucide-react";
import { useSocialIntegrations } from "@/hooks/useSocialIntegrations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SocialSchedulerProps {
  onSchedule?: (postData: any) => void;
}

export function SocialScheduler({ onSchedule }: SocialSchedulerProps) {
  const { integrations } = useSocialIntegrations();
  const [postData, setPostData] = useState({
    titulo: "",
    legenda: "",
    data_postagem: "",
    hora_postagem: "",
    platforms: [] as string[],
    formato: "post",
    anexo_url: ""
  });

  const connectedIntegrations = integrations?.filter(i => i.is_active) || [];

  const platformIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    google: Instagram
  };

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    if (checked) {
      setPostData(prev => ({
        ...prev,
        platforms: [...prev.platforms, platform]
      }));
    } else {
      setPostData(prev => ({
        ...prev,
        platforms: prev.platforms.filter(p => p !== platform)
      }));
    }
  };

  const handleSchedule = async () => {
    if (!postData.titulo || !postData.legenda || !postData.data_postagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (postData.platforms.length === 0) {
      toast.error("Selecione pelo menos uma plataforma");
      return;
    }

    try {
      const scheduledDateTime = new Date(`${postData.data_postagem}T${postData.hora_postagem}:00`);
      const now = new Date();

      // Se a data é no futuro, agendar
      if (scheduledDateTime > now) {
        const scheduledPost = {
          ...postData,
          data_hora: scheduledDateTime.toISOString(),
          status: 'agendado'
        };

        if (onSchedule) {
          onSchedule(scheduledPost);
        }

        toast.success(`Post agendado para ${postData.platforms.length} plataforma${postData.platforms.length > 1 ? 's' : ''}`);
      } else {
        // Se a data é agora ou no passado, publicar imediatamente
        toast.loading('Publicando post...', { id: 'publishing' });

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Você precisa estar logado para publicar', { id: 'publishing' });
          return;
        }

        const response = await supabase.functions.invoke('publish-social-post', {
          body: postData,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          toast.error(`Erro ao publicar: ${response.error.message}`, { id: 'publishing' });
          return;
        }

        const result = response.data;
        const successCount = result.results?.filter((r: any) => r.success).length || 0;
        
        if (successCount > 0) {
          toast.success(`Post publicado em ${successCount}/${postData.platforms.length} plataforma${postData.platforms.length > 1 ? 's' : ''}!`, { id: 'publishing' });
        } else {
          toast.error('Falha ao publicar em todas as plataformas', { id: 'publishing' });
        }
      }
      
      // Reset form
      setPostData({
        titulo: "",
        legenda: "",
        data_postagem: "",
        hora_postagem: "",
        platforms: [],
        formato: "post",
        anexo_url: ""
      });

    } catch (error) {
      console.error('Erro no agendamento/publicação:', error);
      toast.error('Erro inesperado ao processar o post');
    }
  };

  return (
    <Card data-intro="social-scheduler">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Agendamento Social
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Platforms */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Plataformas Conectadas</Label>
          {connectedIntegrations.length === 0 ? (
            <div className="p-4 border border-dashed rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma plataforma conectada. 
                <br />
                Conecte suas redes sociais para agendar posts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {connectedIntegrations.map((integration) => {
                const Icon = platformIcons[integration.provider as keyof typeof platformIcons];
                const isSelected = postData.platforms.includes(integration.provider);
                
                return (
                  <div key={integration.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={integration.provider}
                      checked={isSelected}
                      onCheckedChange={(checked) => handlePlatformToggle(integration.provider, checked as boolean)}
                    />
                    <label
                      htmlFor={integration.provider}
                      className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="capitalize">{integration.provider}</span>
                      <Badge variant="secondary" className="text-xs">
                        Ativo
                      </Badge>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Post</Label>
            <Input
              id="titulo"
              value={postData.titulo}
              onChange={(e) => setPostData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Digite o título do post..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legenda">Legenda</Label>
            <Textarea
              id="legenda"
              value={postData.legenda}
              onChange={(e) => setPostData(prev => ({ ...prev, legenda: e.target.value }))}
              placeholder="Escreva a legenda do post..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formato">Formato</Label>
              <Select
                value={postData.formato}
                onValueChange={(value) => setPostData(prev => ({ ...prev, formato: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anexo">Imagem/Vídeo (URL)</Label>
              <Input
                id="anexo"
                value={postData.anexo_url}
                onChange={(e) => setPostData(prev => ({ ...prev, anexo_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data de Publicação</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data"
                  type="date"
                  value={postData.data_postagem}
                  onChange={(e) => setPostData(prev => ({ ...prev, data_postagem: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  value={postData.hora_postagem}
                  onChange={(e) => setPostData(prev => ({ ...prev, hora_postagem: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Button */}
        <Button
          onClick={handleSchedule}
          className="w-full"
          disabled={connectedIntegrations.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          Agendar Post
        </Button>
      </CardContent>
    </Card>
  );
}