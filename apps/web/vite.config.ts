import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    // Le front et l'API partagent une origine : pas de CORS, cookies same-site.
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: { environment: 'jsdom' },
});
