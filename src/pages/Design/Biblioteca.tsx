import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Palette, Upload, Image as ImageIcon, FileText, Video, Download, Trash2, Eye, Search } from "lucide-react";
import { useTutorial } from '@/hooks/useTutorial';
import { TutorialButton } from '@/components/TutorialButton';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useClientesAtivos } from "@/hooks/useClientesOptimized";

interface BrandAsset {
  id: string;
  cliente_id: string;
  tipo: string;
  nome: string;
  file_path: string;
  file_url: string | null;
  mime_type: string | null;
  tamanho_kb: number | null;
  metadata: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function DesignBiblioteca() {
  const { startTutorial, hasSeenTutorial } = useTutorial('design-biblioteca');
  const { toast } = useToast();
  const { user } = useAuth();
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<string>("todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  
  // ✅ Hook otimizado para clientes
  const { data: clientes = [] } = useClientesAtivos();
  
  // Upload state
  const [uploadData, setUploadData] = useState({
    nome: "",
    tipo: "logo",
    cliente_id: "",
    file: null as File | null
  });

  useEffect(() => {
    fetchAssets();
  }, [selectedCliente, selectedTipo]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Biblioteca] Buscando assets...');

      let query = supabase
        .from('brand_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCliente !== 'todos') {
        query = query.eq('cliente_id', selectedCliente);
      }

      if (selectedTipo !== 'todos') {
        query = query.eq('tipo', selectedTipo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAssets(data || []);
      console.log(`✅ [Biblioteca] ${data?.length || 0} assets carregados`);
    } catch (error) {
      console.error('❌ [Biblioteca] Erro:', error);
      toast({
        title: "Erro ao carregar biblioteca",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.nome || !uploadData.cliente_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, cliente e selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${uploadData.cliente_id}/${uploadData.tipo}/${Date.now()}.${fileExt}`;
      
      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, uploadData.file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Criar registro no banco
      const { error: dbError } = await supabase
        .from('brand_assets')
        .insert({
          cliente_id: uploadData.cliente_id,
          tipo: uploadData.tipo,
          nome: uploadData.nome,
          file_path: fileName,
          file_url: publicUrl,
          mime_type: uploadData.file.type,
          tamanho_kb: Math.round(uploadData.file.size / 1024),
          created_by: user?.id
        });

      if (dbError) throw dbError;

      toast({ title: "✅ Asset enviado com sucesso!" });
      setUploadDialogOpen(false);
      setUploadData({ nome: "", tipo: "logo", cliente_id: "", file: null });
      fetchAssets();
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: "Erro ao enviar arquivo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (assetId: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este asset?')) return;

    try {
      // Deletar do storage
      await supabase.storage
        .from('brand-assets')
        .remove([filePath]);

      // Deletar do banco
      const { error } = await supabase
        .from('brand_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({ title: "Asset excluído com sucesso" });
      fetchAssets();
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir asset",
        variant: "destructive"
      });
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'logo': return <Palette className="h-5 w-5" />;
      case 'template': return <FileText className="h-5 w-5" />;
      case 'imagem': return <ImageIcon className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <FolderOpen className="h-5 w-5" />;
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: assets.length,
    logos: assets.filter(a => a.tipo === 'logo').length,
    templates: assets.filter(a => a.tipo === 'template').length,
    imagens: assets.filter(a => a.tipo === 'imagem').length,
    videos: assets.filter(a => a.tipo === 'video').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            Biblioteca de Assets
          </h1>
          <p className="text-muted-foreground">Repositório de criativos, logos e templates</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome do Asset</Label>
                  <Input
                    value={uploadData.nome}
                    onChange={(e) => setUploadData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Logo Principal"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={uploadData.tipo}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="imagem">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={uploadData.cliente_id}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, cliente_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Arquivo</Label>
                  <Input
                    type="file"
                    onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    accept="image/*,video/*,.pdf,.ai,.psd"
                  />
                </div>
                <Button onClick={handleUpload} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <TutorialButton onStart={startTutorial} hasSeenTutorial={hasSeenTutorial} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Logos</p>
              <p className="text-2xl font-bold">{stats.logos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Templates</p>
              <p className="text-2xl font-bold">{stats.templates}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Imagens</p>
              <p className="text-2xl font-bold">{stats.imagens}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Vídeos</p>
              <p className="text-2xl font-bold">{stats.videos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCliente} onValueChange={setSelectedCliente}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clientes.map(cliente => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTipo} onValueChange={setSelectedTipo}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="logo">Logo</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Assets */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando biblioteca...</p>
          </CardContent>
        </Card>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum asset encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden group">
              <CardHeader className="p-0">
                <div className="aspect-square bg-muted relative">
                  {asset.mime_type?.startsWith('image/') && asset.file_url ? (
                    <img
                      src={asset.file_url}
                      alt={asset.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getIcon(asset.tipo)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {asset.file_url && (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          asChild
                        >
                          <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          asChild
                        >
                          <a href={asset.file_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(asset.id, asset.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{asset.nome}</h3>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline">{asset.tipo}</Badge>
                  {asset.tamanho_kb && (
                    <span className="text-xs text-muted-foreground">
                      {(asset.tamanho_kb / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
