import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const transactions = store.getTransactions();
  return NextResponse.json({
    transactions,
    total: transactions.length,
  });
}
