/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with different levels
 */

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Simple logger implementation
 * In production, consider using winston or similar logging library
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  /**
   * Log error messages
   */
  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, ...args));
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, ...args));
  }

  /**
   * Log info messages
   */
  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, ...args));
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  }

  /**
   * Log HTTP requests
   */
  request(method: string, path: string, ip: string, statusCode?: number): void {
    const status = statusCode ? ` - ${statusCode}` : '';
    this.info(`${method} ${path} - ${ip}${status}`);
  }

  /**
   * Log database operations
   */
  database(operation: string, collection: string, duration?: number): void {
    const time = duration ? ` (${duration}ms)` : '';
    this.debug(`DB ${operation} on ${collection}${time}`);
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, details?: any): void {
    const user = userId ? ` - User: ${userId}` : '';
    const extra = details ? ` - ${JSON.stringify(details)}` : '';
    this.info(`AUTH ${event}${user}${extra}`);
  }
}

// Export singleton instance
export const logger = new Logger();