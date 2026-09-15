import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: 0,
      validate: {
        validator: function validateDiscount(value) {
          return !value || value < this.price;
        },
        message: 'Discount price must be lower than the regular price',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    numSold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 });

productSchema.virtual('discountPercent').get(function computeDiscountPercent() {
  if (!this.discountPrice || this.discountPrice <= 0) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.virtual('inStock').get(function computeInStock() {
  return this.stock > 0;
});

productSchema.virtual('finalPrice').get(function computeFinalPrice() {
  return this.discountPrice && this.discountPrice > 0 ? this.discountPrice : this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.pre('validate', async function generateUniqueSlug(next) {
  if (this.isModified('name') || this.isNew) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    const Product = this.constructor;
    // Ensure slug uniqueness even when product names collide
    while (await Product.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
    this.slug = slug;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
