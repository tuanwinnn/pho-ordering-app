import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import { invalidateMenuCache } from '@/lib/redis';
import { requireAdmin } from '@/lib/auth';

// GET single menu item by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 });
  }
}

// UPDATE menu item (admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const menuItem = await MenuItem.findByIdAndUpdate(id, body, { new: true });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    await invalidateMenuCache();
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

// DELETE menu item (admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    await invalidateMenuCache();
    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
