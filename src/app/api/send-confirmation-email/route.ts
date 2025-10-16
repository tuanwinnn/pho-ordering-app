import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * API Route: Send Order Confirmation Email
 * Called after successful Stripe payment
 */
export async function POST(request: Request) {
  try {
    // Parse the request body to get order details
    const body = await request.json();
    const { 
      customerEmail, 
      customerName,
      orderNumber, 
      items, 
      subtotal,
      deliveryFee,
      total, 
      specialInstructions 
    } = body;

    // Validate required fields
    if (!customerEmail || !orderNumber || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      // FROM: Must be a verified domain in Resend
      // For testing, use onboarding@resend.dev
      // For production, use your own domain (info@yourdomain.com)
      from: 'Phở Paradise <onboarding@resend.dev>',
      
      // TO: Customer's email address
      // customerEmail - when ready for real 
      to: ['itztuannguyen8826@gmail.com'],
      
      // Email subject line
      subject: `Order Confirmation #${orderNumber} - Phở Paradise`,
      
      // React component as email body
      react: OrderConfirmationEmail({
        orderNumber,
        customerName: customerName || 'Valued Customer',
        items,
        subtotal,
        deliveryFee,
        total,
        specialInstructions,
      }) as React.ReactElement,
    });

    // Check if email sending failed
    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Success! Return the email ID
    console.log('✅ Email sent successfully:', data);
    return NextResponse.json({ 
      success: true, 
      emailId: data?.id 
    });

  } catch (error: unknown) {
    console.error('Email API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}