import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import App from './App';
import { getQueryClient } from './lib/queryClient';
import Providers from './providers';

export async function render(url: string) {
  const queryClient = getQueryClient();

  // URL별 prefetch
  if (url === '/') {
    await queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: () => fetch('http://localhost:3000/api/users').then((r) => r.json()),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <Providers>
          <HydrationBoundary state={dehydratedState}>
            <App />
          </HydrationBoundary>
        </Providers>
      </StaticRouter>
    </StrictMode>,
  );
  return { html, dehydratedState };
}
