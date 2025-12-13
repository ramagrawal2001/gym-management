import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gymReducer from './slices/gymSlice';
import notificationReducer from './slices/notificationSlice';
import memberReducer from './slices/memberSlice';
import leadReducer from './slices/leadSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gym: gymReducer,
    notifications: notificationReducer,
    members: memberReducer,
    leads: leadReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export default store;

