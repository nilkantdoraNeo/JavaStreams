const env = require("../config/env");
const { buildProblemSeed } = require("./problemTemplates");
const { runJavaTests } = require("../codeexecutor/dockerJavaRunner");

function findMatchingParen(source, openIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "(") {
      depth += 1;
      continue;
    }

    if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function parseMapChecks(assertion) {
  const pairs = [];
  let cursor = 0;

  while (cursor < assertion.length) {
    const getIndex = assertion.indexOf(".get(", cursor);
    if (getIndex === -1) {
      break;
    }

    const keyOpen = getIndex + ".get".length;
    const keyClose = findMatchingParen(assertion, keyOpen);
    if (keyClose === -1) {
      break;
    }

    const equalsIndex = assertion.indexOf(".equals(", keyClose + 1);
    if (equalsIndex === -1) {
      break;
    }

    const valueOpen = equalsIndex + ".equals".length;
    const valueClose = findMatchingParen(assertion, valueOpen);
    if (valueClose === -1) {
      break;
    }

    pairs.push({
      keyExpr: assertion.slice(keyOpen + 1, keyClose).trim(),
      valueExpr: assertion.slice(valueOpen + 1, valueClose).trim()
    });

    cursor = valueClose + 1;
  }

  return pairs;
}

function inferReturnExpression(assertion) {
  const listMatch = assertion.match(/result\.equals\(java\.util\.List\.of\(([\s\S]*)\)\)/);
  if (listMatch) {
    return `java.util.List.of(${listMatch[1]})`;
  }

  const integerMatch = assertion.match(/\(\(Integer\)result\)\s*==\s*(-?\d+)/);
  if (integerMatch) {
    return integerMatch[1];
  }

  const longMatch = assertion.match(/\(\(Long\)result\)\s*==\s*(-?\d+)L/);
  if (longMatch) {
    return `${longMatch[1]}L`;
  }

  const stringMatch = assertion.match(/result\.equals\("((?:\\.|[^"])*)"\)/);
  if (stringMatch) {
    return `"${stringMatch[1]}"`;
  }

  if (assertion.includes("result instanceof Boolean")) {
    return "Boolean.TRUE";
  }

  const summaryMatch = assertion.match(/getSum\(\)\s*==\s*(-?\d+)/);
  if (summaryMatch) {
    return `java.util.stream.IntStream.of(${summaryMatch[1]}).summaryStatistics()`;
  }

  if (assertion.includes("result instanceof java.util.Map")) {
    const pairs = parseMapChecks(assertion);
    if (pairs.length === 0) {
      return null;
    }
    const flatPairs = pairs.map((pair) => `${pair.keyExpr}, ${pair.valueExpr}`).join(", ");
    return `java.util.Map.of(${flatPairs})`;
  }

  return null;
}

function injectReturn(starterCode, returnExpression) {
  const solved = starterCode.replace(/return\s+null\s*;/, `return ${returnExpression};`);
  if (solved === starterCode) {
    throw new Error("Could not inject return expression into starter code");
  }
  return solved;
}

async function run() {
  const targetCount = Math.max(30, env.game.targetProblemCount || 200);
  const problems = buildProblemSeed(targetCount);
  const failures = [];
  const startedAt = Date.now();

  // eslint-disable-next-line no-console
  console.log(`Running verification for ${problems.length} problems...`);

  for (let index = 0; index < problems.length; index += 1) {
    const problem = problems[index];
    const primaryAssertion = problem.testCases?.[0]?.assertion || "";
    const returnExpression = inferReturnExpression(primaryAssertion);

    if (!returnExpression) {
      failures.push({
        levelNumber: problem.levelNumber,
        title: problem.title,
        status: "GENERATOR_ERROR",
        details: `Unsupported assertion: ${primaryAssertion}`
      });
      // eslint-disable-next-line no-console
      console.log(`[${index + 1}/${problems.length}] L${problem.levelNumber} -> GENERATOR_ERROR`);
      continue;
    }

    let code;
    try {
      code = injectReturn(problem.starterCode, returnExpression);
    } catch (error) {
      failures.push({
        levelNumber: problem.levelNumber,
        title: problem.title,
        status: "GENERATOR_ERROR",
        details: error.message
      });
      // eslint-disable-next-line no-console
      console.log(`[${index + 1}/${problems.length}] L${problem.levelNumber} -> GENERATOR_ERROR`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const result = await runJavaTests({
      code,
      testCases: problem.testCases,
      timeoutMs: problem.timeLimitMs,
      memoryMb: problem.memoryLimitMb
    });

    if (result.status !== "ACCEPTED") {
      failures.push({
        levelNumber: problem.levelNumber,
        title: problem.title,
        status: result.status,
        details: (result.failedTests || []).join("; ") || result.details || "No error details"
      });
      // eslint-disable-next-line no-console
      console.log(`[${index + 1}/${problems.length}] L${problem.levelNumber} -> ${result.status}`);
    } else if ((index + 1) % 10 === 0) {
      // eslint-disable-next-line no-console
      console.log(`[${index + 1}/${problems.length}] verified`);
    }
  }

  const durationMs = Date.now() - startedAt;
  const passed = problems.length - failures.length;

  // eslint-disable-next-line no-console
  console.log(`\nVerification complete in ${Math.round(durationMs / 1000)}s`);
  // eslint-disable-next-line no-console
  console.log(`Passed: ${passed}/${problems.length}`);

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.log("Failures:");
    failures.forEach((failure) => {
      // eslint-disable-next-line no-console
      console.log(
        `- L${failure.levelNumber} ${failure.title}: ${failure.status}${failure.details ? ` | ${failure.details}` : ""}`
      );
    });
    process.exit(1);
    return;
  }

  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Verification script failed:", error);
  process.exit(1);
});
