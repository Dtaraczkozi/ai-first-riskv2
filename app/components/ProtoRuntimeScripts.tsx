"use client";

import { useEffect } from "react";

/**
 * Loads prototype behaviour after hydration. Raw <script> tags in RSC layout are
 * unreliable (can be dropped or reordered). Injecting here guarantees execution.
 */
const SCRIPT_CHAIN = ["/js/widgets.js", "/js/app.js"] as const;

let loadChainPromise: Promise<void> | null = null;

function loadOne(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-proto-runtime="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.dataset.protoRuntime = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

export function ProtoRuntimeScripts() {
  useEffect(() => {
    if (!loadChainPromise) {
      loadChainPromise = (async () => {
        for (const src of SCRIPT_CHAIN) {
          await loadOne(src);
        }
      })();
    }

    loadChainPromise.catch((err) => {
      console.error("[proto-runtime]", err);
      if (document.getElementById("proto-runtime-error")) return;
      const el = document.createElement("div");
      el.id = "proto-runtime-error";
      el.setAttribute("role", "alert");
      el.style.cssText =
        "position:fixed;bottom:0;left:0;right:0;padding:12px 16px;background:#3d1818;color:#f5e8e8;font:14px/1.4 system-ui,sans-serif;z-index:99999;box-shadow:0 -4px 24px rgba(0,0,0,.35)";
      el.textContent =
        "Prototype scripts could not load (widgets.js / app.js). Check the Network tab and that /public is deployed.";
      document.body.appendChild(el);
    });
  }, []);

  return null;
}
