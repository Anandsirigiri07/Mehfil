import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import parseIntakeHandler from './api/parse-intake';
import suggestIdeasHandler from './api/suggest-ideas';
import reviewPlanHandler from './api/review-plan';
import askPlannerHandler from './api/ask-planner';

function vercelDevApiPlugin(): Plugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerMap: Record<string, (req: any, res: any) => Promise<void>> = {
    '/api/parse-intake': parseIntakeHandler,
    '/api/suggest-ideas': suggestIdeasHandler,
    '/api/review-plan': reviewPlanHandler,
    '/api/ask-planner': askPlannerHandler,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const middleware = (req: any, res: any, next: any) => {
    const url = req.url ? req.url.split('?')[0] : '';
    const handler = handlerMap[url];
    if (!handler) {
      return next();
    }

    const buffers: Buffer[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.on('data', (chunk: any) => buffers.push(Buffer.from(chunk)));
    req.on('end', async () => {
      try {
        const bodyStr = Buffer.concat(buffers).toString('utf-8');
        req.body = bodyStr ? JSON.parse(bodyStr) : {};
      } catch {
        req.body = {};
      }

      const vRes = Object.assign(res, {
        status(code: number) {
          res.statusCode = code;
          return vRes;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json(data: any) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return vRes;
        },
      });

      try {
        await handler(req, vRes);
      } catch (err: unknown) {
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Internal Server Error',
            })
          );
        }
      }
    });
  };

  return {
    name: 'vercel-dev-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelDevApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
