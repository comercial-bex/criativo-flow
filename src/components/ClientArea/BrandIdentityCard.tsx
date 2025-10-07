import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, FileText, Palette } from "lucide-react";
import { smartToast } from "@/lib/smart-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandIdentityCardProps {
  clienteId: string;
}

export function BrandIdentityCard({ clienteId }: BrandIdentityCardProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: assets, isLoading } = useQuery({
    queryKey: ['brand-assets', clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: false,
  });

  const uploadAssetMutation = useMutation({
    mutationFn: async ({ file, tipo }: { file: File; tipo: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tipo}_${Date.now()}.${fileExt}`;
      const filePath = `${clienteId}/${tipo}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Save metadata
      const { error: dbError } = await supabase
        .from('brand_assets')
        .insert([{
          cliente_id: clienteId,
          tipo,
          nome: file.name,
          file_path: filePath,
          file_url: publicUrl,
          mime_type: file.type,
          tamanho_kb: Math.round(file.size / 1024),
          created_by: user.id,
        }]);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets', clienteId] });
      smartToast.success('Arquivo enviado', 'Asset adicionado com sucesso');
    },
    onError: (error) => {
      smartToast.error('Erro ao enviar', error instanceof Error ? error.message : 'Erro desconhecido');
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (asset: any) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('client-logos')
        .remove([asset.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('brand_assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets', clienteId] });
      smartToast.success('Arquivo removido', 'Asset deletado com sucesso');
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadAssetMutation.mutateAsync({ file, tipo });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const logos = assets?.filter(a => a.tipo === 'logo') || [];
  const guias = assets?.filter(a => a.tipo === 'guia_marca') || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Identidade Visual & Canais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logos */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Logos da Marca</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {logos.map(logo => (
              <div key={logo.id} className="relative group border rounded-lg p-3 bg-muted/30">
                <div className="aspect-square flex items-center justify-center mb-2">
                  <img 
                    src={logo.file_url} 
                    alt={logo.nome}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground truncate">{logo.nome}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteAssetMutation.mutate(logo)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Adicionar Logo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'logo')}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Guia de Marca */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Guia de Marca (PDF)</Label>
          <div className="space-y-2">
            {guias.map(guia => (
              <div key={guia.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{guia.nome}</p>
                  <p className="text-xs text-muted-foreground">{guia.tamanho_kb} KB</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAssetMutation.mutate(guia)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <label className="flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload Guia de Marca</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'guia_marca')}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Links Oficiais */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Links Oficiais</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Site oficial" />
            <Input placeholder="Blog / Notícias" />
            <Input placeholder="Link in Bio" />
            <Input placeholder="Loja online" />
          </div>
        </div>

        {/* Paleta de Cores & Tom de Voz */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paleta">Paleta de Cores</Label>
            <Textarea
              id="paleta"
              placeholder="#FF5733, #C70039, #900C3F"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="tom_voz">Tom de Voz</Label>
            <Textarea
              id="tom_voz"
              placeholder="Descontraído, formal, técnico..."
              rows={2}
            />
          </div>
        </div>

        {/* Concorrentes & Hashtags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="concorrentes">Concorrentes</Label>
            <Textarea
              id="concorrentes"
              placeholder="Lista de concorrentes diretos"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="hashtags">Hashtags da Marca</Label>
            <Textarea
              id="hashtags"
              placeholder="#empresa #slogan #produto"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
