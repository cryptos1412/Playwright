const {test, expect} = require('@playwright/test');

test('First test', async ({browser})=>
{
    //every function using async, it will follow with await
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://automationexercise.com/")
    
})