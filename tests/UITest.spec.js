const {test, expect} = require('@playwright/test');

test('First test', async ({browser})=>
{
    //every function using async, it will follow with await
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://rahulshettyacademy.com/loginpagePractise/")
    console.log(await page.title());
    await expect(page).toHaveTitle("LoginPage Practise | Rahul Shetty Academy");

    page.locator
})