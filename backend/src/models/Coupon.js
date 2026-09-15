import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.methods.isValidForUse = function isValidForUse(subtotal) {
  if (!this.isActive) return { valid: false, reason: 'This coupon is no longer active' };
  if (this.expirationDate < new Date()) return { valid: false, reason: 'This coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'This coupon has reached its usage limit' };
  }
  if (subtotal < this.minimumPurchase) {
    return {
      valid: false,
      reason: `A minimum purchase of $${this.minimumPurchase.toFixed(2)} is required for this coupon`,
    };
  }
  return { valid: true };
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
