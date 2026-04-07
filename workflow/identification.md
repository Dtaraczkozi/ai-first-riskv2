# Identification workflow

Agentic risk identification: AI drafts and surfaces risks from internal and external sources; the user is the overseer who approves, edits, or rejects suggestions. This document describes the prototype UX and information architecture for the **Identification** phase.

---

## Navigation (sidebar)

Under **Identification**, the submenu order is:

1. **Overview** — aggregate view; surfaces results from the other substeps.
2. **Internal identification** — risks and documents from inside the organisation.
3. **External suggestions** — risks suggested from news, competitors, laws/regulations, and configured external sources.
4. **Survey manager** — bottom of the section; bottom-up input via structured surveys.

**Removed from this workflow:** Workshop manager, Library suggestions (out of scope for this iteration).

---

## Overview

### Purpose

- Single landing place for identification health.
- **Surface substep results** here so users see pending counts and trends without drilling into each step first.

### Middle panel (content)

1. **Compact dataviz (top)**  
   - Shows **newly surfaced risks** and their distribution by origin: **External** vs **Internal** (mock counts).  
   - Keep it compact — fits above the fold without crowding.

2. **Summary cards** (link or navigate to substeps)  
   - Internal: count of suggestions awaiting approval (and link to Internal identification).  
   - External: count of suggestions awaiting approval (and link to External suggestions).  
   - Surveys: e.g. active responses / pending (and link to Survey manager).

3. **“All suggestions” card**  
   - Opens a consolidated view in the **right panel**: accordion sections (e.g. External / Internal / Survey-derived) each containing a **suggestions table** (same schema as elsewhere — see [Shared: Suggestion table](#shared-suggestion-table)).

### Threads

- Relevant **AI threads** appear in the **footer** of the middle panel (same as on every Identification step).

---

## External suggestions

### Middle panel — two tabs

#### Tab: Suggestions

**Grouped summary cards** (three groups, separate):

- **News**
- **Competitors**
- **Laws and regulations**

For each group, show:

- **Count** of suggestions awaiting approval from that source type.
- **Severity distribution** (e.g. low / medium / high counts or a small visual breakdown).

**Interaction**

- Clicking a group loads the **drilldown in the right panel**: a **table** of suggestions for that group (see [Shared: Suggestion table](#shared-suggestion-table)).

**Auto-approve ribbon (top of tab)**

- Banner copy along the lines of: *N suggestions were auto-approved based on confidence thresholds.*
- Trailing link: **Review auto-approved suggestions** toggles visibility of an **extra table**:
  - Rendered **below the ribbon** and **above** the main grouped suggestion cards.
  - Collapsible (hide again to collapse).
- Auto-approved rows: **confidence &gt; 90%**, confidence shown **green**; same table columns and editing behaviour as the main suggestion table.

#### Tab: External sources

- **List** of configured external sources (e.g. companies / feeds to monitor).
- **Search bar** and **filter** control (below the panel header row) to find/filter sources (e.g. by company name).
- Per row:
  - **Open** — navigate to the source (mock).
  - **Remove** — requires **confirmation** (modal or dialog; user must confirm before removal).

**Interaction**

- Clicking a **source** sets the **right panel** to a **history** view:
  - Each row: **article or entry title**, **number of suggestions** surfaced from it, **date**.

---

## Internal identification

### Middle panel — two main sections

#### Section: Suggestions

- **Summary card**: how many suggestions are **identified and awaiting approval** (single aggregate — no News/Competitor/Law grouping).
- Clicking opens the **right panel table** (same schema as external).

**Upload (mock)**

- **Drag-and-drop** area at the top for “uploading” documents.
- After drop/select: simulate processing with a **loading / progress bar**, then surface **mock** suggestions (dedupe, suggested owners, inherent scores — all mocked for the prototype).

#### Section: Internal sources

- **Summary card**: how many **sources** and **types** of internal documents are uploaded (e.g. employee/org data, past reports).
- **List** of uploaded documents (name, type); each can be **removed** from the list (mock).

---

## Survey manager

### Middle panel — header

- **Title** left; **primary CTA** right-aligned on the same line: **New survey** (or equivalent).
- **Removed:** the old inline “New survey” collapsible block at the bottom of the page — creation is **only** via the header CTA.

### Survey list

- **Not** draggable; items are **not** reorderable via drag handles.
- Each survey is a **card**:
  - **Collapsed:** header + **short summary** of what appears in the expanded state.
  - **Expanded:** detailed view with **results** and **suggestions** from the survey in a **list/table** similar to the shared suggestion pattern, plus **who it came from** (respondent/source).

### New survey (modal / overlay)

- Opens from the header CTA.
- **Detailed** creation:
  - Survey **message** / body.
  - **Recipients** (multi-select or list).
  - **Agent suggestions** for message and recipients (mock).

---

## Shared: Suggestion table (right panel)

Used when drilling down from External groups, Internal suggestions, Overview “All suggestions”, or survey detail (where applicable).

| Column | Notes |
|--------|--------|
| Name | |
| Short description | |
| Suggested owner | |
| Inherent likelihood / impact / severity | Editable inline |
| Category | |
| Suggested controls | |
| **Confidence %** | “How sure” the agent is; rules combine general ERM guidance + **user-defined rules** (mock) |

**Tooltip (hover on suggestion row or confidence)**

- Lists **rules the suggestion does not meet** (or fails partially), for transparency.

**Editing**

- Inline editing for the fields above (prototype: `contenteditable` or inputs).

---

## Layout and copy rules (all Identification steps)

- **Threads:** Relevant threads appear at the **bottom** of the middle panel on **every** step.
- **No cutoff / overlap:** Content must remain visible within **expanded** panels; use scroll containers where needed.
- **Text truncation:** After **two lines**, truncate with ellipsis (even if text would wrap to more lines on resize).

---

## Relationship to agentic ERM principles

- **Human-in-the-loop:** Suggestions are drafts until the user approves or edits them.
- **Explainability:** Confidence and “rules not met” support review, not blind trust.
- **Internal vs external:** Clear separation of intake paths; taxonomy and deduplication can be layered in later phases.
