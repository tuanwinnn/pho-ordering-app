import mongoose, { Schema, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  prepTime: { type: String, required: true },
}, { timestamps: true });

const MenuItem = models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

export default MenuItem;