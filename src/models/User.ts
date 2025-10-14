import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  favoriteItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = models.User || mongoose.model('User', UserSchema);

export default User;