import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

const request = process.env.AI_TEST_REQUEST;
const outputDir = process.env.AI_TEST_OUTPUT_DIR || 'tests/ai-generated';
const model = process.env.OPENAI_MODEL || 'gpt-5.2';

if (!request) {
  throw new Error('AI_TEST_REQUEST is required.');
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const repoRoot = process.cwd();
const existingFiles = [
  'playwright.config.js',
  'tests/rahulshetty/login.spec.js',
  'tests/rahulshetty/shopChart.spec.js',
  'tests/support/aiTest.js',
]
  .filter((filePath) => fs.existsSync(path.join(repoRoot, filePath)))
  .map((filePath) => ({
    path: filePath,
    content: fs.readFileSync(path.join(repoRoot, filePath), 'utf8'),
  }));

const instructions = `
You are an expert Playwright test engineer.
Create or update Playwright test files for this repository.

Rules:
- Return only valid JSON. No markdown fences.
- JSON shape: {"summary":"short summary","files":[{"path":"tests/.../*.spec.js","content":"full file content"}],"testCommand":"npx playwright test <path>"}
- Only write files under tests/.
- Use CommonJS unless importing from tests/support/aiTest.js.
- Prefer stable locators: getByRole, getByText, ids, and scoped locators.
- For tests that exercise a feature, import { test, expect, captureFeatureScreenshot } from "../support/aiTest" or "../../support/aiTest" as needed, then call captureFeatureScreenshot(page, testInfo, "feature name") after the page reaches the feature's starting state and before performing the main action.
- Keep generated tests deterministic and readable.
- Existing Rahul Shetty credentials: username rahulshettyacademy, password Learning@830$3mK2.
- Existing login URL: https://rahulshettyacademy.com/loginpagePractise/.
`;

const response = await client.responses.create({
  model,
  instructions,
  input: [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `User request from Telegram:\n${request}\n\nPreferred output directory: ${outputDir}\n\nExisting project files:\n${existingFiles
            .map((file) => `--- ${file.path} ---\n${file.content}`)
            .join('\n\n')}`,
        },
      ],
    },
  ],
});

const raw = response.output_text.trim();
let payload;

try {
  payload = JSON.parse(raw);
} catch (error) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`OpenAI response was not JSON:\n${raw}`);
  }
  payload = JSON.parse(jsonMatch[0]);
}

if (!Array.isArray(payload.files) || payload.files.length === 0) {
  throw new Error('OpenAI response must include at least one file.');
}

const writtenFiles = [];
for (const file of payload.files) {
  if (!file.path || typeof file.content !== 'string') {
    throw new Error('Each generated file must include path and content.');
  }

  const normalizedPath = file.path.replaceAll('\\', '/');
  if (!normalizedPath.startsWith('tests/') || !normalizedPath.endsWith('.js')) {
    throw new Error(`Refusing to write outside tests/*.js: ${file.path}`);
  }

  const absolutePath = path.resolve(repoRoot, normalizedPath);
  const testsRoot = path.resolve(repoRoot, 'tests');
  if (!absolutePath.startsWith(testsRoot + path.sep)) {
    throw new Error(`Refusing unsafe path: ${file.path}`);
  }

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, file.content, 'utf8');
  writtenFiles.push(normalizedPath);
}

fs.mkdirSync('ai-output', { recursive: true });
fs.writeFileSync(
  'ai-output/generation-result.json',
  JSON.stringify(
    {
      summary: payload.summary || 'Generated Playwright tests.',
      files: writtenFiles,
      testCommand: payload.testCommand || `npx playwright test ${outputDir}`,
    },
    null,
    2,
  ),
);

console.log(`Generated files:\n${writtenFiles.join('\n')}`);
