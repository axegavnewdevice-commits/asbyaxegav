import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";
const root = new URL("../", import.meta.url);
const required = ["index.html", "pwa.js", "sw.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];
for (const file of required) await access(new URL(file, root), constants.R_OK);
const html = await readFile(new URL("index.html", root), "utf8");
const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", root), "utf8"));
if (!html.includes('rel="manifest" href="./manifest.webmanifest"')) throw new Error("Manifest link missing from index.html");
if (!html.includes('src="./pwa.js"')) throw new Error("PWA bootstrap missing from index.html");
if (!html.includes("</body>") || !html.includes("</html>")) throw new Error("HTML closing tags are missing");
if (html.includes("    </div\n    \n    <!-- Confirmation Modal Structure")) throw new Error("Malformed closing div found");
if (!manifest.name || !manifest.start_url || manifest.display !== "standalone") throw new Error("Required manifest fields are missing");
for (const icon of manifest.icons) await access(new URL(icon.src.replace("./", ""), root), constants.R_OK);
for (const file of ["pwa.js", "sw.js"]) {
  const result = spawnSync(process.execPath, ["--check", new URL(file, root).pathname], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(file + " syntax check failed:\n" + result.stderr);
}
console.log("PWA check passed (" + required.length + " required assets verified).");
