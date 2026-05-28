import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Logger } from './logger/logger';
import { RequestContext } from './types';

export interface ServiceConfig {
  name: string;
  port: number;
  environment?: string;
}

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

export class ServiceBase {
  protected app: Express;
  protected logger: Logger;
  protected config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.logger = new Logger(config.name);
    this.app = express();

    this.setupMiddleware();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      })
    );

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });

    // Tenant context extraction
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const tenantId = req.get('X-Tenant-ID') || req.query.tenant_id;
      const userId = req.get('X-User-ID') || req.query.user_id;
      const userRole = req.get('X-User-Role');
      const sessionId = req.get('X-Session-ID');

      req.context = {
        tenantId: tenantId as string,
        userId: userId as string,
        userRole: userRole,
        sessionId: sessionId,
      };

      next();
    });

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        service: this.config.name,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        status: 404,
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      this.logger.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal Server Error',
        status: 500,
        timestamp: new Date().toISOString(),
      });
    });
  }

  protected registerRoutes(): void {
    // Override in subclasses
  }

  public async start(): Promise<void> {
    this.registerRoutes();

    return new Promise((resolve) => {
      this.app.listen(this.config.port, () => {
        this.logger.info(
          `${this.config.name} listening on port ${this.config.port}`
        );
        resolve();
      });
    });
  }

  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      data,
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  protected sendError(
    res: Response,
    error: string,
    statusCode: number = 400,
    data?: any
  ): void {
    res.status(statusCode).json({
      success: false,
      error,
      data,
      status: statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  protected requireTenant(
    req: Request,
    res: Response
  ): boolean {
    if (!req.context?.tenantId) {
      this.sendError(res, 'Tenant ID is required', 400);
      return false;
    }
    return true;
  }

  protected requireAuth(
    req: Request,
    res: Response
  ): boolean {
    if (!req.context?.userId) {
      this.sendError(res, 'Authentication required', 401);
      return false;
    }
    return true;
  }

  protected requireAdmin(
    req: Request,
    res: Response
  ): boolean {
    if (req.context?.userRole !== 'admin') {
      this.sendError(res, 'Admin access required', 403);
      return false;
    }
    return true;
  }

  public getApp(): Express {
    return this.app;
  }
}
