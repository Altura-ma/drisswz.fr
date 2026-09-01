import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname);
const portfolioDir = resolve(root, 'portfolio');

const portfolioInputs = Object.fromEntries(
  readdirSync(portfolioDir)
    .filter((name) => statSync(resolve(portfolioDir, name)).isDirectory())
    .map((slug) => [`portfolio-${slug}`, `portfolio/${slug}/index.html`]),
);

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        cv: 'cv/index.html',
        portfolio: 'portfolio/index.html',
        ...portfolioInputs,
      },
    },
  },
});
