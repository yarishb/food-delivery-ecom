import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Medusa from '@medusajs/js-sdk';

@Injectable()
export class MedusaService implements OnModuleInit {
  private readonly logger = new Logger(MedusaService.name);
  private sdk: Medusa | undefined;

  onModuleInit() {
    // Ініціалізуємо офіційний SDK спеціально для адмінських операцій бекенду

    this.sdk = new Medusa({
      baseUrl: 'http://localhost:9000',
      debug: process.env.NODE_ENV === 'development',
      apiKey: process.env.MEDUSA_ADMIN_TOKEN,
    });

    this.logger.log(
      '✅ Medusa JS-SDK successfully initialized for Admin workspace',
    );
  }

  async getProducts(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    try {
      const response = await this.sdk?.admin.product.list({
        limit: params?.limit ?? 100,
        offset: params?.offset ?? 0,
        ...(params?.status ? { status: [params.status] as any } : {}),
      });

      this.logger.log(
        `Fetched ${response?.products?.length ?? 0} products from Medusa Admin API`,
      );
      return response?.products ?? [];
    } catch (err) {
      this.logger.error('getProducts failed via SDK', err);
      return [];
    }
  }

  async getOrders(params?: { limit?: number }): Promise<any[]> {
    try {
      const response = await this.sdk?.admin.order.list({
        limit: params?.limit ?? 200,
      });
      return response?.orders ?? [];
    } catch (err) {
      this.logger.error('getOrders failed via SDK', err);
      return [];
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const response = await this.sdk?.admin.productCategory.list();
      return response?.product_categories ?? [];
    } catch (err) {
      this.logger.error('getCategories failed via SDK', err);
      return [];
    }
  }

  async getInventoryItems(): Promise<any[]> {
    try {
      // У новому SDK ліміти та пагінація передаються через загальний об'єкт конфігу
      const response = await this.sdk?.admin.inventoryItem.list({
        limit: 200,
      });
      return response?.inventory_items ?? [];
    } catch (err) {
      this.logger.error('getInventoryItems failed via SDK', err);
      return [];
    }
  }

  async updateProduct(
    productId: string,
    payload: Record<string, any>,
  ): Promise<any> {
    try {
      const response = await this.sdk?.admin.product.update(productId, payload);
      return response?.product;
    } catch (err) {
      this.logger.error(`updateProduct failed for ID ${productId}`, err);
      throw err;
    }
  }

  async createProduct(payload: {
    title: string;
    description: string;
    price: number;
    category: string;
    calories: number;
  }) {
    try {
      const response = await this.sdk?.admin.product.create({
        title: payload.title,
        description: payload.description,
        subtitle: `Калорійність: ${payload.calories} ккал`,
        options: [{ title: 'Default Option', values: ['Standard'] }],
        variants: [
          {
            title: 'Standard',
            // Medusa приймає ціни в мінімальних грошових одиницях (копійках/центах)
            prices: [{ amount: payload.price * 100, currency_code: 'uah' }],
            options: { 'Default Option': 'Standard' },
            inventory_quantity: 10,
            manage_inventory: true,
          } as any,
        ],
      });
      return response?.product;
    } catch (err) {
      this.logger.error('createProduct failed via SDK', err);
      throw err;
    }
  }

  async createDiscount(payload: {
    code: string;
    percentage: number;
    productIds?: string[];
  }): Promise<any> {
    try {
      // Примітка: у архітектурі Medusa v2 дискаунти мапляться через Promotion API
      const response = await this.sdk?.admin.promotion.create({
        code: payload.code,
        type: 'standard',
        application_method: {
          type: 'percentage',
          value: payload.percentage,
          target_type: 'items',
          allocation: 'each',
        },
      } as any);
      return response?.promotion;
    } catch (err) {
      this.logger.error('createDiscount/Promotion failed via SDK', err);
      throw err;
    }
  }
}
