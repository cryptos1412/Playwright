const { test, expect } = require('@playwright/test');

const loginUrl = 'https://rahulshettyacademy.com/loginpagePractise/';
const validUsername = 'rahulshettyacademy';
const validPassword = 'Learning@830$3mK2';

async function login(page) {
    await page.goto(loginUrl);
    await page.locator('#username').fill(validUsername);
    await page.locator('#password').fill(validPassword);
    await page.locator('#terms').check();
    await page.locator('#signInBtn').click();
    await expect(page).toHaveURL(/.*angularpractice\/shop/);
}

async function addProductToCart(page, productName) {
    const productCard = page.locator('app-card').filter({ hasText: productName });

    await expect(productCard).toBeVisible();
    await productCard.getByRole('button', { name: /Add/ }).click();
}

test.describe('Rahul Shetty - Shop cart checkout', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('checkout berhasil untuk satu produk', async ({ page }) => {
        const productName = 'iphone X';

        await addProductToCart(page, productName);
        await expect(page.getByText(/Checkout \( 1 \)/)).toBeVisible();

        await page.getByText(/Checkout \( 1 \)/).click();
        await expect(page.locator('h4.media-heading')).toContainText(productName);

        await page.getByRole('button', { name: 'Checkout' }).click();
        await page.locator('#country').fill('Indonesia');
        await page.locator('#checkbox2').check({ force: true });
        await page.getByRole('button', { name: 'Purchase' }).click();

        await expect(page.locator('.alert-success')).toContainText('Success! Thank you!');
    });

    test('checkout berhasil untuk dua produk dan total quantity sesuai', async ({ page }) => {
        const products = ['iphone X', 'Samsung Note 8'];

        for (const productName of products) {
            await addProductToCart(page, productName);
        }

        await expect(page.getByText(/Checkout \( 2 \)/)).toBeVisible();

        await page.getByText(/Checkout \( 2 \)/).click();
        await expect(page.locator('h4.media-heading')).toHaveCount(2);
        await expect(page.locator('h4.media-heading').nth(0)).toContainText(products[0]);
        await expect(page.locator('h4.media-heading').nth(1)).toContainText(products[1]);

        await page.getByRole('button', { name: 'Checkout' }).click();
        await expect(page.locator('#country')).toBeVisible();
    });

    test('checkout tidak bisa dilanjutkan jika cart masih kosong', async ({ page }) => {
        await page.getByText(/Checkout \( 0 \)/).click();

        await expect(page.locator('.media')).toHaveCount(0);
        await expect(page.locator('h3 strong')).toContainText('0');
        await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
    });
});
