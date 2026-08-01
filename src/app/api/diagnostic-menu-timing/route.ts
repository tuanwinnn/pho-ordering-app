import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { redis, MENU_CACHE_KEY } from '@/lib/redis';

const ITERATIONS = 5;

function avg(times: number[]) {
  return Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100;
}

export async function GET() {
  await connectDB();

  const mongoTimes: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    await MenuItem.find({});
    mongoTimes.push(Math.round((performance.now() - start) * 100) / 100);
  }

  let redisTimes: number[] | null = null;
  if (redis) {
    redisTimes = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      await redis.get(MENU_CACHE_KEY);
      redisTimes.push(Math.round((performance.now() - start) * 100) / 100);
    }
  }

  return NextResponse.json({
    mongo: { iterations: ITERATIONS, timesMs: mongoTimes, avgMs: avg(mongoTimes) },
    redis: redisTimes ? { iterations: ITERATIONS, timesMs: redisTimes, avgMs: avg(redisTimes) } : null,
  });
}
