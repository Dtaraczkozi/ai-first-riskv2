/* ============================================================
   Risk Management Prototype — app.js
   Sidebar (expanded ↔ icon rail) · middle column + icon rail when collapsed · right drilldown
   ============================================================ */

const RIGHT_MIN = 360;
const RIGHT_MAX = 1200;
/** Must match CSS `.middle-panel` min-width */
const MIDDLE_MIN = 280;
/** Must match CSS .resize-handle width for layout math */
const HANDLE_W = 16;

const MIDDLE_COLLAPSE_AT = 100;
const MIDDLE_EXPAND_AT = 200;

const mainRow = document.getElementById("mainRow");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarToggleHost = document.getElementById("sidebarToggleHost");
const middlePanel = document.getElementById("middlePanel");
const middlePanelToggle = document.getElementById("middlePanelToggle");
const middlePanelExpandToggle = document.getElementById("middlePanelExpandToggle");
const resizeHandle = document.getElementById("resizeHandle");
const rightPanel = document.getElementById("rightPanel");
const middleIconRail = document.getElementById("middleIconRail");
const sbNavMenu = document.getElementById("sbNavMenu");
const sbNavThreads = document.getElementById("sbNavThreads");
const sbThreadList = document.getElementById("sbThreadList");
const sbViewMenuBtn = document.getElementById("sbViewMenuBtn");
const sbViewThreadsBtn = document.getElementById("sbViewThreadsBtn");
const mpRelevantThreads = document.getElementById("mpRelevantThreads");
const mpThreadOverlay = document.getElementById("mpThreadOverlay");
const mpThreadOverlayTitle = document.getElementById("mpThreadOverlayTitle");
const mpThreadOverlayBody = document.getElementById("mpThreadOverlayBody");
const rightNavToast = document.getElementById("rightNavToast");
const rightNavToastLabel = document.getElementById("rightNavToastLabel");
const rightNavToastBtn = document.getElementById("rightNavToastBtn");

const SIDEBAR_TITLE_EXPANDED = "Sidebar: show icons only";
const SIDEBAR_TITLE_COLLAPSED = "Sidebar: expand labels";

/**
 * Right panel drilldown copy per middle view (`data-view` id).
 * Shown whenever that screen is selected in the nav / middle column.
 */
const DRILLDOWN = {
  "survey-manager": {
    subtitle: "Surveys & responses",
    html: `
      <div class="right-drill-hint">Follow-ups and owners for the active survey workflow.</div>
      <div class="right-drill-section">
        <h4>Selected survey</h4>
        <div class="w-card">
          <div class="w-card-body">
            <p class="right-drill-hint" style="margin:0">Q4 Risk Assessment Survey · 48 responses · Due Dec 15</p>
          </div>
        </div>
      </div>
      <div class="right-drill-section">
        <h4>Next steps</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Send reminder to pending units</span><span class="w-list-meta">12 recipients</span></div></div>
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Review flagged answers</span><span class="w-list-meta">3 items</span></div></div>
        </div>
      </div>`,
  },
  "identification-overview": {
    subtitle: "Identification pipeline",
    html: `
      <div class="right-drill-hint">Snapshot of risk intake across workflows tied to Identification.</div>
      <div class="right-drill-section"><h4>Pipeline</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Draft 8 · In review 5 · Approved 14</p>
        </div></div></div>
      <div class="right-drill-section"><h4>Owners</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Risk office</span><span class="w-list-meta">Lead</span></div></div>
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Business units</span><span class="w-list-meta">Contributors</span></div></div>
        </div></div>`,
  },
  "workshop-manager": {
    subtitle: "Workshops",
    html: `
      <div class="right-drill-hint">Sessions scheduled from the middle panel drive this drilldown.</div>
      <div class="right-drill-section"><h4>Upcoming</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Cross-functional workshop</span><span class="w-list-meta">Thu 14:00 · Room B</span></div></div>
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Control walkthrough</span><span class="w-list-meta">Next week</span></div></div>
        </div></div>`,
  },
  "library-suggestions": {
    subtitle: "Library",
    html: `
      <div class="right-drill-hint">Suggested objects and templates aligned with Identification.</div>
      <div class="right-drill-section"><h4>Suggestions</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Apply a suggested risk template to accelerate drafting.</p>
        </div></div></div>`,
  },
  "assessment-overview": {
    subtitle: "Assessment",
    html: `
      <div class="right-drill-hint">Ratings and control tests for the Assessment workflow.</div>
      <div class="right-drill-section"><h4>Status</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Inherent risk</span><span class="w-list-meta">Updated 2d ago</span></div></div>
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Residual risk</span><span class="w-list-meta">Awaiting sign-off</span></div></div>
        </div></div>`,
  },
  "mitigation-overview": {
    subtitle: "Mitigation",
    html: `
      <div class="right-drill-hint">Plans and owners for treatment of open risks.</div>
      <div class="right-drill-section"><h4>Active plans</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">3 plans in progress · 1 blocked on dependency</p>
        </div></div></div>`,
  },
  reporting: {
    subtitle: "Reporting",
    html: `
      <div class="right-drill-hint">Exports and dashboards for the Reporting area.</div>
      <div class="right-drill-section"><h4>Scheduled</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Monthly risk pack</span><span class="w-list-meta">1st of month</span></div></div>
        </div></div>`,
  },
  "ai-threads": {
    subtitle: "AI threads",
    html: `
      <div class="right-drill-hint">Thread context for the conversation selected in the middle column.</div>
      <div class="right-drill-section"><h4>Thread</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Sources and citations appear here as you work in AI threads.</p>
        </div></div></div>`,
  },
  messaging: {
    subtitle: "Messaging",
    html: `
      <div class="right-drill-hint">Participants and last activity for the channel in focus.</div>
      <div class="right-drill-section"><h4>Participants</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Risk committee</span><span class="w-list-meta">12 members</span></div></div>
        </div></div>`,
  },
  "object-library": {
    subtitle: "Object library",
    html: `
      <div class="right-drill-hint">Metadata and relationships for the library item in context.</div>
      <div class="right-drill-section"><h4>Selection</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Pick an object in the middle panel to see lineage and usage here.</p>
        </div></div></div>`,
  },
  integrations: {
    subtitle: "Integrations",
    html: `
      <div class="right-drill-hint">Connection health and sync scope for the integration you are configuring.</div>
      <div class="right-drill-section"><h4>Sync</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Last run</span><span class="w-list-meta">OK · 2h ago</span></div></div>
        </div></div>`,
  },
  settings: {
    subtitle: "Settings",
    html: `
      <div class="right-drill-hint">Effective scope for preferences edited in the middle column.</div>
      <div class="right-drill-section"><h4>Scope</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Workspace defaults · Applies to all users in this tenant</p>
        </div></div></div>`,
  },
};

/**
 * Lightweight thread model for prototype UI.
 * - `scopeViewId`: which workflow step/view this thread is related to (for icon + toast navigation)
 * - `objectHint`: small hint shown in the right-panel toast copy
 */
const THREADS = {
  "t-survey-ops": {
    title: "Ops survey follow-ups",
    scopeViewId: "survey-manager",
    scopeLabel: "Survey manager",
    objectHint: "Q4 Risk Assessment Survey",
    updatedLabel: "Updated 1h ago",
    messages: [
      { from: "You", text: "Summarise overdue responses and draft a reminder." },
      { from: "AI", text: "12 units pending. I drafted a concise reminder and highlighted 3 flagged answers for review." },
      { from: "You", text: "Pin the 3 flagged answers and propose owners." },
      { from: "AI", text: "Flagged: (1) Backup testing freq, (2) Access policy gaps, (3) Vendor breach exposure. Suggested owners added." },
    ],
  },
  "t-dora-gap": {
    title: "DORA gap analysis notes",
    scopeViewId: "assessment-overview",
    scopeLabel: "Assessment",
    objectHint: "DORA compliance gap",
    updatedLabel: "Updated yesterday",
    messages: [
      { from: "You", text: "Collect the main gaps and map them to controls." },
      { from: "AI", text: "Top gaps: third-party oversight, incident reporting SLAs, resilience testing cadence. Draft mapping prepared." },
    ],
  },
  "t-vendor-brainstorm": {
    title: "Vendor brainstorm thread",
    scopeViewId: "workshop-manager",
    scopeLabel: "Workshop manager",
    objectHint: "Vendor Risk Brainstorm",
    updatedLabel: "Updated 3d ago",
    messages: [
      { from: "You", text: "Summarise outcomes and tag top 5 risks." },
      { from: "AI", text: "Top risks: single cloud concentration, contract SLA gaps, weak attestations, data residency, access reviews." },
    ],
  },
  "t-q4-pack": {
    title: "Q4 risk pack review",
    scopeViewId: "reporting",
    scopeLabel: "Reporting",
    objectHint: "Q4 Risk Management Summary",
    updatedLabel: "Updated 1w ago",
    messages: [
      { from: "You", text: "Pull key changes since last quarter and propose an exec summary." },
      { from: "AI", text: "Highlights drafted: +8 risks identified, 3 overdue actions, 1 critical third-party breach exposure trend." },
    ],
  },
  "t-general-risk-chat": {
    title: "General risk brainstorming",
    scopeViewId: null,
    scopeLabel: "General",
    objectHint: "Cross-workflow",
    updatedLabel: "Updated 10m ago",
    messages: [
      { from: "You", text: "Help me think through top operational risks this quarter." },
      { from: "AI", text: "Themes: third-party exposure, resilience testing, key-person dependency, access control hygiene, regulatory change." },
    ],
  },
};

let activeThreadId = null;

function iconHrefForThread(thread) {
  const vid = thread?.scopeViewId;
  if (vid === "survey-manager" || vid === "identification-overview" || vid === "library-suggestions" || vid === "workshop-manager") {
    return "#icon-identification";
  }
  if (vid === "assessment-overview") return "#icon-assessment";
  if (vid === "mitigation-overview") return "#icon-mitigation";
  if (vid === "reporting") return "#icon-reporting";
  return "#icon-ai-threads";
}

function renderSidebarThreads() {
  if (!sbThreadList) return;
  const entries = Object.entries(THREADS).map(([id, t]) => ({ id, ...t }));
  sbThreadList.innerHTML = entries
    .map((t) => {
      const icon = iconHrefForThread(t);
      const meta = t.updatedLabel || `${(t.messages || []).length} messages`;
      return `
        <button class="sb-item" type="button" data-thread-id="${t.id}" onclick="openThread('${t.id}','sidebar')">
          <svg width="24" height="24" aria-hidden="true"><use href="${icon}"/></svg>
          <span class="sb-item-label">${escapeHtml(t.title)}</span>
          <span class="sb-thread-meta">${escapeHtml(meta)}</span>
        </button>`;
    })
    .join("");
}

function setSidebarView(view) {
  if (!sbNavMenu || !sbNavThreads || !sbViewMenuBtn || !sbViewThreadsBtn) return;
  const isThreads = view === "threads";
  sbNavMenu.hidden = isThreads;
  sbNavThreads.hidden = !isThreads;

  const menuActive = !isThreads;
  sbViewMenuBtn.classList.toggle("is-active", menuActive);
  sbViewMenuBtn.setAttribute("aria-pressed", menuActive ? "true" : "false");
  sbViewThreadsBtn.classList.toggle("is-active", isThreads);
  sbViewThreadsBtn.setAttribute("aria-pressed", isThreads ? "true" : "false");
}

function renderRelevantThreadsForView(viewId) {
  if (!mpRelevantThreads) return;
  const relevant = Object.entries(THREADS)
    .filter(([, t]) => !t.scopeViewId || t.scopeViewId === viewId)
    .map(([id, t]) => ({ id, ...t }));

  if (relevant.length === 0) {
    mpRelevantThreads.innerHTML = `<div class="mp-thread-empty">No threads linked to this step.</div>`;
    return;
  }

  mpRelevantThreads.innerHTML = relevant
    .map(
      (t) => `
      <button class="mp-thread-chip" type="button" data-thread-id="${t.id}" onclick="openThread('${t.id}','footer')">
        <span class="mp-thread-chip-title">${escapeHtml(t.title)}</span>
        <span class="mp-thread-chip-meta">${escapeHtml(t.objectHint)}${t.updatedLabel ? ` · ${escapeHtml(t.updatedLabel)}` : ""}</span>
      </button>`
    )
    .join("");
}

function hideRightToast() {
  if (!rightNavToast) return;
  rightNavToast.hidden = true;
  if (rightNavToastBtn) rightNavToastBtn.onclick = null;
}

function showRightToastForThread(thread) {
  if (!rightNavToast || !rightNavToastBtn || !rightNavToastLabel) return;
  rightNavToast.hidden = false;
  rightNavToastLabel.textContent = `${thread.scopeLabel} · ${thread.objectHint}`;
  rightNavToastBtn.textContent = "Open";
  rightNavToastBtn.onclick = () => navigateToViewId(thread.scopeViewId);
}

function openThread(threadId, source = "unknown") {
  const thread = THREADS[threadId];
  if (!thread || !mpThreadOverlay || !mpThreadOverlayTitle || !mpThreadOverlayBody) return;

  if (middleCollapsed) expandMiddle();

  activeThreadId = threadId;
  mpThreadOverlayTitle.textContent = thread.title;
  mpThreadOverlayBody.innerHTML = thread.messages
    .map(
      (m) => `
      <div class="mp-msg">
        <div class="mp-msg-from">${escapeHtml(m.from)}</div>
        <div class="mp-msg-text">${escapeHtml(m.text)}</div>
      </div>`
    )
    .join("");
  mpThreadOverlay.hidden = false;
  mpThreadOverlay.setAttribute("data-source", source);
  showRightToastForThread(thread);
}

function closeThreadOverlay() {
  if (!mpThreadOverlay) return;
  mpThreadOverlay.hidden = true;
  activeThreadId = null;
  hideRightToast();
}

function openThreadFromSidebar(el) {
  const tid = el?.dataset?.threadId;
  if (!tid) return;
  openThread(tid, "sidebar");
}

function drilldownFallback(label) {
  return {
    subtitle: "Context drilldown",
    html: `<div class="right-drill-hint">Details for <strong>${escapeHtml(label)}</strong> appear here as you work in the main column.</div>`,
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function updateRightDrilldown(viewId, label) {
  const titleEl = document.getElementById("rightPaneTitle");
  const subEl = document.getElementById("rightPaneSubtitle");
  const bodyEl = document.getElementById("rightDrilldown");
  if (!titleEl || !subEl || !bodyEl) return;

  const pack = DRILLDOWN[viewId] || drilldownFallback(label);
  titleEl.textContent = label;
  subEl.textContent = pack.subtitle;
  bodyEl.innerHTML = pack.html;
}

function syncDrilldownFromActiveNav() {
  const active =
    document.querySelector(".sb-subitem.is-active[data-view]") ||
    document.querySelector(".sb-item.is-active[data-view]");
  if (!active) {
    syncMiddleRail();
    return;
  }
  const viewId = active.dataset.view;
  const label =
    active.querySelector(".sb-item-label")?.textContent.trim() ||
    active.textContent.trim();
  if (viewId) updateRightDrilldown(viewId, label);
  syncMiddleRail();
}

function syncMiddleRail() {
  if (!middleIconRail) return;
  const active =
    document.querySelector(".sb-subitem.is-active[data-view]") ||
    document.querySelector(".sb-item.is-active[data-view]");
  const vid = active?.dataset?.view;
  const inIdentification =
    active && active.closest && active.closest("#identificationSubmenu");

  middleIconRail.querySelectorAll(".mir-btn").forEach((btn) => {
    btn.classList.remove("is-active");
    const bvid = btn.dataset.view;
    const group = btn.dataset.railGroup;
    if (bvid && vid && bvid === vid) btn.classList.add("is-active");
    if (group === "identification" && inIdentification) btn.classList.add("is-active");
  });
}

function navigateToViewId(viewId) {
  const el = document.querySelector(
    `.sb-subitem[data-view="${viewId}"], .sb-item[data-view="${viewId}"]`
  );
  if (el) navigateTo(el);
}

function navigateRailIdentification() {
  const active = document.querySelector("#identificationSubmenu .sb-subitem.is-active");
  if (active) {
    navigateTo(active);
    return;
  }
  const first = document.querySelector("#identificationSubmenu .sb-subitem[data-view]");
  if (first) navigateTo(first);
}

let sidebarCollapsed = false;
let middleCollapsed = false;
let rightPanelWidth = RIGHT_MIN;
let savedRightPanelWidth = RIGHT_MIN;

function getSidebarOuterWidth() {
  if (!sidebar) return 0;
  const r = sidebar.getBoundingClientRect();
  const mr = parseFloat(getComputedStyle(sidebar).marginRight) || 0;
  return r.width + mr;
}

function getMainRowInnerWidth() {
  return mainRow ? mainRow.getBoundingClientRect().width : 0;
}

/** Usable width for middle + right (excluding sidebar and drag handle). */
function pairSlotWidth() {
  return Math.max(0, getMainRowInnerWidth() - getSidebarOuterWidth() - HANDLE_W);
}

/**
 * Max middle width: at most half the pair (equal split), and right stays ≥ RIGHT_MIN.
 * Matches CSS: middle min-width is MIDDLE_MIN (handled when clamping right).
 */
function maxMiddleWidth() {
  const slot = pairSlotWidth();
  if (slot <= 0) return 0;
  return Math.min(slot / 2, slot - RIGHT_MIN);
}

function clampRightPanelWidth(rw) {
  const slot = pairSlotWidth();
  const minR = Math.max(RIGHT_MIN, slot / 2);
  const maxR = Math.min(RIGHT_MAX, slot - MIDDLE_MIN);
  if (minR > maxR) {
    return Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, Math.round(slot / 2)));
  }
  return Math.min(maxR, Math.max(minR, rw));
}

/** Default: middle is half the width of the right panel → middle = slot/3, right = 2×slot/3 */
function defaultMiddleRightWidths() {
  const slot = pairSlotWidth();
  if (slot <= 0) return { mw: 0, rw: RIGHT_MIN };
  let rw = (2 * slot) / 3;
  rw = clampRightPanelWidth(rw);
  const mw = slot - rw;
  return { mw, rw };
}

function clearMiddleInlineFlex() {
  if (!middlePanel) return;
  middlePanel.style.flex = "";
  middlePanel.style.maxWidth = "";
}

function syncMiddleToggleButtons() {
  const expanded = !middleCollapsed;
  [middlePanelToggle, middlePanelExpandToggle].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("is-active", expanded);
    btn.setAttribute("aria-pressed", expanded ? "true" : "false");
  });
}

function applyCollapsedLayout() {
  if (!middlePanel || !rightPanel || !middlePanelToggle) return;
  middlePanel.classList.add("is-hidden");
  middlePanel.classList.remove("middle-panel--drag-reveal");
  clearMiddleInlineFlex();
  if (mainRow) mainRow.classList.add("main-row--middle-collapsed");
  if (mainRow) mainRow.classList.remove("main-row--middle-expanding");
  rightPanel.classList.add("right-panel--fill");
  rightPanel.style.width = "";
  syncMiddleToggleButtons();
  syncMiddleRail();
}

function applyRightWidthPx(w) {
  if (!rightPanel) return;
  rightPanelWidth = clampRightPanelWidth(w);
  rightPanel.style.width = `${rightPanelWidth}px`;
}

function collapseMiddle() {
  if (middleCollapsed) return;
  middleCollapsed = true;
  savedRightPanelWidth = rightPanelWidth;
  applyCollapsedLayout();
}

function expandMiddle() {
  if (!middleCollapsed || !middlePanel || !rightPanel || !middlePanelToggle) return;
  middleCollapsed = false;
  middlePanel.classList.remove("is-hidden", "middle-panel--drag-reveal");
  clearMiddleInlineFlex();
  if (mainRow) mainRow.classList.remove("main-row--middle-collapsed", "main-row--middle-expanding");
  rightPanel.classList.remove("right-panel--fill");
  rightPanelWidth = clampRightPanelWidth(savedRightPanelWidth);
  rightPanel.style.width = `${rightPanelWidth}px`;
  syncMiddleToggleButtons();
}

function applySidebarState() {
  if (!sidebar || !sidebarToggle) return;
  sidebar.classList.remove("is-collapsed");
  if (sidebarCollapsed) sidebar.classList.add("is-collapsed");
  sidebarToggle.dataset.sidebarState = sidebarCollapsed ? "collapsed" : "expanded";
  sidebarToggle.title = sidebarCollapsed ? SIDEBAR_TITLE_COLLAPSED : SIDEBAR_TITLE_EXPANDED;
  sidebarToggle.classList.add("is-active");
  sidebarToggle.setAttribute("aria-pressed", "true");
  if (sidebarToggleHost && sidebarToggle.parentElement !== sidebarToggleHost) {
    sidebarToggleHost.appendChild(sidebarToggle);
  }
  requestAnimationFrame(() => {
    if (!middleCollapsed) {
      applyRightWidthPx(rightPanelWidth);
    }
  });
}

function navigateTo(el) {
  if (el.classList.contains("sb-subitem")) {
    document.querySelectorAll(".sb-subitem").forEach((i) => i.classList.remove("is-active"));
    document.querySelectorAll(".sb-item").forEach((i) => i.classList.remove("is-active"));
    el.classList.add("is-active");
  } else {
    document.querySelectorAll(".sb-subitem").forEach((i) => i.classList.remove("is-active"));
    document.querySelectorAll(".sb-item").forEach((i) => i.classList.remove("is-active"));
    el.classList.add("is-active");
  }
  const label =
    el.querySelector(".sb-item-label")?.textContent.trim() ||
    el.textContent.trim();
  const mpTitle = document.getElementById("mpTitle");
  if (mpTitle) mpTitle.textContent = label;

  const viewId = el.dataset.view;
  if (viewId) {
    document.querySelectorAll(".mp-view").forEach((v) => v.classList.remove("is-active"));
    const target = document.getElementById("view-" + viewId);
    if (target) target.classList.add("is-active");
    updateRightDrilldown(viewId, label);
    renderRelevantThreadsForView(viewId);
  }
  syncMiddleRail();
}

function toggleSubmenu(id) {
  const submenu = document.getElementById(id + "Submenu");
  const item = document.getElementById(id + "Item");
  if (!submenu || !item) return;
  const isOpen = submenu.classList.toggle("is-open");
  item.classList.toggle("is-expanded", isOpen);
}

let isDragging = false;
let dragStartX = 0;
let dragStartWidth = 0;

let isExpandDragging = false;
let expandDragStartX = 0;
let expandDragStartMiddle = 0;

let dragPendingX = null;
let dragRaf = 0;

function endOuterDrag() {
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  if (resizeHandle) resizeHandle.classList.remove("is-dragging");
  if (mainRow) mainRow.classList.remove("is-resizing-columns");
}

function layoutMiddleRightPair(middleW) {
  if (!middlePanel || !rightPanel) return;
  const slot = pairSlotWidth();
  let mw = Math.max(0, Math.min(maxMiddleWidth(), middleW));
  let rw = clampRightPanelWidth(slot - mw);
  mw = slot - rw;
  middlePanel.style.flex = `0 0 ${mw}px`;
  rightPanel.style.width = `${rw}px`;
  rightPanelWidth = rw;
}

function bootProtoShell() {
  const ok =
    mainRow &&
    sidebar &&
    sidebarToggle &&
    middlePanel &&
    middlePanelToggle &&
    resizeHandle &&
    rightPanel;

  if (!ok) {
    console.error(
      "[app.js] Prototype markup is incomplete — expected #mainRow, #sidebar, #middlePanel, #rightPanel, etc."
    );
    return;
  }

  resizeHandle.style.width = `${HANDLE_W}px`;
  applySidebarState();
  requestAnimationFrame(() => {
    const { rw } = defaultMiddleRightWidths();
    rightPanelWidth = rw;
    applyRightWidthPx(rightPanelWidth);
  });
  syncDrilldownFromActiveNav();
  syncMiddleToggleButtons();
  syncMiddleRail();
  const active =
    document.querySelector(".sb-subitem.is-active[data-view]") ||
    document.querySelector(".sb-item.is-active[data-view]");
  if (active?.dataset?.view) renderRelevantThreadsForView(active.dataset.view);

  if (sbViewMenuBtn && sbViewThreadsBtn) {
    setSidebarView("menu");
    sbViewMenuBtn.addEventListener("click", () => setSidebarView("menu"));
    sbViewThreadsBtn.addEventListener("click", () => setSidebarView("threads"));
  }

  renderSidebarThreads();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeThreadOverlay();
  });

  // Enable drag-to-reorder within each list section (in-section only).
  if (window.W && typeof window.W.dragReorder === "function") {
    ["surveyList", "workshopList", "reportList", "aiThreadList", "messageList", "libraryList"].forEach(
      (id) => window.W.dragReorder(id, { handle: ".w-drag-handle", itemSel: ".w-list-item" })
    );
  }

  if (middleIconRail) {
    middleIconRail.addEventListener("click", (e) => {
      const btn = e.target.closest(".mir-btn");
      if (!btn) return;
      const vid = btn.dataset.view;
      if (vid) navigateToViewId(vid);
      else if (btn.dataset.railGroup === "identification") navigateRailIdentification();
    });
  }

  sidebarToggle.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    applySidebarState();
  });

  function onMiddlePanelToggleClick() {
    if (middleCollapsed) expandMiddle();
    else collapseMiddle();
  }
  middlePanelToggle.addEventListener("click", onMiddlePanelToggleClick);
  if (middlePanelExpandToggle) {
    middlePanelExpandToggle.addEventListener("click", onMiddlePanelToggleClick);
  }

  function scheduleDragMove(clientX) {
    dragPendingX = clientX;
    if (dragRaf) return;
    dragRaf = requestAnimationFrame(() => {
      dragRaf = 0;
      const x = dragPendingX;
      dragPendingX = null;
      if (x === null) return;

      if (isExpandDragging) {
        const delta = x - expandDragStartX;
        let mw = expandDragStartMiddle + delta;
        mw = Math.max(0, Math.min(maxMiddleWidth(), mw));
        layoutMiddleRightPair(mw);
        return;
      }

      if (!isDragging) return;
      const delta = dragStartX - x;
      let newRight = dragStartWidth + delta;
      newRight = clampRightPanelWidth(newRight);
      rightPanel.style.width = `${newRight}px`;
      rightPanelWidth = newRight;

      const mw = middlePanel.getBoundingClientRect().width;
      if (!middleCollapsed && mw < MIDDLE_COLLAPSE_AT) {
        collapseMiddle();
        isDragging = false;
        endOuterDrag();
      }
    });
  }

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (middleCollapsed) {
      isExpandDragging = true;
      expandDragStartX = e.clientX;
      expandDragStartMiddle = 0;
      const rw = rightPanel.getBoundingClientRect().width;
      rightPanelWidth = rw;
      rightPanel.classList.remove("right-panel--fill");
      rightPanel.style.width = `${rw}px`;
      if (mainRow) mainRow.classList.add("main-row--middle-expanding");
      middlePanel.classList.remove("is-hidden");
      middlePanel.classList.add("middle-panel--drag-reveal");
      middlePanel.style.flex = "0 0 0px";
      resizeHandle.classList.add("is-dragging");
      mainRow.classList.add("is-resizing-columns");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      return;
    }

    isDragging = true;
    dragStartX = e.clientX;
    dragStartWidth = rightPanelWidth;
    resizeHandle.classList.add("is-dragging");
    mainRow.classList.add("is-resizing-columns");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isExpandDragging && !isDragging) return;
    scheduleDragMove(e.clientX);
  });

  document.addEventListener("mouseup", () => {
    if (dragRaf) {
      cancelAnimationFrame(dragRaf);
      dragRaf = 0;
    }
    dragPendingX = null;

    if (isExpandDragging) {
      isExpandDragging = false;
      endOuterDrag();
      const mw = middlePanel.getBoundingClientRect().width;
      if (mw >= MIDDLE_EXPAND_AT) {
        savedRightPanelWidth = rightPanelWidth;
        if (mainRow) mainRow.classList.remove("main-row--middle-expanding");
        expandMiddle();
      } else {
        middlePanel.classList.remove("middle-panel--drag-reveal");
        clearMiddleInlineFlex();
        if (mainRow) mainRow.classList.remove("main-row--middle-expanding");
        applyCollapsedLayout();
      }
      return;
    }

    if (!isDragging) return;
    isDragging = false;
    endOuterDrag();
  });

  window.addEventListener("resize", () => {
    if (!middleCollapsed) {
      applyRightWidthPx(rightPanelWidth);
    }
  });
}

bootProtoShell();

// Expose small surface for inline handlers in proto markup
window.openThreadFromSidebar = openThreadFromSidebar;
window.openThread = openThread;
window.closeThreadOverlay = closeThreadOverlay;

window.navigateTo = navigateTo;
window.toggleSubmenu = toggleSubmenu;
