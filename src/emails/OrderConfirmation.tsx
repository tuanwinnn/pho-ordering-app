import * as React from 'react';

// Define the props that this email template will receive
interface OrderConfirmationEmailProps {
  orderNumber: string; // Unique order ID
  customerName: string; // Customer's name
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    spiceLevel?: string;
    addons?: string[];
  }>;
  subtotal: number; // Order subtotal
  deliveryFee: number; // Delivery charge
  total: number; // Total amount paid
  specialInstructions?: string; // Any special requests
}

/**
 * Order Confirmation Email Template
 * This creates a beautiful HTML email to send to customers
 */
export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  deliveryFee,
  total,
  specialInstructions,
}) => {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .order-number {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #92400e;
          }
          .item {
            padding: 15px;
            background: #f9fafb;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .item-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 16px;
          }
          .item-details {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
          }
          .total-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
          }
          .total-final {
            font-size: 20px;
            font-weight: bold;
            color: #f59e0b;
            padding-top: 15px;
            border-top: 2px solid #f59e0b;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            background: #f9fafb;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
          }
        `}</style>
      </head>
      <body>
        {/* Email Header */}
        <div className="header">
          <h1 style={{ margin: 0, fontSize: '28px' }}>🍜 Phở Paradise</h1>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>Order Confirmation</p>
        </div>

        {/* Email Content */}
        <div className="content">
          {/* Greeting */}
          <h2 style={{ color: '#1f2937', marginTop: 0 }}>
            Thank you{customerName ? `, ${customerName}` : ''}! 🎉
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            We&apos;ve received your order and our chefs are getting started. Your delicious Vietnamese meal will be ready soon!
          </p>

          {/* Order Number */}
          <div className="order-number">
            Order #{orderNumber}
          </div>

          {/* Order Items */}
          <h3 style={{ color: '#1f2937', marginTop: 30 }}>Your Order:</h3>
          {items.map((item, index) => (
            <div key={index} className="item">
              <div className="item-name">
                {item.quantity}x {item.name}
              </div>
              <div className="item-details">
                ${item.price.toFixed(2)} each
                {item.spiceLevel && ` • Spice Level: ${item.spiceLevel}`}
                {item.addons && item.addons.length > 0 && (
                  <div>Add-ons: {item.addons.join(', ')}</div>
                )}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          {specialInstructions && (
            <div style={{ 
              background: '#fef3c7', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '20px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <strong>Special Instructions:</strong>
              <div style={{ marginTop: '5px', color: '#92400e' }}>
                {specialInstructions}
              </div>
            </div>
          )}

          {/* Order Total */}
          <div className="total-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="total-row total-final">
              <span>Total Paid:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* What's Next Section */}
          <div style={{ 
            background: '#f0fdf4', 
            padding: '20px', 
            borderRadius: '8px', 
            marginTop: '30px',
            border: '1px solid #86efac'
          }}>
            <h3 style={{ color: '#166534', marginTop: 0 }}>What&apos;s Next? ⏰</h3>
            <ul style={{ color: '#166534', paddingLeft: '20px' }}>
              <li>Your order is being prepared by our expert chefs</li>
              <li>Estimated delivery time: 30-45 minutes</li>
              <li>You&apos;ll receive updates as your order progresses</li>
            </ul>
          </div>

          {/* Track Order Button (optional - can link to order status page) */}
          <div style={{ textAlign: 'center' }}>
            <a 
              href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders`}
              className="button"
              style={{ color: 'white' }}
            >
              Track Your Order
            </a>
          </div>
        </div>

        {/* Email Footer */}
        <div className="footer">
          <p style={{ margin: '5px 0' }}>
            <strong>Phở Paradise</strong> - Authentic Vietnamese Cuisine
          </p>
          <p style={{ margin: '5px 0' }}>
            123 Vietnamese Street, Oakland, CA 94612
          </p>
          <p style={{ margin: '5px 0' }}>
            (510) 555-PHỞ (7467) • hello@phoparadise.com
          </p>
          <p style={{ margin: '15px 0 5px 0', fontSize: '12px' }}>
            Questions? Reply to this email or contact our support team.
          </p>
        </div>
      </body>
    </html>
  );
};