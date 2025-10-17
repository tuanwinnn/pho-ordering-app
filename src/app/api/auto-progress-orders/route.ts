// src/app/api/auto-progress-orders/route.ts
// This API route can be called by a cron job to auto-progress orders
// For demo purposes - simulates kitchen workflow

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const STATUS_PROGRESSION = {
  'pending': { next: 'preparing', delayMinutes: 0.1 },
  'preparing': { next: 'ready', delayMinutes: 0.1 },
  'ready': { next: 'delivered', delayMinutes: 0.1 },
  'delivered': null // Final state
};

export async function GET() {
  try {
    await connectDB();
    
    const now = new Date();
    let updatedCount = 0;

    // Process each non-delivered order
    const orders = await Order.find({ status: { $ne: 'delivered' } });

    for (const order of orders) {
      const progression = STATUS_PROGRESSION[order.status as keyof typeof STATUS_PROGRESSION];
      
      if (!progression) continue;

      // Check if enough time has passed since last update
      const lastUpdate = new Date(order.updatedAt || order.createdAt);
      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      if (minutesSinceUpdate >= progression.delayMinutes) {
        // Progress to next status
        order.status = progression.next;
        order.updatedAt = now;
        await order.save();
        
        updatedCount++;
        
        // TODO: Send email notification here
        console.log(`Order ${order._id} progressed to ${progression.next}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${orders.length} orders, updated ${updatedCount}`,
      updatedCount 
    });

  } catch (error) {
    console.error('Error auto-progressing orders:', error);
    return NextResponse.json(
      { error: 'Failed to auto-progress orders' },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to manually trigger auto-progression
export async function POST() {
  return GET();
}