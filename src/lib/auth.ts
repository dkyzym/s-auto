import { Page, expect } from '@playwright/test';

/* медленное «человеческое» набивание */
async function typeSlow(page: Page, text: string, delayMs = 160) {
  for (const ch of text) {
    await page.keyboard.insertText(ch);
    await page.waitForTimeout(delayMs + Math.random() * 60); // 160‑220 мс
  }
}

/* гарантированно очищаем поле и печатаем заново */
async function clearAndType(page: Page, inputSelector: string, value: string) {
  const inp = page.locator(inputSelector);
  await expect(inp).toBeVisible({ timeout: 10_000 });
  await inp.click({ clickCount: 3 });          // выделяем всё
  await page.keyboard.press('Delete');         // стираем
  await expect(inp).toHaveValue('');           // убеждаемся, что чисто
  await typeSlow(page, value);                 // печатаем медленно
  await expect(inp).toHaveValue(value);        // валидация
}

async function doSsoLogin(page: Page) {
  /* ── логин ── */
  await clearAndType(
    page,
    '[data-qa="auth-AdaptiveLoginForm__login"] input',
    process.env.SABY_LOGIN!
  );
  await page.locator('[data-qa="auth-AdaptiveLoginForm__checkSignInTypeButton"]:visible').click();

  /* ── пароль ── */
  await clearAndType(
    page,
    '[data-qa="auth-AdaptiveLoginForm__password"] input',
    process.env.SABY_PASSWORD!
  );
  await page.locator('[data-qa="auth-AdaptiveLoginForm__signInButton"]:visible').click();

  /* ── долгий редирект ── */
  await page.waitForURL('**/ret.saby.ru/**', { timeout: 30_000 });
  await expect(page.getByText('Каталог').first()).toBeVisible({ timeout: 15_000 });
}

export async function ensureLoggedIn(page: Page) {
  /* 1. уже в ретейле? */
  if (
    page.url().includes('ret.saby.ru') &&
    (await page.getByText('Каталог').first().isVisible({ timeout: 4_000 }).catch(() => false))
  ) {
    return;
  }

  /* 2. стартуем с SSO‑формы? */
  if (page.url().includes('sso.sbis.ru')) {
    await doSsoLogin(page);
    return;
  }

  /* 3. пробуем сразу ретейл */
  await page.goto('https://ret.saby.ru/');
  if (
    page.url().includes('ret.saby.ru') &&
    (await page.getByText('Каталог').first().isVisible({ timeout: 4_000 }).catch(() => false))
  ) {
    return; // куки живы
  }

  /* 4. логинимся через форму */
  await page.goto('https://sso.sbis.ru/auth-online/?ret=ret.saby.ru/');
  await doSsoLogin(page);
}
