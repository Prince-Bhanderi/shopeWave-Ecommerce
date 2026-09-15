import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../api/wishlistService';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const extractErrorMessage = (error) => error?.message || 'Something went wrong with your wishlist.';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistService.getWishlist();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistService.addToWishlist(productId);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistService.removeFromWishlist(productId);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const moveWishlistItemToCart = createAsyncThunk('wishlist/moveToCart', async (productId, { rejectWithValue }) => {
  try {
    await wishlistService.moveToCart(productId);
    const res = await wishlistService.getWishlist();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistState: () => initialState,
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
    const fulfilled = (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    };

    builder
      .addCase(fetchWishlist.pending, pending)
      .addCase(fetchWishlist.fulfilled, fulfilled)
      .addCase(fetchWishlist.rejected, rejected)
      .addCase(addToWishlist.pending, pending)
      .addCase(addToWishlist.fulfilled, fulfilled)
      .addCase(addToWishlist.rejected, rejected)
      .addCase(removeFromWishlist.pending, pending)
      .addCase(removeFromWishlist.fulfilled, fulfilled)
      .addCase(removeFromWishlist.rejected, rejected)
      .addCase(moveWishlistItemToCart.pending, pending)
      .addCase(moveWishlistItemToCart.fulfilled, fulfilled)
      .addCase(moveWishlistItemToCart.rejected, rejected);
  },
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
