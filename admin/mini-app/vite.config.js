import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/the4/admin/mini-app-dist/',
  build: {
    outDir: '../../public/admin/mini-app-dist',
    emptyOutDir: true,
  },
});
