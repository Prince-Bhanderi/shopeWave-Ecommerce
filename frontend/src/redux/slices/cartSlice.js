import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../api/cartService';
import { calculateCartTotals, unitPriceOf, round2 } from '../../utils/priceCalculations';
import { getGuestCart, setGuestCart } from '../../utils/storage';

const emptyTotals = { subtotal: 0, discount: 0, shippingCost: 0, tax: 0, totalPrice: 0, totalQuantity: 0 };

const initialState = {
  items: [],
  coupon: null,
  mode: 'guest', // 'guest' | 'server' - flipped by CartProvider based on auth state
  status: 'idle',
  error: null,
  ...emptyTotals,
};

const extractErrorMessage = (error) => error?.message || 'Something went wrong with your cart.';

const recomputeGuestState = (state) => {
  const totals = calculateCartTotals(state.items, state.coupon);
  Object.assign(state, totals);
  setGuestCart(state.items);
};

const applyServerCart = (state, cart) => {
  state.items = cart.items;
  state.coupon = cart.coupon;
  state.subtotal = cart.subtotal;
  state.discount = cart.discount;
  state.shippingCost = cart.shippingCost;
  state.tax = cart.tax;
  state.totalPrice = cart.totalPrice;
  state.totalQuantity = cart.totalQuantity;
};

// ---------------- Server (authenticated) thunks ----------------

export const fetchServerCart = createAsyncThunk('cart/fetchServer', async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.getCart();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverAddItem = createAsyncThunk('cart/serverAdd', async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try {
    const res = await cartService.addToCart(productId, quantity);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverUpdateItem = createAsyncThunk('cart/serverUpdate', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartService.updateCartItem(itemId, quantity);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverRemoveItem = createAsyncThunk('cart/serverRemove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartService.removeCartItem(itemId);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverClearCart = createAsyncThunk('cart/serverClear', async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.clearCart();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverApplyCoupon = createAsyncThunk('cart/serverApplyCoupon', async (code, { rejectWithValue }) => {
  try {
    const res = await cartService.applyCoupon(code);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const serverRemoveCoupon = createAsyncThunk('cart/serverRemoveCoupon', async (_, { rejectWithValue }) => {
  try {
    const res = await cartService.removeCoupon();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

// Called right after login/register: pushes every locally-held guest cart
// item to the server cart, then fetches the authoritative merged cart.
export const mergeGuestCartToServer = createAsyncThunk('cart/mergeGuestCart', async (_, { rejectWithValue }) => {
  try {
    const guestItems = getGuestCart();
    for (const item of guestItems) {
      // Sequential on purpose: preserves guest cart insertion order and avoids
      // hammering the API with a burst of concurrent add-to-cart requests.
      await cartService.addToCart(item.product._id, item.quantity);
    }
    setGuestCart([]);
    const res = await cartService.getCart();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateGuestCart: (state) => {
      state.items = getGuestCart();
      const totals = calculateCartTotals(state.items, state.coupon);
      Object.assign(state, totals);
    },
    setCartMode: (state, action) => {
      state.mode = action.payload;
    },
    guestAddItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.product._id === product._id);
      const nextQty = Math.min((existing?.quantity || 0) + quantity, product.stock);

      if (existing) {
        existing.quantity = nextQty;
        existing.lineTotal = round2(unitPriceOf(product) * nextQty);
      } else {
        state.items.push({
          _id: product._id,
          product,
          quantity: nextQty,
          unitPrice: unitPriceOf(product),
          lineTotal: round2(unitPriceOf(product) * nextQty),
        });
      }
      recomputeGuestState(state);
    },
    guestUpdateItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.product.stock));
        item.lineTotal = round2(item.unitPrice * item.quantity);
      }
      recomputeGuestState(state);
    },
    guestRemoveItem: (state, action) => {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
      recomputeGuestState(state);
    },
    guestClearCart: (state) => {
      state.items = [];
      state.coupon = null;
      recomputeGuestState(state);
    },
    resetCartState: (state) => {
      Object.assign(state, initialState, { items: [], mode: 'guest' });
      setGuestCart([]);
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = 'loading';
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    };
    const fulfilledWithCart = (state, action) => {
      state.status = 'succeeded';
      applyServerCart(state, action.payload);
    };

    builder
      .addCase(fetchServerCart.pending, pending)
      .addCase(fetchServerCart.fulfilled, fulfilledWithCart)
      .addCase(fetchServerCart.rejected, rejected)

      .addCase(serverAddItem.pending, pending)
      .addCase(serverAddItem.fulfilled, fulfilledWithCart)
      .addCase(serverAddItem.rejected, rejected)

      .addCase(serverUpdateItem.pending, pending)
      .addCase(serverUpdateItem.fulfilled, fulfilledWithCart)
      .addCase(serverUpdateItem.rejected, rejected)

      .addCase(serverRemoveItem.pending, pending)
      .addCase(serverRemoveItem.fulfilled, fulfilledWithCart)
      .addCase(serverRemoveItem.rejected, rejected)

      .addCase(serverClearCart.pending, pending)
      .addCase(serverClearCart.fulfilled, fulfilledWithCart)
      .addCase(serverClearCart.rejected, rejected)

      .addCase(serverApplyCoupon.pending, pending)
      .addCase(serverApplyCoupon.fulfilled, fulfilledWithCart)
      .addCase(serverApplyCoupon.rejected, rejected)

      .addCase(serverRemoveCoupon.pending, pending)
      .addCase(serverRemoveCoupon.fulfilled, fulfilledWithCart)
      .addCase(serverRemoveCoupon.rejected, rejected)

      .addCase(mergeGuestCartToServer.pending, pending)
      .addCase(mergeGuestCartToServer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mode = 'server';
        applyServerCart(state, action.payload);
      })
      .addCase(mergeGuestCartToServer.rejected, rejected);
  },
});

export const {
  hydrateGuestCart,
  setCartMode,
  guestAddItem,
  guestUpdateItem,
  guestRemoveItem,
  guestClearCart,
  resetCartState,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
