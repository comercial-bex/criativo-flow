import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link as LinkIcon, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskReferencesTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function TaskReferencesTab({ formData, setFormData }: TaskReferencesTabProps) {
  const [linkReferencia, setLinkReferencia] = useState('');
  const [capaPreview, setCapaPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCapaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapaPreview(reader.result as string);
        setFormData({ ...formData, capa_thumbnail: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const adicionarLink = () => {
    if (!linkReferencia.trim()) {
      toast({
        title: 'Link vazio',
        description: 'Digite um link antes de adicionar',
        variant: 'destructive'
      });
      return;
    }

    const referenciasAtuais = formData.referencias_visuais || [];
    const novoLink = {
      id: Date.now().toString(),
      url: linkReferencia,
      addedAt: new Date().toISOString()
    };

    setFormData({
      ...formData,
      referencias_visuais: [...referenciasAtuais, novoLink]
    });
    setLinkReferencia('');
    
    toast({
      title: 'Link adicionado',
      description: 'Referência visual adicionada com sucesso'
    });
  };

  const removerLink = (linkId: string) => {
    const referenciasAtuais = formData.referencias_visuais || [];
    setFormData({
      ...formData,
      referencias_visuais: referenciasAtuais.filter((link: any) => link.id !== linkId)
    });
  };

  const handleArquivosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const arquivosAtuais = formData.arquivos_complementares || [];
    
    const novosArquivos = files.map(file => ({
      id: Date.now().toString() + file.name,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setFormData({
      ...formData,
      arquivos_complementares: [...arquivosAtuais, ...novosArquivos]
    });

    toast({
      title: 'Arquivos adicionados',
      description: `${files.length} arquivo(s) adicionado(s)`
    });
  };

  const removerArquivo = (arquivoId: string) => {
    const arquivosAtuais = formData.arquivos_complementares || [];
    setFormData({
      ...formData,
      arquivos_complementares: arquivosAtuais.filter((arq: any) => arq.id !== arquivoId)
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Upload de Capa/Thumbnail */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Capa do Cartão / Thumbnail</Label>
        </div>
        <div className="space-y-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleCapaUpload}
            className="cursor-pointer"
          />
          {capaPreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
              <img 
                src={capaPreview} 
                alt="Preview da capa" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setCapaPreview(null);
                  setFormData({ ...formData, capa_thumbnail: null });
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            📸 Recomendado: 1080x1080px para melhor visualização
          </p>
        </div>
      </Card>

      {/* Links de Referência Visual */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Links de Referência Visual</Label>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: https://pinterest.com/pin/..."
              value={linkReferencia}
              onChange={(e) => setLinkReferencia(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarLink())}
            />
            <Button onClick={adicionarLink} size="sm">
              Adicionar
            </Button>
          </div>

          {/* Lista de Links */}
          {(formData.referencias_visuais || []).length > 0 && (
            <div className="space-y-2">
              {formData.referencias_visuais.map((link: any) => (
                <div 
                  key={link.id} 
                  className="flex items-center gap-2 p-2 bg-muted rounded-md group hover:bg-muted/80"
                >
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-primary hover:underline truncate"
                  >
                    {link.url}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removerLink(link.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Upload de Arquivos Complementares */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Arquivos Complementares</Label>
        </div>
        <div className="space-y-3">
          <Input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.svg,.pdf,.zip,.ai,.psd"
            onChange={handleArquivosUpload}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            📎 Aceita: Logos, Paletas, PDFs, ZIPs, Arquivos de Design (AI, PSD)
          </p>

          {/* Lista de Arquivos */}
          {(formData.arquivos_complementares || []).length > 0 && (
            <div className="space-y-2">
              {formData.arquivos_complementares.map((arquivo: any) => (
                <div 
                  key={arquivo.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md group hover:bg-muted/80"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{arquivo.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(arquivo.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removerArquivo(arquivo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
