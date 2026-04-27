import { planner } from "./planner.js";
import { observer } from "./observer.js";

export async function runAgent(request) {
  let iteration = 0;

  while (iteration < 5) {
    iteration++;
    console.log(`\n=== Iteration ${iteration} ===`);

    // PLAN
    const testCase = await planner();
    if (!testCase) continue;

    console.log("TestCase:", testCase);

    // DO (Playwright)
    const response = await request.post(testCase.endpoint, {
      data: testCase.payload
    });

    const result = {
      status: response.status(),
      body: await response.json().catch(() => ({}))
    };

    console.log("Result:", result);

    // OBSERVE
    observer(testCase, result);
  }
}