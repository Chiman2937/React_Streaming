import express from 'express';
import fs from 'node:fs/promises';
import { ViteDevServer } from 'vite';

import apiRouter from './src/api/routes';

// Constants 설정
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
const base = process.env.BASE || '';

const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

// http 서버 생성
const app = express();

// Api 요청 처리
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);

let vite: ViteDevServer;

if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// 모든 요청 처리
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    let template;
    let render;

    if (!isProduction) {
      // 1. index.html 읽기
      template = await fs.readFile('./index.html', 'utf-8');

      // 2. Vite HTML 변환 적용 (HMR 등)
      template = await vite.transformIndexHtml(url, template);

      // 3. 서버 진입점 로드
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      // @ts-expect-error - 빌드 시 생성되는 파일
      render = (await import('./dist/server/entry-server.js')).render;
    }

    // 4. 서버에서 React 컴포넌트 렌더링 + React Query 캐시 추출
    const rendered = await render(url);

    // 5. HTML 템플릿 조합:
    // (1) <!--app-head--> 위치에 동적 head 태그 삽입 (title, meta 등)
    // (1) <!--app-html--> 위치에 서버 렌더링된 HTML 삽입
    const finalHtml = template
      .replace('<!--app-head-->', rendered.head ?? '')
      .replace('<!--app-html-->', rendered.html ?? '');

    // 6. 응답 전송
    res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
  } catch (e) {
    // 에러 발생 시 스택 트레이스 수정
    const error = e as Error;
    if (!isProduction && vite) {
      vite.ssrFixStacktrace(error);
    }
    console.error(error);
    res.status(500).end(error.message);
  }
});

// http 서버 시작
app.listen(port, () => {
  console.log('✅ Server running on http://localhost:3000');
});
