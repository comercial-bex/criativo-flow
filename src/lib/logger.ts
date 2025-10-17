/**
 * Sistema de Logging Estruturado
 * Substitui console.log por logging controlado por ambiente
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data
    };
  }

  private shouldLog(level: LogLevel): boolean {
    // Em produção, só loga warn e error
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  debug(message: string, context?: string, data?: any) {
    if (!this.shouldLog('debug')) return;
    const entry = this.formatMessage('debug', message, context, data);
    console.debug(`🐛 [${entry.context || 'DEBUG'}]`, entry.message, entry.data || '');
  }

  info(message: string, context?: string, data?: any) {
    if (!this.shouldLog('info')) return;
    const entry = this.formatMessage('info', message, context, data);
    console.info(`ℹ️ [${entry.context || 'INFO'}]`, entry.message, entry.data || '');
  }

  warn(message: string, context?: string, data?: any) {
    if (!this.shouldLog('warn')) return;
    const entry = this.formatMessage('warn', message, context, data);
    console.warn(`⚠️ [${entry.context || 'WARN'}]`, entry.message, entry.data || '');
  }

  error(message: string, context?: string, data?: any) {
    if (!this.shouldLog('error')) return;
    const entry = this.formatMessage('error', message, context, data);
    console.error(`❌ [${entry.context || 'ERROR'}]`, entry.message, entry.data || '');
    
    // Em produção, enviar para serviço de monitoramento (ex: Sentry)
    if (!this.isDevelopment) {
      this.reportToMonitoring(entry);
    }
  }

  private reportToMonitoring(entry: LogEntry) {
    // Integração futura com Sentry ou similar
    // window.Sentry?.captureException(entry);
  }
}

export const logger = new Logger();
