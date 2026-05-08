const { test, expect } = require('@playwright/test');

const VALID_EMAIL = 'user@example.com';
const VALID_PASSWORD = 'Secret123!';

test.describe('Login form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders all form fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#remember')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
    await expect(page.locator('#togglePassword')).toBeVisible();
  });

  test('shows validation when both fields empty', async ({ page }) => {
    await page.locator('#submitBtn').click();
    await expect(page.locator('#emailError')).toHaveText('Email is required.');
    await expect(page.locator('#passwordError')).toHaveText('Password is required.');
  });

  test('rejects invalid email format', async ({ page }) => {
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('Secret123!');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#emailError')).toHaveText('Please enter a valid email.');
  });

  test('rejects too-short password', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill('short');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#passwordError')).toContainText('at least 8 characters');
  });

  test('rejects invalid credentials and shows remaining attempts', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill('WrongPass1!');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formError')).toContainText('Invalid email or password');
    await expect(page.locator('#formError')).toContainText('2 attempts remaining');
  });

  test('locks account after 3 failed attempts', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('#email').fill(VALID_EMAIL);
      await page.locator('#password').fill('WrongPass1!');
      await page.locator('#submitBtn').click();
      await expect(page.locator('#submitBtn')).toBeEnabled();
    }
    await expect(page.locator('#formError')).toContainText('Account temporarily locked');

    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formError')).toContainText('Too many failed attempts');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
    await expect(page.locator('#submitBtn')).toHaveText('Signed in');
  });

  test('login is case-insensitive on email', async ({ page }) => {
    await page.locator('#email').fill('USER@Example.com');
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
  });

  test('trims whitespace from email', async ({ page }) => {
    await page.locator('#email').fill('  user@example.com  ');
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
  });

  test('password is NOT trimmed (preserves leading/trailing spaces)', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(' Secret123! ');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formError')).toContainText('Invalid email or password');
  });

  test('toggle password visibility', async ({ page }) => {
    const password = page.locator('#password');
    const toggle = page.locator('#togglePassword');
    await expect(password).toHaveAttribute('type', 'password');
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveText('Hide');
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveText('Show');
  });

  test('remember-me persists email across reloads', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#remember').check();
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');

    await page.reload();
    await expect(page.locator('#email')).toHaveValue(VALID_EMAIL);
    await expect(page.locator('#remember')).toBeChecked();
  });

  test('remember-me unchecked clears stored email', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('rememberedEmail', 'user@example.com'));
    await page.reload();
    await expect(page.locator('#email')).toHaveValue(VALID_EMAIL);

    await page.locator('#remember').uncheck();
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');

    const stored = await page.evaluate(() => localStorage.getItem('rememberedEmail'));
    expect(stored).toBeNull();
  });

  test('clears errors after fixing input and resubmitting', async ({ page }) => {
    await page.locator('#submitBtn').click();
    await expect(page.locator('#emailError')).toHaveText('Email is required.');
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#emailError')).toHaveText('');
    await expect(page.locator('#passwordError')).toHaveText('');
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
  });

  test('submit button briefly disabled while signing in', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#submitBtn')).toBeDisabled();
    await expect(page.locator('#submitBtn')).toHaveText('Signed in');
  });

  test('pressing Enter in password field submits the form', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#password').press('Enter');
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
  });

  test('does not navigate away on submit (preventDefault)', async ({ page }) => {
    const startUrl = page.url();
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formSuccess')).toHaveText('Welcome back!');
    expect(page.url()).toBe(startUrl);
  });

  test('double-clicking submit does not register two attempts', async ({ page }) => {
    await page.locator('#email').fill(VALID_EMAIL);
    await page.locator('#password').fill('WrongPass1!');
    const btn = page.locator('#submitBtn');
    await btn.click();
    await btn.click({ force: true }).catch(() => {});
    await expect(page.locator('#formError')).toContainText('2 attempts remaining');
  });

  test('does not execute injected script payloads from email input', async ({ page }) => {
    const payload = '"><img src=x onerror="window.__xss=1">';
    await page.locator('#email').fill(payload);
    await page.locator('#password').fill('Secret123!');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#emailError')).toHaveText('Please enter a valid email.');
    const xss = await page.evaluate(() => window.__xss);
    expect(xss).toBeUndefined();
    await expect(page.locator('#loginForm img')).toHaveCount(0);
  });

  test('very long email is handled without crashing', async ({ page }) => {
    const longLocal = 'a'.repeat(300);
    await page.locator('#email').fill(longLocal + '@example.com');
    await page.locator('#password').fill(VALID_PASSWORD);
    await page.locator('#submitBtn').click();
    await expect(page.locator('#formError')).toContainText('Invalid email or password');
  });
});
