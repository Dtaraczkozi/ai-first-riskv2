/* ============================================================
   Workflow views — Identification & Assessment (workflow/*.md)
   Loaded before app.js; hooks navigateTo from bootProtoShell.
   ============================================================ */

(function () {
  const SUGGESTION_TABLE_COLS = [
    "Name",
    "Short description",
    "Owner suggestion",
    "Created",
    "Score",
    "Category",
    "Suggested controls",
    "Confidence %",
    "Actions",
  ];

  function suggestionRowCreated(r, i) {
    if (r.created) return r.created;
    const dates = ["Apr 8, 2026", "Apr 5, 2026", "Apr 2, 2026", "Mar 30, 2026", "Mar 25, 2026", "Mar 18, 2026"];
    return dates[i % dates.length];
  }

  function suggestionCell(text, extraClass) {
    const esc = escapeHtml;
    const cls = extraClass ? ` wf-suggestion-cell ${extraClass}` : " wf-suggestion-cell";
    return `<span class="${cls.trim()}">${esc(text)}</span>`;
  }

  function suggestionTableRows(rows, poolKey) {
    const pk = poolKey || "external";
    const esc = escapeHtml;
    return rows
      .map(
        (r, i) => {
          const created = suggestionRowCreated(r, i);
          return (
            `<tr class="is-hoverable wf-risk-row wf-suggestion-row" role="button" tabindex="0" ` +
            `data-pool="${esc(pk)}" data-index="${i}" data-filter-value="${esc(r.sev)}" ` +
            `onclick="WorkflowViews.openSuggestionRowDetail('${esc(pk)}',${i})" ` +
            `onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();WorkflowViews.openSuggestionRowDetail('${esc(pk)}',${i});}" ` +
            `title="Open details · rules: ${esc(r.rules || "—")}">` +
            `<td class="wf-suggestion-td wf-suggestion-td--name">${suggestionCell(r.name)}</td>` +
            `<td class="wf-suggestion-td">${suggestionCell(r.desc)}</td>` +
            `<td class="wf-suggestion-td">${suggestionCell(r.owner)}</td>` +
            `<td class="wf-suggestion-td wf-suggestion-td--date">${suggestionCell(created, "wf-suggestion-cell--muted")}</td>` +
            `<td class="wf-suggestion-td wf-suggestion-td--score"><span class="wf-suggestion-cell wf-suggestion-cell--badge-wrap"><span class="w-badge ${r.sevClass}">${esc(r.sev)}</span></span></td>` +
            `<td class="wf-suggestion-td">${suggestionCell(r.cat)}</td>` +
            `<td class="wf-suggestion-td">${suggestionCell(r.ctrl)}</td>` +
            `<td class="wf-suggestion-td wf-suggestion-td--conf"><span class="wf-suggestion-cell wf-suggestion-cell--conf">${esc(r.conf)}%</span></td>` +
            `<td class="wf-suggestion-td wf-suggestion-td--actions wf-suggestion-actions" onclick="event.stopPropagation();" onkeydown="event.stopPropagation();">` +
            `<span class="wf-suggestion-actions__btns">` +
            `<button type="button" class="wf-suggestion-actions__icon-btn wf-suggestion-actions__icon-btn--approve" onclick="event.stopPropagation();WorkflowViews.approveSuggestionRow('${esc(pk)}',${i})" aria-label="Approve" title="Approve">` +
            `<svg width="18" height="18" aria-hidden="true"><use href="#icon-check"/></svg></button>` +
            `<button type="button" class="wf-suggestion-actions__icon-btn wf-suggestion-actions__icon-btn--reject" onclick="event.stopPropagation();WorkflowViews.rejectSuggestionRow('${esc(pk)}',${i})" aria-label="Reject" title="Reject">` +
            `<svg width="18" height="18" aria-hidden="true"><use href="#icon-close"/></svg></button>` +
            `</span></td>` +
            `</tr>`
          );
        }
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

  /** Single field for assessment risk detail form (right panel) */
  function riskFormFieldHtml(riskId, fieldKey, label, value, multiline, rows) {
    const fid = `risk-${riskId}-${fieldKey}`;
    const esc = escapeHtml;
    if (multiline) {
      return (
        `<div class="w-form-field">` +
        `<label class="w-form-label" for="${esc(fid)}">${esc(label)}</label>` +
        `<textarea class="w-form-textarea" id="${esc(fid)}" name="${esc(fid)}" rows="${rows || 4}">${esc(value)}</textarea>` +
        `</div>`
      );
    }
    return (
      `<div class="w-form-field">` +
      `<label class="w-form-label" for="${esc(fid)}">${esc(label)}</label>` +
      `<input class="w-form-input" id="${esc(fid)}" name="${esc(fid)}" type="text" value="${esc(value)}">` +
      `</div>`
    );
  }

  function readOnlyStatusFieldHtml(label, valuePlain) {
    return (
      `<div class="w-form-field wf-form-field--readonly">` +
      `<span class="w-form-label">${escapeHtml(label)}</span>` +
      `<div class="wf-detail-readonly" tabindex="0">${escapeHtml(valuePlain)}</div>` +
      `</div>`
    );
  }

  function readOnlySeverityBadgeHtml(label, sevClass, sevText) {
    const esc = escapeHtml;
    return (
      `<div class="w-form-field wf-form-field--readonly">` +
      `<span class="w-form-label">${esc(label)}</span>` +
      `<div class="wf-detail-readonly wf-detail-readonly--badge"><span class="w-badge ${esc(sevClass)}">${esc(sevText)}</span></div>` +
      `</div>`
    );
  }

  function buildAssessmentRiskFormHtml(riskId, data) {
    const esc = escapeHtml;
    const parts = [
      `<p class="right-drill-hint" style="margin-top:0">Likelihood, impact, and register rating are read-only. Other fields can be edited and saved.</p>`,
      riskFormFieldHtml(riskId, "title", "Risk name", data.title, false),
      readOnlyStatusFieldHtml("Rating · category (from register)", data.sub),
    ];
    (data.extraFields || []).forEach((f) => {
      parts.push(riskFormFieldHtml(riskId, f.key, f.label, f.value, !!f.multiline, f.rows));
    });
    parts.push(
      `<div class="w-form-actions">` +
        `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveAssessmentRiskDetail('${esc(riskId)}')">Save</button>` +
      `</div>`
    );
    return `<form class="w-form wf-risk-detail-form" data-risk-id="${esc(riskId)}" onsubmit="return false">${parts.join("")}</form>`;
  }

  /** Suggestion row → right panel: editable fields; L/I/Severity read-only */
  function buildSuggestionDetailFormHtml(formId, row) {
    const esc = escapeHtml;
    const fid = (k) => `sug-${formId}-${k}`;
    const created = row.created || suggestionRowCreated(row, 0);
    return (
      `<form class="w-form wf-table-entity-form" data-entity-form="${esc(formId)}" onsubmit="return false">` +
      `<p class="right-drill-hint" style="margin-top:0">Edit suggestion fields. Score is read-only.</p>` +
      readOnlyStatusFieldHtml("Created", created) +
      readOnlySeverityBadgeHtml("Score", row.sevClass, row.sev) +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("name"))}">Name</label>` +
      `<input class="w-form-input" id="${esc(fid("name"))}" type="text" value="${esc(row.name)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("desc"))}">Short description</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("desc"))}" rows="3">${esc(row.desc)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("owner"))}">Owner suggestion</label>` +
      `<input class="w-form-input" id="${esc(fid("owner"))}" type="text" value="${esc(row.owner)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("cat"))}">Category</label>` +
      `<input class="w-form-input" id="${esc(fid("cat"))}" type="text" value="${esc(row.cat)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("ctrl"))}">Suggested controls</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("ctrl"))}" rows="2">${esc(row.ctrl)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("conf"))}">Confidence %</label>` +
      `<input class="w-form-input" id="${esc(fid("conf"))}" type="text" inputmode="numeric" value="${esc(row.conf)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("rules"))}">Rules / evidence</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("rules"))}" rows="2">${esc(row.rules || "")}</textarea></div>` +
      `<div class="w-form-actions">` +
      `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveTableEntityDetail('suggestion','${esc(formId)}')">Save</button>` +
      `</div></form>`
    );
  }

  function SUGGESTION_COLS_HTML() {
    return SUGGESTION_TABLE_COLS.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
  }

  /** Full suggestion table for middle panel (scroll wrapper only). */
  function suggestionTableToolbarHtml(poolKey) {
    const pk = poolKey || "external";
    const esc = escapeHtml;
    const safeId = esc(String(pk).replace(/[^a-zA-Z0-9_-]/g, "-"));
    const tid = `wf-tb-sug-${safeId}`;
    const fname = `wf-filter-${tid}`;
    return (
      `<div class="wf-table-toolbar wf-toolbar" role="toolbar" aria-label="Suggestion table tools">` +
      `<div class="wf-table-toolbar__search-wrap">` +
      `<svg class="wf-table-toolbar__search-icon" width="18" height="18" aria-hidden="true"><use href="#icon-search"/></svg>` +
      `<input type="search" class="w-form-input wf-table-toolbar__search" data-wf-table-search placeholder="Search suggestions…" aria-label="Search suggestions"/>` +
      `</div>` +
      `<div class="wf-filter-dropdown">` +
      `<button type="button" class="w-btn is-secondary wf-filter-dropdown__trigger" aria-expanded="false" aria-haspopup="true" id="${tid}-filter-btn" aria-controls="${tid}-filter-panel">` +
      `<svg width="18" height="18" aria-hidden="true"><use href="#icon-filter"/></svg>` +
      `<span class="wf-filter-dropdown__trigger-text">Filter</span>` +
      `</button>` +
      `<div class="wf-filter-dropdown__panel" id="${tid}-filter-panel" role="group" aria-labelledby="${tid}-filter-btn" hidden>` +
      `<div class="wf-filter-dropdown__options" role="radiogroup" aria-label="Filter by score">` +
      `<label class="wf-filter-option"><input type="radio" data-wf-table-filter-radio name="${fname}" value="all" checked> All scores</label>` +
      `<label class="wf-filter-option"><input type="radio" data-wf-table-filter-radio name="${fname}" value="High"> High</label>` +
      `<label class="wf-filter-option"><input type="radio" data-wf-table-filter-radio name="${fname}" value="Medium"> Medium</label>` +
      `<label class="wf-filter-option"><input type="radio" data-wf-table-filter-radio name="${fname}" value="Low"> Low</label>` +
      `</div></div></div></div>`
    );
  }

  function midPanelSuggestionTable(rows, poolKey) {
    return (
      `<div class="wf-table-block" data-wf-table-block>` +
      suggestionTableToolbarHtml(poolKey) +
      `<div class="w-card-flush wf-suggestion-table-scroll-outer">` +
      `<div class="wf-suggestion-table-scroll">` +
      `<table class="w-table wf-suggestion-table"><thead><tr>${SUGGESTION_COLS_HTML()}</tr></thead>` +
      `<tbody>${suggestionTableRows(rows, poolKey)}</tbody></table></div></div></div>`
    );
  }

  function midPanelSuggestionBlock(rows, poolKey) {
    const pk = poolKey || "external";
    const esc = escapeHtml;
    return (
      `<div class="wf-suggestion-table-wrap" data-suggestion-pool="${esc(pk)}">` +
      midPanelSuggestionTable(rows, poolKey) +
      `</div>`
    );
  }

  function mountSuggestionAccordionBodies() {
    const mount = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    mount("idInternalSugTableMount", midPanelSuggestionBlock(MOCK_INTERNAL, "internal"));
    mount("idExtSugNewsMount", midPanelSuggestionBlock(MOCK_EXTERNAL_NEWS, "external-news"));
    mount("idExtSugCompetitorsMount", midPanelSuggestionBlock(MOCK_EXTERNAL_COMPETITORS, "external-competitors"));
    mount("idExtSugLawsMount", midPanelSuggestionBlock(MOCK_EXTERNAL_LAWS, "external-laws"));
  }

  /** 9 rows · H 2 · M 4 · L 3 — matches identification overview + internal accordion */
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
      rules: "Resilience policy section 4 not evidenced",
    },
    {
      name: "Privileged access review gap",
      desc: "Quarterly reviews overdue for two admin groups.",
      owner: "Security",
      sev: "High",
      sevClass: "is-error",
      cat: "Access",
      ctrl: "PAM rollout",
      conf: "90",
      rules: "SOX access control mapping",
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
      name: "Patch cadence variance",
      desc: "Critical patches exceed internal SLA in two regions.",
      owner: "IT Ops",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Technology",
      ctrl: "Patch management program",
      conf: "79",
      rules: "Change window policy",
    },
    {
      name: "Logging retention mismatch",
      desc: "SIEM retention shorter than legal hold requirement.",
      owner: "GRC",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Operations",
      ctrl: "Log taxonomy update",
      conf: "74",
      rules: "Evidence retention standard",
    },
    {
      name: "Vendor SLA breach pattern",
      desc: "Repeated misses on incident notification window.",
      owner: "Procurement",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Third party",
      ctrl: "Contract remedies",
      conf: "72",
      rules: "Vendor risk tier alignment",
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
    {
      name: "Data classification drift",
      desc: "Unstructured shares tagged incorrectly.",
      owner: "Data Gov",
      sev: "Low",
      sevClass: "is-success",
      cat: "Data",
      ctrl: "Labeling automation",
      conf: "69",
      rules: "Data handling guideline",
    },
    {
      name: "Training completion gap",
      desc: "Mandatory controls training below target in two BUs.",
      owner: "L&D",
      sev: "Low",
      sevClass: "is-success",
      cat: "People",
      ctrl: "Campaign nudges",
      conf: "68",
      rules: "Competency matrix",
    },
  ];

  /** 5 awaiting · H 1 · M 3 · L 1 — News card */
  const MOCK_EXTERNAL_NEWS = [
    {
      name: "Peer breach — credential stuffing campaign",
      desc: "News cluster",
      owner: "CISO",
      sev: "High",
      sevClass: "is-error",
      cat: "Cyber",
      ctrl: "MFA enforcement",
      conf: "91",
      rules: "Threat intel recency",
    },
    {
      name: "Sector regulator signals tighter outsourcing reviews",
      desc: "Based on Reuters",
      owner: "Compliance",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Regulatory",
      ctrl: "Vendor attestation refresh",
      conf: "82",
      rules: "Jurisdiction scope narrow",
    },
    {
      name: "Supply chain disclosure rule consultation",
      desc: "Draft reporting requirement",
      owner: "Compliance",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Regulatory",
      ctrl: "Disclosure playbook",
      conf: "80",
      rules: "Comment period tracking",
    },
    {
      name: "Climate risk reporting draft",
      desc: "Sector peer comparison",
      owner: "Risk Office",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "ESG",
      ctrl: "Scenario analysis",
      conf: "77",
      rules: "Materiality threshold",
    },
    {
      name: "Industry benchmark update",
      desc: "Annual loss data refresh",
      owner: "Finance",
      sev: "Low",
      sevClass: "is-success",
      cat: "Benchmark",
      ctrl: "Model input review",
      conf: "70",
      rules: "Methodology note",
    },
  ];

  /** 3 awaiting · H 0 · M 2 · L 1 — Competitors card */
  const MOCK_EXTERNAL_COMPETITORS = [
    {
      name: "Competitor A — pricing model shift",
      desc: "10-K signals",
      owner: "Strategy",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Market",
      ctrl: "Competitive intel",
      conf: "75",
      rules: "Source freshness",
    },
    {
      name: "Competitor B — breach notification",
      desc: "Public filing",
      owner: "CISO",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Cyber",
      ctrl: "Tabletop refresh",
      conf: "83",
      rules: "Incident pattern",
    },
    {
      name: "Competitor C — market exit",
      desc: "Narrative risk",
      owner: "Treasury",
      sev: "Low",
      sevClass: "is-success",
      cat: "Counterparty",
      ctrl: "Exposure review",
      conf: "66",
      rules: "Concentration limit",
    },
  ];

  /** 6 awaiting · H 2 · M 3 · L 1 — Laws card */
  const MOCK_EXTERNAL_LAWS = [
    {
      name: "DORA RTS amendment draft",
      desc: "ICT risk technical standards",
      owner: "Compliance",
      sev: "High",
      sevClass: "is-error",
      cat: "Regulatory",
      ctrl: "Gap register",
      conf: "89",
      rules: "RTS consultation",
    },
    {
      name: "SEC cyber disclosure final",
      desc: "Material incident reporting",
      owner: "Legal",
      sev: "High",
      sevClass: "is-error",
      cat: "Disclosure",
      ctrl: "Disclosure runbook",
      conf: "87",
      rules: "8-K workflow",
    },
    {
      name: "GDPR Article 32 guidance",
      desc: "Security of processing",
      owner: "DPO",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Privacy",
      ctrl: "Controls mapping",
      conf: "78",
      rules: "WP29 alignment",
    },
    {
      name: "NIS2 implementation note",
      desc: "Essential entities",
      owner: "GRC",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Regulatory",
      ctrl: "Scope assessment",
      conf: "76",
      rules: "Member state variance",
    },
    {
      name: "UK FCA operational resilience",
      desc: "Third-party concentration",
      owner: "Compliance",
      sev: "Medium",
      sevClass: "is-warning",
      cat: "Regulatory",
      ctrl: "Impact tolerances",
      conf: "81",
      rules: "PS21/3 mapping",
    },
    {
      name: "ISO 27001 minor revision",
      desc: "Control wording updates",
      owner: "ISO PMO",
      sev: "Low",
      sevClass: "is-success",
      cat: "Standards",
      ctrl: "SOA refresh",
      conf: "73",
      rules: "Annex A delta",
    },
  ];

  function suggestionPoolMap() {
    return {
      internal: MOCK_INTERNAL,
      "external-news": MOCK_EXTERNAL_NEWS,
      "external-competitors": MOCK_EXTERNAL_COMPETITORS,
      "external-laws": MOCK_EXTERNAL_LAWS,
    };
  }

  /** Mutable drill row data (saved in-session via right-panel forms). */
  const MOCK_SURVEY_SUGGESTIONS = {
    ss1: {
      title: "Latency in control testing evidence",
      subSurvey: "Q4 Risk Assessment Survey · Sarah Kim",
      sev: "Medium",
      sevClass: "is-warning",
      context:
        "Respondent noted delays obtaining testing artefacts for two in-scope controls.",
      rationale:
        "Medium — compensating monitoring in place; deadline risk for year-end sign-off.",
      nextStep: "",
    },
    ss2: {
      title: "Policy exception — privileged access",
      subSurvey: "Q4 Risk Assessment Survey · Tom Reeves",
      sev: "High",
      sevClass: "is-error",
      context:
        "Standing exception for break-glass admin without quarterly recertification evidence.",
      rationale: "Escalation candidate.",
      nextStep: "Route to IAM lead for exception renewal or remediation plan.",
    },
  };

  const MOCK_SURVEY_RESPONSES = {
    sr1: {
      name: "Sarah Kim",
      statusLine: "Q4 Risk Assessment · Complete",
      submitted: "Dec 2 · 14:22 · session verified",
      aiFlags: "1 suggestion promoted to triage · 0 conflicts",
    },
    sr2: {
      name: "Tom Reeves",
      statusLine: "Q4 Risk Assessment · Complete",
      submitted: "Dec 1 · 09:05",
      aiFlags: "",
    },
    sr3: {
      name: "Priya Nair",
      statusLine: "Vendor Risk Q. · Partial",
      progress: "Section 2 of 5 saved · last activity Nov 28",
    },
    sr4: {
      name: "Marcus Lee",
      statusLine: "Q4 Risk Assessment · In progress",
      progress: "Auto-save enabled · no submission yet.",
    },
  };

  const MOCK_AUTO_APPROVED_ROWS = {
    aa1: {
      name: "Third-party concentration",
      statusLine: "Auto-approved · 94% confidence",
      rule: "External intake · duplicate cluster + regulator keyword boost.",
      audit: "Logged to suggestion ledger · reversible within 14 days.",
    },
  };

  const MOCK_MITIGATION_ACTIONS = {
    ma1: {
      title: "Vendor security attestation workflow",
      statusLine: "Overdue · Sarah Kim",
      body: "Evidence collection, SOC 2–aligned scoring, executive exception reporting for third-party PII access.",
      dueNote: "Nov 30 (past) · escalate to program sponsor.",
    },
    ma2: {
      title: "DORA compliance roadmap",
      statusLine: "In progress · Tom Reeves",
      body: "ICT risk, incident reporting, resilience testing mapped to board checkpoints.",
      dueNote: "",
    },
    ma3: {
      title: "Architecture succession plan",
      statusLine: "In progress · HR / Priya Nair",
      body: "Shadowing, decision log, critical system ownership handover.",
      dueNote: "",
    },
    ma4: {
      title: "Backup & DR testing program",
      statusLine: "Scheduled · Marcus Lee",
      body: "Randomized restores, RTO/RPO verification, remediation tracking.",
      dueNote: "",
    },
    ma5: {
      title: "Access control policy update",
      statusLine: "Complete · Security team",
      body: "Privileged access reviews, JML automation with IdP — closed in register.",
      dueNote: "",
    },
  };

  function buildSurveySuggestionFormHtml(id, d) {
    const esc = escapeHtml;
    const fid = (k) => `svsug-${id}-${k}`;
    return (
      `<form class="w-form wf-table-entity-form" data-entity-kind="survey-suggestion" data-entity-id="${esc(id)}" onsubmit="return false">` +
      `<p class="right-drill-hint" style="margin-top:0">Survey suggestion — severity is read-only.</p>` +
      readOnlySeverityBadgeHtml("Severity", d.sevClass, d.sev) +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("title"))}">Title</label>` +
      `<input class="w-form-input" id="${esc(fid("title"))}" type="text" value="${esc(d.title)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("sub"))}">Survey · respondent</label>` +
      `<input class="w-form-input" id="${esc(fid("sub"))}" type="text" value="${esc(d.subSurvey)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("ctx"))}">Context</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("ctx"))}" rows="3">${esc(d.context)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("rat"))}">Severity rationale</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("rat"))}" rows="3">${esc(d.rationale)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("next"))}">Next step</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("next"))}" rows="2">${esc(d.nextStep)}</textarea></div>` +
      `<div class="w-form-actions">` +
      `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveTableEntityDetail('surveySuggestion','${esc(id)}')">Save</button>` +
      `</div></form>`
    );
  }

  function buildSurveyResponseFormHtml(id, d) {
    const esc = escapeHtml;
    const fid = (k) => `svres-${id}-${k}`;
    const extra =
      d.aiFlags !== undefined
        ? `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("ai"))}">AI flags</label>` +
          `<textarea class="w-form-textarea" id="${esc(fid("ai"))}" rows="2">${esc(d.aiFlags)}</textarea></div>`
        : "";
    const prog =
      d.progress !== undefined
        ? `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("prog"))}">Progress / notes</label>` +
          `<textarea class="w-form-textarea" id="${esc(fid("prog"))}" rows="3">${esc(d.progress)}</textarea></div>`
        : "";
    return (
      `<form class="w-form wf-table-entity-form" data-entity-kind="survey-response" data-entity-id="${esc(id)}" onsubmit="return false">` +
      `<p class="right-drill-hint" style="margin-top:0">Response detail — workflow status is read-only.</p>` +
      readOnlyStatusFieldHtml("Response status", d.statusLine) +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("name"))}">Respondent</label>` +
      `<input class="w-form-input" id="${esc(fid("name"))}" type="text" value="${esc(d.name)}"></div>` +
      (d.submitted
        ? `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("sub"))}">Submitted</label>` +
          `<input class="w-form-input" id="${esc(fid("sub"))}" type="text" value="${esc(d.submitted)}"></div>`
        : "") +
      extra +
      prog +
      `<div class="w-form-actions">` +
      `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveTableEntityDetail('surveyResponse','${esc(id)}')">Save</button>` +
      `</div></form>`
    );
  }

  function buildAutoApprovedFormHtml(id, d) {
    const esc = escapeHtml;
    const fid = `aa-${id}-`;
    return (
      `<form class="w-form wf-table-entity-form" data-entity-kind="auto-approved" data-entity-id="${esc(id)}" onsubmit="return false">` +
      `<p class="right-drill-hint" style="margin-top:0">Auto-approved row — approval status is read-only.</p>` +
      readOnlyStatusFieldHtml("Status", d.statusLine) +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid)}name">Name</label>` +
      `<input class="w-form-input" id="${esc(fid)}name" type="text" value="${esc(d.name)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid)}rule">Rule</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid)}rule" rows="3">${esc(d.rule)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid)}audit">Audit</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid)}audit" rows="2">${esc(d.audit)}</textarea></div>` +
      `<div class="w-form-actions">` +
      `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveTableEntityDetail('autoApproved','${esc(id)}')">Save</button>` +
      `</div></form>`
    );
  }

  function buildMitigationFormHtml(id, d) {
    const esc = escapeHtml;
    const fid = (k) => `mit-${id}-${k}`;
    return (
      `<form class="w-form wf-table-entity-form" data-entity-kind="mitigation" data-entity-id="${esc(id)}" onsubmit="return false">` +
      `<p class="right-drill-hint" style="margin-top:0">Mitigation action — workflow status is read-only.</p>` +
      readOnlyStatusFieldHtml("Status", d.statusLine) +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("title"))}">Action title</label>` +
      `<input class="w-form-input" id="${esc(fid("title"))}" type="text" value="${esc(d.title)}"></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("body"))}">Description</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("body"))}" rows="4">${esc(d.body)}</textarea></div>` +
      `<div class="w-form-field"><label class="w-form-label" for="${esc(fid("due"))}">Due / escalation</label>` +
      `<textarea class="w-form-textarea" id="${esc(fid("due"))}" rows="2">${esc(d.dueNote)}</textarea></div>` +
      `<div class="w-form-actions">` +
      `<button type="button" class="w-btn is-primary" onclick="WorkflowViews.saveTableEntityDetail('mitigation','${esc(id)}')">Save</button>` +
      `</div></form>`
    );
  }

  function setSuggestionRowOutcome(tr, outcome) {
    const cell = tr.querySelector(".wf-suggestion-actions");
    if (!cell || tr.classList.contains("wf-suggestion-row--resolved")) return false;
    tr.classList.add("wf-suggestion-row--resolved");
    tr.classList.toggle("wf-suggestion-row--approved", outcome === "approved");
    tr.classList.toggle("wf-suggestion-row--rejected", outcome === "rejected");
    cell.innerHTML =
      outcome === "approved"
        ? `<span class="wf-suggestion-outcome wf-suggestion-outcome--approved">Approved</span>`
        : `<span class="wf-suggestion-outcome wf-suggestion-outcome--rejected">Rejected</span>`;
    return true;
  }

  function riskTitleFromSuggestionRow(tr) {
    const t = tr.querySelector("td")?.textContent?.trim() || "Risk";
    return t.length > 72 ? `${t.slice(0, 71)}…` : t;
  }

  function suggestionPoolLabel(poolKey) {
    const map = {
      internal: "internal identification",
      "external-news": "the News pool",
      "external-competitors": "the Competitors pool",
      "external-laws": "the Laws and regulations pool",
    };
    return map[poolKey] || "this suggestion list";
  }

  function toastRiskApproved(poolKey, title) {
    if (typeof window.W === "undefined" || typeof window.W.toast !== "function") return;
    const where = suggestionPoolLabel(poolKey);
    window.W.toast(
      `Suggestion approved: “${title}”. It’s saved to ${where}; this row now shows Approved in the table.`,
      { duration: 5000 }
    );
  }

  window.WorkflowViews = {
    escapeHtml,

    approveAllInPool(poolKey) {
      const wrap = document.querySelector(`[data-suggestion-pool="${poolKey}"]`);
      if (!wrap) return;
      let n = 0;
      wrap.querySelectorAll("tbody tr.wf-suggestion-row:not(.wf-suggestion-row--resolved)").forEach((tr) => {
        if (setSuggestionRowOutcome(tr, "approved")) n += 1;
      });
      if (n > 0 && typeof window.W !== "undefined" && typeof window.W.toast === "function") {
        const where = suggestionPoolLabel(poolKey);
        const noun = n === 1 ? "suggestion" : "suggestions";
        window.W.toast(
          `Approved ${n} ${noun} in ${where}. Each row is saved and now shows Approved in the table.`,
          { duration: 5000 }
        );
      }
    },

    approveSuggestionRow(poolKey, index) {
      const wrap = document.querySelector(`[data-suggestion-pool="${poolKey}"]`);
      const tr = wrap?.querySelector(`tr.wf-suggestion-row[data-index="${index}"]`);
      if (tr && setSuggestionRowOutcome(tr, "approved")) {
        toastRiskApproved(poolKey, riskTitleFromSuggestionRow(tr));
      }
    },

    rejectSuggestionRow(poolKey, index) {
      const wrap = document.querySelector(`[data-suggestion-pool="${poolKey}"]`);
      const tr = wrap?.querySelector(`tr.wf-suggestion-row[data-index="${index}"]`);
      if (tr) setSuggestionRowOutcome(tr, "rejected");
    },

    /** Navigate via programmatic click on sidebar subitem */
    goToView(viewId) {
      const btn = document.querySelector(`.sb-subitem[data-view="${viewId}"]`);
      if (btn) btn.click();
    },

    openInternalSuggestionsDrilldown() {
      const el = document.getElementById("idInternalSugAccordion");
      if (el) {
        el.classList.add("is-open");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },

    openExternalGroupDrilldown(group) {
      const map = { news: "idExtSugNews", competitors: "idExtSugCompetitors", laws: "idExtSugLaws" };
      const el = document.getElementById(map[group] || "");
      if (el) {
        el.classList.add("is-open");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },

    openExternalSourceHistory() {
      setRightDrilldownHtml(
        "Source history",
        "Entries → suggestions",
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

    /** External suggestions: expand the auto-approved collapsible (mid panel) */
    expandAutoApprovedSection() {
      const el = document.getElementById("wfAutoApprovedSection");
      if (el) el.classList.add("is-open");
    },

    openSuggestionRowDetail(poolKey, index) {
      const pools = suggestionPoolMap();
      const pool = pools[poolKey];
      if (!pool || pool[index] == null) return;
      const row = pool[index];
      const formId = `${poolKey}-${index}`;
      const created = row.created || suggestionRowCreated(row, index);
      const rowWithMeta = { ...row, created };
      setRightDrilldownHtml(
        row.name,
        `${row.sev} · ${row.cat} · Created ${created}`,
        buildSuggestionDetailFormHtml(formId, rowWithMeta)
      );
    },

    openSurveySuggestionDrilldown(id) {
      const d = MOCK_SURVEY_SUGGESTIONS[id];
      if (!d) return;
      setRightDrilldownHtml(d.title, d.subSurvey, buildSurveySuggestionFormHtml(id, d));
    },

    openSurveyResponseDrilldown(id) {
      const d = MOCK_SURVEY_RESPONSES[id];
      if (!d) return;
      setRightDrilldownHtml(d.name, d.statusLine, buildSurveyResponseFormHtml(id, d));
    },

    openAutoApprovedRowDrilldown(id) {
      const d = MOCK_AUTO_APPROVED_ROWS[id];
      if (!d) return;
      setRightDrilldownHtml(d.name, d.statusLine, buildAutoApprovedFormHtml(id, d));
    },

    openMitigationActionDrilldown(id) {
      const d = MOCK_MITIGATION_ACTIONS[id];
      if (!d) return;
      setRightDrilldownHtml(d.title, d.statusLine, buildMitigationFormHtml(id, d));
    },

    /** Assessment overview — at-risk assessments table (also used from merged accordion help text) */
    openAtRiskDrilldown() {
      setRightDrilldownHtml(
        "At-risk assessments",
        "Filterable",
        `<div class="right-drill-hint">Deadline, quorum, owner</div>
        <div class="w-card"><div class="w-card-flush">
        <table class="w-table w-table--fixed"><thead><tr><th>Assessment</th><th>Deadline</th><th>Quorum</th><th>Owner</th></tr></thead>
        <tbody>
          <tr><td>Q4 Vendor concentration</td><td>Apr 12</td><td>3/5</td><td>S. Kim</td></tr>
          <tr><td>ITGC annual</td><td>Apr 3</td><td>2/4</td><td>T. Reeves</td></tr>
        </tbody></table></div></div>`
      );
    },

    /** Risk register row → right panel editable detail (assessment overview) */
    openAssessmentRiskDetail(id) {
      const risks = {
        ar1: {
          title: "Third-party data breach exposure",
          sub: "Critical · Third party",
          extraFields: [
            {
              key: "context",
              label: "Context",
              value: "Linked assessments and mitigation status.",
              multiline: true,
              rows: 2,
            },
            {
              key: "summary",
              label: "Summary",
              value:
                "Vendor access to customer PII without uniform SOC 2 evidence; regulator interest increasing.",
              multiline: true,
              rows: 4,
            },
            {
              key: "owners",
              label: "Owners",
              value: "Third-party risk · CISO · DPO",
              multiline: false,
            },
            {
              key: "openActions",
              label: "Open actions",
              value: "3 actions · 1 overdue.",
              multiline: true,
              rows: 3,
            },
          ],
        },
        ar2: {
          title: "DORA compliance gap",
          sub: "High · Regulatory",
          extraFields: [
            {
              key: "context",
              label: "Context",
              value: "ICT risk management and incident reporting.",
              multiline: true,
              rows: 2,
            },
            {
              key: "gapAnalysis",
              label: "Gap analysis",
              value: "Roadmap milestones not yet mapped to board checkpoints.",
              multiline: true,
              rows: 4,
            },
            {
              key: "nextStep",
              label: "Next step",
              value: "Assign regulatory liaison; target Q3 readiness review.",
              multiline: true,
              rows: 3,
            },
          ],
        },
        ar3: {
          title: "Key person dependency — IT architecture",
          sub: "Medium · People / technology",
          extraFields: [
            {
              key: "context",
              label: "Context",
              value: "Succession and knowledge transfer.",
              multiline: true,
              rows: 2,
            },
            {
              key: "impact",
              label: "Impact",
              value: "Single-threaded design decisions; no documented deputy sign-off.",
              multiline: true,
              rows: 4,
            },
            {
              key: "mitigation",
              label: "Mitigation",
              value: "Shadowing plan in progress · decision log location TBD.",
              multiline: true,
              rows: 3,
            },
          ],
        },
        ar4: {
          title: "Insufficient backup testing frequency",
          sub: "Low–Med · Operations",
          extraFields: [
            {
              key: "context",
              label: "Context",
              value: "Recovery objectives.",
              multiline: true,
              rows: 2,
            },
            {
              key: "testing",
              label: "Testing",
              value: "Quarterly drills not met for 2 of 5 critical systems.",
              multiline: true,
              rows: 4,
            },
          ],
        },
        ar5: {
          title: "Obsolete access control policies",
          sub: "Low · Policy",
          extraFields: [
            {
              key: "context",
              label: "Context",
              value: "Zero-trust alignment.",
              multiline: true,
              rows: 2,
            },
            {
              key: "policyNotes",
              label: "Policy notes",
              value: "Policy owner assigned; draft in review with IAM.",
              multiline: true,
              rows: 4,
            },
          ],
        },
      };
      const r = risks[id];
      if (!r) return;
      setRightDrilldownHtml(r.title, r.sub, buildAssessmentRiskFormHtml(id, r));
    },

    /** Persist edited risk fields from form (title + extra fields; register rating line stays fixed) */
    saveAssessmentRiskDetail(riskId) {
      const form = document.querySelector(`#rightDrilldown form.wf-risk-detail-form[data-risk-id="${riskId}"]`);
      if (!form) return;
      const titleInput = form.querySelector(`#risk-${riskId}-title`);
      const titleEl = document.getElementById("rightPaneTitle");
      if (titleInput && titleEl) {
        const v = titleInput.value.trim();
        if (v) titleEl.textContent = v;
      }
      alert("Risk details saved.");
    },

    saveTableEntityDetail(kind, idOrFormId) {
      if (kind === "suggestion") {
        const m = /^(.+)-(\d+)$/.exec(idOrFormId);
        if (!m) return;
        const poolKey = m[1];
        const index = parseInt(m[2], 10);
        const pools = suggestionPoolMap();
        const pool = pools[poolKey];
        if (!pool || pool[index] == null) return;
        const row = pool[index];
        const prefix = `sug-${idOrFormId}-`;
        const get = (k) => {
          const el = document.getElementById(prefix + k);
          return el ? String(el.value).trim() : "";
        };
        row.name = get("name") || row.name;
        row.desc = get("desc");
        row.owner = get("owner");
        row.cat = get("cat");
        row.ctrl = get("ctrl");
        row.conf = get("conf").replace(/%/g, "");
        row.rules = get("rules");
        const titleEl = document.getElementById("rightPaneTitle");
        if (titleEl) titleEl.textContent = row.name;
        const subEl = document.getElementById("rightPaneSubtitle");
        if (subEl) subEl.textContent = `${row.sev} · ${row.cat}`;
        alert("Suggestion saved.");
        return;
      }
      if (kind === "surveySuggestion") {
        const d = MOCK_SURVEY_SUGGESTIONS[idOrFormId];
        if (!d) return;
        const p = (k) => {
          const el = document.getElementById(`svsug-${idOrFormId}-${k}`);
          return el ? el.value.trim() : "";
        };
        d.title = p("title") || d.title;
        d.subSurvey = p("sub");
        d.context = p("ctx");
        d.rationale = p("rat");
        d.nextStep = p("next");
        const titleEl = document.getElementById("rightPaneTitle");
        if (titleEl) titleEl.textContent = d.title;
        alert("Survey suggestion saved.");
        return;
      }
      if (kind === "surveyResponse") {
        const d = MOCK_SURVEY_RESPONSES[idOrFormId];
        if (!d) return;
        const p = (k) => {
          const el = document.getElementById(`svres-${idOrFormId}-${k}`);
          return el ? el.value.trim() : "";
        };
        d.name = p("name") || d.name;
        if (d.submitted !== undefined) d.submitted = p("sub");
        if (d.aiFlags !== undefined) d.aiFlags = p("ai");
        if (d.progress !== undefined) d.progress = p("prog");
        const titleEl = document.getElementById("rightPaneTitle");
        if (titleEl) titleEl.textContent = d.name;
        alert("Response saved.");
        return;
      }
      if (kind === "autoApproved") {
        const d = MOCK_AUTO_APPROVED_ROWS[idOrFormId];
        if (!d) return;
        const fid = `aa-${idOrFormId}-`;
        const nameEl = document.getElementById(`${fid}name`);
        const ruleEl = document.getElementById(`${fid}rule`);
        const auditEl = document.getElementById(`${fid}audit`);
        if (nameEl) d.name = nameEl.value.trim() || d.name;
        if (ruleEl) d.rule = ruleEl.value.trim();
        if (auditEl) d.audit = auditEl.value.trim();
        const titleEl = document.getElementById("rightPaneTitle");
        if (titleEl) titleEl.textContent = d.name;
        alert("Auto-approved row saved.");
        return;
      }
      if (kind === "mitigation") {
        const d = MOCK_MITIGATION_ACTIONS[idOrFormId];
        if (!d) return;
        const p = (k) => {
          const el = document.getElementById(`mit-${idOrFormId}-${k}`);
          return el ? el.value.trim() : "";
        };
        d.title = p("title") || d.title;
        d.body = p("body");
        d.dueNote = p("due");
        const titleEl = document.getElementById("rightPaneTitle");
        if (titleEl) titleEl.textContent = d.title;
        alert("Mitigation action saved.");
        return;
      }
    },

    openAssessmentCardDrilldown(id) {
      const packs = {
        a1: {
          title: "Q4 Vendor Risk Assessment",
          sub: "In flight — monitoring",
          html: `<div class="right-drill-hint">Assessor activity and reminders.</div>
          <div class="right-drill-section"><h4>Assessors</h4>
          <div class="w-list">
            <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Sarah Kim</span><span class="w-list-meta">Submitted · High / Medium</span></div></div>
            <div class="w-list-item"><div class="w-list-content"><span class="w-list-title">Tom Reeves</span><span class="w-list-meta">Opened · pending</span></div></div>
          </div></div>`,
        },
        a2: {
          title: "IT Controls — annual cycle",
          sub: "Setup & dispatch",
          html: `<div class="right-drill-hint">Pre-filled assessors and message.</div>
          <div class="right-drill-section"><h4>AI draft</h4>
          <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Invitation preview truncated — full text below.</p>
          <textarea class="w-form-textarea" rows="4" readonly>Please complete the IT controls assessment by …</textarea>
          </div></div></div>`,
        },
        a3: {
          title: "DORA ICT resilience — pilot",
          sub: "Synthesis & approval",
          html: `<div class="right-drill-hint">Aggregated score 3.4 ± 0.6 · divergence flag.</div>
          <div class="right-drill-section"><h4>AI summary</h4>
          <div class="w-card"><div class="w-card-body">
          <p class="right-drill-hint" style="margin:0">Wide spread on impact — 3 of 6 assessors rated higher. Accept / Adjust / Request reassessment.</p>
          </div></div></div>
          <div class="right-drill-section"><h4>Audit trail</h4>
          <p class="right-drill-hint" style="margin:0">Read-only after approval.</p></div>`,
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
      mountSuggestionAccordionBodies();
    },
  };

  /** Internal identification — upload tab */
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

  function getTableFilterRows(block) {
    if (!block) return [];
    const tbody = block.querySelector("tbody");
    if (tbody) return Array.from(tbody.querySelectorAll("tr"));
    const docList = block.querySelector(".wf-doc-list");
    if (docList) return Array.from(docList.querySelectorAll("li"));
    const wList = block.querySelector(".w-list");
    if (wList) return Array.from(wList.querySelectorAll(".w-list-item"));
    return [];
  }

  function applyTableFilter(block) {
    if (!block || !block.matches("[data-wf-table-block]")) return;
    const searchEl = block.querySelector("[data-wf-table-search]");
    const q = (searchEl && searchEl.value ? searchEl.value : "").trim().toLowerCase();
    const radio = block.querySelector("input[type=radio][data-wf-table-filter-radio]:checked");
    const filterVal = radio && radio.value !== "all" ? radio.value : "all";
    getTableFilterRows(block).forEach((row) => {
      const fv = row.getAttribute("data-filter-value") || "";
      const text = row.textContent.toLowerCase();
      const okQ = !q || text.includes(q);
      const okF = filterVal === "all" || fv === filterVal;
      row.hidden = !(okQ && okF);
    });
  }

  function wireTableToolbarsOnce() {
    if (wireTableToolbarsOnce._done) return;
    wireTableToolbarsOnce._done = true;
    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t && t.matches && t.matches("[data-wf-table-search]")) {
        applyTableFilter(t.closest("[data-wf-table-block]"));
      }
    });
    document.addEventListener("change", (e) => {
      const t = e.target;
      if (t && t.matches && t.matches("input[type=radio][data-wf-table-filter-radio]")) {
        applyTableFilter(t.closest("[data-wf-table-block]"));
      }
    });
    document.addEventListener("click", (e) => {
      const trig = e.target.closest(".wf-filter-dropdown__trigger");
      if (trig) {
        e.preventDefault();
        const pid = trig.getAttribute("aria-controls");
        const panel = pid ? document.getElementById(pid) : null;
        if (!panel) return;
        const opening = panel.hidden;
        document.querySelectorAll(".wf-filter-dropdown__panel").forEach((p) => {
          p.hidden = true;
        });
        document.querySelectorAll(".wf-filter-dropdown__trigger").forEach((b) => {
          b.setAttribute("aria-expanded", "false");
        });
        if (opening) {
          panel.hidden = false;
          trig.setAttribute("aria-expanded", "true");
        }
        return;
      }
      if (!e.target.closest(".wf-filter-dropdown")) {
        document.querySelectorAll(".wf-filter-dropdown__panel").forEach((p) => {
          p.hidden = true;
        });
        document.querySelectorAll(".wf-filter-dropdown__trigger").forEach((b) => {
          b.setAttribute("aria-expanded", "false");
        });
      }
    });
  }
  wireTableToolbarsOnce();
})();
