import { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Wrapper para lazy loading de modais pesados
 * Adiciona Suspense boundary automaticamente
 */

interface LazyModalProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

const DefaultModalSkeleton = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function LazyModal({ component, fallback, ...props }: LazyModalProps) {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback || <DefaultModalSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * HOC para transformar um modal em lazy-loadable
 */
export function withLazyModal<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return (props: P) => (
    <LazyModal component={importFn} fallback={fallback} {...props} />
  );
}
