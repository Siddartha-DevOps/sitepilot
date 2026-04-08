const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "start",
  "server",
  "metro",
  "externals.js"
);

if (!fs.existsSync(targetFile)) {
  console.log("[patch-expo-node-externals] Target not found, skipping.");
  process.exit(0);
}

const original = fs.readFileSync(targetFile, "utf8");
const alreadyPatched = original.includes(
  "Array.from(new Set(["
) && original.includes('.map((x)=>x.replace(/^node:/, ""))');

if (alreadyPatched) {
  console.log("[patch-expo-node-externals] Already patched.");
  process.exit(0);
}

const oldSnippet = `const NODE_STDLIB_MODULES = [
    "fs/promises",
    ...(_module.builtinModules || // @ts-expect-error
    (process.binding ? Object.keys(process.binding("natives")) : []) || []).filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![
            "sys"
        ].includes(x)
    ), 
].sort();`;

const newSnippet = `const NODE_STDLIB_MODULES = Array.from(new Set([
    "fs/promises",
    ...(_module.builtinModules || // @ts-expect-error
    (process.binding ? Object.keys(process.binding("natives")) : []) || []).filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![
            "sys"
        ].includes(x)
    ).map((x)=>x.replace(/^node:/, ""))
])).sort();`;

if (!original.includes(oldSnippet)) {
  console.log(
    "[patch-expo-node-externals] Expected Expo CLI snippet was not found. Skipping."
  );
  process.exit(0);
}

const updated = original.replace(oldSnippet, newSnippet);
fs.writeFileSync(targetFile, updated, "utf8");

console.log("[patch-expo-node-externals] Patch applied.");
