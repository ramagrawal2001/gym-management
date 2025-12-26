import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gymReducer from './slices/gymSlice';
import notificationReducer from './slices/notificationSlice';
import memberReducer from './slices/memberSlice';
import leadReducer from './slices/leadSlice';
import uiReducer from './slices/uiSlice';
import expenseReducer from './slices/expenseSlice';
import revenueReducer from './slices/revenueSlice';
import financialReportReducer from './slices/financialReportSlice';

// Persist configuration for auth slice
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated'] // Only persist these fields
};

// Persist configuration for gym slice (to persist feature toggles)
const gymPersistConfig = {
  key: 'gym',
  storage,
  whitelist: ['features'] // Only persist features
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedGymReducer = persistReducer(gymPersistConfig, gymReducer);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  gym: persistedGymReducer,
  notifications: notificationReducer,
  members: memberReducer,
  leads: leadReducer,
  ui: uiReducer,
  expenses: expenseReducer,
  revenues: revenueReducer,
  financialReports: financialReportReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

export default store;

