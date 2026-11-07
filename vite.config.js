import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const routes = ['income-tax-calculator', 'currency-converter', 'gold-rates', 'salary-calculator', 'expense-planner', 'financial-guides'];

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        ...Object.fromEntries(routes.map(route => [route, resolve(root, route, 'index.html')])),
      },
    },
  },
});
