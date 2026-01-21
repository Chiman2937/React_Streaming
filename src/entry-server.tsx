import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

import App from './App';
import Providers from './providers';

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <Providers>
        <App />
      </Providers>
    </StaticRouter>,
  );
  return html;
}
