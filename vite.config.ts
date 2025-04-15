import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const host = env.VITE_HOST || 'localhost';
  const port = Number(env.VITE_PORT) || 5173;
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    server: {
      host,
      port,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
  };
});
