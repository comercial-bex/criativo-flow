import React, { useState } from 'react';
import { smartToast } from '@/lib/smart-toast';

interface SmartFormProps {
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
  draftKey?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function SmartForm({ 
  onSubmit, 
  children, 
  draftKey, 
  successMessage = 'Operação concluída com sucesso!',
  errorMessage = 'Ocorreu um erro ao processar a solicitação',
  onSuccess, 
  onError,
  className = "space-y-4"
}: SmartFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ⚡ ANTI-REFRESH CRÍTICO
    setLoading(true);

    try {
      await onSubmit(e);
      
      smartToast.success(successMessage);

      // Limpar draft do localStorage após sucesso
      if (draftKey) {
        localStorage.removeItem(`draft_${draftKey}`);
      }

      onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      smartToast.error('Erro', errorMsg);
      onError?.(error instanceof Error ? error : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <SmartFormContext.Provider value={{ loading }}>
        {children}
      </SmartFormContext.Provider>
    </form>
  );
}

// Context para compartilhar estado de loading com os filhos
const SmartFormContext = React.createContext<{ loading: boolean }>({ loading: false });

export function useSmartFormLoading() {
  const context = React.useContext(SmartFormContext);
  if (!context) {
    throw new Error('useSmartFormLoading must be used within SmartForm');
  }
  return context.loading;
}
