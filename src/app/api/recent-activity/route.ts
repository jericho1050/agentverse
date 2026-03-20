import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const activities = store.getRecentActivity(10);
  return NextResponse.json(activities);
}
