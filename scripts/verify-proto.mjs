#!/usr/bin/env node
/**
 * Fails the build if prototype assets are missing or clearly broken.
 * Run automatically via `npm run build` — catch deploy issues before they ship.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const publicProto = path.join(root, "public", "proto-body.html");
const legacyProto = path.join(root, "content", "proto-body.html");

let protoPath;
let html;
if (fs.existsSync(publicProto)) {
  protoPath = "public/proto-body.html";
  html = fs.readFileSync(publicProto, "utf8");
} else if (fs.existsSync(legacyProto)) {
  protoPath = "content/proto-body.html";
  html = fs.readFileSync(legacyProto, "utf8");
} else {
  console.error(
    "[verify-proto] No proto-body.html — need public/proto-body.html or content/proto-body.html"
  );
  process.exit(1);
}

if (html.length < 2000) {
  console.error(`[verify-proto] ${protoPath} looks too small.`);
  process.exit(1);
}
const hasMainRow =
  /\bid\s*=\s*["']mainRow["']/.test(html) ||
  html.includes('id="mainRow"') ||
  html.includes("id='mainRow'");
if (!hasMainRow || !/\bmain-row\b/.test(html)) {
  console.error(`[verify-proto] ${protoPath} must include main shell (#mainRow).`);
  process.exit(1);
}

const appJs = path.join(root, "public", "js", "app.js");
const widgetsJs = path.join(root, "public", "js", "widgets.js");
if (!fs.existsSync(appJs)) {
  console.error("[verify-proto] Missing public/js/app.js");
  process.exit(1);
}
const appBuf = fs.readFileSync(appJs, "utf8");
if (!appBuf.includes("bootProtoShell") || appBuf.length < 200) {
  console.error("[verify-proto] public/js/app.js looks invalid.");
  process.exit(1);
}
if (!fs.existsSync(widgetsJs)) {
  console.error("[verify-proto] Missing public/js/widgets.js");
  process.exit(1);
}
const wBuf = fs.readFileSync(widgetsJs, "utf8");
if (wBuf.length < 100) {
  console.error("[verify-proto] public/js/widgets.js looks too small.");
  process.exit(1);
}

console.log("[verify-proto] OK — prototype assets present.");
