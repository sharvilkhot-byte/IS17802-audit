
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 5173,
      // strictPort: true, // Removed to allow fallback
      hmr: {
        host: 'localhost',
        // clientPort: 5173, // Removed to allow dynamic port selection
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
