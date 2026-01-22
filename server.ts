// server.js
import express from 'express';
import fs from 'node:fs/promises';
import { createServer as createViteServer } from 'vite';

import apiRouter from './src/api/routes';

async function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // api 요청 처리
  app.use('/api', apiRouter);

  // Vite 개발 서버 생성
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  // Vite의 connect 인스턴스를 미들웨어로 사용
  app.use(vite.middlewares);

  // 모든 요청 처리
  app.use('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      // 1. index.html 읽기
      let template = await fs.readFile('./index.html', 'utf-8');

      // 2. Vite HTML 변환 적용 (HMR 등)
      template = await vite.transformIndexHtml(url, template);

      // 3. 서버 진입점 로드
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

      // 4. 서버에서 React 컴포넌트 렌더링 + React Query 캐시 추출
      const { html, dehydratedState } = await render(url);

      // 5. HTML 템플릿 조합:
      // (1) <!--app-html--> 위치에 서버 렌더링된 HTML 삽입
      // (2) </body> 직전에 React Query 캐시를 스크립트로 주입
      const finalHtml = template
        .replace('<!--app-html-->', html)
        .replace(
          '</body>',
          `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}</script></body>`,
        );

      // 6. 응답 전송
      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e) {
      // 에러 발생 시 스택 트레이스 수정
      const error = e as Error;
      vite.ssrFixStacktrace(error);
      console.error(error);
      res.status(500).end(error.message);
    }
  });

  app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
  });
}

createServer();
