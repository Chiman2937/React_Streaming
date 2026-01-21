import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);

server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

// server.events.on('request:match', ({ request }) => {
//   console.log('MSW matched:', request.method, request.url);
// });

// server.events.on('request:unhandled', ({ request }) => {
//   console.log('MSW Server unhandled:', request.method, request.url);
// });
