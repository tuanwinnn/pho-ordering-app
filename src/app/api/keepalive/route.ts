// src/app/api/keepalive/route.ts
// Triggered by Vercel Cron every 2 weeks to touch the DB so the Atlas
// free-tier cluster doesn't auto-pause from inactivity.

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await connectDB();
    const count = await MenuItem.estimatedDocumentCount();

    return NextResponse.json({ success: true, pinged: true, menuItemCount: count });
  } catch (error) {
    console.error('Keepalive ping failed:', error);
    return NextResponse.json({ error: 'Keepalive ping failed' }, { status: 500 });
  }
}
