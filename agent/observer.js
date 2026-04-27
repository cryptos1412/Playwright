import { memory } from "./memory.js";

export function observer(testCase, result) {
  if (result.status >= 500) {
    console.log("Critical bug found!");
    memory.failedCases.push({ testCase, result });
  } else {
    console.log("No critical bug");
  }
}