import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type QdrantPoint = {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
};

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly host: string;
  private readonly port: number;
  private readonly collection: string;
  private readonly dim: number;
  private readonly distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine';
  private initPromise?: Promise<void>;

  constructor(private readonly config: ConfigService) {
    this.host = this.config.get<string>('QDRANT_HOST', 'localhost');
    this.port = parseInt(this.config.get<string>('QDRANT_PORT', '6333')!, 10);
    this.collection = this.config.get<string>('QDRANT_COLLECTION_NAME', 'obot_documents');
    this.dim = parseInt(this.config.get<string>('EMBEDDING_DIM', '1024')!, 10);
  }

  onModuleInit() {
    // fire-and-forget init
    this.initPromise = this.ensureCollection().catch((e) => {
      this.logger.warn(`Qdrant init deferred: ${e?.message || e}`);
    });
  }

  private baseUrl(): string {
    return `http://${this.host}:${this.port}`;
  }

  private async ensureCollection(): Promise<void> {
    const url = `${this.baseUrl()}/collections/${encodeURIComponent(this.collection)}`;
    const resp = await fetch(url, { method: 'GET' } as any);
    if (resp.status === 404) {
      this.logger.log(`Creating Qdrant collection '${this.collection}' (dim=${this.dim}, distance=${this.distance})`);
      const createResp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: { size: this.dim, distance: this.distance },
        }),
      } as any);
      if (!createResp.ok) {
        const text = await createResp.text().catch(() => '');
        throw new Error(`Failed to create collection: ${createResp.status} ${text?.slice(0, 200)}`);
      }
      this.logger.log(`Collection '${this.collection}' created.`);
      return;
    }
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Failed to get collection: ${resp.status} ${text?.slice(0, 200)}`);
    }
    // Optionally validate dimension here; skipping destructive actions
    this.logger.log(`Qdrant collection '${this.collection}' available.`);
  }

  private async ensureReady(): Promise<void> {
    if (this.initPromise) await this.initPromise;
  }

  async upsert(points: QdrantPoint[]): Promise<void> {
    await this.ensureReady();
    const url = `${this.baseUrl()}/collections/${encodeURIComponent(this.collection)}/points`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    } as any);
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Qdrant upsert failed: ${resp.status} ${text?.slice(0, 200)}`);
    }
  }

  async search(
    vector: number[],
    opts?: { limit?: number; documentIdsFilter?: string[]; scoreThreshold?: number }
  ): Promise<Array<{ id: string | number; score: number; payload: Record<string, any> }>> {
    await this.ensureReady();
    const url = `${this.baseUrl()}/collections/${encodeURIComponent(this.collection)}/points/search`;
    const filter = opts?.documentIdsFilter?.length
      ? {
          must: [
            {
              key: 'id',
              match: { any: opts!.documentIdsFilter },
            },
          ],
        }
      : undefined;

    const body: any = {
      vector,
      with_payload: true,
      limit: opts?.limit ?? 8,
    };
    if (filter) body.filter = filter;
    if (opts?.scoreThreshold != null) body.score_threshold = opts.scoreThreshold;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    } as any);
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Qdrant search failed: ${resp.status} ${text?.slice(0, 200)}`);
    }
    const data = (await resp.json()) as { result: Array<{ id: string | number; score: number; payload: any }>; status: string };
    return data?.result || [];
  }
}

