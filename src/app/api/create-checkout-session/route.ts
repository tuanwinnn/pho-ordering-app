import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Define types for better TypeScript support
interface CartItem {
  menuItemId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  spiceLevel?: string;
  addons?: string[];
}

interface OrderData {
  items: CartItem[];
  total: number;
  specialInstructions?: string;
}

// This API route creates a Stripe checkout session
// Called when user clicks "Checkout" button
export async function POST(request: Request) {
  try {
    // Parse the order data from the request body
    const body = await request.json() as OrderData;
    const { items, total, specialInstructions } = body;

    // 🆕 STEP 1: Save order to MongoDB FIRST
    await connectDB();
    
    const newOrder = await Order.create({
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        spiceLevel: item.spiceLevel,
        addons: item.addons,
      })),
      total,
      status: 'pending',
      specialInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create line items for Stripe checkout
    const lineItems = items.map((item: CartItem) => {
      // Calculate price including add-ons
      let itemPrice = item.price;
      
      // Add prices for any add-ons
      if (item.addons && item.addons.length > 0) {
        const addonPrices: Record<string, number> = {
          'Extra Meat': 3.50,
          'Extra Vegetables': 2.00,
          'Extra Noodles': 2.50,
          'Fried Egg': 1.50,
          'Spring Roll': 2.99,
        };
        
        item.addons.forEach((addon: string) => {
          itemPrice += addonPrices[addon] || 0;
        });
      }

      // Build item description with customizations
      let description = item.description || '';
      if (item.spiceLevel) {
        description += ` | Spice: ${item.spiceLevel}`;
      }
      if (item.addons && item.addons.length > 0) {
        description += ` | Add-ons: ${item.addons.join(', ')}`;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: description.trim(),
          },
          unit_amount: Math.round(itemPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee as a separate line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee',
          description: 'Standard delivery to your location',
        },
        unit_amount: 399, // $3.99 in cents
      },
      quantity: 1,
    });

    // 🆕 STEP 2: Create Stripe session with order ID in success URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      
      // 🆕 Updated success URL with order_id parameter
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${newOrder._id}`,
      cancel_url: `${request.headers.get('origin')}/?canceled=true`,
      
      metadata: {
        orderId: newOrder._id.toString(), // 🆕 Store order ID in metadata
        orderItemIds: items.map((item: CartItem) => item.menuItemId).join(','),
        specialInstructions: specialInstructions || '',
        totalAmount: total.toString(),
        itemCount: items.length.toString(),
      },
      
      billing_address_collection: 'auto',
    });

    // Return the session ID and URL to the client
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}