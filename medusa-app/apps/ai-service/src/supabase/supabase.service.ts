import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient = undefined as any;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    // Service role key bypasses RLS — required for server-side writes.
    // Falls back to anon key for local dev without RLS.
    const key =
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set in .env',
      );
    }

    this.supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const keyType = process.env.SUPABASE_SERVICE_KEY ? 'service role' : 'anon';
    this.logger.log(`Supabase client initialized (${keyType} key)`);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async searchProductIdsSemantic(
    queryVector: number[],
    limit = 5,
  ): Promise<string[]> {
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: queryVector,
      match_threshold: 0.3,
      match_count: limit,
    });

    if (error) {
      console.error('Помилка RPC match_documents:', error);
      return [];
    }

    return data
      .filter(
        (row: any) =>
          row.metadata?.product_id && row.metadata?.type === 'product',
      )
      .map((row: any) => row.metadata.product_id);
  }

  async saveProductEmbedding(data: {
    productId: string;
    content: string;
    embedding: number[];
  }) {
    const { error } = await this.supabase.from('document_sections').insert({
      content: data.content,
      embedding: data.embedding,
      metadata: {
        product_id: data.productId,
        type: 'product',
        source: 'medusa',
      },
    });

    if (error) {
      console.error('Помилка вставки в document_sections:', error);
      throw error;
    }
  }

  async deleteProductEmbedding(productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('document_sections')
      .delete()
      .eq('metadata->>product_id', productId);

    if (error) {
      console.error('Помилка видалення ембедінгу з document_sections:', error);
      throw error;
    }
  }
}
