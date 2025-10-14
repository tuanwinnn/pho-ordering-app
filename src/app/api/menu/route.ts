import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

// GET all menu items
export async function GET() {
  try {
    await connectDB();
    const menuItems = await MenuItem.find({});
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
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}