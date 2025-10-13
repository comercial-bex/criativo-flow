import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { smartToast } from '@/lib/smart-toast';
import type { Anexo, TipoAnexo } from '@/types/tarefa';

export function useAnexos(tarefaId?: string) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const fetchAnexos = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('anexo')
        .select('*')
        .eq('tarefa_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnexos(data || []);
    } catch (error: any) {
      smartToast.error('Erro ao carregar anexos', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAnexo = useCallback(async (
    file: File,
    tarefaId: string,
    tipo: TipoAnexo,
    legenda?: string
  ) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tarefaId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      // Upload para storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('anexos-tarefas')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('anexos-tarefas')
        .getPublicUrl(fileName);

      // Criar registro no banco
      const { data: anexoData, error: dbError } = await supabase
        .from('anexo')
        .insert({
          tarefa_id: tarefaId,
          tipo: tipo,
          arquivo_url: publicUrl,
          legenda: legenda || file.name,
          versao: 1
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 1000);

      setAnexos(prev => [anexoData, ...prev]);
      smartToast.success('Anexo enviado com sucesso');
      
      return anexoData;
    } catch (error: any) {
      smartToast.error('Erro ao enviar anexo', error.message);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
      throw error;
    }
  }, []);

  const deleteAnexo = useCallback(async (anexoId: string, arquivoUrl: string) => {
    try {
      // Extrair caminho do arquivo da URL
      const url = new URL(arquivoUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // tarefa_id/filename

      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('anexos-tarefas')
        .remove([filePath]);

      if (storageError) console.warn('Erro ao deletar arquivo:', storageError);

      // Deletar registro do banco
      const { error: dbError } = await supabase
        .from('anexo')
        .delete()
        .eq('id', anexoId);

      if (dbError) throw dbError;

      setAnexos(prev => prev.filter(a => a.id !== anexoId));
      smartToast.success('Anexo removido');
    } catch (error: any) {
      smartToast.error('Erro ao remover anexo', error.message);
      throw error;
    }
  }, []);

  const downloadAnexo = useCallback(async (anexo: Anexo) => {
    try {
      const response = await fetch(anexo.arquivo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = anexo.legenda || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      smartToast.success('Download iniciado');
    } catch (error: any) {
      smartToast.error('Erro ao baixar anexo', error.message);
    }
  }, []);

  return {
    anexos,
    loading,
    uploadProgress,
    fetchAnexos,
    uploadAnexo,
    deleteAnexo,
    downloadAnexo
  };
}
