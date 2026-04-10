import { ProtoRuntimeScripts } from "./components/ProtoRuntimeScripts";
import protoBodySource from "../public/proto-body.html";

/** Static page; avoid accidental dynamic/edge behaviour on hosts. */
export const dynamic = "force-static";

const PROTO_FALLBACK = `<div class="panel" role="alert" style="padding:2rem;margin:1rem;font-family:system-ui,sans-serif">
      <p><strong>Prototype markup not found or invalid.</strong> Ensure <code>public/proto-body.html</code> exists in the deployment and contains the main shell (<code>#mainRow</code>).</p>
    </div>`;

function isPlausibleProtoHtml(html: string): boolean {
  const t = html.trim();
  if (t.length < 2000) return false;
  const hasMainRow =
    /\bid\s*=\s*["']mainRow["']/.test(t) ||
    t.includes('id="mainRow"') ||
    t.includes("id='mainRow'");
  return hasMainRow && /\bmain-row\b/.test(t);
}

/**
 * Webpack `asset/source` yields a string; Turbopack + raw-loader may yield `{ default: string }`.
 * If we mis-detect, the shell is replaced by PROTO_FALLBACK and app.js exits early — looks like a "crash".
 */
function normalizeProtoHtmlImport(m: unknown): string {
  if (typeof m === "string") return m;
  if (
    m !== null &&
    typeof m === "object" &&
    "default" in m &&
    typeof (m as { default: unknown }).default === "string"
  ) {
    return (m as { default: string }).default;
  }
  return "";
}

const protoBodyHtml: string = (() => {
  const raw = normalizeProtoHtmlImport(protoBodySource);
  return isPlausibleProtoHtml(raw) ? raw : PROTO_FALLBACK;
})();

export default function Home() {
  return (
    <>
      <div className="app-root">
        <header className="app-top-header" role="banner">
          <div className="app-top-header__left">
            <div className="app-top-header__mark">
              {/* eslint-disable-next-line @next/next/no-img-element -- avoid Image optimizer (sharp) failures on some hosts */}
              <img
                src="/images/diligent-mark.png"
                width={28}
                height={28}
                alt=""
              />
            </div>
            <button
              type="button"
              className="app-top-header__workspace"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Workspace menu"
            >
              <span className="app-top-header__workspace-label">
                Risk Management
              </span>
              <svg
                className="app-top-header__workspace-chevron"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  d="M12 16.7076L6.34619 11.0538L7.40002 10L12 14.6L16.6 10L17.6538 11.0538L12 16.7076Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div className="app-top-header__right">
            <button
              type="button"
              className="app-top-header__account"
              aria-label="Account"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle
                  cx="12"
                  cy="9"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>
        <div
          id="proto-root"
          className="proto-shell"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: protoBodyHtml }}
        />
      </div>
      <ProtoRuntimeScripts />
    </>
  );
}
