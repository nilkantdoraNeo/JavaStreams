const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const env = require("../config/env");
const { buildRunnerSource } = require("./runnerTemplate");

function execFilePromise(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function parseRunnerOutput(stdout) {
  const lines = String(stdout || "")
    .split(/\r?\n/)
    .filter(Boolean);

  const failedTests = [];
  let passed = 0;
  let total = 0;
  let output = "";
  let executionTime = null;
  let runtimeError = null;
  let timedOut = false;

  for (const line of lines) {
    if (line.startsWith("__RESULT__:")) {
      const [, passedText, totalText] = line.split(":");
      passed = Number(passedText) || 0;
      total = Number(totalText) || 0;
    } else if (line.startsWith("__FAIL__:")) {
      failedTests.push(line.replace("__FAIL__:", ""));
    } else if (line.startsWith("__RETURN__:")) {
      output = line.replace("__RETURN__:", "");
    } else if (line.startsWith("__TIME_MS__:")) {
      executionTime = Number(line.replace("__TIME_MS__:", "")) || null;
    } else if (line.startsWith("__RUNTIME_ERROR__:")) {
      runtimeError = line.replace("__RUNTIME_ERROR__:", "");
    } else if (line.startsWith("__EXEC_TIMEOUT__")) {
      timedOut = true;
    }
  }

  return {
    passed,
    total,
    failedTests,
    output,
    executionTime,
    runtimeError,
    timedOut
  };
}

async function executeInDocker({ workingDir, timeoutMs, memoryMb, startupGraceMs }) {
  const args = [
    "run",
    "--rm",
    "--network",
    "none",
    "--cpus",
    "0.75",
    "--memory",
    `${memoryMb}m`,
    "--pids-limit",
    "64",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=64m",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "-v",
    `${workingDir}:/workspace`,
    "-w",
    "/workspace",
    env.codeRunner.dockerImage,
    "sh",
    "-lc",
    "javac Solution.java Runner.java && java Runner"
  ];

  return execFilePromise("docker", args, {
    timeout: timeoutMs + startupGraceMs,
    maxBuffer: 1024 * 1024
  });
}

async function executeLocally({ workingDir, timeoutMs, memoryMb, startupGraceMs }) {
  const compile = await execFilePromise("javac", ["Solution.java", "Runner.java"], {
    cwd: workingDir,
    timeout: timeoutMs + startupGraceMs,
    maxBuffer: 1024 * 1024
  });

  const run = await execFilePromise(
    "java",
    [`-Xmx${memoryMb}m`, "Runner"],
    {
      cwd: workingDir,
      timeout: timeoutMs + startupGraceMs,
      maxBuffer: 1024 * 1024
    }
  );

  return {
    stdout: run.stdout,
    stderr: [compile.stderr, run.stderr].filter(Boolean).join("\n")
  };
}

async function runJavaTests({ code, testCases, timeoutMs, memoryMb }) {
  const safeTimeout = timeoutMs || env.codeRunner.timeoutMs;
  const safeMemory = memoryMb || env.codeRunner.memoryMb;
  const startupGraceMs = env.codeRunner.startupGraceMs || 7000;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "streamquest-"));
  const solutionPath = path.join(tmpDir, "Solution.java");
  const runnerPath = path.join(tmpDir, "Runner.java");

  await fs.writeFile(solutionPath, code, "utf8");
  await fs.writeFile(runnerPath, buildRunnerSource(testCases, safeTimeout), "utf8");

  try {
    const mode = String(env.codeRunner.mode || "docker").toLowerCase();
    let stdout = "";
    let stderr = "";

    if (mode === "local") {
      ({ stdout, stderr } = await executeLocally({
        workingDir: tmpDir,
        timeoutMs: safeTimeout,
        memoryMb: safeMemory,
        startupGraceMs
      }));
    } else {
      try {
        ({ stdout, stderr } = await executeInDocker({
          workingDir: tmpDir,
          timeoutMs: safeTimeout,
          memoryMb: safeMemory,
          startupGraceMs
        }));
      } catch (error) {
        const message = String(error?.message || "");
        if (mode === "auto" && message.includes("dockerDesktopLinuxEngine")) {
          ({ stdout, stderr } = await executeLocally({
            workingDir: tmpDir,
            timeoutMs: safeTimeout,
            memoryMb: safeMemory,
            startupGraceMs
          }));
        } else {
          throw error;
        }
      }
    }
    const parsed = parseRunnerOutput(stdout);
    if (parsed.timedOut) {
      return {
        status: "TIMEOUT",
        output: parsed.output,
        executionTime: parsed.executionTime,
        failedTests: ["Execution timeout"]
      };
    }

    if (parsed.runtimeError) {
      return {
        status: "RUNTIME_ERROR",
        executionTime: parsed.executionTime,
        output: parsed.output,
        failedTests: parsed.failedTests,
        details: parsed.runtimeError
      };
    }
    const allPassed = parsed.total > 0 && parsed.passed === parsed.total;
    return {
      status: allPassed ? "ACCEPTED" : "WRONG_ANSWER",
      executionTime: parsed.executionTime,
      output: parsed.output,
      passed: parsed.passed,
      total: parsed.total,
      failedTests: parsed.failedTests,
      stderr: String(stderr || "")
    };
  } catch (error) {
    if (error.killed) {
      return {
        status: "TIMEOUT",
        output: "",
        failedTests: ["Execution timeout"]
      };
    }
    const parsed = parseRunnerOutput(error.stdout || "");
    if (parsed.timedOut) {
      return {
        status: "TIMEOUT",
        output: parsed.output,
        executionTime: parsed.executionTime,
        failedTests: ["Execution timeout"]
      };
    }
    const stderr = String(error.stderr || "");
    const compileError = /error:/i.test(stderr) || /javac/i.test(stderr);
    return {
      status: compileError ? "COMPILE_ERROR" : "SYSTEM_ERROR",
      output: "",
      failedTests: [stderr || "Runner failed"],
      details: stderr || String(error.message || "")
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

module.exports = {
  runJavaTests
};
