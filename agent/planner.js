import OpenAI from "openai";
import { memory } from "./memory.js";
import 'dotenv/config';

console.log("API KEY:", process.env.OPENAI_API_KEY);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function planner() {
  const prompt = `
  You are a QA engineer.

  Previous failures:
  ${JSON.stringify(memory.failedCases)}

  Generate 1 API test case in JSON:
  {
    "endpoint": "...",
    "payload": { }
  }
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return null;
  }
}