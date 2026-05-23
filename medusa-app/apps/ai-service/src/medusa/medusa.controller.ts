// src/medusa/medusa.controller.ts
import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { MedusaService } from './medusa.service';

interface MedusaWebhookPayload {
  record: {
    id: string;
    title: string;
    description?: string;
    subtitle?: string; // Твоя калорійність
  };
  type: 'INSERT' | 'UPDATE' | 'DELETE';
}

@Controller('medusa-webhook')
export class MedusaController {
  private readonly logger = new Logger(MedusaController.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly embeddingService: EmbeddingService,
    private readonly medusaService: MedusaService,
  ) {}

  @Post('sync-all')
  @HttpCode(HttpStatus.OK)
  async syncAllProducts() {
    this.logger.log(
      '🚀 Starting full product catalog synchronization with Supabase Vector DB...',
    );

    try {
      const products = await this.medusaService.getProducts();

      this.logger.log(`products`, products);

      if (!products || products.length === 0) {
        this.logger.warn('No products found in Medusa catalog to synchronize.');
        return { success: true, message: 'Catalog is empty, nothing to sync.' };
      }

      this.logger.log(
        `Found ${products.length} products in Medusa. Cleaning up old vectors...`,
      );

      let syncedCount = 0;

      for (const product of products) {
        const contentText = `Назва: ${product.title}. Опис: ${product.description || ''}. Калорійність: ${product.subtitle || ''}`;

        this.logger.log(
          `[${syncedCount + 1}/${products.length}] Processing: "${product.title}"`,
        );

        const embedding =
          await this.embeddingService.getEmbedding768(contentText);

        await this.supabaseService.saveProductEmbedding({
          productId: product.id,
          content: contentText,
          embedding: embedding,
        });

        syncedCount++;
      }

      this.logger.log(
        `✅ Successfully synchronized ${syncedCount} products to Supabase.`,
      );
      return {
        success: true,
        message: `Successfully synchronized ${syncedCount} products to Supabase vector database.`,
      };
    } catch (error) {
      this.logger.error('❌ Full catalog synchronization failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('on-product-change')
  @HttpCode(HttpStatus.OK)
  async handleProductChange(@Body() body: MedusaWebhookPayload) {
    this.logger.log(`Received webhook from Medusa. Action type: ${body.type}`);

    const { record, type } = body;

    if (!record || !record.id) {
      this.logger.error('Invalid webhook payload structure');
      throw new BadRequestException(
        'Invalid payload: record and record.id are required',
      );
    }

    const productId = record.id;

    if (type === 'INSERT' || type === 'UPDATE') {
      try {
        const contentText = `Назва: ${record.title}. Опис: ${record.description || ''}. Калорійність: ${record.subtitle || ''}`;

        this.logger.log(
          `Step 1: Generating 768-dim vector via local Ollama (nomic-embed-text)`,
        );
        const embedding =
          await this.embeddingService.getEmbedding768(contentText);

        this.logger.log(
          `Step 2: Saving to Supabase 'document_sections' tables for ID: ${productId}`,
        );
        await this.supabaseService.saveProductEmbedding({
          productId,
          content: contentText,
          embedding: embedding,
        });

        this.logger.log(
          `✅ Product ${productId} successfully indexed locally.`,
        );
        return { success: true, message: `Product ${productId} indexed.` };
      } catch (error) {
        this.logger.error(`❌ Failed to process product ${productId}`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    if (type === 'DELETE') {
      try {
        this.logger.log(
          `Removing embeddings from 'document_sections' for product: ${productId}`,
        );
        await this.supabaseService.deleteProductEmbedding(productId);
        this.logger.log(`✅ Product ${productId} removed from index.`);
        return { success: true, message: `Product ${productId} deleted.` };
      } catch (error) {
        this.logger.error(
          `❌ Failed to delete product index ${productId}`,
          error,
        );
        return { success: false, error: String(error) };
      }
    }

    return { success: true };
  }
}
