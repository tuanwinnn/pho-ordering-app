import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

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

    // Create line items for Stripe checkout
    // Each item needs: name, amount (in cents), quantity
    const lineItems = items.map((item: CartItem) => {
      // Calculate price including add-ons
      let itemPrice = item.price;
      
      // Add prices for any add-ons
      if (item.addons && item.addons.length > 0) {
        // Define prices for each add-on option
        const addonPrices: Record<string, number> = {
          'Extra Meat': 3.50,
          'Extra Vegetables': 2.00,
          'Extra Noodles': 2.50,
          'Fried Egg': 1.50,
          'Spring Roll': 2.99,
        };
        
        // Add up all add-on prices
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
            // You can add images here when you have real images
            // images: [item.imageUrl],
          },
          // Stripe expects amount in cents, so multiply by 100
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

  // Create the Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    // Payment settings
    payment_method_types: ['card'], // Accept credit/debit cards
    mode: 'payment', // One-time payment (not subscription)
    
    // Line items (what customer is buying)
    line_items: lineItems,
    
    // Success and cancel URLs
    success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.headers.get('origin')}/?canceled=true`,
    
    // Store order metadata for later retrieval
    metadata: {
      orderItems: JSON.stringify(items),
      specialInstructions: specialInstructions || '',
      totalAmount: total.toString(),
    },
    
    // Collect customer info
    // Remove phone collection requirement
    billing_address_collection: 'auto', // Collect billing address automatically
    
    // Shipping address collection (optional)
    // shipping_address_collection: {
    //   allowed_countries: ['US'],
    // },
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