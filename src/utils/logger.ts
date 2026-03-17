/**
 * Centralized logging utility
 * - error: Always shown (critical errors)
 * - info: Always shown (normal output)
 * - debug: Only shown in dev mode (DEBUG=true or --debug flag)
 */

import chalk from 'chalk';

export enum LogLevel {
  ERROR = 'error',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private isDebugMode = false;

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    this.isDebugMode = true;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebug(): boolean {
    return this.isDebugMode;
  }

  /**
   * Log error message (always shown)
   */
  error(message: string, ...args: any[]): void {
    console.error(chalk.red(`❌ ${message}`), ...args);
  }

  /**
   * Log info message (always shown)
   */
  info(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }

  /**
   * Log success message (always shown)
   */
  success(message: string, ...args: any[]): void {
    console.log(chalk.green(message), ...args);
  }

  /**
   * Log warning message (always shown)
   */
  warn(message: string, ...args: any[]): void {
    console.log(chalk.yellow(message), ...args);
  }

  /**
   * Log debug message (only in debug mode)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDebugMode) {
      console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
    }
  }

  /**
   * Raw output without any formatting (for help text, etc.)
   */
  raw(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }

  /**
   * Log a banner
   */
  banner(title: string): void {
    this.info(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
    this.info(chalk.cyan(`║${title.padStart((61 + title.length) / 2).padEnd(61)}║`));
    this.info(chalk.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
  }

  /**
   * Log a separator
   */
  separator(char = '─', length = 40): void {
    this.info(chalk.dim(char.repeat(length)));
  }
}

// Export singleton instance
export const logger = new Logger();

// Initialize debug mode from environment
if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
  logger.enableDebug();
}
