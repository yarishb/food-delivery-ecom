import { Injectable, Logger } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/ollama';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddings: OllamaEmbeddings;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'nomic-embed-text',
    });
  }

  async getEmbedding768(text: string): Promise<number[]> {
    try {
      const vector = await this.embeddings.embedQuery(text);

      if (!vector || vector.length !== 768) {
        throw new Error(
          `Модель повернула вектор некоректного розміру: ${vector?.length ?? 0}`,
        );
      }

      return vector;
    } catch (error) {
      this.logger.error('Помилка генерації вектора через Ollama:', error);
      throw error;
    }
  }
}
