import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ServiceBase } from '../../shared/service-base';
import { cacheSet, cacheGet, cacheDel, cachePattern, cacheClear } from '../../shared/redis/client';
import { Product, Category, PaginatedResponse } from '../../shared/types';

// Mock database
const products = new Map<string, Product>();
const categories = new Map<string, Category>();

// Sample data
function initializeSampleData(): void {
  // Categories
  const categories_data = [
    { id: '1', name: 'Shakes Clásicos', slug: 'shakes-clasicos' },
    { id: '2', name: 'Shakes Proteicos', slug: 'shakes-proteicos' },
    { id: '3', name: 'Smoothies', slug: 'smoothies' },
    { id: '4', name: 'Bebidas Heladas', slug: 'bebidas-heladas' },
  ];

  categories_data.forEach((cat) => {
    categories.set(cat.id, {
      ...cat,
      tenant_id: 'tenant-default',
      created_at: new Date(),
    } as Category);
  });

  // Products
  const products_data = [
    {
      id: uuidv4(),
      name: 'Shake de Fresa y Plátano',
      description: 'Delicioso shake hecho con fresas frescas y plátano',
      price: 4.99,
      cost: 1.50,
      sku: 'SHAKE-001',
      category_id: '1',
      stock_quantity: 100,
      status: 'active' as const,
      images: ['/images/shake-1.jpg'],
      rating: 4.8,
      review_count: 234,
    },
    {
      id: uuidv4(),
      name: 'Shake Proteico Chocolate',
      description: 'Alto en proteína con sabor a chocolate delicioso',
      price: 7.99,
      cost: 2.50,
      sku: 'SHAKE-002',
      category_id: '2',
      stock_quantity: 80,
      status: 'active' as const,
      images: ['/images/shake-2.jpg'],
      rating: 4.6,
      review_count: 189,
    },
    {
      id: uuidv4(),
      name: 'Smoothie de Mango',
      description: 'Fresco smoothie de mango tropical',
      price: 5.99,
      cost: 1.80,
      sku: 'SMOOTH-001',
      category_id: '3',
      stock_quantity: 150,
      status: 'active' as const,
      images: ['/images/smoothie-1.jpg'],
      rating: 4.7,
      review_count: 156,
    },
  ];

  products_data.forEach((prod) => {
    const product: Product = {
      ...prod,
      tenant_id: 'tenant-default',
      created_at: new Date(),
      updated_at: new Date(),
    };
    products.set(product.id, product);
  });
}

class ProductService extends ServiceBase {
  constructor() {
    super({
      name: 'Product Service',
      port: parseInt(process.env.PRODUCT_PORT || '3002'),
    });
    initializeSampleData();
  }

  protected registerRoutes(): void {
    // List products
    this.app.get('/api/products', (req: Request, res: Response) =>
      this.listProducts(req, res)
    );

    // Get product by ID
    this.app.get('/api/products/:id', (req: Request, res: Response) =>
      this.getProduct(req, res)
    );

    // Search products
    this.app.get('/api/products/search/:query', (req: Request, res: Response) =>
      this.searchProducts(req, res)
    );

    // Get categories
    this.app.get('/api/categories', (req: Request, res: Response) =>
      this.getCategories(req, res)
    );

    // Get category products
    this.app.get('/api/categories/:categoryId/products', (req: Request, res: Response) =>
      this.getCategoryProducts(req, res)
    );

    // Create product (admin)
    this.app.post('/api/products', (req: Request, res: Response) =>
      this.createProduct(req, res)
    );

    // Update product (admin)
    this.app.put('/api/products/:id', (req: Request, res: Response) =>
      this.updateProduct(req, res)
    );

    // Delete product (admin)
    this.app.delete('/api/products/:id', (req: Request, res: Response) =>
      this.deleteProduct(req, res)
    );

    // Get inventory
    this.app.get('/api/products/:id/inventory', (req: Request, res: Response) =>
      this.getInventory(req, res)
    );

    // Check stock
    this.app.post('/api/products/check-stock', (req: Request, res: Response) =>
      this.checkStock(req, res)
    );
  }

  private async listProducts(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;

      // Try cache first
      const cacheKey = `products:list:${page}:${limit}:${category || 'all'}`;
      const cached = await cacheGet<PaginatedResponse<Product>>(cacheKey);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      let filtered = Array.from(products.values()).filter((p) => p.status === 'active');

      if (category) {
        filtered = filtered.filter((p) => p.category_id === category);
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      const result: PaginatedResponse<Product> = {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };

      // Cache for 5 minutes
      await cacheSet(cacheKey, result, 300);

      this.sendSuccess(res, result);
    } catch (error) {
      this.logger.error('List products error:', error as Error);
      this.sendError(res, 'Failed to fetch products', 500);
    }
  }

  private async getProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const { id } = req.params;

      // Check cache first
      const cached = await cacheGet<Product>(`product:${id}`);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const product = products.get(id);

      if (!product) {
        this.sendError(res, 'Product not found', 404);
        return;
      }

      // Cache for 5 minutes
      await cacheSet(`product:${id}`, product, 300);

      this.sendSuccess(res, product);
    } catch (error) {
      this.logger.error('Get product error:', error as Error);
      this.sendError(res, 'Failed to fetch product', 500);
    }
  }

  private async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const { query } = req.params;

      // Check cache
      const cacheKey = `search:${query}`;
      const cached = await cacheGet<Product[]>(cacheKey);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const results = Array.from(products.values()).filter(
        (p) =>
          p.status === 'active' &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()))
      );

      // Cache for 10 minutes
      await cacheSet(cacheKey, results, 600);

      this.sendSuccess(res, results);
    } catch (error) {
      this.logger.error('Search products error:', error as Error);
      this.sendError(res, 'Search failed', 500);
    }
  }

  private async getCategories(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      // Check cache
      const cached = await cacheGet<Category[]>('categories:all');

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const categoriesList = Array.from(categories.values());

      // Cache for 1 hour
      await cacheSet('categories:all', categoriesList, 3600);

      this.sendSuccess(res, categoriesList);
    } catch (error) {
      this.logger.error('Get categories error:', error as Error);
      this.sendError(res, 'Failed to fetch categories', 500);
    }
  }

  private async getCategoryProducts(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireTenant(req, res)) return;

      const { categoryId } = req.params;

      // Check cache
      const cacheKey = `category:${categoryId}:products`;
      const cached = await cacheGet<Product[]>(cacheKey);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const categoryProducts = Array.from(products.values()).filter(
        (p) => p.category_id === categoryId && p.status === 'active'
      );

      // Cache for 5 minutes
      await cacheSet(cacheKey, categoryProducts, 300);

      this.sendSuccess(res, categoryProducts);
    } catch (error) {
      this.logger.error('Get category products error:', error as Error);
      this.sendError(res, 'Failed to fetch category products', 500);
    }
  }

  private async createProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;
      if (!this.requireAdmin(req, res)) return;

      const { name, description, price, cost, sku, category_id, stock_quantity } =
        req.body;

      if (!name || !price || !category_id) {
        this.sendError(res, 'Missing required fields', 400);
        return;
      }

      const product: Product = {
        id: uuidv4(),
        name,
        description,
        price,
        cost,
        sku: sku || uuidv4(),
        category_id,
        stock_quantity: stock_quantity || 0,
        status: 'active',
        images: [],
        rating: 0,
        review_count: 0,
        tenant_id: req.context!.tenantId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      products.set(product.id, product);

      // Invalidate cache
      await cacheClear('products:*');
      await cacheClear('category:*');

      this.sendSuccess(res, product, 'Product created', 201);
    } catch (error) {
      this.logger.error('Create product error:', error as Error);
      this.sendError(res, 'Failed to create product', 500);
    }
  }

  private async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;
      if (!this.requireAdmin(req, res)) return;

      const { id } = req.params;
      const updates = req.body;

      let product = products.get(id);

      if (!product) {
        this.sendError(res, 'Product not found', 404);
        return;
      }

      product = { ...product, ...updates, updated_at: new Date() };
      products.set(id, product);

      // Invalidate cache
      await cacheDel(`product:${id}`);
      await cacheClear('products:*');

      this.sendSuccess(res, product, 'Product updated');
    } catch (error) {
      this.logger.error('Update product error:', error as Error);
      this.sendError(res, 'Failed to update product', 500);
    }
  }

  private async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;
      if (!this.requireAdmin(req, res)) return;

      const { id } = req.params;

      if (!products.has(id)) {
        this.sendError(res, 'Product not found', 404);
        return;
      }

      const product = products.get(id)!;
      product.status = 'discontinued';
      products.set(id, product);

      // Invalidate cache
      await cacheDel(`product:${id}`);
      await cacheClear('products:*');

      this.sendSuccess(res, { message: 'Product deleted' });
    } catch (error) {
      this.logger.error('Delete product error:', error as Error);
      this.sendError(res, 'Failed to delete product', 500);
    }
  }

  private async getInventory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = products.get(id);

      if (!product) {
        this.sendError(res, 'Product not found', 404);
        return;
      }

      this.sendSuccess(res, {
        product_id: id,
        quantity: product.stock_quantity,
        status: product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
      });
    } catch (error) {
      this.logger.error('Get inventory error:', error as Error);
      this.sendError(res, 'Failed to fetch inventory', 500);
    }
  }

  private async checkStock(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body as { items: Array<{ product_id: string; quantity: number }> };

      if (!Array.isArray(items)) {
        this.sendError(res, 'Items array required', 400);
        return;
      }

      const availability = items.map((item) => {
        const product = products.get(item.product_id);
        return {
          product_id: item.product_id,
          requested: item.quantity,
          available: product?.stock_quantity || 0,
          in_stock: !product || product.stock_quantity >= item.quantity,
        };
      });

      this.sendSuccess(res, { items: availability });
    } catch (error) {
      this.logger.error('Check stock error:', error as Error);
      this.sendError(res, 'Failed to check stock', 500);
    }
  }
}

// Start service
if (require.main === module) {
  const service = new ProductService();
  service.start().catch((error) => {
    console.error('Failed to start Product Service:', error);
    process.exit(1);
  });
}

export default ProductService;
