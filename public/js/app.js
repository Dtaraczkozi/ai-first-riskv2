/* ============================================================
   Risk Management Prototype — app.js
   Sidebar (expanded ↔ icon rail) · collapsible middle column · right drilldown
   ============================================================ */

const RIGHT_MIN = 360;
const RIGHT_MAX = 1200;
/** Must match CSS `.middle-panel` min-width */
const MIDDLE_MIN = 280;
/** Must match `--middle-layout-duration` in styles.css (ms) */
const MIDDLE_COLLAPSE_MS = 500;
/** Must match CSS .resize-handle width for layout math */
const HANDLE_W = 16;

const mainRow = document.getElementById("mainRow");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarToggleHost = document.getElementById("sidebarToggleHost");
const middlePanel = document.getElementById("middlePanel");
const middlePanelToggle = document.getElementById("middlePanelToggle");
const middlePanelExpandToggle = document.getElementById("middlePanelExpandToggle");
const resizeHandle = document.getElementById("resizeHandle");
const rightPanel = document.getElementById("rightPanel");
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
  "agent-thread": {
    subtitle: "Conversation",
    html: `
      <div class="right-drill-hint">Messages and sources for this agent thread.</div>
      <div class="right-drill-section"><h4>Thread</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Citations and follow-ups appear here as the conversation progresses.</p>
        </div></div></div>`,
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
    return;
  }
  const viewId = active.dataset.view;
  const label =
    active.querySelector(".sb-item-label")?.textContent.trim() ||
    active.textContent.trim();
  if (viewId) updateRightDrilldown(viewId, label);
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

/**
 * Width shared by the middle column + right column (everything in the main row
 * after the sidebar, minus the middle icon rail and resize handle).
 * Keeps mw + rw equal to this value so the split always fills the row.
 */
function pairSlotWidth() {
  if (!mainRow) return 0;
  const inner = mainRow.clientWidth;
  const sb = getSidebarOuterWidth();
  const railEl = document.getElementById("middleIconRail");
  const railW = railEl ? railEl.getBoundingClientRect().width : 0;
  const hw = resizeHandle ? resizeHandle.getBoundingClientRect().width : HANDLE_W;
  return Math.max(0, inner - sb - railW - hw);
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

function syncResizeHandleVisibility() {
  if (!resizeHandle) return;
  const hidden = middleCollapsed;
  resizeHandle.classList.toggle("is-hidden", hidden);
  resizeHandle.setAttribute("aria-hidden", hidden ? "true" : "false");
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
  syncResizeHandleVisibility();
}

function applyRightWidthPx(w) {
  if (!rightPanel) return;
  const slot = pairSlotWidth();
  const rw = clampRightPanelWidth(w);
  layoutMiddleRightPair(slot - rw);
}

function collapseMiddle() {
  if (middleCollapsed || middleCollapseAnimating) return;
  middleCollapseAnimating = true;
  savedRightPanelWidth = rightPanelWidth;
  runMiddleCollapseAnimation(() => {
    middleCollapsed = true;
    applyCollapsedLayout();
    middleCollapseAnimating = false;
  });
}

/** Leave drag-from-collapsed and commit expanded layout + widths (used by handle drag + expandMiddle). */
function commitExpandedFromDrag(middleWIntent) {
  if (!middlePanel || !rightPanel) return;
  middleCollapsed = false;
  middlePanel.classList.remove("is-hidden", "middle-panel--drag-reveal");
  if (mainRow) mainRow.classList.remove("main-row--middle-collapsed", "main-row--middle-expanding");
  rightPanel.classList.remove("right-panel--fill");
  layoutMiddleRightPair(middleWIntent);
  savedRightPanelWidth = rightPanelWidth;
  syncMiddleToggleButtons();
  syncResizeHandleVisibility();
}

function expandMiddle() {
  if (!middleCollapsed || !middlePanel || !rightPanel || !middlePanelToggle) return;
  if (middleCollapseAnimating) {
    cancelMiddleCollapseAnimation();
  }
  rightPanelWidth = clampRightPanelWidth(savedRightPanelWidth);
  const slot = pairSlotWidth();
  commitExpandedFromDrag(Math.max(0, slot - rightPanelWidth));
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

/** Sprite id for each workflow step (16×16 in thread lists). */
const STEP_ICON_SYMBOL = {
  "survey-manager": "icon-identification",
  "identification-overview": "icon-identification",
  "workshop-manager": "icon-identification",
  "library-suggestions": "icon-library",
  "assessment-overview": "icon-assessment",
  "mitigation-overview": "icon-mitigation",
  reporting: "icon-reporting",
};

const STEP_LABELS = {
  "survey-manager": "Survey manager",
  "identification-overview": "Identification overview",
  "workshop-manager": "Workshop manager",
  "library-suggestions": "Library suggestions",
  "assessment-overview": "Assessment overview",
  "mitigation-overview": "Mitigation overview",
  reporting: "Reporting",
};

const AGENT_THREADS = [
  {
    id: "at-survey-copy",
    title: "Q4 survey wording",
    workflowView: "survey-manager",
  },
  {
    id: "at-survey-remind",
    title: "Pending-unit reminder email",
    workflowView: "survey-manager",
  },
  {
    id: "at-id-pipeline",
    title: "Identification triage",
    workflowView: "identification-overview",
  },
  {
    id: "at-workshop-agenda",
    title: "Workshop agenda",
    workflowView: "workshop-manager",
  },
  {
    id: "at-lib-templates",
    title: "Library templates",
    workflowView: "library-suggestions",
  },
  {
    id: "at-assess-residual",
    title: "Residual sign-off",
    workflowView: "assessment-overview",
  },
  {
    id: "at-mit-plan",
    title: "Mitigation owners",
    workflowView: "mitigation-overview",
  },
  {
    id: "at-report-pack",
    title: "Executive risk pack",
    workflowView: "reporting",
  },
  {
    id: "at-general-tips",
    title: "Workspace tips",
    workflowView: null,
  },
  {
    id: "at-general-shortcuts",
    title: "Navigation shortcuts",
    workflowView: null,
  },
];

const AGENT_THREAD_MESSAGES = {
  "at-survey-copy": [
    { role: "user", text: "Can we align Q4 wording with the new policy?" },
    {
      role: "agent",
      text: 'Yes. Three edits help: replace “material” with “significant” in section 2, add a cross-reference to the governance appendix, and clarify that exceptions require committee approval.',
    },
  ],
  "at-survey-remind": [
    { role: "user", text: "Draft a short reminder for pending units." },
    {
      role: "agent",
      text: "Here’s a concise reminder: subject line, one-line ask, due date, and link to the survey. Keep it under 120 words.",
    },
  ],
  "at-id-pipeline": [
    { role: "user", text: "Which intake items should move to review this week?" },
    {
      role: "agent",
      text: "Eight drafts are past SLA; five are in review. I’d prioritize the two with cross-functional dependencies.",
    },
  ],
  "at-workshop-agenda": [
    { role: "user", text: "Session B is running long — what should we cut?" },
    {
      role: "agent",
      text: "Shorten the control walkthrough by one case study and move the deep dive to async handout.",
    },
  ],
  "at-lib-templates": [
    { role: "user", text: "Which template fits a first-pass operational risk?" },
    {
      role: "agent",
      text: "Use the operational risk starter template; it includes inherent/residual placeholders and control mapping.",
    },
  ],
  "at-assess-residual": [
    { role: "user", text: "What evidence do we need for residual sign-off?" },
    {
      role: "agent",
      text: "Attach the latest control test results, owner attestation, and any open exceptions with remediation dates.",
    },
  ],
  "at-mit-plan": [
    { role: "user", text: "Who should own the dependency blocker?" },
    {
      role: "agent",
      text: "Assign the IT owner for the integration; risk office stays accountable for overall treatment.",
    },
  ],
  "at-report-pack": [
    { role: "user", text: "Export formatting for the monthly pack?" },
    {
      role: "agent",
      text: "Use the reporting preset: PDF summary first, then appendix tables. Charts inherit theme colors.",
    },
  ],
  "at-general-tips": [
    { role: "user", text: "How do I export results from the middle column?" },
    {
      role: "agent",
      text: "Open Reporting or use the action on each list — exports respect your current filters.",
    },
  ],
  "at-general-shortcuts": [
    { role: "user", text: "Quick nav shortcuts?" },
    {
      role: "agent",
      text: "Use the sidebar for workflows; the main column toggle hides the canvas when you need more space for the right panel.",
    },
  ],
};

const AGENT_THREADS_BY_ID = Object.fromEntries(AGENT_THREADS.map((t) => [t.id, t]));

let agentThreadReturnViewId = "survey-manager";
let agentThreadReturnTitle = "Survey manager";
/** Set while the agent thread view is open (for CTA + sidebar active state). */
let agentThreadCurrentId = null;

function setActiveThreadInSidebar(threadId) {
  document.querySelectorAll(".sb-thread-item").forEach((btn) => {
    const id = btn.getAttribute("data-thread-id");
    const on = threadId != null && id === threadId;
    btn.classList.toggle("is-active", on);
    if (on) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });
}

function openAgentThreadRelevantPage() {
  const thread = agentThreadCurrentId ? AGENT_THREADS_BY_ID[agentThreadCurrentId] : null;
  if (!thread?.workflowView) return;
  const viewId = thread.workflowView;
  const label = STEP_LABELS[viewId] || viewId;
  updateRightDrilldown(viewId, label);
}

function stepIconHtml(workflowView) {
  if (!workflowView) {
    return `<span class="sb-thread-item__icon" aria-hidden="true"><svg width="16" height="16"><use href="#icon-ai-threads"/></svg></span>`;
  }
  const sym = STEP_ICON_SYMBOL[workflowView] || "icon-ai-threads";
  return `<span class="sb-thread-item__icon" aria-hidden="true"><svg width="16" height="16"><use href="#${sym}"/></svg></span>`;
}

function exitAgentThreadForNav() {
  const threadView = document.getElementById("view-agent-thread");
  if (threadView && threadView.classList.contains("is-active")) {
    threadView.classList.remove("is-active");
    middlePanel?.classList.remove("middle-panel--thread-open");
    agentThreadCurrentId = null;
    setActiveThreadInSidebar(null);
  }
}

function activateNavForView(viewId) {
  const el =
    document.querySelector(`.sb-subitem[data-view="${viewId}"]`) ||
    document.querySelector(`.sb-item[data-view="${viewId}"]`);
  if (!el) return;
  document.querySelectorAll(".sb-subitem").forEach((i) => i.classList.remove("is-active"));
  document.querySelectorAll(".sb-item").forEach((i) => i.classList.remove("is-active"));
  el.classList.add("is-active");
  if (el.classList.contains("sb-subitem")) {
    const sm = el.closest(".sb-submenu");
    document.querySelectorAll(".sb-submenu").forEach((s) => {
      const open = s === sm;
      s.classList.toggle("is-open", open);
      const parentBtn = s.previousElementSibling;
      if (parentBtn?.classList.contains("sb-item")) {
        parentBtn.classList.toggle("is-expanded", open);
      }
    });
  }
}

function renderAgentThreadMessages(threadId) {
  const box = document.getElementById("agentThreadMessages");
  if (!box) return;
  const rows = AGENT_THREAD_MESSAGES[threadId] || [];
  box.innerHTML = rows
    .map((m) => {
      const cls = m.role === "user" ? "mp-thread-chat__bubble--user" : "mp-thread-chat__bubble--agent";
      return `<div class="mp-thread-chat__bubble ${cls}">${escapeHtml(m.text)}</div>`;
    })
    .join("");
}

function openAgentThreadView(threadId) {
  const thread = AGENT_THREADS_BY_ID[threadId];
  if (!thread) return;

  const cur = document.querySelector(".mp-view.is-active");
  if (cur && cur.id !== "view-agent-thread") {
    agentThreadReturnViewId = cur.id.replace(/^view-/, "");
    agentThreadReturnTitle =
      document.getElementById("mpTitle")?.textContent?.trim() || agentThreadReturnTitle;
  }

  document.querySelectorAll(".mp-view").forEach((v) => v.classList.remove("is-active"));
  const threadEl = document.getElementById("view-agent-thread");
  if (threadEl) threadEl.classList.add("is-active");
  middlePanel?.classList.add("middle-panel--thread-open");

  const titleEl = document.getElementById("agentThreadTitle");
  if (titleEl) titleEl.textContent = thread.title;

  const badge = document.getElementById("agentThreadStepBadge");
  if (badge) {
    if (thread.workflowView) {
      badge.hidden = false;
      const sym = STEP_ICON_SYMBOL[thread.workflowView];
      const lab = STEP_LABELS[thread.workflowView] || thread.workflowView;
      badge.innerHTML = `<svg width="16" height="16" aria-hidden="true"><use href="#${sym}"/></svg><span>${escapeHtml(lab)}</span>`;
    } else {
      badge.hidden = true;
      badge.textContent = "";
    }
  }

  renderAgentThreadMessages(threadId);
  updateRightDrilldown("agent-thread", thread.title);

  agentThreadCurrentId = threadId;
  setActiveThreadInSidebar(threadId);
  const openPageBtn = document.getElementById("agentThreadOpenPageBtn");
  if (openPageBtn) {
    openPageBtn.hidden = !thread.workflowView;
  }
}

function closeAgentThreadView() {
  agentThreadCurrentId = null;
  setActiveThreadInSidebar(null);
  const threadEl = document.getElementById("view-agent-thread");
  if (threadEl) threadEl.classList.remove("is-active");
  middlePanel?.classList.remove("middle-panel--thread-open");

  document.querySelectorAll(".mp-view").forEach((v) => v.classList.remove("is-active"));
  const back = document.getElementById("view-" + agentThreadReturnViewId);
  if (back) back.classList.add("is-active");

  const mpTitle = document.getElementById("mpTitle");
  if (mpTitle) mpTitle.textContent = agentThreadReturnTitle;

  activateNavForView(agentThreadReturnViewId);
  updateRightDrilldown(agentThreadReturnViewId, agentThreadReturnTitle);
}

function setSidebarNavMode(mode) {
  const wf = document.getElementById("sbNavWorkflow");
  const th = document.getElementById("sbNavThreads");
  const bWf = document.getElementById("sbModeWorkflow");
  const bTh = document.getElementById("sbModeThreads");
  if (!wf || !th || !bWf || !bTh) return;
  const isWorkflow = mode === "workflow";
  wf.classList.toggle("is-hidden", !isWorkflow);
  th.classList.toggle("is-hidden", isWorkflow);
  bWf.classList.toggle("is-active", isWorkflow);
  bTh.classList.toggle("is-active", !isWorkflow);
  bWf.setAttribute("aria-selected", isWorkflow ? "true" : "false");
  bTh.setAttribute("aria-selected", !isWorkflow ? "true" : "false");
}

function buildAllThreadsList() {
  const host = document.getElementById("sbAllThreadsList");
  if (!host) return;
  host.innerHTML = AGENT_THREADS.map((t) => {
    const icon = stepIconHtml(t.workflowView);
    return `<button type="button" class="sb-thread-item" data-thread-id="${escapeHtml(t.id)}" title="${escapeHtml(t.title)}">${icon}<span class="sb-thread-item__text">${escapeHtml(t.title)}</span></button>`;
  }).join("");
}

function injectAgentStrips() {
  document.querySelectorAll(".mp-view[data-agent-context]").forEach((viewEl) => {
    const ctx = viewEl.dataset.agentContext;
    if (!ctx) return;
    const threads = AGENT_THREADS.filter((t) => t.workflowView === ctx);
    let inner;
    if (threads.length === 0) {
      inner = `<section class="mp-agent-strip" aria-label="Agent threads for this step"><div class="mp-agent-strip__card"><div class="mp-agent-strip__card-head">Agent threads</div><p class="mp-agent-strip__empty">No threads for this step yet.</p></div></section>`;
    } else {
      const rows = threads
        .map((t) => {
          const sym = STEP_ICON_SYMBOL[t.workflowView];
          const icon = `<span class="mp-agent-strip__icon" aria-hidden="true"><svg width="16" height="16"><use href="#${sym}"/></svg></span>`;
          return `<button type="button" class="mp-agent-strip__btn" data-thread-id="${escapeHtml(t.id)}" title="${escapeHtml(t.title)}">${icon}<span class="mp-agent-strip__btn-text">${escapeHtml(t.title)}</span></button>`;
        })
        .join("");
      inner = `<section class="mp-agent-strip" aria-label="Agent threads for this step"><div class="mp-agent-strip__card"><div class="mp-agent-strip__card-head">Agent threads</div><div class="mp-agent-strip__list">${rows}</div></div></section>`;
    }
    viewEl.insertAdjacentHTML("beforeend", inner);
  });
}

function initAgentThreadsUI() {
  buildAllThreadsList();
  injectAgentStrips();

  document.getElementById("sbModeWorkflow")?.addEventListener("click", () => setSidebarNavMode("workflow"));
  document.getElementById("sbModeThreads")?.addEventListener("click", () => setSidebarNavMode("threads"));

  document.getElementById("agentThreadCloseBtn")?.addEventListener("click", () => closeAgentThreadView());
  document.getElementById("agentThreadOpenPageBtn")?.addEventListener("click", () => openAgentThreadRelevantPage());

  middlePanel?.addEventListener("click", (e) => {
    const stripBtn = e.target.closest(".mp-agent-strip__btn[data-thread-id]");
    if (!stripBtn) return;
    openAgentThreadView(stripBtn.getAttribute("data-thread-id"));
  });

  sidebar?.addEventListener("click", (e) => {
    const row = e.target.closest(".sb-thread-item[data-thread-id]");
    if (!row) return;
    openAgentThreadView(row.getAttribute("data-thread-id"));
  });
}

function navigateTo(el) {
  exitAgentThreadForNav();
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
  }
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

let middleCollapseAnimating = false;
let middleCollapseRafId = 0;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Ease-out cubic (matches layout easing feel).
 * @param {number} t 0..1
 */
function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animate middle width → 0 via layoutMiddleRightPair, then run onComplete (apply collapsed chrome).
 */
function runMiddleCollapseAnimation(onComplete) {
  if (!middlePanel || !rightPanel) {
    onComplete();
    return;
  }
  if (prefersReducedMotion()) {
    layoutMiddleRightPair(0);
    onComplete();
    return;
  }

  middlePanel.classList.add("middle-panel--collapse-animating");
  const startMw = middlePanel.getBoundingClientRect().width;
  const t0 = performance.now();

  function done() {
    middlePanel.classList.remove("middle-panel--collapse-animating");
    layoutMiddleRightPair(0);
    middleCollapseRafId = 0;
    onComplete();
  }

  function frame(now) {
    const elapsed = now - t0;
    const u = Math.min(1, elapsed / MIDDLE_COLLAPSE_MS);
    const mw = startMw * (1 - easeOutCubic(u));
    layoutMiddleRightPair(mw);
    if (u < 1) {
      middleCollapseRafId = requestAnimationFrame(frame);
    } else {
      done();
    }
  }

  middleCollapseRafId = requestAnimationFrame(frame);
}

function cancelMiddleCollapseAnimation() {
  if (middleCollapseRafId) {
    cancelAnimationFrame(middleCollapseRafId);
    middleCollapseRafId = 0;
  }
  if (middlePanel) middlePanel.classList.remove("middle-panel--collapse-animating");
  middleCollapseAnimating = false;
}

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
    const { mw, rw } = defaultMiddleRightWidths();
    rightPanelWidth = rw;
    layoutMiddleRightPair(mw);
  });
  syncDrilldownFromActiveNav();
  initAgentThreadsUI();
  syncMiddleToggleButtons();

  if (typeof W !== "undefined" && W.dragReorder) {
    W.dragReorder("surveyList");
    W.dragReorder("workshopList");
  }

  sidebarToggle.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    applySidebarState();
    if (sidebarCollapsed) setSidebarNavMode("workflow");
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
        if (mw >= MIDDLE_MIN) {
          commitExpandedFromDrag(MIDDLE_MIN);
          isExpandDragging = false;
          isDragging = true;
          dragStartX = x;
          dragStartWidth = rightPanelWidth;
          return;
        }
        layoutMiddleRightPair(mw);
        return;
      }

      if (!isDragging) return;
      const delta = dragStartX - x;
      const rawRight = dragStartWidth + delta;
      const slot = pairSlotWidth();
      const rawMw = slot - rawRight;
      if (!middleCollapsed && rawMw < MIDDLE_MIN) {
        layoutMiddleRightPair(MIDDLE_MIN);
        return;
      }
      const newRight = clampRightPanelWidth(rawRight);
      layoutMiddleRightPair(slot - newRight);
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
      if (mw >= MIDDLE_MIN) {
        commitExpandedFromDrag(Math.max(MIDDLE_MIN, Math.min(maxMiddleWidth(), mw)));
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

window.navigateTo = navigateTo;
window.toggleSubmenu = toggleSubmenu;
window.openAgentThreadView = openAgentThreadView;
window.closeAgentThreadView = closeAgentThreadView;
window.openAgentThreadRelevantPage = openAgentThreadRelevantPage;
