import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary capturou erro', 'ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // FASE 4: Detectar ChunkLoadError e auto-reload
    const isChunkError = error.message.includes('ChunkLoadError') || 
                         error.message.includes('Loading chunk') ||
                         error.message.includes('Failed to fetch dynamically imported module');

    if (isChunkError) {
      console.warn('⚠️ ChunkLoadError detectado - nova versão disponível');
      
      // Incrementar contador de falhas
      const failCount = parseInt(sessionStorage.getItem('chunk-fail-count') || '0');
      sessionStorage.setItem('chunk-fail-count', String(failCount + 1));
      
      // Se falhou mais de 2 vezes, fazer hard refresh
      if (failCount >= 2) {
        console.log('🔥 Múltiplas falhas detectadas, fazendo hard refresh');
        sessionStorage.removeItem('chunk-fail-count');
        window.location.href = window.location.origin + '?force-refresh=1';
        return;
      }
      
      // Mostrar mensagem e recarregar
      setTimeout(() => {
        console.log('🔄 Recarregando para corrigir erro de chunk...');
        window.location.reload();
      }, 2000);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // FASE 4: Mensagem específica para ChunkLoadError
      const isChunkError = this.state.error?.message.includes('ChunkLoadError') || 
                           this.state.error?.message.includes('Loading chunk') ||
                           this.state.error?.message.includes('Failed to fetch dynamically imported module');

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">
                {isChunkError ? 'Nova versão disponível' : 'Algo deu errado'}
              </h1>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {isChunkError 
                ? 'Uma nova versão do aplicativo está disponível. Recarregando automaticamente...'
                : 'Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando na correção.'
              }
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 p-4 bg-muted rounded-md">
                <summary className="cursor-pointer font-semibold text-sm mb-2">
                  Detalhes técnicos (apenas em desenvolvimento)
                </summary>
                <pre className="text-xs overflow-auto text-destructive">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <Button onClick={this.handleReset} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
