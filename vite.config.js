import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 프로젝트 사이트: https://<user>.github.io/GRIND/
export default defineConfig({
  base: '/GRIND/',
  plugins: [react()],
});
