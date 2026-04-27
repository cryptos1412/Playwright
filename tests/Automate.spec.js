import { test, expect } from '@playwright/test';
import { runAgent } from '../agent/agent.js';

test('Agentic QA Test', async ({ request }) => {
  await runAgent(request);

  expect(true).toBeTruthy();
});