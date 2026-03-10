const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseVersion(versionText) {
  const clean = String(versionText || "").replace(/^v/, "");
  const parts = clean.split(".").map((part) => Number(part));
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

function compareVersions(a, b) {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

function findNode18OrHigherFromNvm() {
  const localAppData = process.env.LOCALAPPDATA || "";
  const nvmHome = process.env.NVM_HOME || path.join(localAppData, "nvm");

  if (!nvmHome || !fs.existsSync(nvmHome)) {
    return null;
  }

  const directories = fs
    .readdirSync(nvmHome, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^v\d+\.\d+\.\d+$/.test(entry.name))
    .map((entry) => ({
      entryName: entry.name,
      version: parseVersion(entry.name)
    }))
    .filter((item) => item.version.major >= 18)
    .sort((a, b) => compareVersions(b.version, a.version));

  const preferredMajorOrder = [20, 22, 18];
  for (const major of preferredMajorOrder) {
    const match = directories.find((item) => item.version.major === major);
    if (match) {
      const preferredPath = path.join(nvmHome, match.entryName, "node.exe");
      if (fs.existsSync(preferredPath)) {
        return preferredPath;
      }
    }
  }

  for (const item of directories) {
    const nodePath = path.join(nvmHome, item.entryName, "node.exe");
    if (fs.existsSync(nodePath)) {
      return nodePath;
    }
  }

  return null;
}

function resolveTarget(mode) {
  if (mode === "dev") {
    return {
      file: path.join(process.cwd(), "node_modules", "nodemon", "bin", "nodemon.js"),
      args: ["src/server.js"]
    };
  }
  if (mode === "seed") {
    return {
      file: path.join(process.cwd(), "src", "seed", "runSeeder.js"),
      args: []
    };
  }
  if (mode === "verify-problems") {
    return {
      file: path.join(process.cwd(), "src", "seed", "verifyAllProblems.js"),
      args: []
    };
  }
  return {
    file: path.join(process.cwd(), "src", "server.js"),
    args: []
  };
}

function run() {
  const mode = process.argv[2] || "start";
  const current = parseVersion(process.version);

  let nodeBinary = process.execPath;
  if (current.major < 18) {
    const nvmNode = findNode18OrHigherFromNvm();
    if (!nvmNode) {
      // eslint-disable-next-line no-console
      console.error(
        "Node >= 18 required for backend dependencies. Install/use Node 18+ via nvm (example: nvm use 20.11.1)."
      );
      process.exit(1);
    }
    nodeBinary = nvmNode;
    // eslint-disable-next-line no-console
    console.log(`Using Node from NVM: ${nodeBinary}`);
  }

  const target = resolveTarget(mode);
  if (!fs.existsSync(target.file)) {
    // eslint-disable-next-line no-console
    console.error(`Unable to find runtime target: ${target.file}`);
    process.exit(1);
  }

  const child = spawn(nodeBinary, [target.file, ...target.args], {
    stdio: "inherit"
  });

  child.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code == null ? 1 : code);
  });
}

run();
