import { configureStore } from '@reduxjs/toolkit';
import referencesSlice from './slice/referencesSlice';

export const store = configureStore({
     reducer: {
          references: referencesSlice,
     },
});