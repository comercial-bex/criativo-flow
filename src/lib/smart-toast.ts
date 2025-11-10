import { toast } from 'sonner';

export const smartToast = {
  success: (message: string, description?: string, duration?: number) => 
    toast.success(`✅ ${message}`, { description, duration }),
  
  error: (message: string, description?: string, duration?: number) => 
    toast.error(`❌ ${message}`, { description, duration }),
  
  loading: (message: string, duration?: number) => 
    toast.loading(`⏳ ${message}`, { duration }),
  
  info: (message: string, description?: string, duration?: number) => 
    toast.info(`ℹ️ ${message}`, { description, duration }),
  
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  
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
