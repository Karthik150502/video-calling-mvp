import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

// Example slice import
import counterReducer from "./slices/counterReducer"

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hook for dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;
