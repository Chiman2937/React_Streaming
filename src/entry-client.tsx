import './globals.css';

import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { type DehydratedState, HydrationBoundary } from '@tanstack/react-query';

import App from './App';
import Providers from './providers';

declare global {
  interface Window {
    __REACT_QUERY_STATE__?: DehydratedState;
  }
}

const dehydratedState = window.__REACT_QUERY_STATE__;

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <HydrationBoundary state={dehydratedState}>
          <App />
        </HydrationBoundary>
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
