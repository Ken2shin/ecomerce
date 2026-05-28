import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ServiceBase } from '../../shared/service-base';
import { cacheSet, cacheGet, cacheDel, setSession, getSession, deleteSession } from '../../shared/redis/client';
import { User, Session } from '../../shared/types';

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  tenant_id: string;
}

interface LoginRequest {
  email: string;
  password: string;
  tenant_id: string;
}

interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

// Mock user store (replace with database in production)
const users = new Map<string, User>();

class AuthService extends ServiceBase {
  constructor() {
    super({
      name: 'Auth Service',
      port: parseInt(process.env.AUTH_PORT || '3001'),
    });
  }

  protected registerRoutes(): void {
    // Register endpoint
    this.app.post('/api/auth/register', (req: Request, res: Response) =>
      this.register(req, res)
    );

    // Login endpoint
    this.app.post('/api/auth/login', (req: Request, res: Response) =>
      this.login(req, res)
    );

    // Logout endpoint
    this.app.post('/api/auth/logout', (req: Request, res: Response) =>
      this.logout(req, res)
    );

    // Verify token endpoint
    this.app.get('/api/auth/verify', (req: Request, res: Response) =>
      this.verify(req, res)
    );

    // Get user profile
    this.app.get('/api/auth/profile', (req: Request, res: Response) =>
      this.getProfile(req, res)
    );

    // Update profile
    this.app.put('/api/auth/profile', (req: Request, res: Response) =>
      this.updateProfile(req, res)
    );

    // Refresh token
    this.app.post('/api/auth/refresh', (req: Request, res: Response) =>
      this.refreshToken(req, res)
    );
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const { email, password, full_name, phone, tenant_id } = req.body as RegisterRequest;

      // Validate input
      if (!email || !password || !full_name) {
        this.sendError(res, 'Missing required fields', 400);
        return;
      }

      // Check if user exists
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === email && u.tenant_id === tenant_id
      );

      if (existingUser) {
        this.sendError(res, 'User already exists', 400);
        return;
      }

      const userId = uuidv4();
      const user: User = {
        id: userId,
        email,
        full_name,
        phone,
        password_hash: this.hashPassword(password), // Mock hash
        tenant_id,
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date(),
      };

      users.set(userId, user);

      // Cache user
      await cacheSet(`user:${userId}`, user, 3600);

      const token = this.generateToken({
        userId,
        tenantId: tenant_id,
        email,
        role: 'customer',
      });

      // Store session
      await setSession(userId, {
        token,
        tenantId: tenant_id,
        createdAt: new Date(),
      });

      this.sendSuccess(
        res,
        { user: this.sanitizeUser(user), token },
        'Registration successful',
        201
      );
    } catch (error) {
      this.logger.error('Register error:', error as Error);
      this.sendError(res, 'Registration failed', 500);
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const { email, password, tenant_id } = req.body as LoginRequest;

      if (!email || !password) {
        this.sendError(res, 'Email and password required', 400);
        return;
      }

      // Check cache first
      const cachedUser = await cacheGet<User>(`user:email:${email}`);
      let user = cachedUser;

      if (!user) {
        user = Array.from(users.values()).find(
          (u) => u.email === email && u.tenant_id === tenant_id
        );

        if (user) {
          await cacheSet(`user:email:${email}`, user, 3600);
        }
      }

      if (!user || !this.verifyPassword(password, user.password_hash)) {
        this.sendError(res, 'Invalid credentials', 401);
        return;
      }

      const token = this.generateToken({
        userId: user.id,
        tenantId: tenant_id,
        email: user.email,
        role: user.role,
      });

      // Store session
      await setSession(user.id, {
        token,
        tenantId: tenant_id,
        createdAt: new Date(),
      });

      this.sendSuccess(res, {
        user: this.sanitizeUser(user),
        token,
      });
    } catch (error) {
      this.logger.error('Login error:', error as Error);
      this.sendError(res, 'Login failed', 500);
    }
  }

  private async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const userId = req.context!.userId;
      await deleteSession(userId);

      this.sendSuccess(res, { message: 'Logged out' });
    } catch (error) {
      this.logger.error('Logout error:', error as Error);
      this.sendError(res, 'Logout failed', 500);
    }
  }

  private async verify(req: Request, res: Response): Promise<void> {
    try {
      const token = req.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        this.sendError(res, 'Token required', 401);
        return;
      }

      // In production, verify JWT signature
      const payload = this.parseToken(token);

      if (!payload) {
        this.sendError(res, 'Invalid token', 401);
        return;
      }

      // Check if session exists
      const session = await getSession(payload.userId);

      if (!session) {
        this.sendError(res, 'Session expired', 401);
        return;
      }

      const user = users.get(payload.userId);

      if (!user) {
        this.sendError(res, 'User not found', 404);
        return;
      }

      this.sendSuccess(res, {
        user: this.sanitizeUser(user),
        token,
      });
    } catch (error) {
      this.logger.error('Verify error:', error as Error);
      this.sendError(res, 'Verification failed', 500);
    }
  }

  private async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const userId = req.context!.userId;

      // Check cache first
      let user = await cacheGet<User>(`user:${userId}`);

      if (!user) {
        user = users.get(userId);

        if (user) {
          await cacheSet(`user:${userId}`, user, 3600);
        }
      }

      if (!user) {
        this.sendError(res, 'User not found', 404);
        return;
      }

      this.sendSuccess(res, this.sanitizeUser(user));
    } catch (error) {
      this.logger.error('Get profile error:', error as Error);
      this.sendError(res, 'Failed to fetch profile', 500);
    }
  }

  private async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const userId = req.context!.userId;
      const { full_name, phone } = req.body;

      let user = users.get(userId);

      if (!user) {
        this.sendError(res, 'User not found', 404);
        return;
      }

      if (full_name) user.full_name = full_name;
      if (phone) user.phone = phone;
      user.updated_at = new Date();

      users.set(userId, user);

      // Update cache
      await cacheDel(`user:${userId}`);
      await cacheSet(`user:${userId}`, user, 3600);

      this.sendSuccess(res, this.sanitizeUser(user), 'Profile updated');
    } catch (error) {
      this.logger.error('Update profile error:', error as Error);
      this.sendError(res, 'Failed to update profile', 500);
    }
  }

  private async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        this.sendError(res, 'Token required', 401);
        return;
      }

      const payload = this.parseToken(token);

      if (!payload) {
        this.sendError(res, 'Invalid token', 401);
        return;
      }

      const session = await getSession(payload.userId);

      if (!session) {
        this.sendError(res, 'Session expired', 401);
        return;
      }

      const newToken = this.generateToken(payload);

      // Update session
      await setSession(payload.userId, {
        token: newToken,
        tenantId: payload.tenantId,
        createdAt: new Date(),
      });

      this.sendSuccess(res, { token: newToken });
    } catch (error) {
      this.logger.error('Refresh token error:', error as Error);
      this.sendError(res, 'Failed to refresh token', 500);
    }
  }

  private generateToken(payload: TokenPayload): string {
    // Mock token generation (use real JWT in production)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private parseToken(token: string): TokenPayload | null {
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return null;
    }
  }

  private hashPassword(password: string): string {
    // Mock hash (use bcrypt in production)
    return Buffer.from(password).toString('base64');
  }

  private verifyPassword(password: string, hash: string): boolean {
    // Mock verify (use bcrypt in production)
    return this.hashPassword(password) === hash;
  }

  private sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

// Start service
if (require.main === module) {
  const service = new AuthService();
  service.start().catch((error) => {
    console.error('Failed to start Auth Service:', error);
    process.exit(1);
  });
}

export default AuthService;
