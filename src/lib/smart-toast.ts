import { toast } from 'sonner';

export const smartToast = {
  success: (message: string, description?: string) => 
    toast.success(`✅ ${message}`, { description }),
  
  error: (message: string, description?: string) => 
    toast.error(`❌ ${message}`, { description }),
  
  loading: (message: string) => 
    toast.loading(`⏳ ${message}`),
  
  info: (message: string, description?: string) => 
    toast.info(`ℹ️ ${message}`, { description }),
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: `⏳ ${loading}`,
      success: (data) => `✅ ${typeof success === 'function' ? success(data) : success}`,
      error: (err) => `❌ ${typeof error === 'function' ? error(err) : error}`,
    });
  }
};
