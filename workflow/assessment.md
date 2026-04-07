# Assessment workflow

Agentic risk **assessment**: AI pre-fills assessors, messages, and synthesis; the user remains the **overseer** who confirms dispatch, reviews aggregated results, adjusts scores with visible rationale, and signs off before handoff to mitigation. This document describes the prototype UX for the **Assessment** phase and how it aligns with the same patterns as [Identification](./identification.md) (overview + drilldown right panel + thread footer + truncation/layout rules).

---

## Principles (shared with Identification)

- **Draft then approve:** AI proposes; the user explicitly accepts, edits, rejects, or requests regeneration — especially before dispatch, at synthesis, and at final approval.
- **Explainability:** Any headline score or flag should point to **underlying signals** (who submitted what, spread vs suggestion, divergence, overrides).
- **Confidence:** Where the UI shows an AI suggestion (assessors, dates, text), pair it with a **confidence indicator** and a short **rationale** (e.g. domain match, past workshops).
- **Auditability:** Later states expose **who changed what and when**; post-approval audit trail is **read-only**.

---

## Navigation (sidebar)

Under **Assessment**, the submenu should mirror Identification’s pattern:

1. **Overview** — aggregate health of assessments (in flight, due soon, awaiting synthesis, awaiting approval).
2. **Active assessments** (or equivalent) — list/cards of assessments in progress; selecting one opens the **state-specific** middle panel (see [Assessment states](#assessment-states-chronological)).

Exact labels can match the product shell; the important contract is: **one Overview**, then **entry into per-assessment work** where States 1–4 apply.

---

## Overview

### Purpose

- Single landing place for assessment posture across risks.
- **Surface substep-style signals** (counts, deadlines, quorum status) with links into the relevant assessment or state.

### Middle panel (content)

- **Summary cards** (examples): assessments **in setup**, **awaiting responses**, **ready for synthesis**, **awaiting approval**, **completed this period**.
- **Compact dataviz (optional):** distribution of **inherent** or **preliminary** likelihood/impact across open assessments (same spirit as Identification’s external/internal split — keep it compact).
- **“All at-risk assessments”** or similar: row click opens the **right panel** with a filterable table (deadline, quorum, owner) — same drilldown pattern as Identification’s “All suggestions”.

### Threads

- Relevant **AI threads** in the **footer** of the middle panel (same as Identification).

### Layout

- **Two-line truncation** for card titles and previews; **no clipping** in expanded panels; scroll containers where tables grow.

---

## Assessment states (chronological)

States are numbered here in **execution order**. The UI may show them as steps, tabs, or a single workspace that **morphs** by state.

| Order | State | Summary |
|-------|--------|---------|
| A | [State 2 — Setup & dispatch](#state-2--setup--dispatch) | Review AI pre-fill; approve and send. |
| B | [State 1 — In flight (monitoring)](#state-1--in-flight-monitoring) | Track submissions, reminders, live score preview. |
| C | [State 3 — Synthesis & review](#state-3--synthesis--review) | Quorum/deadline met; aggregated score and AI summary. |
| D | [State 4 — Approval & handoff](#state-4--approval--handoff) | Sign-off, audit summary, mitigation handoff. |

---

## State 2 — Setup & dispatch

**When:** A new assessment cycle is being configured. The agent has **pre-filled** fields; the user **reviews and approves** before dispatch.

### Middle panel

- **Proposed assessor chips** with a **confidence indicator** per chip (e.g. “Suggested based on risk domain and past workshops”). Actions: **Accept all** or **edit individually** (opens detail in right panel or inline).
- **Proposed due date** with a **one-line rationale** (e.g. “7 days — high priority risk”).
- **Invitation message preview** — **truncated to 2–3 lines** in the middle panel (full text in right panel).
- **Readiness status:** checklist — e.g. assessors confirmed / due date set / message ready.
- **Primary CTA:** **Send assessment** — **disabled** until the readiness checklist is complete.
- **Secondary CTA:** **Build manually** (text link) — clears AI suggestions and opens a **blank/manual** configuration in the **right panel** (same fields, no pre-fill).

### Right panel

- **Full editable assessor list:** add, remove, reorder; each row shows **AI rationale for inclusion** and **accept/reject** per assessor.
- **Full invitation message:** editable **textarea** with AI draft pre-loaded; user may edit freely or **regenerate**.
- **File attachment** area for supporting context documents.
- **Due date picker** with AI-suggested date **pre-selected**.
- **Agentic dispatch settings:**
  - Toggle **automatic reminders**
  - **Reminder frequency**
  - **Quorum threshold** (minimum submissions before synthesis can run automatically)

### Alignment note

This is the assessment analogue of Identification’s “draft for approval” before anything is sent to stakeholders.

---

## State 1 — In flight (monitoring)

**When:** Assessment is **dispatched**; assessors may respond before the deadline.

### Middle panel

- **Breakdown:** **Sent / opened / submitted** counts (clear segments or KPI chips).
- **Score distribution preview:** compact **dot plot or bar** showing the **spread of likelihood and impact** responses received **so far** — **updates live** (or on refresh) as submissions arrive.
- **Time remaining:** **countdown** to deadline; **visual warning** when **under 24 hours** (colour or icon — keep consistent with design tokens).
- **Passive “agent working” indicator** when reminders or other **automated** actions are running (non-blocking; does not steal focus).

### Right panel

- **Full assessor table:** name, role, status (**sent / opened / submitted / overdue**), **submission timestamp**, **nudge** action per row (manual nudge; distinct from automated reminders in the log).
- **Row click — submission preview:** that assessor’s **likelihood** and **impact** selections, **notes**, and the **original AI suggestion** side-by-side so **delta** is obvious.
- **Reminder log:** each reminder — **timestamp**, **AI-triggered vs manually sent**.

### Visuals (preserve)

- Live updating L/I distribution (dot plot or bar — product choice; keep compact).
- Countdown + &lt;24h warning.
- Subtle agent activity indicator.

---

## State 3 — Synthesis & review

**When:** **Quorum met** or **deadline passed**. Agent has **aggregated** scores and generated a **summary**. Primary **judgment** moment for the overseer.

### Middle panel

- **Aggregated risk score** — single number on a **5-point** scale with a **confidence band** beneath (e.g. `3.4 ± 0.6`).
- **Likelihood** and **impact** as **separate** aggregated values (not only a single composite).
- **Divergence flag** when spread is high — e.g. “Wide spread — 3 of 6 assessors rated impact significantly higher” with link to **breakdown in the right panel**.
- **AI summary excerpt:** **1–2 sentences** from the full summary (full text in right panel).
- **Three primary CTAs:** **Accept score** | **Adjust score** | **Request reassessment**
- **Adjust score:** activates **inline steppers** (or equivalent) for **likelihood** and **impact** in the **middle panel** — simple tweaks without opening the right panel.

### Right panel

- **Full AI-generated summary** with **Accept** / **Edit inline** / **Reject** — **reject** prompts **regenerate with a user note**.
- **Per-assessor breakdown table:** name, likelihood, impact, **delta from AI suggestion**, notes.
- **Likelihood vs impact scatter plot** — **one dot per assessor** for **outlier** visibility.
- **Manual score override** field — **separate** from the middle-panel “adjust” flow: for setting a value **independent** of aggregation when policy allows.
- **AI suggestion history:** what was **pre-filled** per assessor vs **how each responded**.

### Alignment note

Matches Identification’s emphasis on **explainable** outputs and **rules/signals** — here the “signals” are assessor submissions, spread, and divergence.

---

## State 4 — Approval & handoff

**When:** After the user **accepts or adjusts** the score in State 3. **Sign-off** and transition to mitigation.

### Middle panel

- **Audit summary card:** final score, assessor count, **participation rate**, **overrides** (what/when/by whom), **AI summary status** (accepted / edited / regenerated).
- **Two primary CTAs only:** **Approve** | **Reject**
- **Reject:** **mandatory note** — inline text appears **before** the action completes; workflow routes **back to State 3** with the note **attached** to the record.
- **Approve:** immediate status transition + **handoff confirmation** copy, e.g. risk moved to **Assessed**, mitigation owner notified, **AI-drafted initial mitigation actions** ready for review.
- **“Review mitigations” CTA** — opens **right panel** (or Mitigation workflow) with drafted actions.

### Right panel — pre-approval

- **Read-only audit trail:** all submissions, synthesis, edits during review, timestamps, **who** made each change. **Nothing editable.**

### Right panel — post-approval

- **AI-drafted mitigation actions** — **editable** list; user can edit, reorder, delete before confirming (carries into **Mitigation** step).
- **Complete assessment package summary** attached to the **risk object** going forward.
- **“Confirm and open mitigation”** CTA — closes assessment formally and opens the **next workflow step** (Mitigation).

---

## Shared UI contract (Assessment ↔ Identification)

| Pattern | Identification | Assessment |
|--------|----------------|------------|
| Overview | Aggregate + dataviz + drilldown card | Same idea: aggregate + optional viz + drilldown |
| Right panel | Tables, history, accordions | Assessor table, logs, plots, audit trail |
| AI confidence | Per suggestion / auto-approve ribbon | Per assessor chip, synthesis confidence band |
| Truncation | Two lines | Message preview 2–3 lines; card text two lines |
| Threads | Footer on every step | Footer on every step |
| Human approver | Approve / edit / reject suggestions | Accept / adjust / reject / approve with mandatory note on reject |

---

## Out of scope for this doc

- **Mitigation** step content — only **handoff** and **draft actions** are referenced here.
- **Residual risk** full composite (controls + KRIs + issues) — may be **downstream** of this assessment in the product; this workflow focuses on **assessor-led inherent / assessment scores** and **synthesis** unless the product ties them explicitly in this phase.
