/**
 * Example usage of the Skill Optimization Script
 *
 * This example demonstrates how to programmatically optimize a skill
 * by providing a test prompt and expected output.
 */

import { optimizeSkill } from "./optimize-skill.js";
import fs from "fs/promises";
import path from "path";

// Example: Optimizing a provider development skill
async function runExample() {
  // Define the test case
  const testPrompt = await fs.readFile("./testingassets/prompt.md", "utf-8");
  const expectedOutput = await fs.readFile("./testingassets/expectedoutput.txt", "utf-8");
  const skillPath = path.resolve("./testingarena/.claude/skills/codebolt-agent-development/SKILL.md");

  console.log("Starting skill optimization example...\n");

  try {
    const results = await optimizeSkill({
      prompt: testPrompt.trim(),
      expectedOutput: expectedOutput.trim(),
      skillPath: skillPath,
      cycles: 3,
      outputDir: "./example-results",
      verbose: true,
    });

    // // Print summary
    // console.log("\n--- Optimization Summary ---");
    // console.log(`Total cycles: ${results.length}`);
    // console.log("Score progression:");
    // results.forEach((r) => {
    //   console.log(`  Cycle ${r.cycle}: ${r.score}/100`);
    // });

    // // Check if we can read the final skill
    // const finalSkill = await fs.readFile("./example-results/final-skill.md", "utf-8");
    // console.log(`\nFinal skill length: ${finalSkill.length} characters`);

  } catch (error) {
    console.error("Optimization failed:", error.message);
    process.exit(1);
  }
}

// Alternative: Run with custom configuration
async function runCustomOptimization() {
  // Create a simple test skill
  const testSkillContent = `---
name: simple-function-skill
description: A skill for creating simple JavaScript functions
---

# Simple Function Skill

When creating functions:
- Use descriptive names
- Add JSDoc comments
- Handle edge cases
`;

  // Write test skill to temp file
  const tempSkillPath = "./temp-skill.md";
  await fs.writeFile(tempSkillPath, testSkillContent);

  const results = await optimizeSkill({
    prompt: "Create a function that validates an email address",
    expectedOutput: `
/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email.trim());
}
`.trim(),
    skillPath: tempSkillPath,
    cycles: 2,
    outputDir: "./custom-results",
    verbose: true,
  });

  // Cleanup temp file
  await fs.unlink(tempSkillPath);

  return results;
}

// Run the example
runExample().catch(console.error);

// Export for programmatic use
export { runExample, runCustomOptimization };
