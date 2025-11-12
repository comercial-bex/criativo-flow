import { toast as BexToast } from '@/components/BexToast';

export const smartToast = {
  success: (message: string, description?: string, duration?: number) => 
    BexToast.success(`✅ ${message}`, description, { duration }),
  
  error: (message: string, description?: string, duration?: number) => 
    BexToast.error(`❌ ${message}`, description, { duration }),
  
  loading: (message: string, duration?: number) => 
    BexToast.loading(`⏳ ${message}`, undefined, { duration }),
  
  info: (message: string, description?: string, duration?: number) => 
    BexToast.info(`ℹ️ ${message}`, description, { duration }),
  
  dismiss: (toastId?: string | number) => {
    BexToast.dismiss(String(toastId || ''));
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
    const toastId = BexToast.loading(`⏳ ${loading}`);
    
    promise
      .then((data) => {
        BexToast.dismiss(toastId);
        BexToast.success(`✅ ${typeof success === 'function' ? success(data) : success}`);
      })
      .catch((err) => {
        BexToast.dismiss(toastId);
        BexToast.error(`❌ ${typeof error === 'function' ? error(err) : error}`);
      });
    
    return promise;
  }
};
