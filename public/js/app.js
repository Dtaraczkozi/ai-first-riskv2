/* ============================================================
   Risk Management Prototype — app.js
   Sidebar (expanded ↔ icon rail) · collapsible right panel · fixed middle column
   ============================================================ */

/** Min width for the middle column when the right panel is visible (matches CSS `.middle-panel` min-width). */
const MIDDLE_MIN = 280;
const RIGHT_MAX = 1200;
/** Must match `--middle-layout-duration` in styles.css (ms) */
const RIGHT_COLLAPSE_MS = 500;
/** Must match CSS .resize-handle width for layout math */
const HANDLE_W = 16;

const mainRow = document.getElementById("mainRow");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarToggleHost = document.getElementById("sidebarToggleHost");
const middlePanel = document.getElementById("middlePanel");
const rightIconRail = document.getElementById("rightIconRail");
const rightPanelToggle = document.getElementById("rightPanelToggle");
const rightPanelExpandToggle = document.getElementById("rightPanelExpandToggle");
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
    subtitle: "Identification health",
    html: `
      <div class="right-drill-hint">Open <strong>All suggestions</strong> in the overview to triage External / Internal / Survey-derived items.</div>
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
  "internal-identification": {
    subtitle: "Internal intake",
    html: `
      <div class="right-drill-hint">Upload documents to generate suggestions; review the summary card then open the suggestion table.</div>
      <div class="right-drill-section"><h4>Next</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Deduplicate near-duplicates</span><span class="w-list-meta">2 pairs</span></div></div>
        </div></div>`,
  },
  "external-suggestions": {
    subtitle: "External signals",
    html: `
      <div class="right-drill-hint">News, competitors, and laws — grouped suggestions with confidence and auto-approve ribbon (mock).</div>
      <div class="right-drill-section"><h4>Feeds</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">3 active feeds · 2 paused</p>
        </div></div></div>`,
  },
  "assessment-overview": {
    subtitle: "Assessment posture",
    html: `
      <div class="right-drill-hint">In setup, in flight, synthesis, and approval — counts mirror the overview cards.</div>
      <div class="right-drill-section"><h4>Signals</h4>
        <div class="w-list">
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Quorum risk</span><span class="w-list-meta">2 assessments</span></div></div>
          <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Deadline &lt; 7d</span><span class="w-list-meta">5 assessments</span></div></div>
        </div></div>`,
  },
  "assessment-active": {
    subtitle: "Per-assessment work",
    html: `
      <div class="right-drill-hint">Select an assessment in the list to see state-specific details here.</div>
      <div class="right-drill-section"><h4>Tip</h4>
        <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Setup → monitoring → synthesis → approval follow the assessment.md contract.</p>
        </div></div></div>`,
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

/** Safe `data-inline-ctx` value for use inside a double-quoted attribute selector. */
function escapeAttrSelectorValue(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Gap between anchor and menu (matches CSS `calc(100% + 6px)`). */
const DROPDOWN_VIEWPORT_GAP_PX = 6;

/**
 * Opens a dropdown below its anchor by default; flips above when the menu would clip the viewport.
 * Call after the menu is visible (`hidden` removed) so `offsetHeight` is accurate.
 * @param {HTMLElement} menu
 * @param {HTMLElement} anchor - Positioning context (e.g. `.mp-agent-plus-wrap`, `.sb-new-thread`)
 */
function positionDropdownToFitViewport(menu, anchor) {
  if (!menu || !anchor) return;
  menu.classList.remove("mp-dropdown--above", "mp-dropdown--below");
  const h = menu.offsetHeight;
  if (h < 1) return;
  const ar = anchor.getBoundingClientRect();
  const vv = window.visualViewport;
  const vTop = vv ? vv.offsetTop : 0;
  const vH = vv ? vv.height : window.innerHeight;
  const viewportBottom = vTop + vH;
  const gap = DROPDOWN_VIEWPORT_GAP_PX;
  const spaceBelow = viewportBottom - ar.bottom - gap;
  const spaceAbove = ar.top - vTop - gap;
  let openAbove = false;
  if (spaceBelow >= h) {
    openAbove = false;
  } else if (spaceAbove >= h) {
    openAbove = true;
  } else {
    openAbove = spaceAbove > spaceBelow;
  }
  menu.classList.add(openAbove ? "mp-dropdown--above" : "mp-dropdown--below");
}

function qsInlineChatSection(ctx) {
  if (ctx == null || ctx === "") return null;
  try {
    return document.querySelector(
      `.mp-inline-chat[data-inline-ctx="${escapeAttrSelectorValue(ctx)}"]`
    );
  } catch (e) {
    console.warn("[app.js] qsInlineChatSection", e);
    return null;
  }
}

function qsWorkflowViewByContext(ctx) {
  try {
    return document.querySelector(
      `.mp-view[data-agent-context="${escapeAttrSelectorValue(ctx)}"]`
    );
  } catch (e) {
    return null;
  }
}

/** Docked: thread picker + message input always visible; live widgets scroll above. */
const CHAT_UI_DOCKED = "docked";
/** Full-panel overlay: snapshot + messages scroll; composer pinned to bottom. */
const CHAT_UI_OVERLAY = "overlay";

const INLINE_AGENT_REPLY_MS = 950;
const INLINE_AGENT_REPLY_TEXT =
  "Thanks — I’m using the page snapshot you sent as context for this thread.";

function stripIdsFromSubtree(root) {
  if (!root) return;
  if (root.nodeType === 1) root.removeAttribute("id");
  root.querySelectorAll?.("[id]").forEach((n) => n.removeAttribute("id"));
}

/** Overlay thread (snapshot + messages) is hidden in docked mode; composer stays in place below the toolbar. */
function setInlineOverlayStackHidden(section, hidden) {
  if (!section) return;
  section.querySelector(".mp-inline-chat__thread-scroll")?.toggleAttribute("hidden", hidden);
}

/** Keep toolbar strip directly under gradient so expanded chat shows toolbar on top (not above composer at bottom). */
function positionInlineToolbar(section) {
  const gradient = section.querySelector(".mp-inline-chat__gradient");
  const strip = section.querySelector(".mp-inline-chat__toolbar-strip");
  if (!strip || !gradient) return;
  gradient.after(strip);
}

function syncInlinePanelToggleButton(section) {
  const btn = section?.querySelector("[data-inline-panel-toggle]");
  if (!btn) return;
  const expanded = section.dataset.chatUi === CHAT_UI_OVERLAY;
  btn.title = expanded ? "Collapse to input" : "Expand thread panel";
  btn.setAttribute("aria-label", expanded ? "Collapse thread to input only" : "Expand thread to full panel");
}

/** Match overlay column width to the live main canvas (.mp-view__main border box) — snapshot + composer + toolbar */
function syncInlineChatColumnWidths(ctx) {
  const run = () => {
    const view = qsWorkflowViewByContext(ctx);
    const main = view?.querySelector(".mp-view__main");
    const section = qsInlineChatSection(ctx);
    if (!main || !section) return;
    const w = main.getBoundingClientRect().width;
    section.style.setProperty("--mp-chat-column-w", `${Math.round(w * 1000) / 1000}px`);
  };
  run();
  requestAnimationFrame(run);
}

const MP_INLINE_TOOLBAR_FLIP_MS = 420;
const MP_INLINE_TOOLBAR_EASE_EXPAND = "cubic-bezier(0.33, 1, 0.68, 1)";
const MP_INLINE_SWIPE_FALLBACK_MS = 520;

/** FLIP: animate toolbar when expanding docked → overlay (collapse is instant — no animation). */
function runInlineToolbarFlipAnimation(toolbar, firstRect) {
  if (!toolbar || !firstRect) return;
  requestAnimationFrame(() => {
    const lastRect = toolbar.getBoundingClientRect();
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    if (Math.abs(dx) < 0.75 && Math.abs(dy) < 0.75) return;
    toolbar.style.transition = "none";
    toolbar.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      toolbar.style.transition = `transform ${MP_INLINE_TOOLBAR_FLIP_MS}ms ${MP_INLINE_TOOLBAR_EASE_EXPAND}`;
      toolbar.style.transform = "translate(0, 0)";
      const cleanup = () => {
        toolbar.style.transition = "";
        toolbar.style.transform = "";
      };
      toolbar.addEventListener(
        "transitionend",
        (e) => {
          if (e.propertyName === "transform") cleanup();
        },
        { once: true }
      );
      window.setTimeout(cleanup, MP_INLINE_SWIPE_FALLBACK_MS);
    });
  });
}

/** Collapse overlay → docked immediately (no swipe). */
function collapseInlineChatToDocked(ctx) {
  setChatUi(ctx, CHAT_UI_DOCKED);
}

function setChatUi(ctx, mode) {
  const section = qsInlineChatSection(ctx);
  if (!section) return;
  section.style.removeProperty("--mp-chat-column-w");
  const toolbar = section.querySelector(".mp-inline-chat__toolbar");
  const prevMode = section.dataset.chatUi;
  const flipToolbarOnExpand =
    toolbar && prevMode === CHAT_UI_DOCKED && mode === CHAT_UI_OVERLAY;

  const firstToolbarRect = flipToolbarOnExpand ? toolbar.getBoundingClientRect() : null;

  const composerWrap = section.querySelector("[data-inline-composer-wrap]");
  const snap = section.querySelector("[data-inline-snapshot]");

  section.dataset.chatUi = mode;
  section.classList.remove(
    "mp-inline-chat--docked",
    "mp-inline-chat--overlay",
    "mp-inline-chat--collapsed",
    "mp-inline-chat--expand-swipe"
  );

  if (mode === CHAT_UI_DOCKED) {
    section.classList.add("mp-inline-chat--docked", "mp-inline-chat--collapsed");
    positionInlineToolbar(section);
    if (composerWrap) composerWrap.hidden = false;
    setInlineOverlayStackHidden(section, true);
    middlePanel?.classList.remove("middle-panel--chat-overlay");
    if (prevMode === CHAT_UI_OVERLAY && snap) {
      snap.innerHTML = "";
      snap.setAttribute("aria-hidden", "true");
    }
  } else if (mode === CHAT_UI_OVERLAY) {
    section.classList.add("mp-inline-chat--overlay");
    setInlineOverlayStackHidden(section, false);
    if (composerWrap) composerWrap.hidden = false;
    positionInlineToolbar(section);
    middlePanel?.classList.add("middle-panel--chat-overlay");
    syncInlineChatColumnWidths(ctx);
    if (prevMode === CHAT_UI_DOCKED) {
      section.classList.add("mp-inline-chat--expand-swipe");
      const scrollEl = section.querySelector(".mp-inline-chat__thread-scroll");
      const endSwipe = () => {
        section.classList.remove("mp-inline-chat--expand-swipe");
      };
      scrollEl?.addEventListener("animationend", endSwipe, { once: true });
      window.setTimeout(endSwipe, MP_INLINE_SWIPE_FALLBACK_MS);
    }
  }
  syncInlinePanelToggleButton(section);

  if (flipToolbarOnExpand && firstToolbarRect) {
    runInlineToolbarFlipAnimation(toolbar, firstToolbarRect);
  }
}

function setInlineComposerBusy(section, busy) {
  if (!section) return;
  const input = section.querySelector("[data-inline-composer-input]");
  const send = section.querySelector("[data-inline-composer-send]");
  if (input) {
    input.readOnly = busy;
    input.setAttribute("aria-busy", busy ? "true" : "false");
  }
  if (send) send.disabled = busy;
}

function fillInlineSnapshot(ctx) {
  const view = qsWorkflowViewByContext(ctx);
  const main = view?.querySelector(".mp-view__main");
  const section = qsInlineChatSection(ctx);
  const snap = section?.querySelector("[data-inline-snapshot]");
  if (!main || !snap) return;
  snap.innerHTML = "";
  const clone = main.cloneNode(true);
  stripIdsFromSubtree(clone);
  clone.classList.add("mp-inline-chat__snapshot-clone");
  snap.appendChild(clone);
  snap.setAttribute("aria-hidden", "false");
  syncInlineChatColumnWidths(ctx);
}

function scrollInlineThreadToBottom(ctx) {
  const section = qsInlineChatSection(ctx);
  const scrollEl = section?.querySelector(".mp-inline-chat__thread-scroll");
  if (!scrollEl) return;
  requestAnimationFrame(() => {
    scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
  });
}

function removeInlineTyping(section) {
  section?.querySelector("[data-inline-typing]")?.remove();
}

function appendInlineUserBubble(ctx, userText) {
  const section = qsInlineChatSection(ctx);
  const box = section?.querySelector("[data-inline-messages]");
  if (!box || !userText) return;
  box.insertAdjacentHTML(
    "beforeend",
    `<div class="mp-thread-chat__bubble mp-thread-chat__bubble--user">${escapeHtml(userText)}</div>`
  );
}

function appendInlineTypingRow(ctx) {
  const section = qsInlineChatSection(ctx);
  const box = section?.querySelector("[data-inline-messages]");
  if (!box) return;
  box.insertAdjacentHTML(
    "beforeend",
    `<div class="mp-inline-chat__typing" data-inline-typing aria-live="polite">
      <span class="mp-inline-chat__typing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="mp-inline-chat__typing-label">Agent is replying…</span>
    </div>`
  );
}

function appendInlineAgentBubble(ctx, text) {
  const section = qsInlineChatSection(ctx);
  const box = section?.querySelector("[data-inline-messages]");
  if (!box) return;
  box.insertAdjacentHTML(
    "beforeend",
    `<div class="mp-thread-chat__bubble mp-thread-chat__bubble--agent">${escapeHtml(text)}</div>`
  );
}

function updateInlineThreadTitle(ctx, threadId) {
  const section = qsInlineChatSection(ctx);
  const el = section?.querySelector("[data-inline-thread-title]");
  const t = AGENT_THREADS_BY_ID[threadId];
  if (el && t) el.textContent = t.title;
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
let rightCollapsed = false;
let rightPanelWidth = 0;
let savedRightPanelWidth = 0;

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
  const rrailW = rightIconRail ? rightIconRail.getBoundingClientRect().width : 0;
  const hw = resizeHandle ? resizeHandle.getBoundingClientRect().width : HANDLE_W;
  return Math.max(0, inner - sb - rrailW - hw);
}

/** Main content = middle + right; right panel cannot be narrower than one third of that pair. */
function minRightWidthForSlot(slot) {
  if (slot <= 0) return 0;
  return slot / 3;
}

/** Max middle width when both columns visible (right at its minimum width). */
function maxMiddleWidth() {
  const slot = pairSlotWidth();
  if (slot <= 0) return 0;
  return slot - minRightWidthForSlot(slot);
}

/**
 * Max right panel width: at most 50% of the middle+right pair (main content slot),
 * and never wider than what still leaves MIDDLE_MIN for the middle column; also capped by RIGHT_MAX.
 */
function maxRightWidth() {
  const slot = pairSlotWidth();
  if (slot <= 0) return 0;
  const maxHalfOfPair = slot * 0.5;
  const maxWhenMiddleAtMin = slot - MIDDLE_MIN;
  return Math.min(RIGHT_MAX, maxHalfOfPair, maxWhenMiddleAtMin);
}

function clampRightPanelWidth(rw) {
  const slot = pairSlotWidth();
  const minR = minRightWidthForSlot(slot);
  const maxR = maxRightWidth();
  if (minR > maxR) {
    return Math.max(0, Math.round(maxR));
  }
  return Math.min(maxR, Math.max(minR, rw));
}

/** Default: middle ≈ ⅔ of main pair, right ≈ ⅓ (right sits at its minimum width). */
function defaultMiddleRightWidths() {
  const slot = pairSlotWidth();
  if (slot <= 0) return { mw: 0, rw: 0 };
  let rw = minRightWidthForSlot(slot);
  rw = clampRightPanelWidth(rw);
  const mw = slot - rw;
  return { mw, rw };
}

function clearMiddleInlineFlex() {
  if (!middlePanel) return;
  middlePanel.style.flex = "";
  middlePanel.style.maxWidth = "";
}

function syncRightToggleButtons() {
  const expanded = !rightCollapsed;
  [rightPanelToggle, rightPanelExpandToggle].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("is-active", expanded);
    btn.setAttribute("aria-pressed", expanded ? "true" : "false");
  });
}

function syncResizeHandleVisibility() {
  if (!resizeHandle) return;
  const hidden = rightCollapsed;
  resizeHandle.classList.toggle("is-hidden", hidden);
  resizeHandle.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function applyRightCollapsedLayout() {
  if (!middlePanel || !rightPanel) return;
  rightPanel.classList.add("is-hidden");
  rightPanel.classList.remove("right-panel--drag-reveal", "right-panel--collapse-animating");
  rightPanel.style.width = "";
  clearMiddleInlineFlex();
  middlePanel.classList.add("middle-panel--fill");
  middlePanel.classList.remove("middle-panel--drag-reveal");
  if (mainRow) mainRow.classList.add("main-row--right-collapsed");
  if (mainRow) mainRow.classList.remove("main-row--right-expanding");
  syncRightToggleButtons();
  syncResizeHandleVisibility();
}

function applyRightWidthPx(w) {
  if (!rightPanel) return;
  const slot = pairSlotWidth();
  const rw = clampRightPanelWidth(w);
  layoutMiddleRightPair(slot - rw);
}

function collapseRight() {
  if (rightCollapsed || rightCollapseAnimating) return;
  rightCollapseAnimating = true;
  savedRightPanelWidth = rightPanelWidth;
  runRightCollapseAnimation(() => {
    rightCollapsed = true;
    applyRightCollapsedLayout();
    rightCollapseAnimating = false;
  });
}

/** Leave drag-from-collapsed and commit expanded layout + widths (used by handle drag + expandRight). */
function commitExpandedFromDrag(middleWIntent) {
  if (!middlePanel || !rightPanel) return;
  rightCollapsed = false;
  rightPanel.classList.remove("is-hidden", "right-panel--drag-reveal", "right-panel--collapse-animating");
  middlePanel.classList.remove("middle-panel--fill");
  if (mainRow) mainRow.classList.remove("main-row--right-collapsed", "main-row--right-expanding");
  layoutMiddleRightPair(middleWIntent);
  savedRightPanelWidth = rightPanelWidth;
  syncRightToggleButtons();
  syncResizeHandleVisibility();
}

function expandRight() {
  if (!rightCollapsed || !middlePanel || !rightPanel) return;
  if (rightCollapseAnimating) {
    cancelRightCollapseAnimation();
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
    if (!rightCollapsed) {
      applyRightWidthPx(rightPanelWidth);
    }
  });
}

/** Sprite id for each workflow step (16×16 in thread lists). */
const STEP_ICON_SYMBOL = {
  "survey-manager": "icon-identification",
  "identification-overview": "icon-identification",
  "internal-identification": "icon-identification",
  "external-suggestions": "icon-identification",
  "assessment-overview": "icon-assessment",
  "assessment-active": "icon-assessment",
  "mitigation-overview": "icon-mitigation",
  reporting: "icon-reporting",
};

const STEP_LABELS = {
  "survey-manager": "Survey manager",
  "identification-overview": "Overview",
  "internal-identification": "Internal identification",
  "external-suggestions": "External suggestions",
  "assessment-overview": "Overview",
  "assessment-active": "Active assessments",
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
    id: "at-internal-docs",
    title: "Internal document intake",
    workflowView: "internal-identification",
  },
  {
    id: "at-external-feeds",
    title: "External feed review",
    workflowView: "external-suggestions",
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
  {
    id: "at-page-element",
    title: "Selected element",
    workflowView: null,
  },
];

const AGENT_THREADS_BY_ID = Object.fromEntries(AGENT_THREADS.map((t) => [t.id, t]));

/** Per–workflow-step selected thread for inline chat */
const inlineThreadSelection = Object.create(null);
/** Last workflow view with `data-agent-context` (for sidebar “New thread”). */
let lastWorkflowAgentContext = "identification-overview";

let agentThreadReturnViewId = "identification-overview";
let agentThreadReturnTitle = "Overview";
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
  let thread = null;
  if (agentThreadCurrentId) {
    thread = AGENT_THREADS_BY_ID[agentThreadCurrentId];
  } else {
    const active = document.querySelector(".mp-view.is-active[data-agent-context]");
    const ctx = active?.dataset.agentContext;
    if (ctx) {
      const tid = inlineThreadSelection[ctx];
      thread = tid ? AGENT_THREADS_BY_ID[tid] : null;
    }
  }
  if (!thread?.workflowView) return;
  const viewId = thread.workflowView;
  const label = STEP_LABELS[viewId] || viewId;
  updateRightDrilldown(viewId, label);
}

function updateInlineOpenPageVisibility(ctx) {
  const section = qsInlineChatSection(ctx);
  if (!section) return;
  const btn = section.querySelector("[data-inline-open-page]");
  if (!btn) return;
  const pill = section.querySelector("[data-inline-pill]");
  const tid = pill?.value || inlineThreadSelection[ctx];
  const thread = tid ? AGENT_THREADS_BY_ID[tid] : null;
  btn.hidden = !thread?.workflowView;
}

function stepIconHtml(workflowView) {
  if (!workflowView) {
    return `<span class="sb-thread-item__icon" aria-hidden="true"><svg width="16" height="16"><use href="#icon-ai-threads"/></svg></span>`;
  }
  const sym = STEP_ICON_SYMBOL[workflowView] || "icon-ai-threads";
  return `<span class="sb-thread-item__icon" aria-hidden="true"><svg width="16" height="16"><use href="#${sym}"/></svg></span>`;
}

function exitAgentThreadForNav() {
  document.querySelectorAll(".mp-inline-chat--overlay").forEach((sec) => {
    const ctx = sec.dataset.inlineCtx;
    if (ctx) collapseInlineChatToDocked(ctx);
  });
  middlePanel?.classList.remove("middle-panel--chat-overlay");
  agentThreadCurrentId = null;
  setActiveThreadInSidebar(null);
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

function openAgentThreadView(threadId) {
  const thread = AGENT_THREADS_BY_ID[threadId];
  if (!thread) return;

  if (thread.workflowView) {
    const navEl = document.querySelector(`.sb-subitem[data-view="${thread.workflowView}"]`);
    if (navEl) navigateTo(navEl);
  } else {
    const navEl =
      document.querySelector(`.sb-subitem[data-view="${lastWorkflowAgentContext}"]`) ||
      document.querySelector('.sb-subitem[data-view="identification-overview"]');
    if (navEl) navigateTo(navEl);
  }

  const activeView = document.querySelector(".mp-view.is-active[data-agent-context]");
  const ctx = activeView?.dataset.agentContext;
  if (!ctx) return;

  inlineThreadSelection[ctx] = threadId;
  syncInlinePillForContext(ctx);
  clearInlineMessages(ctx);
  updateInlineThreadTitle(ctx, threadId);
  fillInlineSnapshot(ctx);
  setChatUi(ctx, CHAT_UI_OVERLAY);
  scrollInlineThreadToBottom(ctx);

  agentThreadCurrentId = threadId;
  setActiveThreadInSidebar(threadId);

  const drillId = thread.workflowView || ctx;
  const label = STEP_LABELS[drillId] || thread.title;
  updateRightDrilldown(drillId, thread.title);
}

function closeAgentThreadView() {
  const overlay = document.querySelector(".mp-inline-chat--overlay[data-inline-ctx]");
  if (overlay) {
    const ctx = overlay.dataset.inlineCtx;
    if (ctx) collapseInlineChatToDocked(ctx);
  }
  agentThreadCurrentId = null;
  setActiveThreadInSidebar(null);
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
  host.innerHTML = AGENT_THREADS.filter((t) => t.id !== "at-page-element").map((t) => {
    const icon = stepIconHtml(t.workflowView);
    return `<button type="button" class="sb-thread-item" data-thread-id="${escapeHtml(t.id)}" title="${escapeHtml(t.title)}">${icon}<span class="sb-thread-item__text">${escapeHtml(t.title)}</span></button>`;
  }).join("");
}

function topicThreadsFor(ctx) {
  return AGENT_THREADS.filter((t) => t.workflowView === ctx);
}

function generalThreads() {
  return AGENT_THREADS.filter((t) => t.workflowView == null);
}

function defaultThreadIdForContext(ctx) {
  const topics = topicThreadsFor(ctx);
  if (topics.length) return topics[0].id;
  const gens = generalThreads();
  return gens[0]?.id || "";
}

function buildInlinePillOptionsHtml(ctx) {
  const topics = topicThreadsFor(ctx);
  const gens = generalThreads().filter((t) => t.id !== "at-page-element");
  let html = "";
  if (topics.length) {
    html += `<optgroup label="This topic">`;
    topics.forEach((t) => {
      html += `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)}</option>`;
    });
    html += `</optgroup>`;
  }
  if (gens.length) {
    html += `<optgroup label="General">`;
    gens.forEach((t) => {
      html += `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)}</option>`;
    });
    html += `</optgroup>`;
  }
  const pageEl = AGENT_THREADS_BY_ID["at-page-element"];
  if (pageEl) {
    html += `<optgroup label="Page">`;
    html += `<option value="${escapeHtml(pageEl.id)}">${escapeHtml(pageEl.title)}</option>`;
    html += `</optgroup>`;
  }
  return html;
}

function inlineFieldId(ctx) {
  return String(ctx).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function buildInlineChatHtml(ctx) {
  const opts = buildInlinePillOptionsHtml(ctx);
  const fid = inlineFieldId(ctx);
  return `
<section class="mp-inline-chat mp-inline-chat--docked mp-inline-chat--collapsed" data-inline-ctx="${escapeHtml(ctx)}" data-chat-ui="docked" aria-label="Agent conversation">
  <div class="mp-inline-chat__gradient" aria-hidden="true"></div>
  <div class="mp-inline-chat__toolbar-strip">
  <div class="mp-inline-chat__toolbar">
    <div class="mp-inline-chat__toolbar-start">
      <label class="visually-hidden" for="inline-pill-${fid}">Thread</label>
      <select id="inline-pill-${fid}" class="mp-inline-chat__pill" data-inline-pill data-inline-ctx="${escapeHtml(ctx)}">
        ${opts}
      </select>
      <span class="visually-hidden" data-inline-thread-title></span>
      <div class="mp-inline-chat__plus-wrap mp-agent-plus-wrap">
        <button type="button" class="mp-inline-chat__plus mp-agent-chat__icon-btn" data-inline-plus data-inline-ctx="${escapeHtml(ctx)}" title="Add thread" aria-label="Add thread" aria-haspopup="true" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-add"/></svg>
        </button>
        <div class="mp-inline-chat__menu" data-inline-menu hidden role="menu">
          <button type="button" class="mp-inline-chat__menu-item" role="menuitem" data-inline-new="general" data-inline-ctx="${escapeHtml(ctx)}">General thread</button>
          <button type="button" class="mp-inline-chat__menu-item" role="menuitem" data-inline-new="topic" data-inline-ctx="${escapeHtml(ctx)}">Topic-specific thread</button>
          <button type="button" class="mp-inline-chat__menu-item" role="menuitem" data-inline-new="pick" data-inline-ctx="${escapeHtml(ctx)}">Select element…</button>
        </div>
      </div>
    </div>
    <div class="mp-inline-chat__toolbar-actions">
      <button type="button" class="tb-btn mp-agent-chat__icon-btn mp-thread-chat__open-page" data-inline-open-page data-inline-ctx="${escapeHtml(ctx)}" hidden title="Open relevant page in side panel" aria-label="Open relevant page in side panel">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-open-relevant-page"/></svg>
      </button>
      <button type="button" class="tb-btn mp-agent-chat__icon-btn mp-inline-chat__panel-toggle" data-inline-panel-toggle data-inline-ctx="${escapeHtml(ctx)}" title="Expand thread panel" aria-label="Expand thread to full panel">
        <img class="mp-inline-chat__panel-ico mp-inline-chat__panel-ico--expand" src="/icons/fullscreen.png" width="18" height="18" alt="" decoding="async" />
        <img class="mp-inline-chat__panel-ico mp-inline-chat__panel-ico--collapse" src="/icons/exit-fullscreen.png" width="18" height="18" alt="" decoding="async" />
      </button>
    </div>
  </div>
  </div>
  <div class="mp-inline-chat__thread-scroll" hidden>
    <div class="mp-inline-chat__snapshot" data-inline-snapshot aria-hidden="true"></div>
    <div class="mp-inline-chat__messages" data-inline-messages data-inline-ctx="${escapeHtml(ctx)}"></div>
  </div>
  <div class="mp-chat-composer mp-inline-chat__composer-wrap" data-inline-composer-wrap>
    <div class="mp-chat-composer__field">
      <textarea class="w-form-textarea mp-chat-composer__input" rows="1" placeholder="Message this thread…" data-inline-composer-input></textarea>
      <button type="button" class="tb-btn mp-chat-composer__send" aria-label="Send" title="Send message" data-inline-composer-send>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-send"/></svg>
      </button>
    </div>
    <p class="mp-chat-composer__hint">Sending captures the page and opens the conversation panel.</p>
  </div>
</section>`;
}

function syncInlinePillForContext(ctx) {
  const section = qsInlineChatSection(ctx);
  if (!section) return;
  const pill = section.querySelector("[data-inline-pill]");
  if (!pill) return;
  let tid = inlineThreadSelection[ctx];
  if (!tid || !AGENT_THREADS_BY_ID[tid]) {
    tid = defaultThreadIdForContext(ctx);
    inlineThreadSelection[ctx] = tid;
  }
  pill.value = tid;
  if (pill.value !== tid) {
    const fb = defaultThreadIdForContext(ctx);
    inlineThreadSelection[ctx] = fb;
    pill.value = fb;
  }
  updateInlineOpenPageVisibility(ctx);
}

function clearInlineMessages(ctx) {
  const section = qsInlineChatSection(ctx);
  if (!section) return;
  const box = section.querySelector("[data-inline-messages]");
  if (box) box.innerHTML = "";
}

function closeAllInlinePlusMenus() {
  document.querySelectorAll(".mp-inline-chat__menu[data-inline-menu]").forEach((m) => {
    m.hidden = true;
    m.classList.remove("mp-dropdown--above", "mp-dropdown--below");
  });
  document.querySelectorAll("[data-inline-plus], [data-agent-plus]").forEach((b) => b.setAttribute("aria-expanded", "false"));
}

function closeSbNewThreadMenu() {
  const menu = document.getElementById("sbNewThreadMenu");
  const btn = document.getElementById("sbNewThreadBtn");
  if (menu) {
    menu.hidden = true;
    menu.classList.remove("mp-dropdown--above", "mp-dropdown--below");
  }
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function handleInlineNewThread(kind, ctx) {
  if (kind === "pick") {
    startAgentPickMode(ctx);
    return;
  }
  if (kind === "general") {
    inlineThreadSelection[ctx] = "at-general-tips";
  } else {
    inlineThreadSelection[ctx] = defaultThreadIdForContext(ctx);
  }
  syncInlinePillForContext(ctx);
  clearInlineMessages(ctx);
  setActiveThreadInSidebar(inlineThreadSelection[ctx]);
}

let agentPickHoverEl = null;

function contextIdForThread(thread) {
  if (!thread) return lastWorkflowAgentContext;
  if (thread.workflowView) return thread.workflowView;
  return agentThreadReturnViewId || lastWorkflowAgentContext;
}

function startAgentPickMode(ctx) {
  endAgentPickMode();
  document.body.classList.add("is-agent-context-picking");
  document.body.dataset.agentPickCtx = ctx || "";
}

function endAgentPickMode() {
  document.body.classList.remove("is-agent-context-picking");
  delete document.body.dataset.agentPickCtx;
  if (agentPickHoverEl) {
    agentPickHoverEl.classList.remove("is-agent-pick-hover");
    agentPickHoverEl = null;
  }
}

function pickModeTargetFromEvent(e) {
  if (!e.target || !e.target.closest) return null;
  const t = e.target;
  if (t.closest(".mp-inline-chat")) return null;
  return (
    t.closest("[data-agent-pick]") ||
    t.closest(".w-card") ||
    t.closest(".w-stat") ||
    t.closest(".w-list-item") ||
    t.closest(".w-collapsible") ||
    t.closest(".w-table") ||
    t.closest(".w-section-title") ||
    t.closest(".mp-header") ||
    t.closest("section") ||
    t.closest("h1, h2, h3")
  );
}

function initAgentPickModeListeners() {
  document.addEventListener(
    "mousemove",
    (e) => {
      if (!document.body.classList.contains("is-agent-context-picking")) return;
      const el = pickModeTargetFromEvent(e);
      if (el === agentPickHoverEl) return;
      if (agentPickHoverEl) agentPickHoverEl.classList.remove("is-agent-pick-hover");
      agentPickHoverEl = el;
      if (agentPickHoverEl) agentPickHoverEl.classList.add("is-agent-pick-hover");
    },
    true
  );

  document.addEventListener(
    "click",
    (e) => {
      if (!document.body.classList.contains("is-agent-context-picking")) return;
      if (e.target.closest(".mp-inline-chat")) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const el = pickModeTargetFromEvent(e);
      const label =
        el?.getAttribute?.("data-agent-pick-label") ||
        el?.querySelector?.(".w-card-title, .w-list-title, h1, h2, h3")?.textContent?.trim() ||
        "this area";
      endAgentPickMode();
      console.info("[prototype] Context selected:", label);
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("is-agent-context-picking")) {
      endAgentPickMode();
    }
  });
}

function navigateToAgentContextView(ctx) {
  const el = document.querySelector(`.sb-subitem[data-view="${ctx}"]`);
  if (el) {
    navigateTo(el);
    return;
  }
  const fb = document.querySelector('.sb-subitem[data-view="identification-overview"]');
  if (fb) navigateTo(fb);
}

function initSidebarNewThreadMenu() {
  const btn = document.getElementById("sbNewThreadBtn");
  const menu = document.getElementById("sbNewThreadMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllInlinePlusMenus();
    menu.hidden = !menu.hidden;
    if (!menu.hidden) {
      const anchor = btn.closest(".sb-new-thread") || btn;
      requestAnimationFrame(() => positionDropdownToFitViewport(menu, anchor));
    }
    btn.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest("[data-sb-new]");
    if (!item) return;
    const kind = item.getAttribute("data-sb-new");
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    setSidebarNavMode("workflow");
    if (kind === "pick") {
      navigateToAgentContextView(lastWorkflowAgentContext);
      setTimeout(() => startAgentPickMode(lastWorkflowAgentContext), 0);
      return;
    }
    if (kind === "general") {
      inlineThreadSelection[lastWorkflowAgentContext] = "at-general-tips";
      navigateToAgentContextView(lastWorkflowAgentContext);
    } else {
      inlineThreadSelection[lastWorkflowAgentContext] = defaultThreadIdForContext(lastWorkflowAgentContext);
      navigateToAgentContextView(lastWorkflowAgentContext);
    }
  });
}

function initInlineChatMiddlePanelHandlers() {
  middlePanel?.addEventListener("keydown", (e) => {
    if (!e.target.matches?.("[data-inline-composer-input]")) return;
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    const section = e.target.closest(".mp-inline-chat");
    if (section?.dataset.replyPending === "true") return;
    section?.querySelector("[data-inline-composer-send]")?.click();
  });

  middlePanel?.addEventListener("change", (e) => {
    const pill = e.target.closest("[data-inline-pill]");
    if (!pill) return;
    const ctx = pill.getAttribute("data-inline-ctx");
    if (!ctx) return;
    const tid = pill.value;
    inlineThreadSelection[ctx] = tid;
    setActiveThreadInSidebar(tid);
    clearInlineMessages(ctx);
    updateInlineOpenPageVisibility(ctx);
    updateInlineThreadTitle(ctx, tid);
    if (qsInlineChatSection(ctx)?.classList.contains("mp-inline-chat--overlay")) {
      fillInlineSnapshot(ctx);
    }
  });

  middlePanel?.addEventListener("click", (e) => {
    const openRel = e.target.closest("[data-inline-open-page]");
    if (openRel) {
      openAgentThreadRelevantPage();
      return;
    }

    const panelToggle = e.target.closest("[data-inline-panel-toggle]");
    if (panelToggle) {
      const section = panelToggle.closest(".mp-inline-chat");
      const ctx = section?.dataset.inlineCtx;
      if (!ctx) return;
      if (section.dataset.chatUi === CHAT_UI_OVERLAY) {
        collapseInlineChatToDocked(ctx);
      } else {
        fillInlineSnapshot(ctx);
        setChatUi(ctx, CHAT_UI_OVERLAY);
        scrollInlineThreadToBottom(ctx);
      }
      e.stopPropagation();
      return;
    }

    const sendProto = e.target.closest("[data-inline-composer-send]");
    if (sendProto) {
      const section = sendProto.closest(".mp-inline-chat");
      const ctx = section?.dataset.inlineCtx;
      if (!ctx) return;
      if (section.dataset.replyPending === "true") return;
      const input = section.querySelector("[data-inline-composer-input]");
      const text = (input?.value || "").trim();
      if (!text) return;
      const ui = section.dataset.chatUi;
      if (ui !== CHAT_UI_DOCKED && ui !== CHAT_UI_OVERLAY) return;

      fillInlineSnapshot(ctx);
      const tid = inlineThreadSelection[ctx] || defaultThreadIdForContext(ctx);
      updateInlineThreadTitle(ctx, tid);
      if (input) input.value = "";

      appendInlineUserBubble(ctx, text);
      appendInlineTypingRow(ctx);

      if (ui === CHAT_UI_DOCKED) {
        setChatUi(ctx, CHAT_UI_OVERLAY);
      }

      section.dataset.replyPending = "true";
      setInlineComposerBusy(section, true);
      scrollInlineThreadToBottom(ctx);

      window.setTimeout(() => {
        const sec = qsInlineChatSection(ctx);
        removeInlineTyping(sec);
        appendInlineAgentBubble(ctx, INLINE_AGENT_REPLY_TEXT);
        scrollInlineThreadToBottom(ctx);
        if (sec) {
          sec.dataset.replyPending = "false";
          setInlineComposerBusy(sec, false);
        }
      }, INLINE_AGENT_REPLY_MS);
      return;
    }

    const plus = e.target.closest("[data-inline-plus], [data-agent-plus]");
    if (plus) {
      const wrap = plus.closest(".mp-agent-plus-wrap");
      const menu = wrap?.querySelector("[data-inline-menu]");
      const willOpen = menu?.hidden;
      closeAllInlinePlusMenus();
      if (menu && willOpen) {
        menu.hidden = false;
        plus.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => positionDropdownToFitViewport(menu, wrap || plus));
      }
      e.stopPropagation();
      return;
    }

    const newItem = e.target.closest("[data-inline-new]");
    if (newItem) {
      closeAllInlinePlusMenus();
      if (newItem.hasAttribute("data-agent-expanded-menu")) {
        const kind = newItem.getAttribute("data-inline-new");
        const ctx =
          document.querySelector(".mp-view.is-active[data-agent-context]")?.dataset.agentContext ||
          lastWorkflowAgentContext;
        if (kind === "pick") startAgentPickMode(ctx);
        else handleInlineNewThread(kind, ctx);
      } else {
        const kind = newItem.getAttribute("data-inline-new");
        const ctx = newItem.getAttribute("data-inline-ctx");
        handleInlineNewThread(kind, ctx);
      }
    }
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".mp-agent-plus-wrap") || e.target.closest(".sb-new-thread")) return;
  closeAllInlinePlusMenus();
  closeSbNewThreadMenu();
});

function injectInlineChats() {
  document.querySelectorAll(".mp-view[data-agent-context]").forEach((viewEl) => {
    if (viewEl.querySelector(":scope > .mp-view__main")) return;
    const ctx = viewEl.dataset.agentContext;
    if (!ctx) return;

    const main = document.createElement("div");
    main.className = "mp-view__main";
    while (viewEl.firstChild) {
      main.appendChild(viewEl.firstChild);
    }

    const tpl = document.createElement("template");
    tpl.innerHTML = buildInlineChatHtml(ctx).trim();
    const inline = tpl.content.firstElementChild;
    if (!inline) return;

    viewEl.appendChild(main);
    viewEl.appendChild(inline);

    if (!inlineThreadSelection[ctx]) {
      inlineThreadSelection[ctx] = defaultThreadIdForContext(ctx);
    }
    syncInlinePillForContext(ctx);
    clearInlineMessages(ctx);
    updateInlineOpenPageVisibility(ctx);
    syncInlinePanelToggleButton(inline);
  });
}

function syncInlineChatForActiveView() {
  const view = document.querySelector(".mp-view.is-active[data-agent-context]");
  if (!view) return;
  const ctx = view.dataset.agentContext;
  syncInlinePillForContext(ctx);
  const tid = inlineThreadSelection[ctx] || defaultThreadIdForContext(ctx);
  clearInlineMessages(ctx);
  updateInlineOpenPageVisibility(ctx);
  updateInlineThreadTitle(ctx, tid);
  setChatUi(ctx, CHAT_UI_DOCKED);
}

function initAgentThreadsUI() {
  try {
    buildAllThreadsList();
    injectInlineChats();
  } catch (err) {
    console.error("[app.js] initAgentThreadsUI", err);
  }

  document.getElementById("sbModeWorkflow")?.addEventListener("click", () => setSidebarNavMode("workflow"));
  document.getElementById("sbModeThreads")?.addEventListener("click", () => setSidebarNavMode("threads"));

  initInlineChatMiddlePanelHandlers();
  initSidebarNewThreadMenu();

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
    if (typeof window.WorkflowViews !== "undefined" && window.WorkflowViews.onNavigate) {
      window.WorkflowViews.onNavigate(viewId);
    }
    const activeView = document.querySelector(".mp-view.is-active");
    if (activeView?.dataset.agentContext) {
      lastWorkflowAgentContext = activeView.dataset.agentContext;
    }
    syncInlineChatForActiveView();
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
let expandDragStartRight = 0;

let dragPendingX = null;
let dragRaf = 0;

let rightCollapseAnimating = false;
let rightCollapseRafId = 0;

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
 * Animate right width → 0 via layoutMiddleRightPair, then run onComplete (apply collapsed chrome).
 */
function runRightCollapseAnimation(onComplete) {
  if (!middlePanel || !rightPanel) {
    onComplete();
    return;
  }
  const slot = pairSlotWidth();
  if (prefersReducedMotion()) {
    layoutMiddleRightPair(slot);
    onComplete();
    return;
  }

  rightPanel.classList.add("right-panel--collapse-animating");
  const startRw = rightPanel.getBoundingClientRect().width;
  const t0 = performance.now();

  function done() {
    rightPanel.classList.remove("right-panel--collapse-animating");
    layoutMiddleRightPair(slot);
    rightCollapseRafId = 0;
    onComplete();
  }

  function frame(now) {
    const elapsed = now - t0;
    const u = Math.min(1, elapsed / RIGHT_COLLAPSE_MS);
    const rw = startRw * (1 - easeOutCubic(u));
    layoutMiddleRightPair(slot - rw);
    if (u < 1) {
      rightCollapseRafId = requestAnimationFrame(frame);
    } else {
      done();
    }
  }

  rightCollapseRafId = requestAnimationFrame(frame);
}

function cancelRightCollapseAnimation() {
  if (rightCollapseRafId) {
    cancelAnimationFrame(rightCollapseRafId);
    rightCollapseRafId = 0;
  }
  if (rightPanel) rightPanel.classList.remove("right-panel--collapse-animating");
  rightCollapseAnimating = false;
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
  let mw = Math.max(0, Math.min(slot, middleW));
  let rw = slot - mw;
  if (rw > 0) {
    rw = clampRightPanelWidth(rw);
    mw = slot - rw;
  } else {
    rw = 0;
    mw = slot;
  }
  middlePanel.style.flex = `0 0 ${mw}px`;
  rightPanel.style.width = `${rw}px`;
  rightPanelWidth = rw;
}

function bootProtoShell() {
  const ok = mainRow && sidebar && sidebarToggle && middlePanel && resizeHandle && rightPanel;

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
  const initialView = document.querySelector(".sb-subitem.is-active[data-view]")?.dataset.view;
  if (initialView && typeof window.WorkflowViews !== "undefined" && window.WorkflowViews.onNavigate) {
    window.WorkflowViews.onNavigate(initialView);
  }
  initAgentThreadsUI();
  initAgentPickModeListeners();
  syncInlineChatForActiveView();
  syncRightToggleButtons();

  sidebarToggle.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    applySidebarState();
    if (sidebarCollapsed) setSidebarNavMode("workflow");
  });

  function onRightPanelToggleClick() {
    if (rightCollapsed) expandRight();
    else collapseRight();
  }
  rightPanelToggle?.addEventListener("click", onRightPanelToggleClick);
  rightPanelExpandToggle?.addEventListener("click", onRightPanelToggleClick);

  function scheduleDragMove(clientX) {
    dragPendingX = clientX;
    if (dragRaf) return;
    dragRaf = requestAnimationFrame(() => {
      dragRaf = 0;
      const x = dragPendingX;
      dragPendingX = null;
      if (x === null) return;

      const slot = pairSlotWidth();

      if (isExpandDragging) {
        const delta = x - expandDragStartX;
        let rw = expandDragStartRight + delta;
        rw = Math.max(0, Math.min(maxRightWidth(), rw));
        if (rw >= minRightWidthForSlot(slot)) {
          commitExpandedFromDrag(slot - rw);
          isExpandDragging = false;
          isDragging = true;
          dragStartX = x;
          dragStartWidth = rightPanelWidth;
          return;
        }
        layoutMiddleRightPair(slot - rw);
        return;
      }

      if (!isDragging) return;
      const delta = dragStartX - x;
      const rawRight = dragStartWidth + delta;
      const rawMw = slot - rawRight;
      if (!rightCollapsed && rawMw < MIDDLE_MIN) {
        layoutMiddleRightPair(MIDDLE_MIN);
        return;
      }
      const newRight = clampRightPanelWidth(rawRight);
      layoutMiddleRightPair(slot - newRight);
    });
  }

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (rightCollapsed) {
      const slot = pairSlotWidth();
      isExpandDragging = true;
      expandDragStartX = e.clientX;
      expandDragStartRight = 0;
      rightPanelWidth = 0;
      rightPanel.classList.remove("is-hidden");
      rightPanel.classList.add("right-panel--drag-reveal");
      rightPanel.style.width = "0px";
      middlePanel.classList.remove("middle-panel--fill");
      clearMiddleInlineFlex();
      middlePanel.style.flex = `0 0 ${slot}px`;
      if (mainRow) mainRow.classList.add("main-row--right-expanding");
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
      const slot = pairSlotWidth();
      const rw = rightPanel.getBoundingClientRect().width;
      if (rw >= minRightWidthForSlot(slot)) {
        commitExpandedFromDrag(Math.max(MIDDLE_MIN, Math.min(maxMiddleWidth(), slot - rw)));
      } else {
        rightPanel.classList.remove("right-panel--drag-reveal");
        clearMiddleInlineFlex();
        if (mainRow) mainRow.classList.remove("main-row--right-expanding");
        applyRightCollapsedLayout();
      }
      return;
    }

    if (!isDragging) return;
    isDragging = false;
    endOuterDrag();
  });

  window.addEventListener("resize", () => {
    if (!rightCollapsed) {
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
