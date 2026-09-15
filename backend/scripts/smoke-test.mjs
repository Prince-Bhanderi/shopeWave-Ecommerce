/**
 * Lightweight route-wiring smoke test.
 *
 * This is NOT a substitute for a full integration test suite. It boots the
 * Express `app` in isolation (no live MongoDB connection) and asserts that:
 *   - every router/controller module loads without import errors
 *   - validation middleware rejects bad input before it reaches a controller
 *   - auth/authorization middleware blocks protected routes appropriately
 *   - unknown routes return a clean 404
 *   - the centralized error handler always returns a consistent JSON
 *     envelope and never lets an unhandled exception crash the process
 *
 * Run it any time with: npm run smoke-test
 * (add a real MongoDB + supertest-backed CRUD test suite for deeper
 * coverage once you have a database available in your environment)
 */
import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke-test-secret-key-not-for-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Fail fast instead of hanging when no DB connection is open.
mongoose.set('bufferCommands', false);

const { default: app } = await import('../src/app.js');

let pass = 0;
let fail = 0;
const check = (label, cond, extra = '') => {
  if (cond) {
    pass += 1;
    console.log(`PASS  ${label}`);
  } else {
    fail += 1;
    console.log(`FAIL  ${label} ${extra}`);
  }
};

const dbIsConnected = mongoose.connection.readyState === 1;

console.log(`Running smoke test (database connected: ${dbIsConnected})...\n`);

// 1. Health check - no DB needed
{
  const res = await request(app).get('/api/health');
  check('GET /api/health -> 200', res.status === 200, JSON.stringify(res.body));
  check('health body has success:true', res.body.success === true);
}

// 2. Unknown route -> 404 via notFound middleware
{
  const res = await request(app).get('/api/this-route-does-not-exist');
  check('GET unknown route -> 404', res.status === 404);
  check('404 body has success:false', res.body.success === false);
}

// 3. Validation middleware runs BEFORE controller/DB access
{
  const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email' });
  check('POST /api/auth/register invalid body -> 400', res.status === 400, JSON.stringify(res.body));
  check('validation errors array present', Array.isArray(res.body.errors) && res.body.errors.length > 0);
}
{
  const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: '' });
  check('POST /api/auth/login invalid body -> 400', res.status === 400);
}

// 4. Auth middleware blocks protected routes before DB access
{
  const res = await request(app).get('/api/cart');
  check('GET /api/cart no token -> 401', res.status === 401, JSON.stringify(res.body));
}
{
  const res = await request(app).get('/api/wishlist');
  check('GET /api/wishlist no token -> 401', res.status === 401);
}
{
  const res = await request(app).get('/api/orders/my-orders');
  check('GET /api/orders/my-orders no token -> 401', res.status === 401);
}
{
  const res = await request(app).get('/api/admin/dashboard');
  check('GET /api/admin/dashboard no token -> 401', res.status === 401);
}
{
  const res = await request(app).post('/api/products').send({ name: 'x' });
  check('POST /api/products no token -> 401', res.status === 401);
}

// 5. Bad JWT -> 401 (jwt.verify error path)
{
  const res = await request(app).get('/api/cart').set('Authorization', 'Bearer not-a-real-token');
  check('GET /api/cart bad token -> 401', res.status === 401);
}

// 6. Malformed Mongo id in a param is handled gracefully, not an unhandled crash
{
  const res = await request(app).get('/api/products/not-a-valid-id');
  check('GET /api/products/:badId -> handled gracefully', res.status === 404 || res.status === 500, `status=${res.status}`);
}

// 7. DB-backed routes degrade to a clean JSON error instead of crashing when
//    the database is unreachable (only meaningful when run without a DB).
if (!dbIsConnected) {
  const res = await request(app).get('/api/products');
  check('GET /api/products (no DB) -> clean JSON error, not a crash', res.status === 500 && res.body.success === false, JSON.stringify(res.body));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
