/* ============================================================
   Risk Management Prototype — widgets.js
   Shared widget behaviours:
     W.collapse    — collapsible sections
     W.select      — single / multi selection
     W.contextMenu — overflow menus
     W.dragReorder — drag-to-reorder items
   ============================================================ */

const W = (() => {

  /* ── Collapsible sections ─────────────────────────────────────────────────── */

  /**
   * Toggle a collapsible section.
   * HTML structure:
   *   <div class="w-collapsible" id="mySection">
   *     <button class="w-collapsible-trigger" onclick="W.collapse('mySection')">
   *       <span class="w-card-title">Title</span>
   *       <svg class="w-collapsible-chevron" …><use href="#icon-chevron-down"/></svg>
   *     </button>
   *     <div class="w-collapsible-content">…</div>
   *   </div>
   */
  function collapse(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('is-open');
  }


  /* ── Selection model ──────────────────────────────────────────────────────── */

  /**
   * Toggle selection on an item.
   * @param {HTMLElement} el        — the clicked .is-selectable element
   * @param {Object}      options
   * @param {boolean}     options.multi  — allow multiple selections (default: false)
   * @param {string}      options.scope  — CSS selector for the selection pool
   *                                       (default: el's parent container)
   * @param {Function}    options.onChange — callback(selectedEls[]) after change
   *
   * HTML: add `is-selectable` class + onclick="W.select(this, {…})"
   */
  function select(el, options = {}) {
    const multi    = options.multi || false;
    const scope    = options.scope
                       ? document.querySelector(options.scope)
                       : el.parentElement;
    const onChange = options.onChange || null;

    if (!multi) {
      scope.querySelectorAll('.is-selectable.is-selected').forEach(s => {
        if (s !== el) s.classList.remove('is-selected');
      });
    }

    el.classList.toggle('is-selected');

    if (onChange) {
      const selected = [...scope.querySelectorAll('.is-selectable.is-selected')];
      onChange(selected);
    }
  }


  /* ── Context menus ────────────────────────────────────────────────────────── */

  let _activeMenu = null;

  /**
   * Show a context menu.
   * @param {HTMLElement} triggerEl — the .w-ctx-trigger button that was clicked
   * @param {Array}       items    — menu definition:
   *   [
   *     { label: 'Edit',   action: () => … },
   *     { label: 'Delete', action: () => …, danger: true },
   *     'divider',
   *     { label: 'Copy',   action: () => … }
   *   ]
   *
   * HTML: <button class="w-ctx-trigger" onclick="W.contextMenu(this, […])">⋮</button>
   * The menu is created dynamically and positioned near the trigger.
   */
  function contextMenu(triggerEl, items) {
    // Close any open menu first
    closeMenu();

    const menu = document.createElement('div');
    menu.className = 'w-ctx-menu';
    menu.setAttribute('role', 'menu');

    items.forEach(item => {
      if (item === 'divider') {
        const div = document.createElement('div');
        div.className = 'w-ctx-divider';
        menu.appendChild(div);
        return;
      }

      const btn = document.createElement('button');
      btn.className = 'w-ctx-item' + (item.danger ? ' is-danger' : '');
      btn.textContent = item.label;
      btn.setAttribute('role', 'menuitem');
      btn.addEventListener('click', () => {
        closeMenu();
        if (item.action) item.action();
      });
      menu.appendChild(btn);
    });

    // Position relative to trigger
    const card = triggerEl.closest('.w-card') || triggerEl.parentElement;
    card.style.position = 'relative';
    card.appendChild(menu);

    const triggerRect = triggerEl.getBoundingClientRect();
    const cardRect    = card.getBoundingClientRect();
    menu.style.top   = (triggerRect.bottom - cardRect.top + 4) + 'px';
    menu.style.right = (cardRect.right - triggerRect.right) + 'px';

    // Animate open
    requestAnimationFrame(() => menu.classList.add('is-open'));
    _activeMenu = menu;

    // Close on outside click (deferred so the triggering click doesn't close it)
    setTimeout(() => {
      document.addEventListener('click', _onOutsideClick);
      document.addEventListener('keydown', _onEscKey);
    }, 0);
  }

  function closeMenu() {
    if (_activeMenu) {
      _activeMenu.classList.remove('is-open');
      setTimeout(() => _activeMenu?.remove(), 150);
      _activeMenu = null;
    }
    document.removeEventListener('click', _onOutsideClick);
    document.removeEventListener('keydown', _onEscKey);
  }

  function _onOutsideClick(e) {
    if (_activeMenu && !_activeMenu.contains(e.target)) closeMenu();
  }

  function _onEscKey(e) {
    if (e.key === 'Escape') closeMenu();
  }


  /* ── Drag reorder ─────────────────────────────────────────────────────────── */

  /**
   * Initialise drag-to-reorder on a container's children.
   * @param {string}   containerId — id of the list/parent element
   * @param {Object}   options
   * @param {string}   options.handle     — CSS selector for the drag handle within each item
   *                                         (default: '.w-drag-handle')
   * @param {string}   options.itemSel    — CSS selector for draggable items
   *                                         (default: direct children)
   * @param {Function} options.onReorder  — callback(newOrderOfElements[]) after reorder
   *
   * Call once on page load: W.dragReorder('myListId')
   */
  function dragReorder(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.wDragInit === "1") return;
    container.dataset.wDragInit = "1";

    const handleSel = options.handle || ".w-drag-handle";
    const itemSel = options.itemSel || ".w-list-item";
    const onReorder = options.onReorder || null;

    function getItems() {
      return [...container.querySelectorAll(itemSel)];
    }

    function clearDropIndicators() {
      getItems().forEach((el) => {
        el.classList.remove("is-drop-target", "is-drop-target-below");
      });
    }

    /** Where to insert dragItem: sibling to insert before, or null = append. */
    function getInsertBefore(clientY, dragItem) {
      const others = getItems().filter((i) => i !== dragItem);
      for (const item of others) {
        const rect = item.getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) return item;
      }
      return null;
    }

    function updateDropIndicators(clientY, dragItem) {
      clearDropIndicators();
      const insertBefore = getInsertBefore(clientY, dragItem);
      if (insertBefore) {
        insertBefore.classList.add("is-drop-target");
      } else {
        const items = getItems().filter((i) => i !== dragItem);
        if (items.length) items[items.length - 1].classList.add("is-drop-target-below");
      }
    }

    function applyReorder(clientY, dragItem) {
      const insertBefore = getInsertBefore(clientY, dragItem);
      if (insertBefore) {
        container.insertBefore(dragItem, insertBefore);
      } else {
        container.appendChild(dragItem);
      }
    }

    container.addEventListener(
      "click",
      (e) => {
        if (e.target.closest(handleSel)) e.stopPropagation();
      },
      true
    );

    let activeDrag = null;

    function noop() {}

    function endDrag(clientY) {
      const state = activeDrag;
      if (!state) return;
      document.removeEventListener("mousemove", state.onMove);
      document.removeEventListener("mouseup", state.onUp);
      document.removeEventListener("touchmove", state.onTouchMove);
      document.removeEventListener("touchend", state.onTouchEnd);

      const { el, moved } = state;
      el.classList.remove("is-dragging");
      clearDropIndicators();
      applyReorder(clientY, el);
      if (onReorder) onReorder(getItems());

      if (moved) {
        const block = (ev) => {
          ev.stopPropagation();
          document.removeEventListener("click", block, true);
        };
        document.addEventListener("click", block, true);
        setTimeout(() => document.removeEventListener("click", block, true), 0);
      }

      activeDrag = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    container.addEventListener("mousedown", (e) => {
      if (activeDrag) return;
      const handle = e.target.closest(handleSel);
      if (!handle) return;
      const item = handle.closest(itemSel);
      if (!item || item.parentElement !== container) return;

      e.preventDefault();
      e.stopPropagation();

      const state = {
        el: item,
        moved: false,
        lastEvent: e,
        onTouchMove: noop,
        onTouchEnd: noop,
      };
      state.onMove = function onMove(ev) {
        state.lastEvent = ev;
        if (Math.abs(ev.movementX) + Math.abs(ev.movementY) > 1) state.moved = true;
        updateDropIndicators(ev.clientY, item);
      };
      state.onUp = function onUp() {
        const y = state.lastEvent ? state.lastEvent.clientY : e.clientY;
        endDrag(y);
      };
      activeDrag = state;

      item.classList.add("is-dragging");
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      updateDropIndicators(e.clientY, item);

      document.addEventListener("mousemove", state.onMove);
      document.addEventListener("mouseup", state.onUp);
    });

    container.addEventListener(
      "touchstart",
      (e) => {
        if (activeDrag) return;
        const handle = e.target.closest(handleSel);
        if (!handle) return;
        const item = handle.closest(itemSel);
        if (!item || item.parentElement !== container) return;

        e.preventDefault();
        const touch = e.touches[0];
        const state = {
          el: item,
          moved: false,
          lastEvent: touch,
          onMove: noop,
          onUp: noop,
          onTouchMove(ev) {
            if (ev.touches.length !== 1) return;
            const t = ev.touches[0];
            state.lastEvent = t;
            state.moved = true;
            updateDropIndicators(t.clientY, item);
            ev.preventDefault();
          },
          onTouchEnd(ev) {
            const t = ev.changedTouches[0];
            endDrag(t ? t.clientY : state.lastEvent.clientY);
          },
        };
        activeDrag = state;

        item.classList.add("is-dragging");
        updateDropIndicators(touch.clientY, item);

        document.addEventListener("touchmove", state.onTouchMove, { passive: false });
        document.addEventListener("touchend", state.onTouchEnd);
      },
      { passive: false }
    );
  }


  /* ── Public API ───────────────────────────────────────────────────────────── */
  return { collapse, select, contextMenu, closeMenu, dragReorder };
})();

/** Inline handlers and app.js use the global `W`. */
window.W = W;
