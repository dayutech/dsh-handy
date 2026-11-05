import { build } from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const lib = join(root, "lib");
const tempClient = join(lib, ".client.bundle.cjs");
const externals = ["react", "react-dom", "react-dom/client", "@deepseek-ai/*"];

await mkdir(lib, { recursive: true });

await build({
  entryPoints: [join(root, "src/client.js")],
  outfile: tempClient,
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["es2020"],
  external: externals,
  logLevel: "info",
});

const bundle = await readFile(tempClient, "utf8");
const wrapped = [
  "window.__ModuleLoader__.load({",
  '  id: "dsh-handy",',
  "  factory: (require) => {",
  "    const module = { exports: {} };",
  "    const exports = module.exports;",
  bundle,
  "    return module.exports;",
  "  },",
  "});",
  "",
].join("\n");
await writeFile(join(lib, "client.js"), wrapped, "utf8");
await rm(tempClient, { force: true });

await build({
  entryPoints: [join(root, "src/host.js")],
  outfile: join(lib, "index.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: ["node18"],
  external: ["@deepseek-ai/*"],
  logLevel: "info",
});
