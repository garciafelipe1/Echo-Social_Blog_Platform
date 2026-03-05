import '@/styles/globals.css';
import '@/styles/slider.css';
import type { NextComponentType, NextPageContext } from 'next';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import React from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from 'next-themes';
import wrapper from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export type NextLayoutComponentType<P = {}> = NextComponentType<NextPageContext, any, P> & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

export default function App({ Component, pageProps }: AppProps) {
  const getLayout =
    (Component as NextLayoutComponentType).getLayout || ((page: React.ReactNode) => page);

  const { store, props } = wrapper.useWrappedStore(pageProps);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={(store as any).persistor}>
        <ThemeProvider enableSystem attribute="class">
          {getLayout(<Component {...props} />)}
          <ToastContainer className="bottom-0" position="bottom-right" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
