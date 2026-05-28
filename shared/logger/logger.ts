import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    ),
  }),
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', format }),
    new winston.transports.File({ filename: 'logs/combined.log', format })
  );
}

export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.logger = winston.createLogger({
      level: logLevel,
      format,
      transports,
      defaultMeta: { service: context },
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(`[${this.context}] ${message}`, meta);
  }

  error(message: string, error?: Error | Record<string, any>): void {
    this.logger.error(`[${this.context}] ${message}`, error);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(`[${this.context}] ${message}`, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(`[${this.context}] ${message}`, meta);
  }
}
