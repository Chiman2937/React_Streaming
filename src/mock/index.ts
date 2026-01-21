// src/mocks/index.ts
import type { SetupWorker } from 'msw/browser';

declare global {
  interface Window {
    mswWorker?: SetupWorker;
  }
}

export const initMocks = async () => {
  // Vite 환경 변수 사용
  const shouldEnable = import.meta.env.VITE_MSW_ENABLED === 'true';
  if (!shouldEnable) return;

  // 서버 환경
  if (typeof window === 'undefined') {
    const { server } = await import('./server');
    server.listen({
      onUnhandledRequest: 'bypass',
    });
    console.log('🔶 MSW Server ready');
    return;
  }

  // 브라우저 환경
  if (!window.mswWorker) {
    const { worker } = await import('./browser');
    window.mswWorker = worker;

    await worker.start({
      onUnhandledRequest: 'bypass',
      // Vite 개발 서버와 충돌 방지
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('🔷 MSW Client ready');
  } else {
    const worker = window.mswWorker;
    worker.resetHandlers();
  }
};
