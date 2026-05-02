# n8n AI Playwright Agent

Dokumen ini menjelaskan alur Telegram -> n8n -> OpenAI/GitHub Actions -> Playwright -> report.

## Alur utama

1. User chat ke Telegram bot, misalnya:
   `buatkan test checkout produk iphone X dan validasi success purchase di Rahul Shetty`.
2. n8n menerima message dari `Telegram Trigger`.
3. n8n memanggil GitHub Actions workflow `AI Playwright Agent` melalui endpoint `workflow_dispatch`.
4. GitHub Actions menjalankan `scripts/ai-generate-tests.mjs`.
5. OpenAI membuat file Playwright spec baru di `tests/ai-generated`.
6. GitHub Actions commit dan push file generated test ke repository.
7. GitHub Actions menjalankan Playwright test.
8. HTML report dikonversi menjadi `playwright-report.pdf`.
9. Screenshot yang di-attach oleh helper `captureFeatureScreenshot` dikumpulkan sebagai artifact.
10. GitHub Actions mengirim callback ke n8n dan, jika secret Telegram tersedia, mengirim PDF ke Telegram.

## Secret GitHub yang diperlukan

- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Opsional:

- Repository variable `OPENAI_MODEL`, default workflow adalah `gpt-5.2`.

## Request GitHub API dari n8n

Gunakan node HTTP Request:

- Method: `POST`
- URL: `https://api.github.com/repos/<owner>/<repo>/actions/workflows/ai-playwright-agent.yml/dispatches`
- Authentication: GitHub token dengan akses `actions:write` dan `contents:write`
- Headers:
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
- Body JSON:

```json
{
  "ref": "main",
  "inputs": {
    "request": "{{$json.message.text}}",
    "output_dir": "tests/ai-generated",
    "test_path": "",
    "n8n_callback_url": "https://your-n8n-domain/webhook/playwright-report"
  }
}
```

## Format prompt Telegram yang disarankan

```text
Buatkan test Playwright untuk website Rahul Shetty.
Feature: checkout produk iphone X.
Scenario:
- login dengan user valid
- tambah iphone X ke cart
- lanjut checkout
- isi negara Indonesia
- purchase
- validasi muncul success message
Simpan di tests/ai-generated/checkout-iphone.spec.js.
```

## Screenshot before feature

Generated test diinstruksikan untuk memakai:

```js
const { test, expect, captureFeatureScreenshot } = require('../support/aiTest');
```

Lalu setelah halaman berada di awal fitur dan sebelum aksi utama:

```js
await captureFeatureScreenshot(page, testInfo, 'checkout iphone X');
```

Screenshot akan masuk ke Playwright attachment dan juga artifact `playwright-before-feature-screenshots`.
