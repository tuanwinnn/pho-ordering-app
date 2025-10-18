import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmation } from '@/lib/email'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      await connectDB();

      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            status: 'pending',
            paymentStatus: 'paid',
            stripeSessionId: session.id,
          },
          { new: true }
        ).populate('items');

        console.log(`✅ Order ${orderId} payment confirmed`);

        // 📧 SEND ORDER CONFIRMATION EMAIL
        if (session.customer_details?.email && order) {
          await sendOrderConfirmation(
            session.customer_details.email,
            orderId,
            order.total,
            order.items
          );
        }
      } else {
        console.error('❌ No orderId in session metadata');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}