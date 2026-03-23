import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    assetsInclude: ['**/admin/data.json'],
  },
});