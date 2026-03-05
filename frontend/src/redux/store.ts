import { configureStore } from '@reduxjs/toolkit';
// import storage from "redux-persist/lib/storage";
import storage from './sync_storage';
import { createWrapper } from 'next-redux-wrapper';
import { persistReducer, persistStore } from 'redux-persist';
import rootReducer from './reducers';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer as import('redux').Reducer);

const MakeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  const persistor = persistStore(store);

  (store as any).persistor = persistor;

  return store;
};

const wrapper = createWrapper(MakeStore, {
  debug: false,
});

export default wrapper;
