import { defineConfig } from 'astro/config';

// The account-level GitHub Pages site uses the root base.
// Overrides support isolated checks without changing the publication target.
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://saichriszhang.github.io',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
