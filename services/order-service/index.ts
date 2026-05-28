import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ServiceBase } from '../../shared/service-base';
import { checkoutMutex, inventoryMutex } from '../../shared/mutex/redlock';
import { cacheSet, cacheGet, cacheDel } from '../../shared/redis/client';
import { Order, OrderStatus, PaymentStatus } from '../../shared/types';
import axios from 'axios';

interface CreateOrderRequest {
  user_id: string;
  items: Array<{ product_id: string; quantity: number; price: number }>;
  shipping_address: any;
  billing_address?: any;
  payment_method: string;
}

interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

// Mock order store
const orders = new Map<string, Order>();

class OrderService extends ServiceBase {
  constructor() {
    super({
      name: 'Order Service',
      port: parseInt(process.env.ORDER_PORT || '3004'),
    });
  }

  protected registerRoutes(): void {
    // Create order (with Mutex to prevent race conditions)
    this.app.post('/api/orders', (req: Request, res: Response) =>
      this.createOrder(req, res)
    );

    // Get order by ID
    this.app.get('/api/orders/:id', (req: Request, res: Response) =>
      this.getOrder(req, res)
    );

    // Get user orders
    this.app.get('/api/orders/user/:userId', (req: Request, res: Response) =>
      this.getUserOrders(req, res)
    );

    // Update order status
    this.app.put('/api/orders/:id/status', (req: Request, res: Response) =>
      this.updateOrderStatus(req, res)
    );

    // Cancel order
    this.app.post('/api/orders/:id/cancel', (req: Request, res: Response) =>
      this.cancelOrder(req, res)
    );

    // Get order analytics
    this.app.get('/api/orders/analytics/summary', (req: Request, res: Response) =>
      this.getOrderAnalytics(req, res)
    );
  }

  /**
   * Create order with distributed Mutex lock
   * Prevents race conditions on inventory and payment processing
   */
  private async createOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;
      if (!this.requireTenant(req, res)) return;

      const { user_id, items, shipping_address, billing_address, payment_method } =
        req.body as CreateOrderRequest;

      if (!items || items.length === 0) {
        this.sendError(res, 'Items required', 400);
        return;
      }

      const userId = req.context!.userId;
      const tenantId = req.context!.tenantId;

      // CRITICAL: Use Mutex lock to prevent concurrent checkout race conditions
      // This ensures only one checkout per user at a time
      try {
        await checkoutMutex(userId, async () => {
          // 1. Validate inventory (with inventory-specific locks)
          const inventoryCheck = await this.validateAndReserveInventory(items);

          if (!inventoryCheck.success) {
            throw new Error(inventoryCheck.error);
          }

          // 2. Calculate totals
          const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const tax = subtotal * 0.1; // 10% tax
          const shipping_cost = 5.0;
          const total = subtotal + tax + shipping_cost;

          // 3. Create order
          const orderId = uuidv4();
          const order: Order = {
            id: orderId,
            user_id: userId,
            tenant_id: tenantId,
            items: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
              product_name: `Product ${item.product_id}`, // In production, fetch from product service
            })),
            subtotal,
            tax,
            shipping_cost,
            total,
            status: 'pending',
            payment_status: 'pending',
            shipping_address,
            billing_address: billing_address || shipping_address,
            payment_method: payment_method as any,
            created_at: new Date(),
            updated_at: new Date(),
          };

          // 4. Process payment (call payment service)
          try {
            const paymentResult = await this.processPayment(order, payment_method);

            if (paymentResult.success) {
              order.payment_status = 'completed';
              order.status = 'confirmed';
            } else {
              order.payment_status = 'failed';
              order.status = 'cancelled';
              // Release inventory reservation
              await this.releaseInventoryReservation(items);
              throw new Error('Payment failed');
            }
          } catch (error) {
            order.payment_status = 'failed';
            order.status = 'cancelled';
            await this.releaseInventoryReservation(items);
            throw error;
          }

          // 5. Store order
          orders.set(orderId, order);

          // 6. Cache order
          await cacheSet(`order:${orderId}`, order, 3600);

          // Return success
          this.sendSuccess(
            res,
            {
              order_id: orderId,
              status: order.status,
              payment_status: order.payment_status,
              total: order.total,
            },
            'Order created successfully',
            201
          );
        });
      } catch (lockError) {
        this.logger.error('Checkout lock failed:', lockError as Error);
        this.sendError(res, 'Another transaction is in progress. Please try again.', 409);
      }
    } catch (error) {
      this.logger.error('Create order error:', error as Error);
      this.sendError(res, 'Failed to create order', 500);
    }
  }

  private async validateAndReserveInventory(
    items: Array<{ product_id: string; quantity: number }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check stock via product service
      const response = await axios.post(
        `${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'}/api/products/check-stock`,
        { items }
      );

      const { items: availability } = response.data.data;

      // Verify all items are in stock
      const allInStock = availability.every((item: any) => item.in_stock);

      if (!allInStock) {
        const outOfStock = availability
          .filter((item: any) => !item.in_stock)
          .map((item: any) => item.product_id)
          .join(', ');

        return {
          success: false,
          error: `Out of stock: ${outOfStock}`,
        };
      }

      // In production, would decrement inventory here atomically
      // For now, we simulate successful reservation
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Inventory check failed',
      };
    }
  }

  private async releaseInventoryReservation(
    items: Array<{ product_id: string; quantity: number }>
  ): Promise<void> {
    // In production, would release inventory reservation
    this.logger.info('Inventory reservation released');
  }

  private async processPayment(
    order: Order,
    paymentMethod: string
  ): Promise<{ success: boolean; transactionId?: string }> {
    try {
      // Call payment service
      const response = await axios.post(
        `${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005'}/api/payments`,
        {
          order_id: order.id,
          amount: order.total,
          currency: 'USD',
          method: paymentMethod,
          tenant_id: order.tenant_id,
        },
        {
          headers: {
            'X-Tenant-ID': order.tenant_id,
          },
        }
      );

      return {
        success: response.data.success,
        transactionId: response.data.data?.transaction_id,
      };
    } catch (error) {
      this.logger.error('Payment processing error:', error as Error);
      return { success: false };
    }
  }

  private async getOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const { id } = req.params;

      // Check cache first
      const cached = await cacheGet<Order>(`order:${id}`);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const order = orders.get(id);

      if (!order) {
        this.sendError(res, 'Order not found', 404);
        return;
      }

      // Verify user owns order
      if (order.user_id !== req.context!.userId) {
        this.sendError(res, 'Unauthorized', 403);
        return;
      }

      await cacheSet(`order:${id}`, order, 3600);

      this.sendSuccess(res, order);
    } catch (error) {
      this.logger.error('Get order error:', error as Error);
      this.sendError(res, 'Failed to fetch order', 500);
    }
  }

  private async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Verify user
      if (userId !== req.context!.userId) {
        this.sendError(res, 'Unauthorized', 403);
        return;
      }

      const cacheKey = `user:${userId}:orders:${page}`;
      const cached = await cacheGet<any>(cacheKey);

      if (cached) {
        this.sendSuccess(res, cached);
        return;
      }

      const userOrders = Array.from(orders.values())
        .filter((o) => o.user_id === userId)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      const total = userOrders.length;
      const start = (page - 1) * limit;
      const data = userOrders.slice(start, start + limit);

      const result = {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };

      await cacheSet(cacheKey, result, 300);

      this.sendSuccess(res, result);
    } catch (error) {
      this.logger.error('Get user orders error:', error as Error);
      this.sendError(res, 'Failed to fetch orders', 500);
    }
  }

  private async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;
      if (!this.requireAdmin(req, res)) return;

      const { id } = req.params;
      const { status, notes } = req.body as UpdateOrderStatusRequest;

      const order = orders.get(id);

      if (!order) {
        this.sendError(res, 'Order not found', 404);
        return;
      }

      order.status = status;
      if (notes) order.notes = notes;
      order.updated_at = new Date();

      orders.set(id, order);

      await cacheDel(`order:${id}`);
      await cacheSet(`order:${id}`, order, 3600);

      this.sendSuccess(res, order, 'Order status updated');
    } catch (error) {
      this.logger.error('Update order status error:', error as Error);
      this.sendError(res, 'Failed to update order status', 500);
    }
  }

  private async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAuth(req, res)) return;

      const { id } = req.params;

      const order = orders.get(id);

      if (!order) {
        this.sendError(res, 'Order not found', 404);
        return;
      }

      // Verify user owns order
      if (order.user_id !== req.context!.userId) {
        this.sendError(res, 'Unauthorized', 403);
        return;
      }

      // Can only cancel pending or processing orders
      if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
        this.sendError(res, 'Cannot cancel this order', 400);
        return;
      }

      order.status = 'cancelled';
      order.updated_at = new Date();

      orders.set(id, order);

      await cacheDel(`order:${id}`);

      this.sendSuccess(res, order, 'Order cancelled');
    } catch (error) {
      this.logger.error('Cancel order error:', error as Error);
      this.sendError(res, 'Failed to cancel order', 500);
    }
  }

  private async getOrderAnalytics(req: Request, res: Response): Promise<void> {
    try {
      if (!this.requireAdmin(req, res)) return;

      const allOrders = Array.from(orders.values());
      const completedOrders = allOrders.filter((o) => o.status === 'delivered');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

      this.sendSuccess(res, {
        total_orders: allOrders.length,
        completed_orders: completedOrders.length,
        total_revenue: totalRevenue,
        average_order_value: allOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      });
    } catch (error) {
      this.logger.error('Get order analytics error:', error as Error);
      this.sendError(res, 'Failed to fetch analytics', 500);
    }
  }
}

// Start service
if (require.main === module) {
  const service = new OrderService();
  service.start().catch((error) => {
    console.error('Failed to start Order Service:', error);
    process.exit(1);
  });
}

export default OrderService;
