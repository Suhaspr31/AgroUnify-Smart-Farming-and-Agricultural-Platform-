import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cropReducer from './cropSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    crops: cropReducer,
    cart: cartReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
