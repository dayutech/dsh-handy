import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function mustExist(relativePath) {
  const absolute = join(root, relativePath);
  if (!existsSync(absolute)) fail(`missing ${relativePath}`);
  return absolute;
}

function readJson(relativePath) {
  const absolute = mustExist(relativePath);
  if (!existsSync(absolute)) return null;
  try {
    return JSON.parse(readFileSync(absolute, "utf8"));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

const pkg = readJson("package.json");
if (pkg !== null) {
  if (typeof pkg.name !== "string" || pkg.name === "")
    fail("package name is empty");
  if (typeof pkg.version !== "string" || pkg.version === "")
    fail("package version is empty");
  if (
    typeof pkg.repository?.url !== "string" ||
    !pkg.repository.url.includes("github.com/dayutech/dsh-handy")
  ) {
    fail("repository.url must point at dayutech/dsh-handy");
  }
  if (typeof pkg.engines?.dsh !== "string" || pkg.engines.dsh === "") {
    fail("engines.dsh is required for marketplace compatibility");
  }
  if (pkg.dsh?.bundle?.patch !== "./cordis.patch.yml") {
    fail("dsh.bundle.patch must be ./cordis.patch.yml");
  }
  if (pkg.dsh?.client?.platform !== "web") {
    fail("dsh.client.platform must be web");
  }
  if (
    !Array.isArray(pkg.dsh?.client?.inject) ||
    pkg.dsh.client.inject.length === 0
  ) {
    fail("dsh.client.inject must list the client dependencies");
  }
  for (const required of [
    "lib",
    "cordis.patch.yml",
    "README.md",
    "README.en.md",
    "assets",
    "screenshots.json",
  ]) {
    if (!Array.isArray(pkg.files) || !pkg.files.includes(required)) {
      fail(`package files must include ${required}`);
    }
  }
}

const patchPath = mustExist("cordis.patch.yml");
if (existsSync(patchPath)) {
  const patch = readFileSync(patchPath, "utf8");
  if (
    !patch.includes("insert:") ||
    !patch.includes("id: dsh-handy") ||
    !patch.includes("name: dsh-handy")
  ) {
    fail("cordis.patch.yml must insert the dsh-handy bundle");
  }
}

for (const artifact of ["lib/index.js", "lib/client.js"]) {
  const absolute = mustExist(artifact);
  if (existsSync(absolute) && statSync(absolute).size < 100)
    fail(`${artifact} looks empty`);
}

// The submission file is YAML, not JSON; validate its required text below.
const entryPath = join(root, "market/dayutech__dsh-handy.yml");
if (existsSync(entryPath)) {
  const entry = readFileSync(entryPath, "utf8");
  if (!entry.includes("url: https://github.com/dayutech/dsh-handy"))
    fail("market entry URL mismatch");
  if (!entry.includes("category: ui"))
    fail("market entry must use category ui");
  if (!/description:\s*\n\s+en:/.test(entry))
    fail("market entry needs description.en");
  if (/superlative|best|amazing|ultimate/i.test(entry))
    fail("market entry description contains marketing words");
}

const screenshotsPath = mustExist("screenshots.json");
if (existsSync(screenshotsPath)) {
  try {
    const screenshots = JSON.parse(readFileSync(screenshotsPath, "utf8"));
    const list = Array.isArray(screenshots)
      ? screenshots
      : screenshots.screenshots;
    if (!Array.isArray(list) || list.length < 1 || list.length > 8) {
      fail("screenshots.json must list 1-8 screenshots");
    } else {
      for (const screenshot of list) {
        if (
          typeof screenshot !== "string" ||
          screenshot.startsWith("/") ||
          screenshot.includes("..")
        ) {
          fail(`invalid screenshot path: ${String(screenshot)}`);
          continue;
        }
        mustExist(screenshot);
      }
    }
  } catch (error) {
    fail(`screenshots.json is invalid: ${error.message}`);
  }
}

mustExist("assets/icon-180.png");

if (failures.length > 0) {
  console.error("market validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("market validation passed");
