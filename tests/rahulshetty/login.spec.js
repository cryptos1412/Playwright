const { test, expect } = require('@playwright/test');

const loginUrl = 'https://rahulshettyacademy.com/loginpagePractise/';
const validUsername = 'rahulshettyacademy';
const validPassword = 'Learning@830$3mK2';

async function openLoginPage(page) {
    await page.goto(loginUrl);
    await expect(page).toHaveTitle('LoginPage Practise | Rahul Shetty Academy');
}

async function login(page, username, password) {
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#terms').check();
    await page.locator('#signInBtn').click();
}

test.describe('Rahul Shetty - Login', () => {
    test.beforeEach(async ({ page }) => {
        await openLoginPage(page);
    });

    test('login berhasil dengan username dan password yang valid', async ({ page }) => {
        await login(page, validUsername, validPassword);

        await expect(page).toHaveURL(/.*angularpractice\/shop/);
        await expect(page.locator('app-card')).toHaveCount(4);
        await expect(page.getByText(/Checkout \( 0 \)/)).toBeVisible();
    });

    test('login gagal jika password salah', async ({ page }) => {
        await login(page, validUsername, 'passwordSalah');

        const errorMessage = page.locator('[style*="block"]').first();
        await expect(errorMessage).toContainText('Incorrect username/password');
        await expect(page).toHaveURL(/.*loginpagePractise/);
    });

    test('login gagal jika username salah', async ({ page }) => {
        await login(page, 'userSalah', validPassword);

        const errorMessage = page.locator('[style*="block"]').first();
        await expect(errorMessage).toContainText('Incorrect username/password');
        await expect(page).toHaveURL(/.*loginpagePractise/);
    });

    test('validasi muncul saat username dan password kosong', async ({ page }) => {
        await page.locator('#terms').check();
        await page.locator('#signInBtn').click();

        const errorMessage = page.locator('[style*="block"]').first();
        await expect(errorMessage).toContainText('Empty username/password.');
        await expect(page).toHaveURL(/.*loginpagePractise/);
    });

    test('role user dapat dipilih dan popup konfirmasi muncul', async ({ page }) => {
        await page.locator('input[value="user"]').check();

        await expect(page.locator('.modal-body')).toContainText('You will be limited to only fewer functionalities of the app');

        await page.locator('#okayBtn').click();
        await expect(page.locator('input[value="user"]')).toBeChecked();
    });
});
