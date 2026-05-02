const { test } = require('./support/globalScreenshot');

test('First test', async ({ page })=>
{
    await page.goto("https://automationexercise.com/")
})
