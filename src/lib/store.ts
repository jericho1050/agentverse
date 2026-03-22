import type { MedicalDocument, DocumentVerification, ActivityEvent, VerificationStats } from '@/types';
import fs from 'fs';

class Store {
  private documents: Map<string, MedicalDocument> = new Map();
  private verifications: Map<string, DocumentVerification> = new Map();
  private activityLog: ActivityEvent[] = [];

  // Persistence methods
  persist(): void {
    try {
      const data = {
        documents: Array.from(this.documents.entries()),
        verifications: Array.from(this.verifications.entries()),
        activityLog: this.activityLog,
      };
      fs.writeFileSync('/tmp/mediverify-store.json', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist store:', e);
    }
  }

  loadFromDisk(): void {
    try {
      if (fs.existsSync('/tmp/mediverify-store.json')) {
        const raw = fs.readFileSync('/tmp/mediverify-store.json', 'utf-8');
        const data = JSON.parse(raw);
        if (data.documents) {
          for (const [key, val] of data.documents) {
            this.documents.set(key, val as MedicalDocument);
          }
        }
        if (data.verifications) {
          for (const [key, val] of data.verifications) {
            this.verifications.set(key, val as DocumentVerification);
          }
        }
        if (data.activityLog) {
          this.activityLog = data.activityLog;
        }
        console.log(`[Store] Loaded ${this.documents.size} documents from disk`);
      }
    } catch (e) {
      console.error('Failed to load store from disk:', e);
    }
  }

  // Document methods
  addDocument(doc: MedicalDocument): void {
    this.documents.set(doc.id, doc);
    this.persist();
  }

  getDocument(id: string): MedicalDocument | undefined {
    return this.documents.get(id);
  }

  getDocuments(): MedicalDocument[] {
    return Array.from(this.documents.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  updateDocument(id: string, updates: Partial<MedicalDocument>): void {
    const doc = this.documents.get(id);
    if (doc) {
      this.documents.set(id, { ...doc, ...updates });
    }
  }

  // Verification methods
  addVerification(verification: DocumentVerification): void {
    this.verifications.set(verification.id, verification);
    // Link to document
    const doc = this.documents.get(verification.documentId);
    if (doc) {
      this.documents.set(doc.id, { ...doc, status: 'verified', verification });
    }
    this.persist();
  }

  getVerification(id: string): DocumentVerification | undefined {
    return this.verifications.get(id);
  }

  getVerifications(): DocumentVerification[] {
    return Array.from(this.verifications.values()).sort((a, b) => b.verifiedAt - a.verifiedAt);
  }

  // Activity methods
  addActivity(event: ActivityEvent): void {
    this.activityLog.unshift(event);
    if (this.activityLog.length > 200) {
      this.activityLog = this.activityLog.slice(0, 200);
    }
  }

  getRecentActivity(limit: number = 50): ActivityEvent[] {
    return this.activityLog.slice(0, limit);
  }

  // Stats
  getStats(): VerificationStats {
    const docs = this.getDocuments();
    const verified = docs.filter(d => d.status === 'verified');
    const avgScore = verified.length > 0
      ? verified.reduce((sum, d) => sum + (d.verification?.overallScore ?? 0), 0) / verified.length
      : 0;

    return {
      totalDocuments: docs.length,
      totalVerified: verified.length,
      averageScore: Math.round(avgScore),
      totalTokensMinted: verified.length,
    };
  }
}

// Use globalThis to persist store across Next.js API route module boundaries
const globalForStore = globalThis as unknown as { __mediverify_store?: Store };
if (!globalForStore.__mediverify_store) {
  globalForStore.__mediverify_store = new Store();
  globalForStore.__mediverify_store.loadFromDisk();
}
export const store = globalForStore.__mediverify_store;
