import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmbeddingsResponseItem {
  embedding: number[];
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('VOYAGE_API_KEY', '');
    this.baseUrl = (this.config.get<string>('VOYAGE_BASE_URL', 'https://api.voyageai.com/v1') || '').replace(/\/$/, '');
    this.model = this.config.get<string>('EMBEDDINGS_MODEL', 'voyage-3.5-lite');

    if (!this.apiKey) {
      this.logger.warn('VOYAGE_API_KEY not set; embeddings will fail until configured.');
    }
  }

  get modelName(): string {
    return this.model;
  }

  async embedText(text: string): Promise<number[]> {
    const res = await this.requestEmbeddings([text]);
    return res[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await this.requestEmbeddings(texts);
    return res.map((i) => i.embedding);
  }

  private async requestEmbeddings(inputs: string[]): Promise<EmbeddingsResponseItem[]> {
    if (!this.apiKey) {
      throw new Error('VOYAGE_API_KEY is not configured');
    }

    const resp = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: inputs,
        input_type: 'document',
      }),
      redirect: 'manual',
    } as any);

    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location');
      this.logger.error(`Embeddings redirected to: ${location}`);
      throw new Error('Unexpected redirect from embeddings endpoint');
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Embeddings failed: ${resp.status} ${text?.slice(0, 200)}`);
    }

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await resp.text().catch(() => '');
      this.logger.error(`Embeddings non-JSON: status=${resp.status} body=${text?.slice(0, 300)}`);
      throw new Error('Embeddings API did not return JSON');
    }

    const data = (await resp.json()) as { data: EmbeddingsResponseItem[] };
    if (!data?.data?.length) {
      throw new Error('Embeddings API returned no data');
    }
    return data.data;
  }
}

