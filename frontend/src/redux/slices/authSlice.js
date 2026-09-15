import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/authService';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser, clearAuthStorage } from '../../utils/storage';

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  bootstrapped: false, // becomes true once we've verified the token with the server
};

const extractErrorMessage = (error) => error?.message || 'Something went wrong. Please try again.';

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.register(payload);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.login(payload);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    // even if the server call fails, we still clear the client session
  }
  return true;
});

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.updateProfile(payload);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const res = await authService.changePassword(payload);
    return res.data.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setStoredToken(action.payload.token);
      setStoredUser(action.payload.user);
    },
  },
  extraReducers: (builder) => {
    const setAuthenticated = (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      setStoredToken(action.payload.token);
      setStoredUser(action.payload.user);
    };

    builder
      // register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, setAuthenticated)
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, setAuthenticated)
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        clearAuthStorage();
      })
      // load current user (bootstrap / token validation)
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.bootstrapped = true;
        setStoredUser(action.payload);
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.bootstrapped = true;
        clearAuthStorage();
      })
      // update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        setStoredUser(action.payload);
      })
      // change password (server issues a new token)
      .addCase(changePassword.fulfilled, setAuthenticated);
  },
});

export const { clearAuthError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
