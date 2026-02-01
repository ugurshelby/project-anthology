/**
 * Test Logger
 * 
 * Centralized logging for test execution
 */

import { writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
}

class TestLogger {
  private logFile: string;
  private logDir: string;

  constructor() {
    this.logDir = join(process.cwd(), 'test-results', 'logs');
    mkdirSync(this.logDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = join(this.logDir, `test-log-${timestamp}.log`);
  }

  private writeLog(level: LogEntry['level'], message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    const logLine = JSON.stringify(entry) + '\n';
    appendFileSync(this.logFile, logLine, 'utf-8');

    // Also log to console with appropriate level
    const consoleMessage = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
      console.error(consoleMessage, context || '');
    } else if (level === 'warn') {
      console.warn(consoleMessage, context || '');
    } else {
      console.log(consoleMessage, context || '');
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.writeLog('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.writeLog('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.writeLog('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.writeLog('debug', message, context);
  }

  getLogFile(): string {
    return this.logFile;
  }
}

// Singleton instance
export const testLogger = new TestLogger();
