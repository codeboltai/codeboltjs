# Skill Optimization Script

A tool to iteratively optimize Claude Code skills using the Claude Agent SDK.

## How It Works

The script runs an optimization loop with three steps:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Optimization Cycle                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Generate Output                                        │
│  ├─ Load current skill                                          │
│  ├─ Execute prompt with skill context                           │
│  └─ Capture generated output                                    │
│                                                                 │
│  Step 2: Critique                                               │
│  ├─ Compare generated output vs expected output                 │
│  ├─ Identify issues and missing elements                        │
│  ├─ Score quality (0-100)                                       │
│  └─ Suggest improvements                                        │
│                                                                 │
│  Step 3: Improve Skill                                          │
│  ├─ Analyze critique feedback                                   │
│  ├─ Rewrite skill to address issues                             │
│  └─ Output improved skill                                       │
│                                                                 │
│  [Repeat for N cycles or until score >= 95]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

```bash
cd skills/skilloptimizationscript
npm install
```

Ensure you have your Anthropic API key set:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

## Usage

### Command Line

```bash
node optimize-skill.js <skill-path> <prompt-file> <expected-output-file> [options]
```

**Arguments:**
- `skill-path` - Path to the skill file (SKILL.md)
- `prompt-file` - Path to file containing the test prompt
- `expected-output-file` - Path to file containing expected output

**Options:**
- `--cycles=N` - Number of optimization cycles (default: 3)
- `--output=DIR` - Output directory for results (default: ./optimization-results)
- `--quiet` - Disable verbose logging

**Example:**

```bash
# Create test files
echo "Create a React component that displays a user profile" > test-prompt.txt
echo "export function UserProfile({ user }) { ... }" > expected-output.txt

# Run optimization
node optimize-skill.js ../my-skill/SKILL.md test-prompt.txt expected-output.txt --cycles=5
```

### Programmatic Usage

```javascript
import { optimizeSkill } from "./optimize-skill.js";

const results = await optimizeSkill({
  prompt: "Create a function that validates email addresses",
  expectedOutput: `
function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}
  `.trim(),
  skillPath: "./my-skill/SKILL.md",
  cycles: 3,
  outputDir: "./results",
  verbose: true,
});

console.log("Final score:", results[results.length - 1].score);
```

## Output Structure

After running, the output directory contains:

```
optimization-results/
├── cycle-1/
│   ├── generated-output.txt    # Output from skill
│   ├── critique.md             # Critique analysis
│   ├── improved-skill.md       # Improved skill
│   └── metadata.json           # Cycle metadata
├── cycle-2/
│   └── ...
├── cycle-N/
│   └── ...
├── final-skill.md              # Final optimized skill
└── summary.json                # Optimization summary
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prompt` | string | required | The test prompt to evaluate the skill |
| `expectedOutput` | string | required | The expected output to compare against |
| `skillPath` | string | required | Path to the skill file |
| `cycles` | number | 3 | Number of optimization cycles |
| `outputDir` | string | "./optimization-results" | Output directory |
| `verbose` | boolean | true | Enable verbose logging |

## Best Practices

1. **Start with clear expected output** - The more specific your expected output, the better the optimization.

2. **Use representative prompts** - Choose prompts that exercise the main use cases of your skill.

3. **Run multiple test cases** - Optimize against different prompts to ensure the skill generalizes well.

4. **Review intermediate results** - Check the critique at each cycle to understand what's being changed.

5. **Set reasonable cycle counts** - Usually 3-5 cycles are sufficient. More cycles may over-fit to the specific test case.

## Example Run

```bash
$ node optimize-skill.js ../codebolt-provider-development/SKILL.md prompt.txt expected.txt --cycles=3

============================================================
Starting Skill Optimization
Skill: ../codebolt-provider-development/SKILL.md
Cycles: 3
============================================================

--- Cycle 1/3 ---

Step 1: Generating output with skill...
Generated 2847 characters of output
Step 2: Critiquing output against expected...
Score: 65/100
Step 3: Improving skill based on critique...
Improved skill: 12340 characters
Saved results to ./optimization-results/cycle-1/

--- Cycle 2/3 ---

Step 1: Generating output with skill...
Generated 3102 characters of output
Step 2: Critiquing output against expected...
Score: 82/100
Step 3: Improving skill based on critique...
Improved skill: 13567 characters
Saved results to ./optimization-results/cycle-2/

--- Cycle 3/3 ---

Step 1: Generating output with skill...
Generated 3245 characters of output
Step 2: Critiquing output against expected...
Score: 91/100
Step 3: Improving skill based on critique...
Improved skill: 14102 characters
Saved results to ./optimization-results/cycle-3/

Final optimized skill saved to: ./optimization-results/final-skill.md

============================================================
Optimization Complete
Final Score: 91/100
Results saved to: ./optimization-results
============================================================
```
