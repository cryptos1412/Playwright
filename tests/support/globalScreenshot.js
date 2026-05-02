const fs = require('fs');
const path = require('path');
const { test: base, expect } = require('@playwright/test');

function formatDateTime(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');

    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join('-') + '_' + [
        pad(date.getHours()),
        pad(date.getMinutes()),
    ].join('-');
}

function sanitizeName(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'test';
}

function getAutomationName(testInfo) {
    const relativeTestFile = path.relative(testInfo.config.rootDir, testInfo.file);
    const parts = relativeTestFile.split(path.sep);

    if (parts[0] === 'tests' && parts[1] && parts[1].includes('.spec') === false) {
        return sanitizeName(parts[1]);
    }

    return sanitizeName(path.basename(testInfo.file, path.extname(testInfo.file)));
}

function getScreenshotDir(testInfo) {
    if (process.env.SCREENSHOT_DIR) {
        return process.env.SCREENSHOT_DIR;
    }

    return path.join('screenshots', `${getAutomationName(testInfo)}-${formatDateTime()}`);
}

async function saveScreenshot(page, testInfo, stepName) {
    const screenshotDir = getScreenshotDir(testInfo);
    const testName = sanitizeName(testInfo.title);
    const fileName = `${String(testInfo.retry).padStart(2, '0')}-${testName}-${sanitizeName(stepName)}.png`;
    const screenshotPath = path.join(screenshotDir, fileName);

    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach(`${stepName} screenshot`, {
        path: screenshotPath,
        contentType: 'image/png',
    });
}

const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        await saveScreenshot(page, testInfo, 'before-test');

        try {
            await use(page);
        } finally {
            if (!page.isClosed()) {
                await saveScreenshot(page, testInfo, 'after-test');
            }
        }
    },
});

module.exports = {
    test,
    expect,
    saveScreenshot,
};
