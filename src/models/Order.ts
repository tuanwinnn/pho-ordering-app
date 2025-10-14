import mongoose, { Schema, models } from 'mongoose';

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number,
    spiceLevel: String,
    addons: [String],
  }],
  total: { type: Number, required: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  specialInstructions: String,
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'delivered'],
    default: 'pending'
  },
}, { timestamps: true });

const Order = models.Order || mongoose.model('Order', OrderSchema);

export default Order;