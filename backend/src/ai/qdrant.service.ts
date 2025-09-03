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
  private readonly autoRecreateOnDimMismatch: boolean;
  private initPromise?: Promise<void>;

  constructor(private readonly config: ConfigService) {
    this.host = this.config.get<string>('QDRANT_HOST', 'localhost');
    this.port = parseInt(this.config.get<string>('QDRANT_PORT', '6333')!, 10);
    this.collection = this.config.get<string>('QDRANT_COLLECTION_NAME', 'obot_documents');
    this.dim = parseInt(this.config.get<string>('EMBEDDING_DIM', '1024')!, 10);
    const autoFlag = (this.config.get<string>('QDRANT_AUTO_RECREATE', 'true') || '').toLowerCase();
    this.autoRecreateOnDimMismatch = ['1', 'true', 'yes', 'y'].includes(autoFlag);
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

  /**
   * Wrapper around fetch that turns network/connectivity failures
   * into a clear, actionable error about Qdrant availability.
   */
  private async safeFetch(url: string, init?: any): Promise<Response> {
    try {
      // Using undici's global fetch
      return (await fetch(url, init as any)) as unknown as Response;
    } catch (err: any) {
      const code = err?.cause?.code || '';
      const hint = code ? ` (${code})` : '';
      const message = `Qdrant connection failed${hint}: cannot reach ${this.baseUrl()}. Is Qdrant running?`;
      this.logger.error(message);
      throw new Error(message);
    }
  }

  private async ensureCollection(): Promise<void> {
    const url = `${this.baseUrl()}/collections/${encodeURIComponent(this.collection)}`;
    const resp = await this.safeFetch(url, { method: 'GET' } as any);
    if (resp.status === 404) {
      this.logger.log(`Creating Qdrant collection '${this.collection}' (dim=${this.dim}, distance=${this.distance})`);
      const createResp = await this.safeFetch(url, {
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
    // Validate vector dimension and optionally reconcile
    const info = await resp.json().catch(() => undefined as any);
    const actualDim =
      info?.result?.config?.params?.vectors?.size ??
      info?.result?.config?.params?.vectors?.params?.size ??
      info?.result?.vectors_config?.params?.size ??
      info?.result?.params?.vectors?.size ??
      info?.result?.vectors?.size;

    if (typeof actualDim === 'number' && actualDim !== this.dim) {
      const msg = `Qdrant collection '${this.collection}' dimension mismatch: expected ${this.dim}, found ${actualDim}`;
      if (this.autoRecreateOnDimMismatch) {
        this.logger.warn(msg + ' — recreating collection to match configured embedding dimension (data will be cleared).');
        const del = await this.safeFetch(url, { method: 'DELETE' } as any);
        if (!del.ok) {
          const text = await del.text().catch(() => '');
          throw new Error(`Failed to delete mismatched collection: ${del.status} ${text?.slice(0, 200)}`);
        }
        const createResp = await this.safeFetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vectors: { size: this.dim, distance: this.distance } }),
        } as any);
        if (!createResp.ok) {
          const text = await createResp.text().catch(() => '');
          throw new Error(`Failed to create collection after deletion: ${createResp.status} ${text?.slice(0, 200)}`);
        }
        this.logger.log(`Recreated collection '${this.collection}' with dim=${this.dim}.`);
      } else {
        this.logger.error(msg + ' — set QDRANT_AUTO_RECREATE=true to auto-fix, or adjust EMBEDDING_DIM/model to match.');
        throw new Error(msg);
      }
    } else {
      this.logger.log(`Qdrant collection '${this.collection}' available.${typeof actualDim === 'number' ? ` dim=${actualDim}` : ''}`);
    }
  }

  private async ensureReady(): Promise<void> {
    if (this.initPromise) await this.initPromise;
  }

  async upsert(points: QdrantPoint[]): Promise<void> {
    await this.ensureReady();
    const url = `${this.baseUrl()}/collections/${encodeURIComponent(this.collection)}/points`;
    const resp = await this.safeFetch(url, {
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

    const resp = await this.safeFetch(url, {
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
