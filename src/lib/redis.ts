import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export const MENU_CACHE_KEY = 'menu:all';
export const MENU_CACHE_TTL_SECONDS = 300;

export async function invalidateMenuCache() {
  if (!redis) return;
  try {
    await redis.del(MENU_CACHE_KEY);
  } catch (error) {
    console.error('Redis invalidate error:', error);
  }
}
