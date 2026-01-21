// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs/promises';

async function createServer() {
  const app = express();

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

      // 4. 앱 HTML 렌더링
      const appHtml = await render(url);

      // 5. 템플릿에 렌더링된 HTML 삽입
      const html = template.replace(`<!--app-html-->`, appHtml);

      // 6. 응답 전송
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // 에러 발생 시 스택 트레이스 수정
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000, () => {
    console.log('✅ Server running on http://localhost:3000');
  });
}

createServer();
