/* ============================================================
   Risk Management Prototype — app.js
   Sidebar (3-state) · middle column (collapsible + drag) · single right panel
   ============================================================ */

const RIGHT_DEFAULT = 800;
const RIGHT_MIN = 360;
const RIGHT_MAX = 1200;
const HANDLE_W = 8;

const MIDDLE_COLLAPSE_AT = 100;
const MIDDLE_EXPAND_AT = 200;

const mainRow = document.getElementById("mainRow");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const middlePanel = document.getElementById("middlePanel");
const middlePanelToggle = document.getElementById("middlePanelToggle");
const resizeHandle = document.getElementById("resizeHandle");
const rightPanel = document.getElementById("rightPanel");

const SIDEBAR_TITLES = [
  "Sidebar: full — click for compact icons",
  "Sidebar: icons only — click to hide",
  "Sidebar: hidden — click to restore full",
];

let sidebarStateIndex = 0;
let middleCollapsed = false;
let rightPanelWidth = RIGHT_DEFAULT;
let savedRightPanelWidth = RIGHT_DEFAULT;

function getSidebarOuterWidth() {
  if (!sidebar) return 0;
  const r = sidebar.getBoundingClientRect();
  const mr = parseFloat(getComputedStyle(sidebar).marginRight) || 0;
  return r.width + mr;
}

function getMainRowInnerWidth() {
  return mainRow ? mainRow.getBoundingClientRect().width : 0;
}

function maxMiddleWidth() {
  return Math.max(
    0,
    getMainRowInnerWidth() - getSidebarOuterWidth() - HANDLE_W - RIGHT_MIN
  );
}

function clearMiddleInlineFlex() {
  if (!middlePanel) return;
  middlePanel.style.flex = "";
  middlePanel.style.maxWidth = "";
}

function applyCollapsedLayout() {
  if (!middlePanel || !rightPanel || !middlePanelToggle) return;
  middlePanel.classList.add("is-hidden");
  middlePanel.classList.remove("middle-panel--drag-reveal");
  clearMiddleInlineFlex();
  rightPanel.classList.add("right-panel--fill");
  rightPanel.style.width = "";
  middlePanelToggle.classList.remove("is-active");
  middlePanelToggle.setAttribute("aria-pressed", "false");
}

function applyRightWidthPx(w) {
  if (!rightPanel) return;
  rightPanelWidth = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, w));
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
  rightPanel.classList.remove("right-panel--fill");
  rightPanelWidth = savedRightPanelWidth;
  rightPanel.style.width = `${rightPanelWidth}px`;
  middlePanelToggle.classList.add("is-active");
  middlePanelToggle.setAttribute("aria-pressed", "true");
}

function applySidebarState() {
  if (!sidebar || !sidebarToggle) return;
  sidebar.classList.remove("is-collapsed", "is-hidden");
  const states = ["expanded", "collapsed", "hidden"];
  const state = states[sidebarStateIndex];
  if (state === "collapsed") sidebar.classList.add("is-collapsed");
  if (state === "hidden") sidebar.classList.add("is-hidden");
  sidebarToggle.dataset.sidebarState = state;
  sidebarToggle.title = SIDEBAR_TITLES[sidebarStateIndex];
  const visible = state !== "hidden";
  sidebarToggle.classList.toggle("is-active", visible);
  sidebarToggle.setAttribute(
    "aria-pressed",
    state === "hidden" ? "false" : "true"
  );
  requestAnimationFrame(() => {
    if (!middleCollapsed) {
      applyRightWidthPx(rightPanelWidth);
    }
  });
}

function navigateTo(el) {
  if (el.classList.contains("sb-subitem")) {
    document.querySelectorAll(".sb-subitem").forEach((i) => i.classList.remove("is-active"));
    el.classList.add("is-active");
  } else {
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

/** rAF-coalesced pointer position for smooth splitter drag */
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
  const inner = getMainRowInnerWidth();
  const sb = getSidebarOuterWidth();
  const rw = Math.min(
    RIGHT_MAX,
    Math.max(RIGHT_MIN, inner - sb - HANDLE_W - middleW)
  );
  const mw = inner - sb - HANDLE_W - rw;
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

  resizeHandle.style.width = "8px";
  applyRightWidthPx(rightPanelWidth);
  applySidebarState();

  sidebarToggle.addEventListener("click", () => {
    sidebarStateIndex = (sidebarStateIndex + 1) % 3;
    applySidebarState();
  });

  middlePanelToggle.addEventListener("click", () => {
    if (middleCollapsed) expandMiddle();
    else collapseMiddle();
  });

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
      newRight = Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, newRight));
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
        expandMiddle();
      } else {
        middlePanel.classList.remove("middle-panel--drag-reveal");
        clearMiddleInlineFlex();
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
