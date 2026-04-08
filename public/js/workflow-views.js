/* ============================================================
   Workflow views — Identification & Assessment (workflow/*.md)
   Loaded before app.js; hooks navigateTo from bootProtoShell.
   ============================================================ */

(function () {
  const SUGGESTION_TABLE_COLS = [
    "Name",
    "Short description",
    "Suggested owner",
    "L / I / Severity",
    "Category",
    "Suggested controls",
    "Confidence %",
  ];

  function suggestionTableRows(mockRows) {
    return mockRows
      .map(
        (r) =>
          `<tr class="is-hoverable" title="Rules not fully met: ${escapeHtml(r.rules || "—")}">` +
          `<td>${escapeHtml(r.name)}</td>` +
          `<td>${escapeHtml(r.desc)}</td>` +
          `<td>${escapeHtml(r.owner)}</td>` +
          `<td><span class="w-badge ${r.sevClass}">${escapeHtml(r.sev)}</span></td>` +
          `<td>${escapeHtml(r.cat)}</td>` +
          `<td>${escapeHtml(r.ctrl)}</td>` +
          `<td><span style="color:var(--color-success-default)">${escapeHtml(r.conf)}%</span></td>` +
          `</tr>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setRightDrilldownHtml(title, subtitle, html) {
    const titleEl = document.getElementById("rightPaneTitle");
    const subEl = document.getElementById("rightPaneSubtitle");
    const bodyEl = document.getElementById("rightDrilldown");
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;
    if (bodyEl) bodyEl.innerHTML = html;
  }

  function suggestionTableHtml(title, subtitle, rows) {
    const head = SUGGESTION_COLS_HTML();
    return (
      `<div class="right-drill-hint">${escapeHtml(subtitle)}</div>` +
      `<div class="right-drill-section"><h4>${escapeHtml(title)}</h4>` +
      `<div class="w-card"><div class="w-card-flush wf-table-scroll">` +
      `<table class="w-table w-table--fixed wf-suggestion-table"><thead><tr>${head}</tr></thead>` +
      `<tbody>${suggestionTableRows(rows)}</tbody></table></div>` +
      `<div class="w-card-body" style="padding-top:var(--space-2)">` +
      `<button type="button" class="w-btn is-secondary" onclick="WorkflowViews.approveAllMock()">Approve selected (mock)</button> ` +
      `<button type="button" class="w-btn is-ghost" onclick="WorkflowViews.rejectAllMock()">Reject (mock)</button>` +
      `</div></div></div>`
    );
  }

  function SUGGESTION_COLS_HTML() {
    return SUGGESTION_TABLE_COLS.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
  }

  const MOCK_INTERNAL = [
    {
      name: "Legacy system single point of failure",
      desc: "Critical app has no hot standby path.",
      owner: "IT Risk",
      sev: "High",
      sevClass: "is-error",
      cat: "Technology",
      ctrl: "Redundancy review",
      conf: "88",
      rules: "Resilience policy §4 not evidenced",
    },
    {
      name: "Incomplete offboarding checklist",
      desc: "Access removal not always within 24h.",
      owner: "HR Ops",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "People",
      ctrl: "IAM integration",
      conf: "76",
      rules: "HR–IT SLA mapping partial",
    },
    {
      name: "Vendor sub-processor disclosure gap",
      desc: "Contracts pre-2023 lack cascade clause.",
      owner: "Procurement",
      sev: "Low",
      sevClass: "is-success",
      cat: "Third party",
      ctrl: "Contract addendum pack",
      conf: "71",
      rules: "Regulatory mapping optional",
    },
  ];

  const MOCK_EXTERNAL_NEWS = [
    {
      name: "Sector regulator signals tighter outsourcing reviews",
      desc: "Based on Reuters — mock",
      owner: "Compliance",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Regulatory",
      ctrl: "Vendor attestation refresh",
      conf: "82",
      rules: "Jurisdiction scope narrow",
    },
    {
      name: "Peer breach — credential stuffing campaign",
      desc: "News cluster — mock",
      owner: "CISO",
      sev: "High",
      sevClass: "is-error",
      cat: "Cyber",
      ctrl: "MFA enforcement",
      conf: "91",
      rules: "Threat intel recency",
    },
  ];

  window.WorkflowViews = {
    escapeHtml,

    approveAllMock() {
      alert("Prototype: approvals would be recorded.");
    },
    rejectAllMock() {
      alert("Prototype: rejections would be recorded.");
    },

    /** Identification overview — all suggestions accordion in right panel */
    openAllSuggestionsDrilldown() {
      const rows = MOCK_INTERNAL.concat(MOCK_EXTERNAL_NEWS);
      setRightDrilldownHtml(
        "All suggestions",
        "Consolidated (mock)",
        `<div class="right-drill-hint">External / Internal / Survey-derived sections (prototype).</div>
        <div class="right-drill-section"><h4>External</h4>
          <div class="w-card"><div class="w-card-flush wf-table-scroll">
          <table class="w-table w-table--fixed"><thead><tr>${SUGGESTION_COLS_HTML()}</tr></thead>
          <tbody>${suggestionTableRows(MOCK_EXTERNAL_NEWS)}</tbody></table></div></div></div>
        <div class="right-drill-section"><h4>Internal</h4>
          <div class="w-card"><div class="w-card-flush wf-table-scroll">
          <table class="w-table w-table--fixed"><thead><tr>${SUGGESTION_COLS_HTML()}</tr></thead>
          <tbody>${suggestionTableRows(MOCK_INTERNAL)}</tbody></table></div></div></div>
        <div class="right-drill-section"><h4>Survey-derived</h4>
          <div class="w-card"><div class="w-card-body"><p class="right-drill-hint" style="margin:0">No pending survey suggestions in this mock.</p></div></div></div>`
      );
    },

    /** Navigate via programmatic click on sidebar subitem */
    goToView(viewId) {
      const btn = document.querySelector(`.sb-subitem[data-view="${viewId}"]`);
      if (btn) btn.click();
    },

    openInternalSuggestionsDrilldown() {
      setRightDrilldownHtml(
        "Internal suggestions",
        "Review & approve",
        suggestionTableHtml("Awaiting approval", "From uploaded documents (mock)", MOCK_INTERNAL)
      );
    },

    openExternalGroupDrilldown(group) {
      const rows =
        group === "news"
          ? MOCK_EXTERNAL_NEWS
          : group === "competitors"
            ? MOCK_EXTERNAL_NEWS.slice(0, 1)
            : MOCK_INTERNAL.slice(0, 2);
      setRightDrilldownHtml(
        group.charAt(0).toUpperCase() + group.slice(1),
        "Suggestions",
        suggestionTableHtml("Suggestions", "External intake (mock)", rows)
      );
    },

    openExternalSourceHistory() {
      setRightDrilldownHtml(
        "Source history",
        "Entries → suggestions (mock)",
        `<div class="right-drill-hint">Article-level history for selected source.</div>
        <div class="right-drill-section"><h4>Recent entries</h4>
        <div class="w-card"><div class="w-card-flush">
        <table class="w-table"><thead><tr><th>Title</th><th>Suggestions</th><th>Date</th></tr></thead>
        <tbody>
          <tr><td>FCA outsourcing CP — consultation</td><td>4</td><td>Mar 28</td></tr>
          <tr><td>ENISA threat landscape 2026</td><td>2</td><td>Mar 20</td></tr>
        </tbody></table></div></div></div>`
      );
    },

    toggleAutoApprovedTable() {
      const el = document.getElementById("wfAutoApprovedBlock");
      if (el) el.hidden = !el.hidden;
    },

    /** Assessment: all at-risk table */
    openAtRiskDrilldown() {
      setRightDrilldownHtml(
        "At-risk assessments",
        "Filterable (mock)",
        `<div class="right-drill-hint">Deadline, quorum, owner</div>
        <div class="w-card"><div class="w-card-flush">
        <table class="w-table w-table--fixed"><thead><tr><th>Assessment</th><th>Deadline</th><th>Quorum</th><th>Owner</th></tr></thead>
        <tbody>
          <tr><td>Q4 Vendor concentration</td><td>Apr 12</td><td>3/5</td><td>S. Kim</td></tr>
          <tr><td>ITGC annual</td><td>Apr 3</td><td>2/4</td><td>T. Reeves</td></tr>
        </tbody></table></div></div>`
      );
    },

    openAssessmentCardDrilldown(id) {
      const packs = {
        a1: {
          title: "Q4 Vendor Risk Assessment",
          sub: "In flight — monitoring",
          html: `<div class="right-drill-hint">Assessor activity and reminders (mock).</div>
          <div class="right-drill-section"><h4>Assessors</h4>
          <div class="w-list">
            <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Sarah Kim</span><span class="w-list-meta">Submitted · High / Medium</span></div></div>
            <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Tom Reeves</span><span class="w-list-meta">Opened · pending</span></div></div>
          </div></div>`,
        },
        a2: {
          title: "IT Controls — annual cycle",
          sub: "Setup & dispatch",
          html: `<div class="right-drill-hint">Pre-filled assessors and message (mock).</div>
          <div class="right-drill-section"><h4>AI draft</h4>
          <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Invitation preview truncated — full text here in prototype.</p>
          <textarea class="w-form-textarea" rows="4" readonly>Please complete the IT controls assessment by …</textarea>
          </div></div></div>`,
        },
        a3: {
          title: "DORA ICT resilience — pilot",
          sub: "Synthesis & approval",
          html: `<div class="right-drill-hint">Aggregated score 3.4 ± 0.6 · divergence flag (mock).</div>
          <div class="right-drill-section"><h4>AI summary</h4>
          <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Wide spread on impact — 3 of 6 assessors rated higher. Accept / Adjust / Request reassessment.</p>
          </div></div></div>
          <div class="right-drill-section"><h4>Audit trail</h4>
          <p class="right-drill-hint" style="margin:0">Read-only after approval (mock).</p></div>`,
        },
      };
      const p = packs[id] || packs.a1;
      setRightDrilldownHtml(p.title, p.sub, p.html);
    },

    syncMpHeaderActions(viewId) {
      const host = document.getElementById("mpHeaderActions");
      if (!host) return;
      if (viewId === "survey-manager") {
        host.hidden = false;
        host.innerHTML = `<button type="button" class="w-btn is-primary" id="wfNewSurveyBtn">New survey</button>`;
        const b = document.getElementById("wfNewSurveyBtn");
        if (b)
          b.onclick = () => {
            const m = document.getElementById("wfSurveyModal");
            if (m) {
              m.hidden = false;
              m.setAttribute("aria-hidden", "false");
            }
          };
      } else {
        host.innerHTML = "";
        host.hidden = true;
      }
    },

    closeSurveyModal() {
      const m = document.getElementById("wfSurveyModal");
      if (m) {
        m.hidden = true;
        m.setAttribute("aria-hidden", "true");
      }
    },

    onNavigate(viewId) {
      this.syncMpHeaderActions(viewId);
    },
  };

  /** Internal identification — mock upload */
  window.WFExtTab = {
    show(which) {
      const sug = document.getElementById("wfExtPanelSug");
      const src = document.getElementById("wfExtPanelSrc");
      const tSug = document.getElementById("wfTabSug");
      const tSrc = document.getElementById("wfTabSrc");
      const on = which === "sug";
      if (sug) sug.hidden = !on;
      if (src) src.hidden = on;
      if (tSug) {
        tSug.classList.toggle("is-active", on);
        tSug.setAttribute("aria-selected", on ? "true" : "false");
      }
      if (tSrc) {
        tSrc.classList.toggle("is-active", !on);
        tSrc.setAttribute("aria-selected", !on ? "true" : "false");
      }
    },
  };

  window.WFInternalUpload = {
    run(zoneEl) {
      if (!zoneEl || zoneEl.dataset.busy === "1") return;
      zoneEl.dataset.busy = "1";
      const bar = document.getElementById("wfInternalProgress");
      const fill = document.getElementById("wfInternalProgressFill");
      const after = document.getElementById("wfInternalAfter");
      if (bar) bar.hidden = false;
      if (after) after.hidden = true;
      let p = 0;
      const t = setInterval(() => {
        p += 18;
        if (fill) fill.style.width = Math.min(p, 100) + "%";
        if (p >= 100) {
          clearInterval(t);
          zoneEl.dataset.busy = "0";
          if (bar) bar.hidden = true;
          if (after) after.hidden = false;
          const badgeExt = document.getElementById("wfBadgeExternal");
          if (badgeExt) badgeExt.textContent = "19";
        }
      }, 160);
    },
  };
})();
