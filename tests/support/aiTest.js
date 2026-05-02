const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

async function captureFeatureScreenshot(page, testInfo, featureName) {
    const safeName = featureName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const screenshotPath = path.join(testInfo.outputDir, `before-${safeName || 'feature'}.png`);

    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(`before ${featureName}`, {
        path: screenshotPath,
        contentType: 'image/png',
    });
}

module.exports = {
    test,
    expect,
    captureFeatureScreenshot,
};
