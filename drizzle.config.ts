import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: '/Users/numan/Library/Application Support/Electron/sqlite.db',
  },
} satisfies Config;
