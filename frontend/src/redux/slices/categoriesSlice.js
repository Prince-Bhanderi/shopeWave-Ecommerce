import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../api/categoryService';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await categoryService.getCategories();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to load categories');
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
