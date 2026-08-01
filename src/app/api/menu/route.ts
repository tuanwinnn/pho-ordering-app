import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { redis, invalidateMenuCache, MENU_CACHE_KEY, MENU_CACHE_TTL_SECONDS } from '@/lib/redis';

// GET all menu items
export async function GET() {
  // if (redis) {
  //   try {
  //     const cached = await redis.get(MENU_CACHE_KEY);
  //     if (cached) {
  //       return NextResponse.json(cached);
  //     }
  //   } catch (error) {
  //     console.error('Redis read error, falling back to DB:', error);
  //   }
  // }

  try {
    await connectDB();
    const menuItems = await MenuItem.find({});

    if (redis) {
      redis.set(MENU_CACHE_KEY, menuItems, { ex: MENU_CACHE_TTL_SECONDS }).catch((error) =>
        console.error('Redis write error:', error)
      );
    }

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST create new menu item
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const menuItem = await MenuItem.create(body);
    await invalidateMenuCache();
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}