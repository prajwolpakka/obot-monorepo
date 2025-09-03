import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  async extractText(filePath: string, mimeType?: string): Promise<string> {
    const ext = (path.extname(filePath) || '').toLowerCase();
    try {
      if (ext === '.pdf' || mimeType?.includes('pdf')) {
        // Lazy require to avoid type issues if not installed yet
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse');
        const buffer = await fs.readFile(filePath);
        const data = await pdfParse(buffer);
        return data.text || '';
      }
      if (ext === '.docx' || mimeType?.includes('wordprocessingml.document')) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mammoth = require('mammoth');
        const buffer = await fs.readFile(filePath);
        const { value } = await mammoth.extractRawText({ buffer });
        return value || '';
      }
      if (ext === '.csv' || mimeType?.includes('csv')) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const parse = require('csv-parse/sync').parse as (input: string, opts?: any) => any[];
        const content = await fs.readFile(filePath, 'utf8');
        const rows = parse(content, { skip_empty_lines: true });
        return rows.map((r) => (Array.isArray(r) ? r.join(', ') : String(r))).join('\n');
      }
      // Fallback: treat as plain text
      return await fs.readFile(filePath, 'utf8');
    } catch (e: any) {
      this.logger.error(`Failed to extract text from ${filePath}: ${e?.message || e}`);
      throw e;
    }
  }

  chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
    const chunks: string[] = [];
    if (!text) return chunks;
    const size = Math.max(1, chunkSize);
    const overlap = Math.max(0, Math.min(chunkOverlap, Math.floor(size / 2)));
    let start = 0;
    while (start < text.length) {
      const end = Math.min(text.length, start + size);
      const slice = text.slice(start, end);
      chunks.push(slice);
      if (end === text.length) break;
      start = end - overlap;
    }
    return chunks;
  }

  hashContent(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

