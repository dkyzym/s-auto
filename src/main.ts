import dotenv from 'dotenv';
dotenv.config();      // читает .env

import { chromium } from 'playwright';
import { ensureLoggedIn } from './lib/auth.js';

const userDataDir = './.auth/profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: null,
    args: ['--start-maximized']
  });
  const page = ctx.pages()[0] ?? await ctx.newPage();

//   await page.goto('https://sso.sbis.ru/auth-online/?ret=ret.saby.ru/');
//   await ensureLoggedIn(page);

await page.goto('https://ret.saby.ru/');      // ← вместо SSO‑ссылки
await ensureLoggedIn(page);


  // пока нет updatePurchases — просто остаёмся на главной
})();
