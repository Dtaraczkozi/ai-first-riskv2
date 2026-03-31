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
    if (!container) return;

    const handleSel = options.handle  || '.w-drag-handle';
    const itemSel   = options.itemSel || null;
    const onReorder = options.onReorder || null;

    let dragItem    = null;
    let placeholderEl = null;
    let dropBeforeEl = null;

    function getItems() {
      return itemSel
        ? [...container.querySelectorAll(itemSel)]
        : [...container.children];
    }

    function clearPlaceholder() {
      if (placeholderEl) {
        placeholderEl.remove();
        placeholderEl = null;
      }
      dropBeforeEl = null;
    }

    function ensurePlaceholderSizedLike(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const ph = document.createElement('div');
      ph.className = 'w-drop-placeholder';
      ph.style.height = `${Math.max(1, Math.round(r.height))}px`;
      ph.style.margin = cs.margin;
      ph.style.borderRadius = cs.borderRadius;
      return ph;
    }

    container.addEventListener('mousedown', (e) => {
      const handle = e.target.closest(handleSel);
      if (!handle) return;

      dragItem = handle.closest(itemSel || '*');
      if (!dragItem || dragItem.parentElement !== container) return;

      dragItem.classList.add('is-dragging');
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      e.preventDefault();

      const onMove = (ev) => {
        const items = getItems().filter((i) => i !== placeholderEl);
        const y     = ev.clientY;

        // Find the item we're hovering over (and whether we should insert before it)
        let target = null;
        for (const item of items) {
          if (item === dragItem) continue;
          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (y < midY) { target = item; break; }
        }

        // Create placeholder once (same-size, single-color)
        if (!placeholderEl) {
          placeholderEl = ensurePlaceholderSizedLike(dragItem);
          if (placeholderEl) container.insertBefore(placeholderEl, dragItem.nextSibling);
        }

        // Move placeholder to prospective drop location
        if (!placeholderEl) return;
        if (target && target !== dragItem) {
          dropBeforeEl = target;
          if (placeholderEl.nextSibling !== target) {
            container.insertBefore(placeholderEl, target);
          }
        } else {
          dropBeforeEl = null;
          container.appendChild(placeholderEl);
        }
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);

        if (dragItem) {
          dragItem.classList.remove('is-dragging');

          // Reorder DOM
          if (placeholderEl) {
            container.insertBefore(dragItem, placeholderEl);
          } else if (dropBeforeEl) {
            container.insertBefore(dragItem, dropBeforeEl);
          }

          const newOrder = getItems().filter((i) => i !== placeholderEl);
          clearPlaceholder();
          if (onReorder) onReorder(newOrder);
        }

        dragItem    = null;
        clearPlaceholder();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }


  /* ── Public API ───────────────────────────────────────────────────────────── */
  return { collapse, select, contextMenu, closeMenu, dragReorder };

})();
