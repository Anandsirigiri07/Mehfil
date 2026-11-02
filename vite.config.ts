import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
function vercelDevApiPlugin(): Plugin {
  return {
    name: 'vercel-dev-api',
    configureServer(server) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (!url.startsWith('/api/')) {
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
            const mod = await server.ssrLoadModule('.' + url + '.ts');
            await mod.default(req, vRes);
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
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }
  return {
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
  };
});
