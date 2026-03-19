import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const documents = store.getDocuments();
  return NextResponse.json({ documents, total: documents.length });
}
