import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const verification = store.getVerification(id);

  if (!verification) {
    return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
  }

  const doc = store.getDocument(verification.documentId);

  return NextResponse.json({
    verification,
    document: doc ? {
      id: doc.id,
      title: doc.title,
      type: doc.type,
      uploadedAt: doc.uploadedAt,
      status: doc.status,
    } : null,
  });
}
