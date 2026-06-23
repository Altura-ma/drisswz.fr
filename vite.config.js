import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        cv: 'cv/index.html',
        portfolio: 'portfolio/index.html',
      },
    },
  },
});
