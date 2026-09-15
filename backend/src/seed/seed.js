/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import { categoriesData, productsData, couponsData, reviewPool } from './seedData.js';
import { calculateOrderTotals } from '../utils/calculatePrices.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shopwave.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

const destroyOnly = process.argv.includes('--destroy');

const clearDatabase = async () => {
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
    Coupon.deleteMany(),
  ]);
  console.log('Existing collections cleared.');
};

const seedUsers = async () => {
  const admin = await User.create({
    name: 'ShopWave Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '+1-555-0100',
  });

  const demoCustomer = await User.create({
    name: 'John Doe',
    email: 'demo@shopwave.dev',
    password: 'Demo@12345',
    role: 'customer',
    phone: '+1-555-0101',
    address: [
      {
        label: 'Home',
        addressLine1: '221B Baker Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDefault: true,
      },
    ],
  });

  const secondCustomer = await User.create({
    name: 'Jane Smith',
    email: 'jane@shopwave.dev',
    password: 'Jane@12345',
    role: 'customer',
    phone: '+1-555-0102',
    address: [
      {
        label: 'Home',
        addressLine1: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'United States',
        isDefault: true,
      },
    ],
  });

  console.log('Users seeded: 1 admin, 2 demo customers.');
  return { admin, demoCustomer, secondCustomer };
};

const seedCategories = async () => {
  const categories = await Category.insertMany(categoriesData);
  console.log(`Categories seeded: ${categories.length}`);
  return categories;
};

const seedProducts = async (categories) => {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  const productsToInsert = productsData.map((p, index) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    discountPrice: p.discountPrice || 0,
    category: categoryMap[p.categoryName],
    brand: p.brand,
    images: p.images,
    stock: p.stock,
    sku: `SKU-${String(index + 1).padStart(5, '0')}`,
    featured: Boolean(p.featured),
  }));

  const products = await Product.insertMany(productsToInsert);
  console.log(`Products seeded: ${products.length}`);
  return products;
};

const seedOrders = async ({ demoCustomer, secondCustomer }, products) => {
  const pick = (name) => products.find((p) => p.name === name);

  const buildOrder = (user, items, { status, paymentMethod, paymentStatus, daysAgo }) => {
    const pricingItems = items.map(({ product, quantity }) => ({
      price: product.price,
      discountPrice: product.discountPrice,
      quantity,
    }));
    const totals = calculateOrderTotals({ items: pricingItems, coupon: null });

    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    return {
      user: user._id,
      orderItems: items.map(({ product, quantity }) => ({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        quantity,
      })),
      shippingAddress: {
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        addressLine1: user.address[0].addressLine1,
        city: user.address[0].city,
        state: user.address[0].state,
        postalCode: user.address[0].postalCode,
        country: user.address[0].country,
      },
      paymentMethod,
      paymentStatus,
      orderStatus: status,
      ...totals,
      deliveredAt: status === 'Delivered' ? createdAt : undefined,
      statusHistory: [{ status, changedAt: createdAt }],
      createdAt,
      updatedAt: createdAt,
    };
  };

  const orderDefs = [
    buildOrder(
      demoCustomer,
      [
        { product: pick('EchoWave Pro Wireless Bluetooth Headphones'), quantity: 1 },
        { product: pick('EchoWave Mini Portable Bluetooth Speaker'), quantity: 1 },
      ],
      { status: 'Delivered', paymentMethod: 'Stripe', paymentStatus: 'paid', daysAgo: 21 }
    ),
    buildOrder(
      demoCustomer,
      [{ product: pick('Vantura Pulse Smart Watch'), quantity: 1 }],
      { status: 'Delivered', paymentMethod: 'COD', paymentStatus: 'paid', daysAgo: 10 }
    ),
    buildOrder(
      demoCustomer,
      [{ product: pick('PeakGear Premium Non-Slip Yoga Mat'), quantity: 2 }],
      { status: 'Processing', paymentMethod: 'COD', paymentStatus: 'pending', daysAgo: 2 }
    ),
    buildOrder(
      secondCustomer,
      [
        { product: pick('PureGlow Vitamin C Brightening Serum'), quantity: 1 },
        { product: pick('PureGlow Organic Skincare Gift Set'), quantity: 1 },
      ],
      { status: 'Delivered', paymentMethod: 'Stripe', paymentStatus: 'paid', daysAgo: 15 }
    ),
    buildOrder(
      secondCustomer,
      [{ product: pick("UrbanForge Classic Leather Sneakers"), quantity: 1 }],
      { status: 'Shipped', paymentMethod: 'Stripe', paymentStatus: 'paid', daysAgo: 4 }
    ),
    buildOrder(
      secondCustomer,
      [{ product: pick('PlayNest 500-Piece Building Blocks Set'), quantity: 1 }],
      { status: 'Pending', paymentMethod: 'COD', paymentStatus: 'pending', daysAgo: 0 }
    ),
    buildOrder(
      demoCustomer,
      [{ product: pick('PureGlow Vitamin C Brightening Serum'), quantity: 2 }],
      { status: 'Processing', paymentMethod: 'Cashfree', paymentStatus: 'paid', daysAgo: 1 }
    ),
  ];

  const orders = await Order.insertMany(orderDefs);

  // Reflect the demo sales in product stock/numSold so the admin dashboard
  // ("best-selling", "low stock") looks realistic out of the box.
  const nonPendingOrders = orders.filter((o) => o.orderStatus !== 'Pending');
  const updates = {};
  nonPendingOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const key = item.product.toString();
      updates[key] = (updates[key] || 0) + item.quantity;
    });
  });
  await Promise.all(
    Object.entries(updates).map(([productId, qty]) =>
      Product.findByIdAndUpdate(productId, { $inc: { numSold: qty, stock: -qty } })
    )
  );

  console.log(`Orders seeded: ${orders.length}`);
  return orders;
};

const seedReviews = async ({ demoCustomer, secondCustomer }, products, orders) => {
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped');

  const reviewDocs = [];
  let poolIndex = 0;

  deliveredOrders.forEach((order) => {
    const reviewer = order.user.toString() === demoCustomer._id.toString() ? demoCustomer : secondCustomer;
    order.orderItems.forEach((item) => {
      const template = reviewPool[poolIndex % reviewPool.length];
      poolIndex += 1;
      reviewDocs.push({
        user: reviewer._id,
        product: item.product,
        order: order._id,
        rating: template.rating,
        title: template.title,
        comment: template.comment,
      });
    });
  });

  // A couple of extra cross-reviews so featured products show richer social
  // proof (both demo users purchased overlapping categories in real usage).
  const inserted = await Review.insertMany(reviewDocs, { ordered: false }).catch((err) => {
    // ignore duplicate-key races (same user+product) if any; log the rest
    if (err?.writeErrors) return err.insertedDocs || [];
    throw err;
  });

  // Recalculate rating/numReviews per product
  const productIds = [...new Set(reviewDocs.map((r) => r.product.toString()))];
  await Promise.all(
    productIds.map(async (productId) => {
      const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await Product.findByIdAndUpdate(productId, {
        rating: stats.length ? stats[0].avgRating : 0,
        numReviews: stats.length ? stats[0].count : 0,
      });
    })
  );

  console.log(`Reviews seeded: ${Array.isArray(inserted) ? inserted.length : reviewDocs.length}`);
};

const seedCoupons = async () => {
  const coupons = await Coupon.insertMany(couponsData);
  console.log(`Coupons seeded: ${coupons.length}`);
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

    await clearDatabase();

    if (destroyOnly) {
      console.log('Database destroyed (--destroy flag). Skipping re-seed.');
      process.exit(0);
    }

    const users = await seedUsers();
    const categories = await seedCategories();
    const products = await seedProducts(categories);
    const orders = await seedOrders(users, products);
    await seedReviews(users, products, orders);
    await seedCoupons();

    console.log('\n================= SEED COMPLETE =================');
    console.log('Demo login credentials (development only):');
    console.log(`  Admin:     ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('  Customer:  demo@shopwave.dev / Demo@12345');
    console.log('  Customer:  jane@shopwave.dev / Jane@12345');
    console.log('Sample coupon codes: WELCOME10, FLAT20, SAVE15');
    console.log('===================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

run();
