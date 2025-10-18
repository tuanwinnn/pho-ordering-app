import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  spiceLevel?: string;
  addons?: string[];
}

export async function sendOrderConfirmation(
  customerEmail: string,
  orderId: string,
  orderTotal: number,
  items: OrderItem[]
) {
  const itemsList = items
    .map(item => {
      let itemText = `${item.quantity}x ${item.name}`;
      if (item.spiceLevel) {
        itemText += ` (${item.spiceLevel})`;
      }
      if (item.addons && item.addons.length > 0) {
        itemText += ` + ${item.addons.join(', ')}`;
      }
      itemText += ` - $${(item.price * item.quantity).toFixed(2)}`;
      return itemText;
    })
    .join('<br>');

  const mailOptions = {
    from: `"Phở Paradise" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation #${orderId.slice(-6).toUpperCase()} - Phở Paradise`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
          .items { margin: 15px 0; line-height: 2; }
          .total { font-size: 24px; font-weight: bold; color: #f59e0b; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🍜 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Thank you for choosing Phở Paradise</p>
          </div>
          
          <div class="content">
            <h2 style="color: #f59e0b;">Order #${orderId.slice(-6).toUpperCase()}</h2>
            
            <div class="order-box">
              <h3 style="margin-top: 0; color: #374151;">Your Order:</h3>
              <div class="items">
                ${itemsList}
              </div>
              <div class="total">
                Total: $${orderTotal.toFixed(2)}
              </div>
            </div>
            
            <p style="font-size: 16px;">
              Your delicious Vietnamese meal is being prepared with care! We'll keep you updated on your order status.
            </p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" class="button">
                Track Your Order
              </a>
            </center>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <strong>💡 Order Status:</strong><br>
              You can track your order in real-time at the link above. We'll update you as your order progresses!
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Phở Paradise</strong></p>
            <p>123 Vietnamese Street, Oakland, CA 94612</p>
            <p>📞 (510) 555-7467 | 📧 hello@phoparadise.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
              Questions? Reply to this email and we'll get back to you!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendOrderStatusUpdate(
  customerEmail: string,
  orderId: string,
  newStatus: string
) {
  const statusMessages = {
    pending: {
      emoji: '⏳',
      title: 'Order Received',
      message: 'We have received your order and will start preparing it soon!',
    },
    preparing: {
      emoji: '👨‍🍳',
      title: 'Cooking in Progress',
      message: 'Our chefs are preparing your delicious Vietnamese meal!',
    },
    ready: {
      emoji: '✅',
      title: 'Order Ready',
      message: 'Your order is ready and will be delivered shortly!',
    },
    delivered: {
      emoji: '🎉',
      title: 'Order Delivered',
      message: 'Your order has been delivered! Enjoy your meal!',
    },
  };

  const status = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.pending;

  const mailOptions = {
    from: `"Phở Paradise" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `${status.emoji} Order Update #${orderId.slice(-6).toUpperCase()} - ${status.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; text-align: center; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 48px;">${status.emoji}</h1>
            <h2 style="margin: 10px 0 0 0;">${status.title}</h2>
          </div>
          
          <div class="content">
            <div class="status-box">
              <h2 style="color: #f59e0b; margin-top: 0;">Order #${orderId.slice(-6).toUpperCase()}</h2>
              <p style="font-size: 18px; margin: 20px 0;">
                ${status.message}
              </p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" class="button">
                Track Your Order
              </a>
            </center>
          </div>
          
          <div class="footer">
            <p><strong>Phở Paradise</strong></p>
            <p>123 Vietnamese Street, Oakland, CA 94612</p>
            <p>📞 (510) 555-7467 | 📧 hello@phoparadise.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
    return { success: false, error };
  }
}