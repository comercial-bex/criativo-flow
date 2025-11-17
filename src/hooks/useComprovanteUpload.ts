import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { smartToast } from "@/lib/smart-toast";

interface ComprovanteFile {
  file: File;
  preview: string;
  id: string;
  uploaded?: boolean;
  url?: string;
  progress?: number;
}

interface UseComprovanteUploadReturn {
  arquivos: ComprovanteFile[];
  uploading: boolean;
  adicionarArquivos: (files: File[]) => void;
  removerArquivo: (id: string) => void;
  uploadTodos: () => Promise<string[]>;
  limpar: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export function useComprovanteUpload(): UseComprovanteUploadReturn {
  const [arquivos, setArquivos] = useState<ComprovanteFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido: ${file.type}. Use JPG, PNG ou PDF.`
      };
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: 5MB.`
      };
    }

    return { valid: true };
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'application/pdf') {
        // Para PDF, usar um ícone padrão
        resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UERGPC90ZXh0Pjwvc3ZnPg==');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const adicionarArquivos = useCallback(async (files: File[]) => {
    const novosArquivos: ComprovanteFile[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        smartToast.error("Arquivo inválido", validation.error);
        continue;
      }

      const preview = await generateThumbnail(file);
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      novosArquivos.push({
        file,
        preview,
        id,
        uploaded: false,
      });
    }

    if (novosArquivos.length > 0) {
      setArquivos(prev => {
        const total = prev.length + novosArquivos.length;
        if (total > 5) {
          smartToast.error("Limite excedido", "Máximo de 5 arquivos permitidos");
          return prev;
        }
        return [...prev, ...novosArquivos];
      });
    }
  }, []);

  const removerArquivo = useCallback((id: string) => {
    setArquivos(prev => {
      const arquivo = prev.find(a => a.id === id);
      if (arquivo?.preview && arquivo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(arquivo.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const uploadTodos = useCallback(async (): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const arquivo of arquivos) {
        if (arquivo.uploaded && arquivo.url) {
          urls.push(arquivo.url);
          continue;
        }

        const fileName = `${Date.now()}_${arquivo.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `comprovantes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('comprovantes-pagamento')
          .upload(filePath, arquivo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de ${arquivo.file.name}: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes-pagamento')
          .getPublicUrl(filePath);

        urls.push(publicUrl);

        // Atualizar estado do arquivo
        setArquivos(prev => prev.map(a => 
          a.id === arquivo.id 
            ? { ...a, uploaded: true, url: publicUrl, progress: 100 }
            : a
        ));
      }

      return urls;
    } catch (error: any) {
      smartToast.error("Erro no upload", error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [arquivos]);

  const limpar = useCallback(() => {
    arquivos.forEach(arquivo => {
      if (arquivo.preview && arquivo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(arquivo.preview);
      }
    });
    setArquivos([]);
  }, [arquivos]);

  return {
    arquivos,
    uploading,
    adicionarArquivos,
    removerArquivo,
    uploadTodos,
    limpar,
  };
}
