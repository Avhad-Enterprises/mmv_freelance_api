/**
 * Structured logging for CMS operations
 * In production, integrate with Winston, Bunyan, or similar
 */

enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    action: string;
    userId?: number;
    sectionType?: string;
    itemId?: number;
    details?: any;
    error?: any;
}

class CmsLogger {
    private isDevelopment = process.env.NODE_ENV !== 'production';

    private formatLog(entry: LogEntry): string {
        return JSON.stringify({
            ...entry,
            timestamp: new Date().toISOString()
        });
    }

    private log(level: LogLevel, action: string, data: Partial<LogEntry> = {}): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            action,
            ...data
        };

        const formatted = this.formatLog(entry);

        // In development, use colored console output
        if (this.isDevelopment) {
            const color = {
                [LogLevel.INFO]: '\x1b[36m',    // Cyan
                [LogLevel.WARN]: '\x1b[33m',    // Yellow
                [LogLevel.ERROR]: '\x1b[31m',   // Red
                [LogLevel.DEBUG]: '\x1b[90m'    // Gray
            }[level];
            const reset = '\x1b[0m';
            console.log(`${color}[CMS]${reset} ${formatted}`);
        } else {
            // In production, log to stdout (captured by log aggregators)
            console.log(formatted);
        }
    }

    public info(action: string, data?: Partial<LogEntry>): void {
        this.log(LogLevel.INFO, action, data);
    }

    public warn(action: string, data?: Partial<LogEntry>): void {
        this.log(LogLevel.WARN, action, data);
    }

    public error(action: string, error: Error, data?: Partial<LogEntry>): void {
        this.log(LogLevel.ERROR, action, {
            ...data,
            error: {
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
                name: error.name
            }
        });
    }

    public debug(action: string, data?: Partial<LogEntry>): void {
        if (this.isDevelopment) {
            this.log(LogLevel.DEBUG, action, data);
        }
    }

    // Audit trail methods
    public auditCreate(sectionType: string, itemId: number, userId: number, details?: any): void {
        this.info('CREATE', { sectionType, itemId, userId, details });
    }

    public auditUpdate(sectionType: string, itemId: number, userId: number, details?: any): void {
        this.info('UPDATE', { sectionType, itemId, userId, details });
    }

    public auditDelete(sectionType: string, itemId: number, userId: number): void {
        this.info('DELETE', { sectionType, itemId, userId });
    }

    public auditReorder(sectionType: string, userId: number, count: number): void {
        this.info('REORDER', { sectionType, userId, details: { count } });
    }

    public auditAccess(sectionType: string, action: string, userId?: number): void {
        this.debug('ACCESS', { sectionType, userId, details: { action } });
    }
}

export const cmsLogger = new CmsLogger();
