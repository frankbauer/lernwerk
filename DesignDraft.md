# Design Document: Lernwerk — Island Learning Environment

**University Introduction Lecture — Interactive Learning Platform**

Version 0.8 — Draft  
Status: In Review

> **What changed in v0.8**
>
> - The draft now starts from the **existing, client-side-only Lernwerk** (Übungsplaner, Abenteuerkarte, CodeBlocks exercise pages, local autosave) and describes how to **evolve** it into the full platform instead of building from scratch. See §1.4, §29 (roadmap) and Appendix A (mapping of today's implementation to the draft's concepts).
> - The platform is built with **SvelteKit and Svelte 5 (runes)** (§6, §7).
> - **Theming is a foundation:** today's switchable themes carry over to every part of the new system (§22).
> - **Content ownership:** exercise modules stay files (source of truth, deployed and registered; the database only caches them), while curricula, terms and schedules move into the database and are edited in a backend UI (§4, §25.3a, §26).
> - Concepts were aligned with what already exists: islands = chapters, exercise **modules** = the shared exercise collection, **concepts** = topic tags, castle / houses / village / volcano = the POI set, content checksum = exercise version, autosave record = first attempt.
> - Features that exist today but were missing from the draft were added: concept self-assessment and recommendations (§14.6), quiz exercise kinds (§11.6), themes (§22.2), guided tours (§22.8), anonymous local-first use (§1.2, §29.2).

## 1. Vision & Goals

### 1.1 Summary

The platform is a **self-hosted, multi-lecture, term-aware, versioned, whimsical learning environment** that supplements university introduction lectures. Students explore a world of pixel-art islands, each representing a chapter of the lecture. They discover content, complete exercises, earn **term-specific badges**, and follow a curated progression — but always have a non-game "escape hatch" via a traditional list view (the **Übungsplaner**) if they prefer.

The platform grows out of **Lernwerk**, which is already in use for the lecture "Grundlagen der Informatik" (GdI) as a static, client-side-only web app (see §1.4).

**Key Features:**

- **Multi-lecture support:** Each lecture (e.g., "CS101", "Advanced Algorithms") has its own **independent terms, maps, and student cohorts**.
- **Term isolation:** Each term is a self-contained instance of a lecture’s island world, exercises, and student progress.
- **Attempt-based progress:** Students can have multiple **attempts** (formerly "sessions") per exercise, with clear version tracking.
- **Exercise versioning:** Exercises are versioned, and students are notified of changes with full changelog visibility.

### 1.2 Core Design Principles

- **Whimsy over enterprise.** Every screen should feel like it belongs in a game, not a spreadsheet. Particle effects, animated transitions, playful typography. No "Teams-like" chrome.
- **Themable everywhere.** Students choose how Lernwerk looks (today 8 themes, from playful "Abenteuer" to a dark "Terminal"). Every view — list, exercise page incl. code editor, map HUD, cards, admin UI — is styled only through theme tokens, so a theme always applies to the whole app (§22).
- **Progressive disclosure.** Fog of war hides what students haven't reached. **Fog is island-based (coarse-grained).**
- **Multiple modes.** The island view is the primary experience, but the list view is a full peer — not an afterthought.
- **Accessibility alongside delight.** Animations respect `prefers-reduced-motion`. Keyboard navigation is fully supported in all views.
- **Self-contained & self-hosted.** All services run in a Docker stack. No external cloud dependencies at runtime.
- **Local-first, login optional.** Everything that works today without an account (browsing, coding, compiling Java in the browser, local progress) keeps working without an account. Logging in adds sync across devices, attempts history, badges, hints and live coding. Anonymous use collects no personal data on the server (matches today's privacy statement in `datenschutz.html`).
- **Code runs in the browser.** Java is compiled and executed client-side (CodeBlocks + TeaVM/WASM). The server never executes student code.
- **Evolve, don't rewrite content.** Exercise folders, `exercises.json` modules and the curriculum format stay the source of truth. The new app reads them; it does not require re-authoring the ~150 existing exercises.
- **Term isolation per lecture.** Each lecture’s terms operate independently. Students can be enrolled in **multiple lectures simultaneously**.
- **Exercise versioning.** Exercises are versioned via file hashes. Students are notified if they open an attempt for an outdated exercise version, with full changelog access.
- **Files for exercises, database for curricula.** Exercise modules are deployed as files and are the source of truth for exercises (the database only caches them). Curricula, terms and schedules are authored in the backend UI and live in the database (§4).
- **User coordination for edits.** Map editor allows concurrent edits; **last write wins** (no automatic locking).

### 1.3 Goals

- Replace static Moodle-style content lists with an engaging spatial metaphor.
- Provide a clear, gamified content flow that signals to students what to do next.
- Integrate seamlessly with the existing **CodeBlocks** exercise engine (a prebuilt Vue 3 bundle) without replacing it.
- Offer lightweight LLM-based hints that scaffold without spoiling.
- Support live, in-lecture coding with anonymous sharing and lecturer review.
- Lay the foundation for university SSO integration.
- **Support multiple lectures**, each with independent terms, maps, and student cohorts.
- **Enable lecturers to clone, modify, and lock terms independently per lecture.**
- **Allow students to enroll in multiple lectures and terms**, with progress and badges copied over where applicable.
- **Restrict tutor access to students in their assigned lecture/term combinations.**
- **Version exercises** so students and lecturers can track changes over time.
- **Notify students** when an exercise they are working on has been updated.
- **Support term archiving**, with student data export and expiration flags.

### 1.4 Starting Point: Lernwerk Today

Large parts of the student-facing experience already exist as a **static site without backend** (HTML + vanilla JS + jQuery, no build step, served from `gdi.cs.fau.de/livecompile/`). A detailed inventory is in Appendix A; the essentials:

| Area | Exists today | Gap to this draft |
| --- | --- | --- |
| Content model | `modules/<id>/exercises.json` (exercise collection + concepts), `data/curriculum.json` (chapters → exercises), merged by `catalog.js`; zod schemas in `data/*.schema.ts` (documentation only) | Lectures, terms, placement roles, version history |
| Exercise pages | One folder per exercise (`index.html` + `exercise.html`, `explanation.html`, Java files with `//#START STUDENT` sections, JSON configs), rendered by `content.js` into **CodeBlocks** containers; Java compiled in-browser via TeaVM (WASM) | Attempts, events for snapshots/hints, lecture/term context |
| List view | **Übungsplaner** (`uebersicht.html`): cards/table, facets, concept self-assessment, recommendation scoring | Locked/version status, lecture/term filters |
| Game view | **Abenteuerkarte** (`karte.html`/`karte.js`): procedurally generated canvas world, one island per chapter, castle/houses/village/volcano, ships, cell-based fog, hero, HUD | Server persistence, badges, wells, bulletin board UI, editor |
| Progress | `localStorage` (`done` set, map state, self-assessment) and IndexedDB autosave (one code state per exercise + content checksum, JSON download/upload) | Accounts, multiple attempts, skipped state, snapshots |
| Schedule | `data/karte.json`: lecture slides and homework with SoSe 2026 dates per chapter | Term model |
| Themes, tours, a11y | 8 themes, guided tours, ARIA live regions, keyboard control of the map | — |
| Not present | Accounts, roles, badges, LLM hints, live coding, glossary, map editor, terms | All of it |

**Evolution strategy:** the SvelteKit app (§7) first re-hosts the existing pages and data unchanged, then replaces the vanilla-JS views one by one, then adds the server-backed features. Each phase is shippable on its own. See §29.

---

## 2. Course & Lecture Structure

### 2.1 Overview

The platform supports **multiple independent lectures** (e.g., "CS101: Introduction to Programming", "CS201: Data Structures"). Each lecture operates as a **self-contained course** with its own:

- **Terms** (semesters)
- **Island maps** (custom per term)
- **Exercises and content** (shared across terms, but versioned)
- **Student cohorts** (enrolled per term)

Students can be **enrolled in multiple lectures simultaneously**, and within each lecture, they can be enrolled in **multiple terms** (e.g., retaking a lecture in a new semester).

### 2.2 Hierarchy

```
User
├── Enrolled in Lecture A (e.g., "CS101")
│   ├── Term 1 (Summer 2026)
│   │   ├── Island 1: Introduction
│   │   ├── Island 2: Variables
│   │   └── Attempts, Badges, Progress (scoped to Term 1)
│   └── Term 2 (Winter 2027)
│       ├── Island 1: Introduction
│       ├── Island 2: Variables
│       └── Attempts, Badges, Progress (scoped to Term 2)
└── Enrolled in Lecture B (e.g., "CS201")
    ├── Term 1 (Summer 2026)
    │   ├── Island 1: Trees
    │   └── Island 2: Graphs
    └── Attempts, Badges, Progress (scoped to Term 1)
```

### 2.3 Key Concepts

- **Module:** A reusable **exercise collection** (today: `modules/gdi/`). It holds exercise folders, their metadata (`exercises.json`) and the **concepts** they use. Modules know nothing about chapters, lectures or terms and can be used by several lectures.
- **Lecture:** A university course (e.g., "GdI"). Defines a **curriculum** (chapters, the concepts each chapter introduces, and which module exercises belong to each chapter). Lectures are **global** and shared across terms.
- **Term:** A semester instance of a lecture (e.g., "GdI SoSe 2026"). Contains its own **curriculum snapshot, schedule (lecture dates, slides, homework), map, and student progress**. Terms are **independent** per lecture.
- **Chapter / Island:** A chapter of the curriculum (today: chapters 0–21), represented as a pixel-art island in the game world. Islands are **derived per term** from the term's curriculum (so each term can have custom layouts).
- **Concept:** A programming concept (e.g., "Schleifen") with a pixel-art icon. Concepts are the **topic tags** of exercises; chapters introduce them; students self-assess them (§14.6).
- **Attempt:** A student’s save state for an exercise (formerly "session"). Students can have multiple attempts per exercise, and each attempt tracks the **exercise version** it was created with. Today's local autosave record is exactly one (unnamed) attempt per exercise.

---

## 3. Term Management System

### 3.1 Overview

Each **lecture** has its own **independent terms**. This allows:

- Lecturers to **clone** an existing term (e.g., "CS101 Summer 2025") to a new term (e.g., "CS101 Summer 2026") and modify it without affecting other lectures or terms.
- Students to **enroll in multiple lectures**, with progress **copied over** from previous terms of the **same lecture** if available.
- Lecturers to **lock** old terms, making them read-only for students while preserving visibility.
- Tutors to be **assigned to specific lecture/term combinations**, restricting their view to only students enrolled in those combinations.

### 3.2 Term Lifecycle

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                Term States (Per Lecture)                          │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Review Mode      │ Lecturers can edit the term (clone, modify islands/exercises).│
│                  │ Students cannot enroll. Links to this term are invalid.     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Signup Open      │ Lecturers finalize the term. Students can enroll.          │
│                  │ Teleport links can target this term.                        │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Active           │ Default term for new students in this lecture.             │
│                  │ Students can interact fully. Tutors see their students.   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Locked           │ Term is read-only for students. Lecturers/tutors can still   │
│                  │ view progress. No further edits allowed.                    │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Expired          │ Term is marked as expired (after 5 years).                  │
│                  │ Students can export/delete their data.                     │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

### 3.3 Term Cloning

- **Lecturer/admin action:** Clone an existing term **within or across lectures** (e.g., "CS101 Summer 2025" → "CS201 Summer 2026").
- **Process:**
  1. Copy the curriculum snapshot, schedule (dates shifted to the new term, to be reviewed), world layout and overrides, placements, badges and unlock rules from the source term.
  2. Reset all student-specific data (discovery state, attempts, unlock progress).
  3. Preserve global assets (badge images, sprite sheets).
  4. Assign the new term a unique `termId` and set its initial state to **Review Mode**.
  5. Exercises are **referenced, not copied**: the new term uses the current versions of the module files; version history is global (§5).
- **Alternative:** create a term from the lecture's **curriculum template** instead of cloning a term.
- **Customization:** Lecturers can modify the cloned term (e.g., change chapters and exercise assignments, adjust unlock logic) before opening it for enrollment.

### 3.4 Student Enrollment & Progress/Badge Copying

- **Enrollment Flow:**
  - Students can **enroll in multiple lectures** (e.g., "CS101" and "CS201").
  - Within each lecture, students can **enroll in multiple terms** (e.g., retaking "CS101" in Summer 2026 after Winter 2025).
  - If a student enrolls in a term of a lecture they’ve taken before, their **progress (attempts, discovery states) and badges are copied over** from their most recent term in that lecture (see §3.5).
- **Progress/Badge Copying Rules:**
  - **Attempts** and **discovery states** are copied if the exercise/island exists in the new term.
  - **Badges** are copied if the badge is available in the new term (i.e., the exercise or achievement triggering the badge exists in the new term).
  - **Hint pools** and **unlock states** are reset per term.
  - **Exercise versions** are preserved: if a student had an attempt for `v1` of an exercise, and the new term has `v2`, the attempt retains its `v1` version and is flagged as outdated.

### 3.5 Tutor Assignment

- Tutors are **assigned to specific lecture/term combinations** by lecturers/admins.
- Tutors can **only see students** who are enrolled in their assigned lecture/term combinations.
- Tutors can **not edit** terms they are not assigned to.

### 3.6 Teleport Links & Term Binding

- **Default Behavior:** Teleport links (e.g., from slides or external sources) with **no term specified** default to the **latest active term of the linked lecture**.
- **Explicit Term Binding:** Links can include `lectureId` and `termId` parameters (e.g., `/island?lecture=cs101&term=summer-2026`) to target a specific lecture/term.
- **Fallback:** If the specified term is locked or does not exist, the link falls back to the latest active term of the lecture.

### 3.7 Active Term Management

- **Default Active Term:** For each lecture, the system defaults to the **latest active term** (highest `order` with `isActive = true`).
- **Manual Override:** Users can **manually select** their active term per lecture from their profile settings.
- **Review Mode:** Terms in **review mode** are **not** considered active and do not appear in the default term selector.

### 3.8 Enrollment Deadlines

- **Supported:** Terms can have **enrollment deadlines** (e.g., "enrollment closes 2 weeks after term start").
- **Default:** Enrollment is **always open** (no deadline) unless explicitly set by a lecturer.

---

## 4. Content Sources: Modules (Files) and Curricula (Database)

### 4.1 Overview

Content is split by **who authors it and how it is deployed**:

| Content | Authored by | Source of truth | Database role |
| ------- | ----------- | --------------- | ------------- |
| **Exercise modules** — `modules/<moduleId>/exercises.json`, concepts, exercise folders (task HTML, Java sources, JSON configs, images) | Exercise authors, in git | **The deployed files** | Read-only **cache/index** (rebuildable at any time) |
| **Curricula** — lectures, chapters, concepts introduced per chapter, which module exercises belong to which chapter, placements/roles | Lecturers, in the **backend UI** | **Database** | Primary store |
| **Term data** — schedule (lecture dates, slides, homework), world layout, badges, unlock rules | Lecturers, in the backend UI / map editor | **Database** | Primary store |
| **Student data** — progress, attempts, snapshots, hints, map state, self-assessment | Students | Database (logged in) or browser (anonymous) | Primary store |

Consequences:

- **Exercises are never created or edited through the platform UI.** An exercise is code + text + assets; it lives in a module repository, is reviewed in git, and is deployed as files. The platform only *reads* modules.
- **Curricula are never files in production.** Lecturers create and change them in the backend UI (§25). Today's `data/curriculum.json` (and the schedule part of `data/karte.json`) are **import formats**: they seed the GdI lecture once and remain available as JSON export/import (backup, moving a curriculum between installations, tests).
- **Lectures reference modules, never copy them.** Several lectures can use the same module; a curriculum references exercises as `{module, id}` (today's `ExerciseRefSchema`).

### 4.2 Module Registry

A module is made available by **registering** it:

1. The module is deployed to the content volume (`/app/content/modules/<moduleId>/`, e.g. by `git pull`, a CI deploy or an unpacked release archive).
2. An admin registers it in the backend UI (or it is auto-registered on startup when listed in `LERNWERK_MODULES`): `{ id, path }` — today's `curriculum.modules[]` entry, now stored in the `modules` table.
3. The server **reads `exercises.json`** from that path, validates it against `ExerciseModuleSchema` (§20.3), computes the content checksum of every exercise (§5.1), and writes the result into the cache tables (`module_exercises`, `module_concepts`, `exercise_versions`).
4. **Re-sync** (admin button "Modul neu einlesen", API call from the deploy pipeline, or on server start) repeats step 3. Nothing else writes to the cache tables.

```typescript
interface ModuleRegistry {
  register(ref: { id: string; path: string }): Promise<SyncReport>;
  sync(moduleId: string): Promise<SyncReport>;          // re-read exercises.json + folders
  unregister(moduleId: string): Promise<void>;          // only if no curriculum references it

  // Read side — served from the cache, backed by the files
  getExercise(ref: { module: string; id: string } | { uuid: string }): Promise<Exercise | null>;
  listExercises(filters?: { moduleId?: string; concepts?: string[]; kind?: ExerciseKind[]; search?: string }): Promise<Exercise[]>;
  listConcepts(moduleId?: string): Promise<Concept[]>;
  getExerciseVersions(uuid: string): Promise<ExerciseVersion[]>;
}

interface SyncReport {
  added: string[]; updated: string[]; removed: string[];   // exercise ids
  newVersions: { id: string; hash: string; hasChangelog: boolean }[];
  errors: { path: string; message: string }[];             // schema violations, missing folders, unknown concepts
  danglingRefs: { lectureId: string; ref: string }[];      // curricula referencing exercises that no longer exist
}
```

**Cache rules:**

- The cache may be dropped and rebuilt from the files at any time without data loss.
- If the files and the cache disagree, the **files win**; a sync fixes the cache.
- An exercise removed from `exercises.json` is marked `removedAt` in the cache, not deleted: attempts and curricula still reference its `uuid`, and the backend UI shows dangling curriculum entries in the sync report.
- Exercise pages (the folder contents) are served directly from the files; only the metadata is cached.
- In static mode (§24.5) there is no database: the build reads the module files and the exported curriculum directly, like `catalog.js` does today.

### 4.3 Exercise Identity

Every exercise has two keys:

- `uuid` — stable identity, stored in the exercise's `index.html` (generated by `tools/add_exercise_uuids.py`) and mirrored into `exercises.json` by the module tooling. Attempts, progress, snapshots and hints reference the `uuid`, so **moving or renaming a folder never orphans student data** (the recent move of all chapters into `modules/gdi/` is exactly this case).
- `id` — human-readable, module-prefixed path (`gdi/05_Objekte/vector`), used in URLs, curricula and the map. Today's `catalog.js` already resolves old unprefixed ids (`resolveId`, `migrateDone`); the same mapping applies on import.

### 4.4 Curriculum Store

Curricula are stored in the database (`lectures`, `curricula`, `curriculum_chapters`, `curriculum_entries`, see §21) and edited in the backend UI (§25.3a). The data model is today's `CurriculumSchema`:

- **Chapter:** number, title, concepts introduced (concept ids from any registered module), ordered list of exercise refs.
- **Rule:** an exercise belongs to the first chapter listing it (as in `catalog.js`); concepts not introduced explicitly are assigned to the first chapter that uses them.
- **Validation on save:** every ref must resolve in the module registry; unknown concepts and duplicate exercises are rejected (the checks from `curriculum.schema.ts`'s `superRefine`).
- **Export/import:** `GET/PUT /api/admin/lectures/:lectureId/curriculum` speaks the JSON format of `data/curriculum.json` (minus `modules`, which come from the registry).

### 4.5 Lecture Reuse Across Terms

- A **lecture** owns a curriculum **template**. Creating a term copies the template into the term (**curriculum snapshot**), so editing next semester's chapters never changes a running term.
- Each term additionally has its own schedule, world layout, placements, badges and unlock rules (§3.3 cloning copies all of them).
- The underlying exercise definitions are always the shared module files; a module update (new checksum) reaches all terms that reference the exercise, with the versioning rules of §5.

---

## 5. Exercise Versioning & Changelog

### 5.1 Versioning System

To track changes to exercises over time, each exercise has a **version history** derived from its content hash. This allows:

- Students to see if they are working on an **outdated version** of an exercise.
- Lecturers to provide **changelogs** explaining what changed between versions.
- Auditing of which version was used for a given attempt, snapshot, or hint.
- **Incompatible changes** to be flagged, preventing students from loading old attempts (see §5.5).

#### Version Derivation

- The **version** of an exercise is a **SHA-256 checksum of everything a student's code depends on**: the task text and the template code blocks (student, static, API, data blocks). Presentation-only metadata (title, description, preview image, difficulty, tags) does **not** change the version.
- This is the checksum that today's `autosave.js` already computes and stores with every local save (`checksum: "sha256:…"`), and that the solution download (`lernwerk-solution` v1) already carries. The server computes it with the **same algorithm**, so locally saved code imported after login keeps its correct version.
- Because exercises are folders (not single JSON files), the checksum is computed by a **build/sync tool** (port of the browser logic to Node) and written to the exercise's metadata, not hashed from a JSON file.
- Example: `sha256:a1b2c3d4e5f6...`
- The hash is stored in the `version` field of the exercise and used to reference the exercise version in attempts and snapshots.

#### Version History in Exercise Metadata

Each exercise entry in `modules/<moduleId>/exercises.json` (or its database record) gets an optional `history` array that tracks all versions and their changelogs. The sync tool appends an entry whenever it detects a new checksum; the lecturer fills in the changelog text (an empty changelog is allowed and shown as "Minor changes"):

```jsonc
// modules/gdi/exercises.json → exercises[i]
{
  "id": "16_Rekusrion/bst_insert",           // folder path inside the module
  "uuid": "d8cde87e-badb-4e3e-8412-4b27044bbc52",  // stable identity (mirrors index.html)
  "title": "BST Insertion",
  "description": "Implementiere das Einfügen in einen binären Suchbaum.",
  "link": "16_Rekusrion/bst_insert",
  "type": "exercise",
  "difficulty": 3,
  "tags": ["rekursion", "baeume"],
  "hasSolution": true, "hasExplanation": true, "hasExperiments": false,
  "version": "sha256:e5f6g7h8...",            // current checksum (written by sync tool)
  "history": [
    {
      "hash": "sha256:a1b2c3d4...",
      "changelog": "Initial version",
      "date": "2026-01-15T10:00:00Z",
      "isIncompatible": false
    },
    {
      "hash": "sha256:e5f6g7h8...",
      "changelog": "Fixed edge case in test cases. Added more hints for recursion.",
      "date": "2026-05-20T14:30:00Z",
      "isIncompatible": false
    }
  ]
}
```

### 5.2 Version Tracking in Attempts

- Each `ExerciseAttempt` (formerly `ExerciseSession`) records the **exercise version** (`exerciseVersion`) it was last saved with.
- Each `CodeSnapshot` and `HintEntry` also records the `exerciseVersion` at the time of creation.
- This allows reconstructing the exact version of the exercise a student was working on for any given snapshot or hint.

### 5.3 Changelog Presentation

When a student opens an exercise attempt:

1. The system compares the attempt’s `exerciseVersion` with the **current version** of the exercise.
2. If the attempt’s version is **outdated**, the student sees:
  - A **visual indicator** (e.g., a ⚠️ icon) on the attempt card in the exercise overview.
  - A **notification toast**: *"This attempt was created for an older version of the exercise. [View changelog]"*
  - A **changelog modal** when they click "View changelog", showing all changes made since their attempt’s version.

#### Changelog Modal Example

```
┌─────────────────────────────────────────────────────────────────┐
│  📜 Changelog: BST Insertion                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Your attempt is from version: a1b2c3d4... (Jan 15, 2026)       │
│  Current version: e5f6g7h8... (May 20, 2026)                     │
│                                                                  │
│  Changes since your attempt:                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔹 May 20, 2026: Fixed edge case in test cases.            │ │
│  │    Added more hints for recursion.                         │ │
│  │                                                           │ │
│  │ 🔹 May 18, 2026: Updated starter code to include           │ │
│  │    a base case example.                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Dismiss]  [Update Attempt to Current Version]                │
└─────────────────────────────────────────────────────────────────┘
```

- The **"Update Attempt to Current Version"** button allows students to **migrate their attempt** to the current exercise version (see §5.4).

### 5.4 Attempt Migration

When a student updates their attempt to the current exercise version:

1. The system **preserves the student’s code** and any manual changes they made.
2. The attempt’s `exerciseVersion` is updated to the current version.
3. The student sees a confirmation: *"Your attempt has been updated to the latest version. Your code was preserved."*
4. If the exercise structure has changed significantly (e.g., new required functions), the student may need to manually adapt their code.
5. **New snapshots and hints** are always stored with the **latest version hash**.

### 5.5 Incompatible Versions

- **Flagging Incompatible Changes:** Lecturers can mark a version as **incompatible** (e.g., `"isIncompatible": true` in the `history` entry) if the changes break existing attempts.
- **Behavior for Incompatible Versions:**
  - Students **cannot load** attempts created for incompatible versions.
  - The attempt card shows a **❌ icon** with the tooltip: *"This attempt cannot be loaded due to incompatible exercise changes."*
  - Students must **start a new attempt** for the current version.
- **Use Case:** Emergency flag if a change (e.g., removing a required function) would break all existing attempts.

### 5.6 Notification for Unfinished Attempts

If a student visits an exercise page and:

- They have an **unfinished attempt** for that exercise, **and**
- The exercise has been **updated since their last attempt activity**,

They receive a **one-time notification** per exercise per login session:

```
⚠️ The exercise "BST Insertion" has been updated since your last attempt.
   [View changelog]  [Continue anyway]
```

- This notification appears **only once per exercise per login session** (to avoid spam).
- It does **not** appear for finished or skipped attempts.

### 5.7 Author Workflow for Exercise Updates

1. **Edit Exercise:** The author changes the exercise folder in the module repository.
2. **Add Changelog Entry:** The author adds a `history` entry with a **changelog text** to the exercise in `exercises.json` (the module tooling can pre-fill hash and date: `tools/exercise_versions.mjs --bump`).
3. **Flag Incompatibility (if needed):** The author sets `isIncompatible: true` if the changes break existing attempts.
4. **Deploy & Sync:** The module is deployed and re-synced (§4.2). The server:
  - Computes the new **content checksum** of the exercise.
  - Takes the matching `history` entry from the file (changelog, date, `isIncompatible`).
  - If the file has no entry for the new checksum, records the version anyway (attempts must be able to reference it) with an empty changelog, and lists it in the sync report as "version without changelog".
  - Updates the cached `version` of the exercise.
5. **Students Are Notified:** Students with unfinished attempts for the old version receive a notification on their next visit (see §5.6).

### 5.8 Versions in the Database

The database only **caches** versions (source of truth: the module files, §4.1), but keeps every version it has ever seen — a hash that disappears from the file must still resolve for old attempts:

```sql
exercise_versions
  id, exerciseUuid,
  hash (text),            -- content checksum --
  changelog (text),       -- from exercises.json history, may be empty --
  isIncompatible (bool),  -- from exercises.json history --
  firstSeenAt,            -- first sync that saw this hash --
  createdAt
```

- `module_exercises.version` always points to the latest version from the files.
- Old exercise *contents* are not stored in the database; reconstructing an old version uses the module's git history (§26.5).

---

## 6. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                           Browser Client                             │
│  SvelteKit (Svelte 5, runes)  │  Rune stores ($state classes)        │
│  svelte/transition + motion   │  mythictree-fairydust (FX)           │
│  ┌────────────────────────┐   ┌───────────────────────────────────┐  │
│  │ @lernwerk/world        │   │ CodeBlocks (Vue 3 UMD bundle)     │  │
│  │ canvas map renderer    │   │ + TeaVM/WASM javac, Pyodide, …    │  │
│  │ (framework-agnostic)   │   │ student code runs ONLY here       │  │
│  └────────────────────────┘   └───────────────────────────────────┘  │
│  ProgressStore: LocalProgressStore (IndexedDB/localStorage)          │
│                 RemoteProgressStore (API, when logged in)            │
└──────────────┬───────────────────────────────────────────────────────┘
               │  HTTPS
┌──────────────▼───────────────────────────────────────────────────────┐
│                SvelteKit Server (adapter-node)                       │
│  hooks.server.ts (Better-Auth session, lecture/term context, roles)  │
│  +page.server.ts load functions │ form actions │ remote functions    │
│  +server.ts endpoints (REST API, SSE)  │  Zod validation             │
│  Module Registry (reads module files, port of catalog.js) + cache    │
│  Static files: modules/ (exercise folders), js/ (runtimes), assets/  │
└──────────────┬────────────────────────────┬──────────────────────────┘
               │                            │
┌──────────────▼──────────┐   ┌─────────────▼──────────────────┐
│   PostgreSQL (Drizzle)  │   │   Ollama (LLM Hints)           │
│   - Users                │   │   Self-hosted, internal only   │
│   - Lectures             │   │   Per-lecture/term models      │
│   - Terms (per lecture)  │   │   Per-lecture/term prompts     │
│   - Islands (per term)   │   └────────────────────────────────┘
│   - POIs (per term)      │
│   - Exercise Attempts    │
│     (per user per term)  │
│   - Badges (per term)    │
│   - Exercises (global)   │
│   - Exercise Versions    │
└─────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│   External Services (NOT co-hosted, accessed via browser)       │
│   Slides (gdi.cs.fau.de/slides)  │  StudOn (PDFs, homework)     │
│   Videos                                                        │
└─────────────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────────────┐
│   Content volume (read-only, source of truth for exercises)       │
│   modules/<moduleId>/exercises.json + exercise folders            │
│   → read on register/sync, cached in PostgreSQL                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- The SvelteKit application is the single backend. It serves the web UI, the static exercise assets and the REST/JSON API endpoints, **with all requests scoped to a lecture and term** (either explicit or default).
- **Two deployment modes from one codebase:**
  - **Static mode** (`adapter-static`): today's deployment model. Prerendered pages, all progress in the browser, no accounts. Used for the public `livecompile` site during the transition and as a fallback.
  - **Server mode** (`adapter-node` in Docker): accounts, sync, badges, hints, live coding, editor.
  - Pages that must work in static mode load their data through **universal** `+page.ts` load functions that read prerendered JSON (catalog, curriculum, schedule); server-only features live in `+page.server.ts`/`+server.ts` and are hidden in static builds (feature flag `PUBLIC_LERNWERK_MODE=static|server`).
- **Progress abstraction (`ProgressStore`):** All views talk to one interface (done/skipped states, attempts, map state, self-assessment). `LocalProgressStore` wraps today's `localStorage`/IndexedDB keys; `RemoteProgressStore` calls the API. On first login, local data is offered for **import** into the account (§29.3). 
- **CodeBlocks stays a black box.** The Vue-based CodeBlocks bundle is mounted client-side into a DOM node owned by a Svelte component (via a Svelte attachment, §11.1). Svelte and Vue never share reactivity; they communicate through the `ExerciseBridge` (§11.1).
- **The world renderer is framework-agnostic.** Today's `karte.js` (canvas, procedural generator, fog, hero, ships) becomes a plain TypeScript package `@lernwerk/world` with an imperative API. A thin `<WorldCanvas>` Svelte component owns the canvas and feeds it state; the HUD and all overlays (cards, scroll, bulletin board) are Svelte components.
- The Ollama instance is network-isolated; only the SvelteKit server can reach it. Students never call it directly.
- **Lecture/term isolation:** All term-specific data (islands, POIs, schedule, attempts, badges) is stored with a `lectureId` and `termId`. Global data (users, modules, exercise definitions, concepts, glossary) is shared across lectures/terms.
- **Content sources (§4):** exercise modules are files (source of truth) with a database cache; curricula, terms and schedules are database records edited in the backend UI.
- **Exercise versioning:** Exercises are versioned via content checksums (§5.1), and attempts/snapshots reference the specific version they were created with.
- **Multi-lecture support:** Each lecture operates independently, with its own curriculum, terms, maps, and student cohorts; lectures share exercise modules.

---

## 7. Technology Stack


| Concern                 | Choice                                                          | Notes                                                                                                                  |
| ----------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Framework               | **SvelteKit 2 + Svelte 5 (runes)**                              | File-based routing, SSR + prerendering, `load` functions, form actions; small runtime, fast hydration on lab tablets   |
| Language                | TypeScript (strict)                                             | Existing zod schemas in `data/*.schema.ts` move to `src/lib/schemas/` and become executable                           |
| Build                   | Vite                                                            | Replaces hand-maintained `?v=` cache busting with hashed asset names                                                   |
| Adapters                | `adapter-node` (server mode), `adapter-static` (static mode)    | See §6                                                                                                                 |
| UI Components           | shadcn-svelte (Bits UI primitives)                              | Accessible headless primitives, styled only through theme tokens                                                       |
| Theming                 | CSS custom properties (`--lw-*` tokens), `data-lw-theme` on `<html>` | Today's 8 themes carried over; theme registry; applies to every view incl. CodeBlocks and the map HUD (§22.2)     |
| State Management        | Svelte 5 runes: `$state`, `$derived`, `$effect`                 | Shared state as classes in `*.svelte.ts` modules, provided per request via `setContext` (no global server-side state)  |
| Validation              | Zod                                                             | Shared schemas between client, load functions, form actions and `+server.ts` endpoints                                 |
| Animation               | `svelte/transition`, `svelte/animate`, `svelte/motion` (`Spring`, `Tween`) | Page transitions, card reveals, fog lift; reduced-motion aware via `prefersReducedMotion` from `svelte/motion` |
| Particle FX             | mythictree-fairydust                                            | Custom particle engine (framework-agnostic): mouse trail, ambient effects, badge pop, fog dissolve                    |
| Localization            | mythictree-rosetta                                              | Custom TypeScript i18n; German is the primary language, all existing UI strings are extracted into it                  |
| Exercise engine         | CodeBlocks (prebuilt Vue 3 UMD, same authors)                   | Mounted via Svelte attachment; Java via TeaVM/WASM, Python via Pyodide; vendored runtimes in `static/js/`              |
| World rendering         | `@lernwerk/world` (TS port of `karte.js`), HTML Canvas 2D       | Procedural islands, 16 px tiles, CodeBlocks tilemap art (`assets/tilemap/`), sprite animation                          |
| ORM                     | Drizzle ORM                                                     | Type-safe, schema-as-code, migrations tracked in repo                                                                  |
| Database                | PostgreSQL 16                                                   | Primary store for all persistent data, **with lecture/term scoping**                                                   |
| Auth                    | Better-Auth (SvelteKit integration via `hooks.server.ts`)       | Session management, role support, SSO adapter                                                                          |
| SSO                     | SAML 2.0 / OIDC adapter (Better-Auth)                           | University integration (FAU IdM), see §19                                                                              |
| Containerization        | Docker Compose                                                  | Single `docker-compose.yml` for all services                                                                           |
| Real-time (live coding) | Server-Sent Events (SSE) via `+server.ts` returning a `ReadableStream` | Lecturer board, student result streaming                                                                        |
| LLM Hints               | Ollama (self-hosted)                                            | Code error context → structured Socratic hint, never full solution                                                     |
| Content                 | Module files + DB cache; curricula in DB                        | §4: modules are deployed as files and registered; curricula are edited in the backend UI                               |
| Testing                 | Vitest (unit, incl. world generator determinism), Playwright (E2E) | Playwright also replaces `tools/capture_previews.mjs` long-term                                                    |

### 7.1 Svelte Conventions

| Concern                   | Where it lives                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Pages                     | `src/routes/**/+page.svelte`                                                                                     |
| Server data               | `+page.server.ts` / `+layout.server.ts` `load`                                                                   |
| Prerenderable data        | universal `+page.ts` `load` (works in static mode)                                                               |
| Mutations from forms      | form actions in `+page.server.ts` (progressive enhancement)                                                      |
| Mutations from components | **remote functions** (`query`/`command` in `*.remote.ts`)                                                        |
| Public REST, SSE          | `src/routes/api/**/+server.ts`                                                                                   |
| Auth, roles, lecture/term | `src/hooks.server.ts` `handle` → `event.locals`                                                                  |
| Shared client state       | rune-based classes in `src/lib/state/*.svelte.ts`, provided via `setContext` (never module-level state on the server) |
| Refresh after changes     | `invalidate('app:progress')`, also on `visibilitychange`                                                         |
| Imperative libraries      | attachments (`{@attach …}`) for CodeBlocks, `@lernwerk/world`, mythictree-fairydust                              |
| Animation                 | `svelte/transition`, `svelte/animate`, `Spring`/`Tween` from `svelte/motion`                                     |
| Env vars                  | `PUBLIC_*` via `$env/static/public` / `$env/dynamic/public`; secrets via `$env/*/private`                        |
| Rich text                 | mdsvex (Markdown + Svelte components)                                                                            |
| Static assets             | `static/`                                                                                                        |

> Remote functions are still marked experimental in some SvelteKit releases. Until they are stable in the version we pin, the same calls are implemented as form actions or `+server.ts` endpoints with a typed client wrapper; the rest of this document says "server function" for either.

---

## 8. Core Concepts & Domain Model

### 8.1 Entity Hierarchy

```
Module (Global, e.g. "gdi" — reusable exercise collection)
 ├── Concept[]                   — id, label, icon (pixel art)
 └── Exercise[]                  — one folder each, see below

Lecture (e.g., "GdI")
 ├── Curriculum (template)       — chapters → concepts introduced, exercise refs {module, id}
 └── Term (e.g., "SoSe 2026")
      ├── Curriculum (snapshot, editable per term)
      ├── Schedule               — lecture dates/slides/PDFs and homework per chapter (today: data/karte.json)
      ├── WorldLayout            — seed, generator version, editor overrides (§25)
      └── Island (= Chapter)
           ├── ArrivalPort          — arrival point on the island
           ├── Castle               — lecture content: slides, PDFs, videos, links,
           │                          lecture examples (kind "lecture") and sandboxes (role "sandbox")
           ├── House[] (≤ 3)        — SuggestedExercise, one house = one exercise POI
           ├── Village              — Bulletin Board: optional exercises + tools + island overview
           ├── Volcano (optional)   — homework (MandatoryExercise, external, with start/due dates)
           ├── DeparturePort        — leads to the next island (ship)
           ├── Well (optional)      — hint replenishment structure, unlocked by badge (new)
           └── Library (optional)   — glossary filtered to the island's concepts (new)

Exercise (Global, Versioned — lives in a module)
 ├── uuid (stable identity), id (module-prefixed path, e.g. "gdi/05_Objekte/vector")
 ├── title, description, difficulty (0 = unrated, 1–5)
 ├── kind ('lecture' | 'sandbox' | 'exercise' | 'test' | 'tool')   -- what it IS (today's `type`) --
 ├── tags (concept ids, main concept first)
 ├── hasSolution, hasExplanation, hasExperiments, isNew, isDraft, isHidden, image
 ├── staticHints[]                -- today's <hint> boxes; fallback for §18.7 --
 ├── version (hash)               -- Current content checksum, see §5.1 --
 ├── history[]                    -- Array of { hash, changelog, date, isIncompatible } --
 └── ExerciseAttempts[]

ExercisePlacement (Per Term)      -- where/how an exercise is used in a term --
 ├── termId, exerciseId, chapter (island)
 ├── role ('mandatory' | 'suggested' | 'optional' | 'sandbox' | 'content')
 ├── poi (castle | house:<n> | village | volcano)   -- derived from role, overridable --
 └── badgeId (nullable)

ExerciseAttempt (Per User Per Term, formerly "Session")
 ├── userId, exerciseUuid, termId
 ├── name, blocks { "<container>:<block>": code }   -- only blocks changed vs. template --
 ├── exerciseVersion (hash)       -- Version of the exercise when last saved --
 ├── isLecturerSolution, sharedForPresentation, shareMode
 ├── anonymousToken, createdAt, updatedAt, deletedAt
 └── CodeSnapshots[]

ExerciseProgress (Per User Per Term)   -- separate from attempts --
 ├── userId, exerciseUuid, termId
 ├── state ('in_progress' | 'finished' | 'skipped')
 └── updatedAt

CodeSnapshot (Per Attempt, Versioned)
 ├── attemptId, userId, exerciseUuid, termId
 ├── blocks, trigger (periodic | run | compile_error | test_run | attempt_end)
 ├── exerciseVersion (hash)       -- Version of the exercise at snapshot time --
 └── createdAt

HintEntry (Per Attempt, Versioned)
 ├── attemptId, userId, termId
 ├── promptContext (jsonb: { code, error, testResults, exerciseMetadata, exerciseVersion })
 ├── hintText, hintSource ('llm' | 'static')
 ├── exerciseVersion (hash)       -- Version of the exercise at hint time --
 └── createdAt

ConceptAssessment (Per User Per Lecture)   -- today's Übungsplaner "Konzepte, die ich kenne" --
 ├── userId, lectureId, conceptId
 ├── level ('unknown' | 'shaky' | 'known' | 'confident')
 └── updatedAt

UserLectureState (Per User Per Term)
 ├── lastHeardChapter             -- today's `lastHeard`: last lecture the student attended --
 └── plannerPreferences (jsonb)   -- view, sort, filters (optional sync) --

Lecture
 ├── id, slug, name, description
 └── createdAt, updatedAt

Term (Per Lecture)
 ├── id, slug, name, description
 ├── lectureId                 -- Belongs to a lecture --
 ├── order, status ('review' | 'signup' | 'active' | 'locked' | 'expired')
 ├── startDate, endDate, enrollmentDeadline, isDefault
 └── createdAt, updatedAt

UserLecture
 ├── userId, lectureId
 ├── enrolledAt, isActive
 └── createdAt

UserTerm (Per User Per Lecture)
 ├── userId, termId
 ├── role ('student' | 'tutor' | 'lecturer' | 'admin')
 ├── signedUpAt, isActive
 └── createdAt

TutorTermAssignment (Per Lecture)
 ├── tutorId, lectureId, termId
 └── assignedAt

Badge (Per Term)
 ├── id, slug, name, description, imageUrl
 ├── exerciseId (nullable), termId  -- Badges are term-specific --
 └── UserBadge[]

UserBadge (Per User Per Term)
 ├── userId, badgeId, termId
 ├── awardedAt
 └── awardedBy ('system' | 'api' | userId)

IslandHintPool (Per User Per Island Per Term)
 ├── userId, islandId, termId
 ├── poolSize, available
 ├── wellUnlocked, lastReplenishAt
 └── createdAt

DiscoveryState (Per User Per Term)    -- today's lernwerk.karte.v1 --
 ├── userId, termId
 ├── visitedIslands: ChapterNo[]   -- coarse, used by logic (labels, bulletin board, teleport) --
 ├── viewedContent: ContentId[]
 ├── hero: { c, r, dir }, ships: { [chapter]: position }, zoom
 ├── layoutSig                      -- signature of the layout the fog belongs to --
 └── fog: RLE blob                  -- fine-grained visual fog, opaque to the server --
```

#### Kind vs. role

v0.7 used one field (`defaultType`) for two different things. Today's data already separates them implicitly; v0.8 makes it explicit:

- **`kind`** (module metadata, today's `type`) says what an exercise *is*: lecture example (Vorlesungsbeispiel), sandbox (Sandkasten), exercise (Übung), test, tool. It never changes per term.
- **`role`** (per term placement) says how the term *uses* it. The default role is derived, and can be overridden per term:

| kind       | default role | default POI | Note |
| ---------- | ------------ | ----------- | ---- |
| `lecture`  | `content`    | castle      | Shown with the chapter's slides |
| `sandbox`  | `sandbox`    | castle      | Live coding target (§12) |
| `exercise` | `optional`   | village     | `suggested` (house) if listed in the term's house list (today: `houses` in `data/karte.json`, max. 3, filled up automatically) |
| `test`     | `mandatory`  | volcano     | None exist yet |
| `tool`     | `optional`   | village     | e.g. calculator; never counted for progress |

Homework (today: `homework` in `data/karte.json`, hosted on StudOn) is a **mandatory external exercise** at the volcano with `start`/`due` dates from the schedule.

### 8.2 Unlock States

Each piece of content exists in one of the following states. Importantly, **students can always self-declare Finished or Skipped on any exercise** — these states are for personal navigation only and are never used for grading. **All states are scoped to a lecture/term.**

- **Locked** — gated content the student has not yet met prerequisites for. Renders as fog in game view, frosted in list view. Students can always bypass by self-marking prerequisites (see §10.1).
- **Unlocked** — accessible, not yet interacted with.
- **In Progress** — student has opened it at least once (or a local autosave exists).
- **Finished** — marked done by the student (self-declared or via plugin hook). Today this is the `done` set in `lernwerk.uebungsplaner.v1`, shared by planner and map.
- **Skipped** — student explicitly chose to bypass this exercise. *New:* not available today; it counts like Finished for unlock rules but is shown differently and does not count towards completion percentages.

---

## 9. The Island World (Game View)

### 9.1 Rendering

The island world (**Abenteuerkarte**) is rendered on an HTML `<canvas>` element occupying the full viewport. **The rendered world is scoped to the active lecture/term.** Today's implementation (`karte.js`, ~2900 lines of vanilla JS) is the reference; it is ported to TypeScript as the framework-agnostic package `@lernwerk/world` and wrapped by a Svelte component `<WorldCanvas>` (the component creates the world on mount through an attachment, passes catalog/progress state in, and receives events such as `poi:enter`, `poi:interact`, `island:visited`).

- **Pixel art assets:** the CodeBlocks tilemap library (`assets/tilemap/tilemap.json`, theme sheets `valley`, `beach`, `desert`, `snow`; sprites such as ducks, volcano, ships, hero). Tile size 16 px, integer zoom levels 1–6, `image-rendering: pixelated`. Autotiling for coast, paths and fog.
- **Procedural islands:** islands are **generated**, not hand-painted. A seeded generator (`mulberry32`) places one island per chapter along a winding walk over a slot grid, shapes it with value noise, assigns a theme, and lays out a path from arrival port via castle, houses, village and volcano to the departure port, decorated with trees, lakes, ducks and islets. The map editor (§25) adjusts this generator's output instead of replacing it.
- **Layout stability:** today any change to chapters/exercises changes the layout signature (`sig`) and partially resets fog. In the platform, each term **pins** its `seed` and `generatorVersion`; the layout only changes when the lecturer publishes a new layout (§25.16). Generator determinism is covered by snapshot tests.
- **Render pipeline:** static terrain is pre-rendered to an offscreen layer; per frame: terrain → y-sorted sprites, ships, hero → badges/quest arrow → fog layer (dirty-rect updates) → labels (Caveat/Geist).
- **Islands** are connected by sea routes (BFS sea paths, Chaikin-smoothed, drawn dotted) that ships sail along.
- **Camera** pans smoothly following the player character; drag to pan, wheel/`+`/`-` to zoom.
- **Fog of war** has two levels (resolves the v0.7 "island-based" decision against the existing implementation):
  - **Logic is island-based:** an island counts as *discovered* once the hero has seen it (`visitedIslands`). Only this coarse state is used by rules, labels, the bulletin board and teleporting, and only this is queried on the server.
  - **Visuals are cell-based:** the rendered fog is a per-cell grid (4 levels) revealed in a radius around the hero and ships. It is stored as an opaque run-length-encoded blob with the discovery state.
  - Fog lifts with a particle-dissolve effect (mythictree-fairydust) when a new island is discovered.

### 9.2 Player Character

- Controlled with **WASD / arrow keys** (8 directions) or **click/tap-to-move** (BFS path finding).
- Drag pans the camera; touch drag supported for tablets.
- Sprite animation (walk cycle).
- Keyboard shortcuts (exist today): `Enter` interact, `N` next goal, `H` go to port, `L` island list, `?` help.
- The character's position (and ship positions, zoom) is persisted per user **per term** (today: `localStorage`; with login: database), restored on load.

### 9.3 Points of Interest (POIs)

POIs are the structures the generator places on each island. Each POI has:

- A **proximity trigger radius**. When the player enters it, an animated tooltip appears ("Enter: betreten").
- On interaction, a **Content Card** slides up from the bottom of the screen (shadcn-svelte `Sheet` or custom panel, styled to match the game aesthetic). Exercises open in an overlay using SvelteKit **shallow routing** (`pushState`), so the URL is shareable and Back closes the overlay (today: an iframe with `?embedded` and a `lernwerk:close` message).

#### Content Card Types


| POI                       | Card Contents                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| Castle                    | The chapter's lectures (title, slides, PDF), lecture examples and sandboxes, with done toggles     |
| House                     | One suggested exercise — see §11.2 Exercise Overview Card                                          |
| Village (Bulletin Board)  | See §9.4                                                                                            |
| Volcano                   | Homework: topic, link (StudOn), start and due date; smokes while the homework is open              |
| Port (Arrival/Departure)  | Island overview: name, content checklist, unlock status; departure calls the ship                  |
| Well (new)                | Hint pool status, locked animation until the badge is earned (§18.5)                               |
| Library (new)             | Glossary filtered to the island's concepts (§17.3)                                                 |


### 9.4 The Bulletin Board

Each island has exactly one Bulletin Board — today the **village** scroll fills this role (remaining exercises and tools with done toggles). It is always visible and accessible from arrival, regardless of unlock state. It serves as the island's "everything else" hub and opens a full-screen overlay styled as a corkboard (or scroll, depending on theme) with pinned cards. It is **not** a global nav; each island has its own board.

The board is organized into three sections:

**1. This Island — Optional Exercises**  
All optional exercises belonging to this island that do not have their own map POI are listed here as exercise cards (same card design as the list view — see §14). Students can open, start, mark finished, or skip any of them directly from the board. Optional exercises are always unlocked; they are never gated.

**2. This Island — Content & Context**  
A summary of all content on the island (castle content, homework), with viewed status and direct "Open" buttons. This gives students a single-page overview without having to walk to each POI.

**3. Other Islands — Discovered**  
Cards for all other islands the student has already discovered, showing island name, icon, brief description, completion percentage, and a quick-teleport button (today: the island list `L` in the HUD). Islands not yet discovered are hidden entirely (no fog card — the bulletin board cannot be used to spoil undiscovered content).

### 9.5 HUD (exists today)

- **Medallion:** liquid fill = finished houses of the current island; ring segments = all exercises of the island.
- **Next goal** (quest arrow + `N`), **port** shortcut, **island list** with progress.
- Island name plates with done/total and homework state, sticking to the screen edge for the current island.
- An ARIA live region announces arrivals, unlocks and interactions.

In the SvelteKit app, the HUD is a set of Svelte components layered over `<WorldCanvas>`; it reads the same rune-based progress state as the list view. Like all UI, the HUD and the canvas-drawn labels follow the active theme (§22.2).

---

## 10. Content Flow & Unlock Logic

### 10.1 Island Unlock Sequence

Unlock behavior is defined by a **rule preset per term** (editable with the rule builder, §25.8). All gating is strictly opt-in: students can always self-declare any exercise as Finished or Skipped at any time from the exercise overview card, which will immediately satisfy any unlock rule that depends on it. **All unlock states are scoped to the active lecture/term.**

**Preset `open` (default — today's behavior):**

```
Arrival Port unlocked
  → Castle, houses, village and volcano are all accessible immediately
  → All houses (SuggestedExercises) marked Finished/Skipped
      → DeparturePort UNLOCKS → ship comes → next island's ArrivalPort UNLOCKS
  (Homework/MandatoryExercise does NOT gate travel: it is graded externally and has its own deadline.)
```

**Preset `guided` (the v0.7 progression, optional):**

```
Arrival Port unlocked
  → Student interacts with castle content (slides, notes, video, links)
  → Each content item individually marked "Viewed" by student
  → All content marked Viewed  [or: student self-skips via overview card]
      → SuggestedExercises (houses) UNLOCK
  → Each SuggestedExercise can be marked "Finished" or "Skipped" independently
  → All SuggestedExercises marked Finished/Skipped
      → MandatoryExercise UNLOCKS (if present on this island)
  → MandatoryExercise marked "Finished" or "Skipped"
      → DeparturePort UNLOCKS → next island's ArrivalPort UNLOCKS
```

**Student self-service bypass:** The "Mark as Finished" and "Mark as Skipped" buttons are available on every exercise overview card at all times — for mandatory, suggested, optional, and sandbox exercises alike — regardless of whether the exercise is currently in the locked state. A student who has not viewed a content POI can still open the suggested exercises by marking the content as viewed manually. The unlock cascade runs immediately on each self-declaration, with no staff involvement required.

**Staff bypass:** Tutors, lecturers, and admins can additionally mark exercises as skipped for an individual student or a whole cohort from the tutor/admin panel.

**Cross-server exercises:** For mandatory exercises hosted on another server (homework on StudOn), the overview card provides manual "Mark as Finished" and "Mark as Skipped" toggles. **No webhook is available yet; rely on manual marking for now.**

**Evaluation runs on the client.** The unlock engine is a pure TypeScript function (`evaluateUnlocks(rules, progress, catalog)`) shared by client and server. In static mode it runs only in the browser; in server mode the server re-evaluates it for staff views and external APIs.

### 10.2 Persistence

Unlock state changes go through the `ProgressStore` (§6). With login, they are written to the database via server functions on every state transition. **All persistence is scoped to the active lecture/term.** A rune-based state class (`ProgressState` in `src/lib/state/progress.svelte.ts`) holds the local mirror for instant UI feedback (optimistic update, rollback on error); a re-sync happens on page focus via `invalidate('app:progress')`. Without login, the same state class persists to `localStorage` (today's keys, §29.3).

---

## 11. Exercise System

### 11.1 Exercise Plugin Integration (CodeBlocks)

The exercise system is powered by **CodeBlocks**, a prebuilt Vue 3 bundle (`codeblocks.umd.js`, maintained by the same team) that renders code editors, compiles Java in the browser (TeaVM javac → WASM in a web worker), runs Python (Pyodide) and hosts playground/quiz modules.

**How it works today:** each exercise folder has an `index.html` with an `elements` object. `content.js` turns it into DOM (task text, tabs, `<div codeblocks>` containers with `block`/`api`/`static`/`data`/`playground` children, generated from Java files with `//#START STUDENT|SOLUTION|STATIC|API` sections), then imports the UMD bundle, which scans the DOM and mounts its Vue apps. `autosave.js` restores saved code by writing into the block elements *before* the mount, and reads changes by scraping hidden textareas after the `codeblocks:mounted` event.

**Target integration:**

- An `<ExerciseView>` Svelte component renders the `elements` description (port of `content.js`'s `buildContent`) and mounts CodeBlocks into a DOM node it owns, using a Svelte **attachment** (`{@attach codeblocks(config)}`); the attachment's cleanup unmounts the Vue apps when the student leaves.
- The CodeBlocks bundle and the language runtimes stay vendored static assets (`static/js/`), loaded lazily only on exercise pages.
- The scraping workaround is replaced by an explicit API that CodeBlocks has to provide (**required CodeBlocks change**, tracked in §29). The platform implements the **bridge**:

```typescript
interface ExerciseBridge {
  // Called by CodeBlocks on mount — provides the plugin's API handle (today: 'codeblocks:mounted' event)
  onPluginReady(api: ExercisePluginAPI): void;

  // Called by CodeBlocks on edits (debounced) — updates the attempt's blocks
  onCodeChange(blocks: BlockMap): void;

  // Called when the student runs/compiles their code; always triggers a snapshot
  onCodeRun(blocks: BlockMap): void;

  // Called when compilation fails
  onCompileError(error: CompileError): void;

  // Called when tests run (or a quiz playground reports a result)
  onTestResult(results: TestResult[]): void;

  // Called when the student marks done inside the plugin UI, or a quiz is solved
  onMarkedFinished(): void;
}

interface ExercisePluginAPI {
  getBlocks(): BlockMap;                 // "<container>:<block>" → code (replaces textarea scraping)
  loadBlocks(blocks: BlockMap): void;    // replaces pre-mount DOM injection
  setReadOnly(readonly: boolean): void;
  setOverlay(host: Element, overlay: Overlay): void;   // exists today
}

type BlockMap = Record<string, string>;  // same shape as today's autosave records
```

- On mount, the platform calls `api.loadBlocks(attempt.blocks)` to restore the student's active **attempt** for the active lecture/term.
- `onCodeChange` updates `blocks` on the active attempt (debounced, no snapshot). Today's autosave interval (`AUTOSAVE_INTERVAL`, default 30 s), Ctrl/Cmd+S and save-on-`pagehide` are kept.
- `onCodeRun` writes a `CodeSnapshot` with `trigger: 'run'` and the current `exerciseVersion` in addition to updating the attempt.
- `onCompileError` writes a snapshot with `trigger: 'compile_error'` and the current `exerciseVersion`, and feeds the LLM hint system (see §18).
- `onTestResult` writes a snapshot with `trigger: 'test_run'` and the current `exerciseVersion`, and feeds the LLM hint system.
- **Transition:** until CodeBlocks exposes the API, the bridge is implemented by an adapter around today's `autosave.js` mechanics (pre-mount injection + textarea reading). Snapshots on run/compile error need the new events and are not available before that.

### 11.2 Exercise Overview Card

When a student enters an exercise POI (or opens an exercise from the list view or bulletin board), a card is shown **before** the plugin loads. The card design takes visual cues from the example shown in the design reference: a compact card with character illustration, pill-style topic tags, dot-scale difficulty indicator, and feature flags. **All data is scoped to the active lecture/term.**

```
┌─────────────────────────────────────────┬──────────┐
│  🗡️  BST Insertion                       │  [art]   │
│  Implement the insert method for a BST.  │          │
│  ─────────────────────────────────────  │          │
│  Difficulty:  ● ● ● ○ ○                 │          │
│  Version: e5f6g7h8... (May 20)          │          │
│                                         │          │
│  [🌿 Trees]  [🔁 Recursion]             └──────────┤
│                                                     │
│  ✓ Example Solution   ✓ Explanation                 │
│    Micro-tasks available                            │
│  ─────────────────────────────────────────────────  │
│  Type: [Suggested]    Status: In Progress           │
│  Lecture: CS101    Term: Summer 2026               │
│                                                     │
│  Attempts:                                          │
│  • "My first attempt"  (May 12)  ⚠️ v1.0  [ Load ]  │
│  • "After office hours" (May 14)  ✅ v2.0  [ Load ]  │
│                              [ + New Attempt ]      │
│                                                     │
│  [ Open Exercise ]  [ ✓ Mark Finished ]  [ Skip ]  │
└─────────────────────────────────────────────────────┘
```

Key points:

- **Description** is always shown — a single sentence from the exercise JSON.
- **Difficulty** is rendered as filled/empty dots (5-dot scale), not stars, to match the reference design.
- **Version indicator**: Shows the current exercise version hash and date. Attempts display their version with an icon:
  - ⚠️ = Outdated version (changelog available)
  - ❌ = Incompatible version (cannot load)
  - ✅ = Current version
- **Feature flags** (`hasSolution`, `hasExplanation`, `hasExperiments` — named as in today's `exercises.json`; labels "Beispiellösung", "Erklärung", "Experimente") are shown as checkmark lines when true; omitted when false. They hint at what the student will find inside the exercise.
- **Kind badge** with pixel-art icon (Vorlesungsbeispiel, Sandkasten, Übung, Test, Werkzeug — from `curriculum.types`) and the **role** in this term (Suggested/Optional/…).
- **Concept pills** use the concept icons; the main concept comes first.
- **"Mark Finished"** and **"Skip"** are always visible and always enabled, regardless of exercise type or current lock state (see §10.1).
- A attempt flagged `isLecturerSolution = true` is visually distinguished with a special border and label ("📖 Lecturer solution — May 14").
- **Lecture/Term indicator** shows which lecture and term the exercise belongs to.

### 11.3 Attempt Management

- Each `ExerciseAttempt` has a user-provided name (default: timestamp) **and is scoped to a lecture/term**.
- An attempt stores a **block map** (`"<container>:<block>" → code`), only for blocks that differ from the template — the format of today's IndexedDB autosave records. An exercise page can contain several CodeBlocks containers with several editable blocks each, so "the code" is never a single string.
- Without login there is exactly **one implicit attempt per exercise** (today's behavior, IndexedDB store `solutions`, key = exercise `uuid`). With login, the local record becomes the first attempt on import (§29.3).
- **Download / Upload** (exists today as "Herunterladen"/"Hochladen" in the menu): an attempt can be exported as a `lernwerk-solution` JSON file (`{type, version, exercise:{uuid,title,checksum}, exportedAt, blocks}`) and imported again. Upload rejects files of another exercise (`uuid` mismatch) and warns on a checksum mismatch (= outdated version, §5.3). "Zurücksetzen" starts a fresh attempt from the template.
- Each attempt records the `exerciseVersion` it was last saved with.
- Students can rename attempts inline.
- Loading an attempt calls `api.loadBlocks(attempt.blocks)` in the plugin and **checks for version mismatches** (see §5.3).
  - If the attempt’s version is **incompatible**, the student cannot load it and must start a new attempt.
  - If the attempt’s version is **outdated**, the student sees a changelog notification.
- An attempt flagged `isLecturerSolution = true` is visually marked with a special border/badge ("📖 Shared by lecturer in lecture on May 14").
- Attempts are soft-deleted (hidden from UI, retained in DB).

### 11.4 Exercise Unlock from External Source

If an exercise is hosted on a third-party server:

1. **No webhook available yet; rely on manual marking for now.**
2. The overview card provides manual "Mark as Finished" and "Mark as Skipped" toggles for the student.
3. Lecturers can also manually mark exercises as finished/skipped for students via the admin panel.

### 11.5 Code Tracking & Snapshots

To enable timeline reconstruction of how students develop their solutions, the platform takes periodic snapshots of the code inside each exercise attempt. This data is intended for future learning analytics — identifying patterns between students who succeed and those who get stuck — and is not surfaced to students directly. **All snapshots are scoped to a lecture/term and versioned.**

**Snapshot triggers:**


| Trigger         | When                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `periodic`      | Every 60 seconds while the student is actively editing (timer resets on inactivity)   |
| `run`           | Every time the student runs/compiles their code via the plugin                        |
| `compile_error` | When the plugin reports a compile failure (may coincide with `run`)                   |
| `test_run`      | When automated tests execute inside the plugin                                        |
| `attempt_end`   | When the student closes the exercise, navigates away, or the attempt becomes inactive |


**Storage:** Each `CodeSnapshot` record stores the full block map, the trigger type, the `exerciseVersion` at the time of the snapshot, and a precise `createdAt` timestamp.

**Snapshot schema:**

```sql
code_snapshots
  id, attemptId, userId, exerciseUuid, termId,
  blocks (jsonb),
  trigger (periodic | run | compile_error | test_run | attempt_end),
  exerciseVersion (text),  -- Hash of the exercise version --
  createdAt
```

Snapshots are only taken for logged-in users who **consented** to learning analytics (opt-in in the profile, §15.2); anonymous/static use never sends code to the server.

**Retention:** Snapshots are never automatically deleted. An admin can archive snapshot data for closed terms to a separate cold-storage table if needed.

**Privacy:** Snapshots are only accessible to the owning student (for their own attempt review) and to lecturer/admin roles (for analytics). No snapshot data is exposed in the student-facing UI; it runs silently in the background.

### 11.6 Exercise Kinds Beyond Code (exist today)

Besides code exercises, CodeBlocks playground modules provide non-executable **quiz exercises** (`common/quiz/`): Parsons puzzles (`puzzle.json`: lines, indent, ordering rules with messages), predict-the-output (`output.json`), matching (`matching.json`), and randomized number/graph tasks whose generated puzzle is stored locally (`lernwerk.numbers.<task>`, `lernwerk.graph.<task>`). Question pools from StudOn (local `studon/` exports) are being ported into this format.

- Quiz results are reported through `onTestResult` / `onMarkedFinished`, so a solved quiz can mark the exercise finished and award badges automatically.
- The random state of randomized quizzes becomes part of the attempt (a `data` block) so it survives device changes.
- Quizzes need no LLM hints; their rule messages are the hints.

### 11.7 Exercise Page Features (exist today)

The exercise page (rendered by `<ExerciseView>`) keeps today's features: tabs (`<tabbar>`), reveal boxes for hints and examples (`<hint>`, "Hinweis zeigen"), solution and explanation tabs, overlays with highlights/comments on code (`overlay.json`), experiments, the chapter breadcrumb, and the guided exercise tour (§22.8).

---

## 12. Live Coding Sessions

### 12.1 Concept

During a lecture, the lecturer can activate a **Sandbox Exercise** — a child content item of a lecture topic that has no own map POI and is listed in the lecture overview card. **Sandbox exercises are scoped to a lecture/term.** Students can:

- Open the sandbox from the castle on the island (today sandboxes are listed there as "Sandkasten", ~22 exist in `modules/gdi/`).
- Open it directly via a **deep link** embedded in a slide (see §12.5) — clicking the link opens the coding view in a new tab without requiring the student to navigate the island.
- Code in the Vue exercise plugin as normal.
- Optionally share their result anonymously for presentation or review.

The exercise coding view itself is intentionally **clean** — it shows no student counts, no submission tallies, no peer data. All metrics and review tooling live exclusively on a separate lecturer page.

### 12.2 Architecture

Live coding uses **Server-Sent Events (SSE)**:

- **Student side:** A "Share for Presentation" or "Submit for Review" button calls a server function that upserts their attempt with `sharedForPresentation = true` and the appropriate `shareMode` **for the active lecture/term**.
- **Lecturer review page:** A `+server.ts` endpoint at `/api/terms/:termId/live/:sandboxId/stream` returns a `ReadableStream` (`text/event-stream`) with new submissions and aggregate statistics. This page is designed to run on a second screen or device.
- **Fan-out:** a single Node process keeps an in-memory pub/sub per sandbox; if the app is scaled to several instances, PostgreSQL `LISTEN/NOTIFY` distributes events. Live coding needs login (static mode has no live features).

```
Student submits → server function → DB write (lecture/term-scoped) → SSE broadcast
                                           → Lecturer review page updates
```

### 12.3 Lecturer Review Page (`/live/:sandboxId`)

This is a **separate page** from the coding view, intended for a second screen or a separate device during the lecture. Students are never redirected here; it is only accessible to lecturer+ roles. **The page is scoped to a lecture/term.**

**Statistics panel (top of page):**

```
Sandbox: "Cherry Picking Exercise"  — Lecture: CS101 — Term: Summer 2026

  Started: 42 students
  Submitted for presentation: 12
  Submitted for review: 8
  Not yet started: 5
  Current Exercise Version: e5f6g7h8... (May 20)
```

**Submission grid:**

- Cards for all shared submissions, grouped by mode (Presentation / Review).
- Each card shows:
  - Anonymous token (`Student #7`)
  - Submission time
  - Code preview snippet
  - **Exercise version** at the time of submission (with ⚠️ if outdated, ❌ if incompatible)
  - **"Activate"** button
- Submissions are sorted by most recent.

**Activate flow:**

1. Lecturer clicks "Activate" on a submission card.
2. A confirmation dialog warns: *"Your current code will be saved to your attempt before switching. Continue?"*
3. On confirm: the lecturer's current code (if any) is written to a new named attempt (`"Before Student #7 — 14 May"`).
4. The activated student's code is loaded into the lecturer's coding view.
5. The submission card is highlighted as "Currently showing."

### 12.4 Lecturer Coding View (`/live/:sandboxId/present`)

A full-screen coding view for the lecturer, optimized for screen sharing. It shows:

- The exercise plugin with the currently loaded code (their own or an activated student submission).
- The **current exercise version** in the top-right corner.
- A minimal floating toolbar: `[ My Code ▼ ]  [ Publish Solution ]  [ Clear ]`
- **No student metrics.** No submission counts. No peer indicators.

**Publish Solution flow:**

1. Lecturer clicks "Publish Solution."
2. A server function copies the lecturer's current code as a new `ExerciseAttempt` for every student who submitted (either mode) **in the active lecture/term**.
3. Each copied attempt is flagged `isLecturerSolution = true` with a timestamp label and the current `exerciseVersion`.
4. An SSE event broadcasts to all connected students in the lecture/term: *"📖 A lecturer solution is now available for this exercise (Version: e5f6g7h8...)."*
5. Students see a non-intrusive toast notification; the solution appears in their attempt list on next open.

### 12.5 Anonymity

- Shared submissions store `userId` server-side but the lecturer sees only anonymous tokens (e.g., `Student #7`).
- Token-to-user mapping is accessible to admins only (audit purposes).
- Students who did not submit receive no notification about other students' submissions.

### 12.6 Slide Deep Link

Slides can embed a direct URL to a sandbox exercise **for a specific lecture/term**:

```
https://learn.university.example/sandbox/:sandboxId?lecture=cs101&term=summer-2026
```

Clicking this link (e.g., from a link on a slide shown during the lecture):

- Opens the coding view in a new browser tab.
- If the student is not logged in, the sandbox still opens and works locally (local-first); only the share buttons ask for login (and return to the sandbox afterwards).
- The `?lecture=cs101&term=summer-2026` parameters ensure the student is taken to the correct lecture and term.
- If no `lecture` or `term` is specified, the link defaults to the **latest active term of the latest lecture** the student is enrolled in.
- The `?ref=slide` parameter is tracked so analytics can distinguish slide-entry from island-entry.
- This works identically to the "Find on Island → Teleport" feature in the list view (§14.4), except it opens the coding view directly rather than panning the map.
- **Existing links keep working:** slides and StudOn already link to static paths such as `/livecompile/modules/gdi/<chapter>/<exercise>/` (and older links to `/livecompile/<chapter>/<exercise>/` from before the move into `modules/`). The SvelteKit app serves or redirects these paths (`hooks.server.ts` / a redirect table generated from the catalog), so no slide has to be edited.

---

## 13. Badge & Achievement System

### 13.1 Badge Model

**Badges are term-specific.** Each badge is tied to a specific lecture/term, and students earn badges independently in each term they enroll in. However, when a student enrolls in a new term of a lecture they’ve taken before, their badges from previous terms of that lecture are **copied over** if the badge is available in the new term.

```typescript
Badge {
  id: string          // e.g., "tree-master"
  name: string        // e.g., "Tree Master"
  description: string
  imageUrl: string    // pixel art badge icon (from existing art set)
  exerciseId?: string // if auto-awarded on exercise completion
  termId: string      // Badges are term-specific --
  lectureId: string   // Belongs to a lecture --
}
```

**Note:** Badge images are **part of the existing art set** for v1. Upload functionality for custom badge images is planned for a future version.

### 13.2 Award Triggers

Badges can be awarded by:

1. **Automatic:** Exercise plugin hook (`onMarkedFinished`) triggers badge lookup for that exercise **in the active lecture/term**. If a badge is configured for the exercise in the term, it is awarded to the student for that term.
2. **Internal API call:** server functions called from the admin UI (scoped to a lecture/term).
3. **External API:** Authenticated POST to `/api/badges/award` (see §20.2) with a `lectureId` and `termId` parameter.

### 13.3 Badge Copying on Term Enrollment

When a student enrolls in a new term of a lecture they’ve taken before:

1. The system checks for **badges the student earned in previous terms of that lecture**.
2. For each badge, if the **same badge (by `id`) exists in the new term**, it is **copied** to the student's profile for the new term.
3. The student sees a notification: *"Your badges from [Previous Term] have been copied to this term!"*

### 13.4 Profile Page — Badge Display

On the student's profile page, badges are shown **grouped by lecture and term**:

```
┌─────────────────────────────────────────────────┐
│  🏆 My Badges                                    │
│  ─────────────────────────────────────────────  │
│  Filter: [All Lectures ▼]  [All Terms ▼]          │
│                                                 │
│  [CS101]                                        │
│    [Summer 2026]                                │
│      🥇 Tree Master    — awarded May 12, 2026      │
│      🥈 DFS Explorer   — awarded May 14, 2026      │
│    [Winter 2025]                                │
│      🥇 Tree Master    — awarded Jan 10, 2025      │
│      🥈 DFS Explorer   — awarded Jan 12, 2025      │
│                                                 │
│  [CS201]                                        │
│    [Summer 2026]                                │
│      🥉 Sorting Star   — awarded Jun 1, 2026       │
└─────────────────────────────────────────────────┘
```

- Badge pop animation on first award (custom particle burst, coin-collect sound optional).
- Badges are private at this stage (no public profile URL).

---

## 14. Exercise List View (Non-Game Mode)

### 14.1 Purpose

A fully-featured list of all exercises **for the active lecture/term**, always accessible from the nav. Students who prefer a structured overview, or who are on mobile, use this as their primary interface. The list is also the primary view on mobile devices where the island canvas is unavailable.

This view exists today as the **Übungsplaner** (`uebersicht.html` + `uebungsplaner.js`): cards and table view, faceted filters, concept self-assessment and a recommendation order (§14.6). It is today's **default entry page**; the map is reached from it. The Svelte port (`src/routes/[lecture]/[term]/uebungen/+page.svelte`) keeps its behavior and URL parameters (`?concept=`, `?chapter=`, `?showDrafts`, `?showHidden`, `?tour`).

### 14.2 Layout & Card Design

Despite being a "list," the UI must be whimsical — not a plain table. Cards are arranged in a responsive grid (2 columns on tablet, 3 on desktop, 1 on mobile). Each card is designed to match the reference card design:

```
┌─────────────────────────────────┬──────────────┐
│  BST Insertion                  │  [character  │
│  Implement the insert method    │   art /      │
│  for a binary search tree.      │   topic art] │
│                                 │              │
│  Difficulty:  ● ● ● ○ ○         └──────────────┤
│  Version: e5f6g7h8... (May 20)                │
│                                               │
│  [🌿 Methods]  [🔧 Operations]                │
│                                               │
│  ✓ Example Solution   ✓ Explanation           │
│  ─────────────────────────────────────────    │
│  [Suggested]  [Lecture 3]  [⚠ Locked]        │
│  CS101 — Summer 2026                           │
│                                               │
│  [ Open ]  [ Find on Island 🗺 ]              │
└───────────────────────────────────────────────┘
```

- Topic tags are pill-shaped with a small emoji icon from the topic's icon set.
- Difficulty is shown as filled/empty dots.
- **Version indicator**: Shows the current exercise version hash and date.
- Feature flags (`✓ Example Solution`, `✓ Explanation`, `✓ Micro-tasks`) are shown as a single line when present.
- A **"Lecture example"** tag appears on exercises that are linked to at least one sandbox (i.e., were used in a live lecture session).
- Locked exercises render with a desaturated, frosted-glass style and a lock icon overlay. The card content is still visible (not blurred) — the lock is purely cosmetic signaling; students can open any exercise from the list regardless (self-service bypass, §10.1).
- **Lecture/Term indicator** shows which lecture and term the exercise belongs to.

### 14.3 Filter Controls

All filters use checkboxes and dropdowns — no natural language input. **All filters are scoped to the active lecture/term.**


| Filter                          | Type                   | Options                                                                  | Today |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------ | ----- |
| Scope (recommendation)          | Segmented control      | Passt zu mir, Thema bekannt, Nächster Schritt, Alle (§14.6)              | ✓     |
| Kind                            | Multi-checkbox         | Vorlesungsbeispiel, Sandkasten, Übung, Test, Werkzeug                    | ✓ ("Typ") |
| Role                            | Multi-checkbox         | Mandatory, Suggested, Optional, Sandbox                                  | new   |
| Chapter / Island                | Single select dropdown | All chapters of the term                                                 | ✓     |
| Concepts                        | Multi-checkbox         | All concepts (with icons)                                                | ✓     |
| Difficulty                      | Multi-checkbox         | 1–5 ("Level")                                                            | ✓     |
| Status                          | Multi-checkbox         | Locked, Unlocked, In Progress, Finished, Skipped                         | partly ("Erledigte ausblenden") |
| Version Status                  | Multi-checkbox         | Current Version, Outdated Version, Incompatible Version                  | new   |
| Has feature                     | Multi-checkbox         | Beispiellösung, Erklärung, Experimente, Neu                              | ✓     |
| Only heard / focus shaky        | Toggles                | Only chapters already heard; prefer concepts marked "unsicher"           | ✓     |
| Search                          | Text                   | Title, description, kind, chapter, concept labels (diacritics-insensitive) | ✓   |
| Lecture                         | Single select dropdown | All lectures the user is enrolled in                                     | new   |
| Term                            | Single select dropdown | All terms the user is enrolled in for the selected lecture               | new   |

Sort orders: recommendation (default), chapter, difficulty, title. Views: cards and table. Filter state is reflected in the URL so filtered lists can be linked (e.g., from slides: `?concept=schleifen`).

### 14.4 Teleport Links

Each exercise card has a **"Find on Island"** button:

- If the student has discovered that island **in the active lecture/term**: teleports them to the world map, camera pans to the exercise POI, character walks to it.
- If not yet discovered (fog of war): the button shows a fog icon with tooltip "Not yet discovered — but you can still open the exercise here."
- On mobile, the "Find on Island" button is hidden (no canvas available) and replaced with a simple "Open" button.

### 14.5 Content Flow Context

An optional toggle on each card shows the content flow context as a brief caption:

- "Suggested after viewing Island 4 content."
- "Completing this contributes to unlocking the next island."
- "Mandatory for Island 3 departure."
- **"New version available!"** (if the exercise has been updated since the student last opened it).

### 14.6 Concept Self-Assessment & Recommendations (exists today)

The Übungsplaner contains a lightweight learner model that was not part of v0.7 and is kept:

- **Last heard lecture:** the student picks the last lecture they attended (`lastHeard`). All concepts introduced up to that chapter default to "kann ich".
- **Per-concept override:** ✕ neu für mich · ? unsicher · ✓ kann ich · ★ sicher.
- **Analysis per exercise:** unknown concepts, shaky concepts, "ready" (no unknown concepts), main concept learned, already heard, done.
- **Scopes:** *Passt zu mir* (ready), *Thema bekannt* (main concept known), *Nächster Schritt* (exactly one new concept), *Alle*.
- **Scoring:** ready first, then exercises that train shaky concepts, then recent lectures; confident-only and done exercises sink; tools sink.
- **Reason line** on every card ("Braucht noch: Arrays", "Übt Schleifen – da bist du unsicher", "Aus deiner letzten Vorlesung", …).

Evolution:

- The model moves into a shared TypeScript module (`src/lib/learner/`) used by the list view, the map's "next goal" (`N`) and the bulletin board, so all three recommend the same next exercise.
- With login, the assessment is stored as `ConceptAssessment` per lecture (survives term changes, unlike progress). `lastHeard` can be **derived from the term schedule** (lecture dates) as a default, and overridden by the student.
- Finished/skipped exercises and passed quizzes may later *suggest* raising a concept's level (never change it silently).
- Aggregated (anonymous) assessments give lecturers a "which concepts feel shaky" view per term (§28.3 analytics).

---

## 15. User Profiles & Roles

### 15.1 Roles

```
admin
  └── lecturer
        └── tutor
              └── student
```

Each role can do everything a child role can do, plus additional capabilities. **All permissions are scoped to lectures/terms where applicable.**


| Capability                                                        | student | tutor        | lecturer | admin |
| ----------------------------------------------------------------- | ------- | ------------ | -------- | ----- |
| View own progress                                                 | ✓       | ✓            | ✓        | ✓     |
| View all student progress (in assigned lectures/terms)            | &nbsp;  | ✓            | ✓        | ✓     |
| Mark exercise as skipped (for student in assigned lectures/terms) | &nbsp;  | ✓            | ✓        | ✓     |
| Award badges manually (for assigned lectures/terms)               | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Create / edit content (islands, POIs)                             | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Clone terms                                                       | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Lock/unlock terms                                                 | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Assign tutors to lecture/terms                                    | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Manage users, roles                                               | &nbsp;  | &nbsp;       | &nbsp;   | ✓     |
| View live coding dashboard (for assigned lectures/terms)          | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Publish lecturer solutions (for assigned lectures/terms)          | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Use external badge API                                            | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Edit curricula and term schedules (via UI)                        | &nbsp;  | &nbsp;       | ✓        | ✓     |
| Register / sync exercise modules                                  | &nbsp;  | &nbsp;       | &nbsp;   | ✓     |
| View exercise changelogs                                          | ✓       | ✓            | ✓        | ✓     |
| Archive/export term data                                          | ✓ (own) | ✓ (assigned) | ✓        | ✓     |


### 15.2 Profile Editor

The profile page is styled as an in-game character card:

- Avatar: choose from a set of pixel-art character sprites (or upload a small image, auto-pixelated).
- Display name.
- Pronouns (optional free text).
- Preferred language (for future i18n).
- Theme: one of the existing visual themes (§22.2, default "Abenteuer") plus an "ambient effects" toggle (particles on/off). Today stored in `lernwerk-theme` (localStorage); synced with login.
- Notification preferences.
- **Lecture enrollment:** List of lectures the user is enrolled in, with option to switch active lecture/term or enroll in new lectures/terms.
- **Tutor lecture/term assignments:** For tutors, a list of lectures/terms they are assigned to (read-only).
- **Badge display:** Filter badges by lecture and term (see §13.4).
- **Concept self-assessment** per lecture (§14.6).
- **Learning analytics consent** (opt-in) for code snapshots and hint logs (§11.5, §18.6).
- **Local data:** import data saved in this browser before login; clear local data (§29.3).

### 15.3 Data Privacy

- Profiles are private. No public URLs.
- Anonymous use (no login) stores everything only in the browser (`localStorage`, IndexedDB), as described in today's `datenschutz.html`. The privacy statement must be extended before any server-side storage goes live (accounts, attempts, snapshots, hints, LLM processing).
- Tutors and lecturers see student progress **only for their assigned lecture/term combinations** in aggregated views; individual progress is accessible only in the tutor/admin panel, not exposed to other students.

---

## 16. Term Signup & Active Term Management

### 16.1 Term Enrollment Flow

1. **Lecture Enrollment First:**
  - Students must first **enroll in a lecture** (e.g., "CS101") before they can enroll in its terms.
  - Lecturers/admins can **pre-enroll** students in lectures.
2. **Term Enrollment:**
  - If a student is **not enrolled in any active term of a lecture**, they are prompted to enroll in the **latest active term** of that lecture upon visiting it.
  - The prompt shows:
    - Term name (e.g., "Summer 2026")
    - Start/end dates (if available)
    - Enrollment deadline (if set)
    - Option to **enroll now** or **view other terms**.
3. **Enrollment Process:**
  - If the user enrolls in a term:
    - A `UserTerm` record is created with `role: 'student'` and `isActive: true`.
    - The system checks for **existing progress (attempts, discovery states) and badges** in previous terms of the **same lecture**.
    - If progress or badges exist, they are **copied to the new term** (see §16.2).
    - The user is redirected to the term's island world or list view.
4. **Multi-Lecture Support:**
  - Users can view all lectures they are enrolled in and enroll in multiple terms per lecture.
  - Lecturers/admins can enroll in any lecture/term without restrictions.

### 16.2 Progress and Badge Copying on Enrollment

When a student enrolls in a new term of a lecture they’ve taken before:

1. **Check for Existing Progress:**
  - The system queries for `ExerciseAttempt` and `DiscoveryState` records for the user in **previous terms of the same lecture**.
  - For each exercise in the new term that matches an exercise in a previous term (by `exerciseId`), the system:
    - Copies the latest `ExerciseAttempt` (if any) to the new term, preserving the `exerciseVersion`.
    - Copies the `DiscoveryState` for islands/POIs that exist in both terms.
2. **Check for Existing Badges:**
  - The system queries for `UserBadge` records for the user in **previous terms of the same lecture**.
  - For each badge, if the **same badge (by `id`) exists in the new term**, it is **copied** to the new term with the current timestamp.
3. **Exclusions:**
  - **Hint pools** are **not copied** (reset per term).
  - **Unlock states** are **not copied** (students must re-earn progress in the new term).
4. **Notification:**
  - The user sees a toast: *"We copied over your progress and badges from [Previous Term]!"*

### 16.3 Active Term Management

- **Default Active Term:**
  - For each lecture, the system defaults to the **latest active term** (highest `order` with `isActive = true`).
  - Users can override this in their profile settings **per lecture**.
- **Switching Terms:**
  - Users can switch their active term from:
    - Profile page (dropdown selector per lecture).
    - Term selector in the navigation bar.
  - Switching terms **does not** copy progress; it only changes the UI context.
- **Review Mode Terms:**
  - Terms in **review mode** are **not** considered active and do not appear in the default term selector.
  - Lecturers/admins can still access review mode terms via the admin panel.

### 16.4 Locked Terms

- **Locking a Term:**
  - Lecturers/admins can **lock** a term via the admin panel.
  - Locked terms are **read-only** for students:
    - Students can **view** their progress, attempts, and badges.
    - Students **cannot** edit attempts, mark exercises as finished/skipped, or interact with the island world.
  - Tutors/lecturers/admins can still view and manage data in locked terms.
- **Unlocking a Term:**
  - Locked terms can be unlocked to allow edits again.

### 16.5 Term-Specific Links

- **Default Behavior:**
  - Links without a `lectureId` or `termId` parameter (e.g., `/island`, `/exercises`) default to the user's **active term of their most recently visited lecture**.
  - If the user has no active term, they default to the **latest active term of the latest lecture** they are enrolled in.
- **Explicit Term Links:**
  - Links can include `lectureId` and `termId` parameters (e.g., `/island?lecture=cs101&term=summer-2026`).
  - If the specified term is **locked**, the user sees a read-only view with a notification: *"This term is locked. You can view your progress but cannot make changes."*
  - If the specified term does not exist, the link falls back to the latest active term of the lecture.

---

## 17. Glossary System

### 17.1 Structure

A glossary is a list of `GlossaryEntry` records:

```typescript
GlossaryEntry {
  id: string
  term: string          // e.g., "Binary Search Tree"
  shortDefinition: string
  body: Markdown string // rich text definition, rendered with mdsvex/markdown on the server (or at build time in static mode)
  concepts: ConceptId[]   // links to the module concepts (§2.3)
  relatedLectures: LectureId[]
  relatedExercises: ExerciseId[]
}
```

**Note:** Glossary entries are **global** and shared across all lectures/terms.

### 17.2 UI

- Accessible from the main nav as a "Tome" or "Codex" (pixel art book icon).
- A-Z index sidebar for quick navigation.
- Search bar with live filtering.
- Each entry page shows the definition, links to related lecture content, and cards for related exercises (with their difficulty, status, and **version** for the active lecture/term).
- Glossary terms can be linked inline from lecture notes and exercise descriptions using a `[BST](/glossary/bst)` syntax processed at render time.

### 17.3 In-Game Presence

A "Library" POI can optionally be placed on any island. Entering it opens the glossary filtered to that island's topic tags **for the active lecture/term**.

---

## 18. LLM Hint System

### 18.1 Overview

When the exercise plugin reports a compile error or failing tests, a **"Get a Hint"** button appears in the exercise UI. Hints are **gamified resources** — they are earned per island and managed through a hint economy rather than a flat per-session rate limit. **Hint pools are scoped to a lecture/term.** The hint request calls a server function (requires login) that:

1. Checks hint availability from the student's island hint pool **for the active lecture/term**.
2. Sends the error/test context + exercise metadata + **exercise version** to Ollama.
  - **Model selection:** The Ollama model is **configurable per lecture and term** (see §18.3).
  - **System prompt:** The system prompt is **customizable per lecture/term** (see §18.4).
3. Returns a **Socratic hint** — a question or nudge that points the student in the right direction without giving the solution.
4. Stores the hint, its full prompt context, and the **exercise version** with a precise timestamp (aligned with code snapshots for attempt timeline replay).

### 18.2 Prompt Design

The prompt includes **lecture/term-specific customizations**:

```
System:
{lectureSystemPrompt}  // Customizable per lecture/term

You are a helpful teaching assistant for the lecture "{lectureName}" (Term: {termName}).
You help students understand their mistakes by asking guiding questions.
NEVER provide the solution directly. NEVER write corrected code.
Respond with 1–3 short sentences maximum.

User:
Exercise: {exercise.title}
Lecture: {lectureId}
Term: {termId}
Exercise Version: {exerciseVersion}
Topics: {exercise.tags.join(', ')}
Difficulty: {exercise.difficulty}/5

Student code (abbreviated, last 1000 chars):
{code.slice(-1000)}

Error / failing tests:
{error.message || failingTests.map(t => t.name + ': ' + t.message).join('\n')}

Provide a Socratic hint.
```

When tests are available and failing, the test context is preferred over raw compile errors as it produces more targeted hints.

### 18.3 Per-Lecture/Term Model Selection

- **Configuration:** Each lecture and term can specify its own **Ollama model** (e.g., `llama3`, `mistral`).
- **Database Storage:**
  ```sql
  lecture_settings
    id, lectureId, defaultModel (text), defaultSystemPrompt (text)

  term_settings
    id, termId, model (text), systemPrompt (text)
  ```
- **Fallback:** If a term does not specify a model, it inherits from its lecture. If the lecture does not specify one, the system uses a global default.

### 18.4 Per-Lecture/Term System Prompts

- **Customization:** Lecturers can define a **custom system prompt** for their lecture or term, allowing them to tailor the hint style (e.g., more/less strict, specific pedagogical approaches).
- **Default Templates:** Default system prompts are provided for different lecture types (e.g., beginner vs. advanced).
- **Storage:** System prompts are stored in `lecture_settings` and `term_settings` tables.
- **Example:**
  ```
  // For a beginner-friendly term:
  "You are a patient and encouraging teaching assistant. Always provide gentle nudges and avoid jargon."

  // For an advanced term:
  "You are a rigorous teaching assistant. Assume the student has a strong foundation and challenge them to think deeply."
  ```

### 18.5 Hint Economy & Island Hint Pool

Hints are allocated per island per student **per lecture/term** via the `IslandHintPool` record. The pool works as follows:

**Initial allocation:** When a student first arrives on an island (landing port discovered) **in a lecture/term**, they receive **5 hints** to their island pool for that term.

**Earning more hints through optional exercises:** Each optional exercise on the island that the student opens grants a **time-gated** hint replenishment:

- The first 2 hints from a given optional exercise are available immediately on opening.
- Subsequent hints from the same optional exercise are time-gated: available one per 5 minutes, with the cooldown doubling after each hint used within the same optional exercise session (5 min → 10 min → 20 min → ...). This discourages "hint farming" while still rewarding engagement.
- These hints are drawn from the global island pool (shared limit of 10 per island **per lecture/term**).

**The Well — special replenishment structure:** The first suggested exercise on each island can be configured with a test. When a student passes that test, they may be awarded a badge (configured in the editor). That badge unlocks the **Well** — a special map structure on the island:

- The Well replenishes **1 hint per hour**, up to a maximum of **10 hints per island per lecture/term**.
- The Well is a visible POI on the island, but inaccessible (locked animation) until the badge is earned. On unlock, it plays a special particle effect.
- Only the first suggested exercise on each island participates in this mechanic; others award badges without Well logic.

**Suggested and mandatory exercises:** These draw from the island hint pool directly, with no added time gating beyond what the pool balance enforces. When the pool is empty, hints are unavailable until replenished by the Well.

**Summary table:**


| Hint source                              | Amount         | Timing           | Pool impact      |
| ---------------------------------------- | -------------- | ---------------- | ---------------- |
| Island arrival                           | 5              | Immediate        | Adds to pool     |
| Opening an optional exercise             | 2              | Immediate        | Draws from pool  |
| Further hints in same optional           | ∞ (gated)      | +5min / doubling | Draws from pool  |
| Well (unlocked by badge)                 | 1/hour, max 10 | Hourly           | Replenishes pool |
| Pool maximum per island per lecture/term | 10             | —                | —                |


### 18.6 Hint Storage & Timestamping

Each hint request is stored as a `HintEntry` record:

```sql
hints
  id, attemptId, userId, termId,
  promptContext (jsonb: { code, error, testResults, exerciseMetadata, exerciseVersion, modelUsed }),
  hintText (string),
  hintSource ('llm' | 'static'),
  exerciseVersion (text),  -- Version of the exercise at hint time --
  modelUsed (text),         -- Model used for this hint (for auditing) --
  createdAt
```

- `**promptContext**` stores the full input sent to the model — code state at the time of request, error or test output, exercise title, tags, lecture/term, and **exercise version**. This allows the prompt to be reviewed later alongside the code timeline.
- **Timestamp alignment:** Because both `CodeSnapshot` and `HintEntry` records use `createdAt` and `exerciseVersion`, a attempt timeline view can interleave snapshots and hints in chronological order for qualitative review by lecturers.
- A **"Show hint history"** toggle in the exercise UI shows all hints from the current attempt in order, each with a relative timestamp ("3 min into attempt") and the exercise version at the time.

### 18.7 Static Fallback Hints

If Ollama is unavailable (network error, model loading), the system falls back to the exercise's static hints — today the `<hint>` reveal boxes in the exercise's task HTML ("Hinweis zeigen"), extracted by the sync tool into `staticHints[]`. Static hints are served in order and marked `hintSource: 'static'` in storage. The UI renders them identically; the student is not told which source was used.

### 18.8 Guardrails

- Ollama is only reachable from the SvelteKit server; students never call it directly.
- The prompt is server-side only; the student sees only the hint text, not the prompt.
- The system never generates or displays code solutions. The system prompt prohibition is enforced server-side and cannot be overridden by client input.

---

## 19. Single Sign-On (SSO) Integration

### 19.1 Strategy

Better-Auth supports custom provider adapters. The university SSO integration will be built as a **SAML 2.0** or **OIDC** provider adapter depending on the university's system. **SSO login automatically enrolls the user in the default term of each lecture they are authorized for, if they are not already enrolled.**

### 19.2 Implementation Plan

0. **Phase 0 (today):** No accounts. All data local in the browser. Stays available as anonymous mode.
1. **Phase 1:** Email/password authentication via Better-Auth for development and testing (wired into SvelteKit through `hooks.server.ts`; session exposed as `event.locals.user`).
2. **Phase 2:** Add the university SSO adapter. Better-Auth session creation on successful SSO assertion.
  - On first SSO login, the user is **automatically enrolled in the default term of each lecture** they are authorized for (based on SSO group claims).
3. **Phase 3:** Optional: sync display name and email from SSO claims on every login.

### 19.3 Account Linking

- If a student previously registered with email/password and later logs in via SSO with the same email, accounts are merged automatically.
- Tutors and lecturers are provisioned via SSO group claims (e.g., `edu:role:tutor`).
- **Lecture/term enrollment:** SSO group claims can also include lecture/term assignments (e.g., `edu:lecture:cs101`, `edu:term:summer-2026`).

### 19.4 Configuration

SSO settings (entity ID, SSO URL, certificate) are managed via environment variables, not hardcoded. A dedicated admin UI page lists configured SSO providers and their status.

---

## 20. API Design

### 20.1 Internal API (SvelteKit `+server.ts` endpoints)

All internal routes are under `/api/` (`src/routes/api/**/+server.ts`). Protected by Better-Auth session cookies, checked once in `hooks.server.ts`. UI pages mostly use `load` functions and form actions/remote functions directly; the REST routes exist for the external API, for the map/editor clients and for tests. **All lecture/term-scoped routes accept optional `lectureId` and `termId` query parameters; if omitted, the user's active lecture/term is used.**

```
# Lecture Management
GET  /api/lectures                  — list all lectures (public info only)
GET  /api/lectures/mine             — list lectures the current user is enrolled in
POST /api/lectures/:lectureId/enroll — enroll in a lecture

# Term Management (Per Lecture)
GET  /api/lectures/:lectureId/terms — list all terms for a lecture
GET  /api/lectures/:lectureId/terms/mine — list terms the current user is enrolled in for a lecture
POST /api/lectures/:lectureId/terms/:termId/enroll — enroll in a term
POST /api/lectures/:lectureId/terms/:termId/activate — set as active term for the lecture

# World State (Per Term)
GET  /api/terms/:termId/world/state — current user's island/discovery state (term-scoped)
POST /api/terms/:termId/world/poi/:id/view — mark a POI as viewed (term-scoped)
POST /api/terms/:termId/world/exercise/:id/finish — mark exercise as finished (term-scoped)
POST /api/terms/:termId/world/exercise/:id/skip — mark exercise as skipped (term-scoped)

# Exercises (Global, Versioned)
GET  /api/exercises — list with filters (type, topic, lecture, status, term, version)
GET  /api/exercises/:id — single exercise metadata (global, with current version)
GET  /api/exercises/:id/versions — list all versions of an exercise

# Exercise Attempts (Per User Per Term, Versioned)
GET  /api/terms/:termId/attempts/:exerciseId — list attempts for exercise (term-scoped)
POST /api/terms/:termId/attempts/:exerciseId — create new attempt (term-scoped)
PUT  /api/terms/:termId/attempts/:exerciseId/:attemptId — update attempt (code, name, markedFinished) (term-scoped)
DEL  /api/terms/:termId/attempts/:exerciseId/:attemptId — soft delete attempt (term-scoped)
POST /api/terms/:termId/attempts/:exerciseId/:attemptId/migrate — migrate attempt to current exercise version (term-scoped)

# Badges (Per Term)
GET  /api/terms/:termId/badges — all badge definitions for a term
GET  /api/badges/mine — current user's awarded badges (with lecture/term grouping)
POST /api/terms/:termId/badges/award — award badge (lecturer+, term-scoped)

# Live Coding (Per Term)
GET  /api/terms/:termId/live/:sandboxId/stream — SSE stream (lecturer only, term-scoped)
POST /api/terms/:termId/live/:sandboxId/share — student shares result (term-scoped)
POST /api/terms/:termId/live/:sandboxId/publish — lecturer publishes solution (term-scoped)

# Glossary (Global)
GET  /api/glossary — list all entries (global)
GET  /api/glossary/:slug — single entry (global)

# Hints (Per Term, Versioned)
GET  /api/terms/:termId/hints/:attemptId — list hints for attempt (term-scoped)
POST /api/terms/:termId/hints/:attemptId — request new hint (rate-limited, term-scoped)

# Admin: Lecture Management
POST /api/admin/lectures — create new lecture (admin)
PUT  /api/admin/lectures/:lectureId — update lecture (admin)

# Admin: Term Management (Per Lecture)
GET  /api/admin/lectures/:lectureId/terms — list all terms for a lecture (lecturer+)
POST /api/admin/lectures/:lectureId/terms — create new term (lecturer+)
POST /api/admin/lectures/:lectureId/terms/:termId/clone — clone a term (lecturer+)
POST /api/admin/lectures/:lectureId/terms/:termId/lock — lock a term (lecturer+)
POST /api/admin/lectures/:lectureId/terms/:termId/unlock — unlock a term (lecturer+)
POST /api/admin/lectures/:lectureId/terms/:termId/publish — publish a term (lecturer+)
POST /api/admin/lectures/:lectureId/tutors/assign — assign tutor to lecture/term (lecturer+)

# Admin: Modules, Curricula, Schedules — see §26.3

# Admin: LLM Settings
POST /api/admin/lectures/:lectureId/settings — update lecture settings (model, system prompt)
POST /api/admin/terms/:termId/settings — update term settings (model, system prompt)

# Admin: Module Sync
POST /api/admin/modules/:moduleId/sync — re-read module files into the cache (admin or deploy API key)
```

### 20.2 External Badge API

Authenticated with an **API key** (`Authorization: Bearer <key>`) issued per integration. Keys are managed in the admin UI and stored as hashed values in the DB. **API keys can be scoped to a lecture/term.**

```
POST /api/ext/badges/award
Body: {
  "userId": "string (internal ID or university ID)",
  "badgeId": "string",
  "lectureId": "string",  // Required: lecture for the badge
  "termId": "string",     // Required: term for the badge
  "exerciseId": "string | null",
  "note": "string | null"
}
Response: { "awarded": true, "awardedAt": "ISO8601" }

GET /api/ext/badges/user/:userId
Query: ?lectureId=<lectureId>&termId=<termId>  // Required: filter by lecture/term
Response: { "badges": UserBadge[] }

POST /api/ext/exercises/complete
Body: {
  "userId": "string",
  "exerciseId": "string",
  "lectureId": "string",  // Required: lecture for the exercise
  "termId": "string"      // Required: term for the completion
}
Response: { "unlocked": UnlockCascadeResult }
```

### 20.3 Zod Schemas

All request/response bodies have corresponding Zod schemas in `src/lib/schemas/`. These are shared between `+server.ts` endpoints, form actions and remote functions to avoid duplication. Today's documentation-only schemas (`data/exercises.schema.ts`, `data/curriculum.schema.ts`) are their starting point and become executable (validated at sync time and in CI). **All schemas include `lectureId`, `termId`, and `exerciseVersion` fields where applicable.**

---

## 21. Database Schema (Drizzle / PostgreSQL)

### 21.1 Core Tables

```sql
-- Users (managed by Better-Auth, extended with platform fields)
users
  id, email, displayName, avatarUrl, pronouns, role,
  theme (text), ambientEffects (bool), analyticsConsent (bool), createdAt, updatedAt

-- Lectures (Courses)
lectures
  id, slug, name, description,
  createdAt, updatedAt

-- Terms (Per Lecture)
terms
  id, slug, name, description,
  lectureId,  -- Belongs to a lecture --
  order, status ('review' | 'signup' | 'active' | 'locked' | 'expired'),
  startDate, endDate, enrollmentDeadline, isDefault,
  createdAt, updatedAt

-- User-Lecture Enrollment
user_lectures
  id, userId, lectureId,
  enrolledAt, isActive,
  createdAt

-- User-Term Enrollment (Per Lecture)
user_terms
  id, userId, termId,
  role ('student' | 'tutor' | 'lecturer' | 'admin'),
  signedUpAt, isActive,
  createdAt

-- Tutor-Lecture-Term Assignments
tutor_assignments
  id, tutorId, lectureId, termId,
  assignedAt

-- Curricula (PRIMARY STORE, edited in the backend UI; today's data/curriculum.json is an import format)
curricula
  id, lectureId, termId (nullable),   -- termId null = lecture template; set = term snapshot --
  basedOnCurriculumId (nullable),     -- template the snapshot was copied from --
  updatedBy, createdAt, updatedAt

curriculum_chapters
  id, curriculumId, number (int), title, order,
  introducedConcepts (text[])         -- concept ids from registered modules --

curriculum_entries
  id, chapterId, order,
  moduleId, exerciseId (text),        -- ref as in curriculum.json --
  exerciseUuid (nullable)             -- resolved on save/sync; null = dangling --

lecture_modules
  lectureId, moduleId                 -- modules a lecture uses --

-- Term Schedule (PRIMARY STORE; today data/karte.json `lectures`/`homework`, imported once)
term_lectures
  id, termId, chapterNumber, nr, title, date, slidesUrl, pdfUrl

term_homework
  id, termId, chapterNumber, nr, topic, url, startsAt, dueAt

world_layouts
  id, termId,
  seed (int), generatorVersion (int),   -- pinned, see §9.1 --
  overrides (jsonb),          -- editor overrides: island names (village/castle), house lists, POI positions,
                              --   themes, painted tiles (§25) --
  layoutSig (text),           -- signature of the generated layout --
  status ('draft' | 'published'), publishedAt,
  createdAt, updatedAt

-- Islands (Per Term) — materialized from curriculum + layout on publish, for queries and staff views
islands
  id, termId, chapterNumber, slug, title, description, order,
  villageName, castleName, theme,
  boundsX, boundsY, boundsW, boundsH,
  isPublished, createdAt, updatedAt

-- POIs (Per Term)
pois
  id, islandId, termId,
  type (castle|house|village|volcano|port|well|library),
  tileX, tileY, label, isArrivalPort, isDeparturePort,
  unlockRequires (jsonb: unlock rule descriptor),
  createdAt, updatedAt

-- Content Items (Linked to POIs, Per Term) — slides/PDFs/videos/links; mostly derived from the schedule
content_items
  id, poiId, contentType (slides|notes|video|link|homework),
  title, description, url, isExternal, startsAt, dueAt,
  termId, createdAt

-- Module Registry (registration is primary data)
modules
  id, title, path, registeredAt, lastSyncAt, lastSyncReport (jsonb)

-- Module Cache (DERIVED from modules/<id>/exercises.json — rebuildable, never edited directly)
module_concepts
  id, moduleId, label, icon

module_exercises
  uuid (pk), id (text, unique, module-prefixed path), moduleId,
  title, description, difficulty (0-5),
  kind (lecture|sandbox|exercise|test|tool),
  tags (text[]),              -- concept ids, main concept first --
  hasSolution, hasExplanation, hasExperiments, isNew, isDraft, isHidden (bool),
  image, staticHints (text[]),
  version (text),  -- Current content checksum --
  syncedAt, removedAt (nullable)

-- Exercise Versions (cache of file history, but append-only: old hashes are never removed)
exercise_versions
  id, exerciseUuid,
  hash (text),  -- Version hash --
  changelog (text),  -- from exercises.json history --
  isIncompatible (bool),  -- from exercises.json history --
  firstSeenAt

-- Exercise Placements (Per Term)
-- Links exercises (global) to chapters/POIs (per term) and stores term-specific overrides
exercise_placements
  id, termId, exerciseUuid, chapterNumber, poiId (nullable),
  role (mandatory|suggested|optional|sandbox|content),   -- derived default, see §8.1 --
  roleOverridden (bool),
  badgeId (nullable),  -- Badge awarded for this exercise in this term --
  createdAt, updatedAt

-- Exercise Progress (Per User Per Term) — today's `done` set, plus skipped
exercise_progress
  id, userId, termId, exerciseUuid,
  state (in_progress|finished|skipped),
  updatedAt

-- Exercise Attempts (Per User Per Term, Formerly "Sessions")
exercise_attempts
  id, userId, exerciseUuid, termId, name,
  blocks (jsonb),             -- "<container>:<block>" → code, only changed blocks --
  isLecturerSolution (bool),
  sharedForPresentation (bool), shareMode (presentation|review),
  anonymousToken, hintCount,
  importedFromLocal (bool),   -- created from a browser autosave on first login --
  exerciseVersion (text),  -- Version of the exercise when last saved --
  createdAt, updatedAt, deletedAt

-- Code Snapshots (Per Attempt, Versioned)
code_snapshots
  id, attemptId, userId, exerciseUuid, termId,
  blocks (jsonb),
  trigger (periodic | run | compile_error | test_run | attempt_end),
  exerciseVersion (text),  -- Version of the exercise at snapshot time --
  createdAt

-- Hints (Per Attempt, Versioned)
hints
  id, attemptId, userId, termId,
  promptContext (jsonb: { code, error, testResults, exerciseMetadata, exerciseVersion, modelUsed }),
  hintText (string),
  hintSource ('llm' | 'static'),
  exerciseVersion (text),  -- Version of the exercise at hint time --
  modelUsed (text),         -- Model used for this hint (for auditing) --
  createdAt

-- World State (Per User Per Term) — today's lernwerk.karte.v1
user_world_state
  id, userId, termId,
  visitedIslands (int[]),     -- coarse discovery, used by logic --
  viewedContent (text[]),
  hero (jsonb: {c, r, dir}), ships (jsonb), zoom (int),
  layoutSig (text),
  fog (bytea),                -- RLE, opaque visual fog --
  updatedAt

-- Learner Model (Per User)
concept_assessments
  id, userId, lectureId, conceptId,
  level (unknown|shaky|known|confident),
  updatedAt

user_term_preferences
  id, userId, termId,
  lastHeardChapter (int, nullable),
  planner (jsonb),            -- view, sort, scope, filters --
  updatedAt

-- Badges (Per Term)
badges
  id, slug, name, description, imageUrl, exerciseId (nullable),
  termId, lectureId  -- Badges are term-specific and belong to a lecture --

-- User Badges (Per User Per Term)
user_badges
  id, userId, badgeId, termId,
  awardedAt,
  awardedBy ('system' | 'api' | userId)

-- Island Hint Pools (Per User Per Island Per Term)
island_hint_pools
  id, userId, islandId, termId,
  poolSize (number), available (number),
  wellUnlocked (bool), lastReplenishAt

-- LLM Settings (Per Lecture/Term)
lecture_settings
  id, lectureId,
  defaultModel (text),  -- Default Ollama model for the lecture --
  defaultSystemPrompt (text),  -- Default system prompt for the lecture --
  createdAt, updatedAt

term_settings
  id, termId,
  model (text),  -- Ollama model for the term (overrides lecture default) --
  systemPrompt (text),  -- System prompt for the term (overrides lecture default) --
  createdAt, updatedAt

-- API Keys (For External Badge/Completion API)
api_keys
  id, name, keyHash, scopes (text[]), lectureId (nullable), termId (nullable),
  createdBy, createdAt, revokedAt

-- Glossary (Global)
glossary_entries
  id, slug, term, shortDefinition, body (text/Markdown),
  concepts (text[]), createdAt, updatedAt

-- Glossary Relations (Global)
glossary_lecture_links   (entryId, islandId)
glossary_exercise_links  (entryId, exerciseId)
```

### 21.2 Indexes

- `user_lectures(userId, lectureId, isActive)` — fast lecture enrollment lookup
- `user_terms(userId, termId, isActive)` — fast term enrollment lookup
- `tutor_assignments(tutorId, lectureId, termId)` — fast tutor assignment lookup
- `exercise_progress(userId, termId, exerciseUuid)` — fast unlock cascade queries
- `user_world_state(userId, termId)` — map state lookup
- `exercise_attempts(userId, exerciseUuid, termId)` — attempt listing
- `user_badges(userId, termId, badgeId)` — profile badge display
- `exercise_placements(termId, chapterNumber, exerciseUuid)` — exercise placement
- `exercise_versions(exerciseUuid, createdAt)` — version history lookup
- `module_exercises(id)` (unique) — lookup by path id
- `curriculum_entries(exerciseUuid)` — dangling-ref checks after sync
- `concept_assessments(userId, lectureId)` — learner model
- `terms(lectureId, status, order)` — active term lookup per lecture
- `lectures(id)` — lecture lookup

---

## 22. UI/UX Design Language

### 22.1 Core Aesthetic

The UI must feel like a **game interface overlaid on an adventure world** — not a learning management system with a skin. Every component should earn its place visually. **Lecture/term context and attempt/version status are subtly indicated throughout the UI.**

**References:** Stardew Valley journal, Celeste pause menu, Fez map screen. Clean enough to read; playful enough to delight.

This describes the **default theme ("Abenteuer")**. The aesthetic is not hard-wired: the whole UI is themable (§22.2), and other themes can be calm, paper-like or dark while keeping the same layout and interactions.

### 22.2 Theming System

Theming exists today (`theme.js`, `css/themes.css`, `css/themes-uebersicht.css`) and carries over unchanged in concept. It is a foundation of the component library, not a skin added at the end.

**Themes shipped today:** Abenteuer (default), Klassisch, Heft, Karten, Terminal (dark), Raster, Tafel (dark green), Prisma.

**How it works:**

- A theme is a set of **design tokens** (CSS custom properties, today's `--lw-*` namespace): colors (`--lw-bg`, `--lw-surface`, `--lw-fg`, `--lw-accent`, `--lw-accent-fg`, …), typography (`--lw-font`, `--lw-font-head`, `--lw-mono`), shape (`--lw-radius-sm`, …), and component tokens (`--lw-btn-*`, `--lw-input-*`, card shadows, focus rings).
- The active theme is the `data-lw-theme` attribute on `<html>` (kept from today, so existing CSS keeps working). Each theme sets its tokens under `html[data-lw-theme="<id>"]` and may add a few characteristic details (e.g. pixel-offset shadows and the handwritten Caveat font in Abenteuer, ruled paper in Heft, chalk texture in Tafel).
- **Rule for all components:** Svelte components and shadcn-svelte primitives use **only tokens** — no hard-coded colors, fonts, radii or shadows. shadcn-svelte's own variables are mapped onto the `--lw-*` tokens once in `src/app.css`.
- **Theme registry** (`src/lib/themes/`): each theme is data — `{ id, name, hint, preview colors, isDark, stylesheet }` (today's `THEMES` array in `theme.js`). Adding a theme means adding a token stylesheet and a registry entry; no component changes.
- **Dark themes** declare `isDark`; components that need it (e.g. image treatments, the code editor's syntax palette) switch on `html[data-lw-dark]`.

**What follows the theme:**

| Area | How |
| ---- | --- |
| App shell, list view, cards, sheets, dialogs, menus | tokens via shadcn-svelte mapping |
| Exercise page incl. **CodeBlocks** editors, output, quizzes | theme stylesheets override CodeBlocks/CodeMirror and quiz styles (exists today for all themes) |
| Map HUD, overlays (castle scroll, house card, bulletin board), island name plates | Svelte components use tokens; canvas-drawn labels read tokens via `getComputedStyle` and redraw on theme change |
| Map world art | the pixel-art tiles stay the same in all themes (it is the "world"); themes may tint fog, sea-route lines and highlight colors through tokens |
| Particle effects (mythictree-fairydust) | palette taken from tokens (`--lw-accent`, …) |
| Guided tours, legal pages, admin UI and editors | same tokens |
| Charts/analytics (staff) | categorical/sequential palettes defined per theme |

**Selection and persistence:**

- Selected in the top-right menu (as today), with a preview swatch per theme; also in the profile.
- Applied **before first paint**: a tiny inline script in `src/app.html` sets `data-lw-theme` from a cookie (logged in, so SSR renders the right theme) or `localStorage` (`lernwerk-theme`, today's key) — no flash.
- New option **"Automatisch"**: follows `prefers-color-scheme` (light → Abenteuer, dark → Terminal).
- A lecture can set a **default theme** for new students and an **accent color** (§22.3); the student's own choice always wins.

**Quality gates:**

- Every theme must meet WCAG AA contrast for text and UI states; a CI check computes contrast for each theme's token pairs.
- Playwright visual snapshots of key screens (list, exercise page, map with HUD, changelog modal) per theme.
- State indicators never depend on color alone (§22.7), so they survive any theme.

### 22.3 Lecture/Term Context UI

- **Lecture/Term Indicator:** A subtle banner or badge in the top-right corner shows the **active lecture and term** (e.g., "CS101 — Summer 2026").
- **Lecture/Term Switcher:** A dropdown in the navigation bar allows users to switch lectures and terms.
- **Locked Term Notifications:** If a user is viewing a locked term, a persistent notification bar appears: *"This term is locked. You can view your progress but cannot make changes."*
- **Lecture-Specific Styling:** Each lecture can set an **accent color** (e.g., CS101 = blue, CS201 = green) that is layered over the active theme as `--lw-lecture-accent` (used for the lecture badge, switcher and map flags); themes decide how strongly it shows. A lecture can also set the default theme for new students.

### 22.4 Attempt/Version Status UI

- **Attempt Terminology:** All student-facing references to "sessions" are replaced with **"attempts"** (e.g., "New Attempt", "Load Attempt", "My Attempts").
- **Version Indicator:** The current exercise version is displayed in the exercise overview card and list view (e.g., "Version: e5f6g7h8... (May 20)").
- **Outdated Attempt Icon:** Attempts created for an older version of an exercise display:
  - ⚠️ = Outdated version (changelog available)
  - ❌ = Incompatible version (cannot load)
  - ✅ = Current version
- **Changelog Button:** A "View Changelog" button appears on outdated/incompatible attempts and exercises with recent changes.
- **Notification Toast:** Students receive a one-time notification per exercise per login session if the exercise has been updated since their last attempt activity (see §5.6).

### 22.5 Particle & Interactive Effects

All particle and interactive ambient effects are powered by **mythictree-fairydust**, the custom particle engine. It runs as a standalone `<canvas>` overlay (`pointer-events: none`) on non-game pages, and is integrated directly into the main world canvas in the game view.

Effects catalogue:

- **Ambient particles:** Fireflies on islands at night, leaf drift in forest regions, gentle sparkle on the ocean.
- **Mouse trail:** Small sparkles follow the cursor on non-game pages.
- **Fog lift:** Dissolve-particle burst when a new island is discovered (island-based fog).
- **Badge pop:** Confetti + glow burst on badge award, with optional coin-collect sound.
- **Port unlock:** Ripple + sparkle cascade when a departure port opens.
- **Well unlock:** Rising water-particle effect with glow bloom.
- **Hint grant:** Small firefly-style particles drift from the hint button when a new hint becomes available.
- **Version update:** A subtle "pulse" effect on exercise cards when a new version is available.

All effects respect `prefers-reduced-motion`: when set, mythictree-fairydust skips particle emission entirely and Svelte transition durations drop to near-zero.

### 22.6 Svelte Transitions & Motion

Implemented with `svelte/transition` (`fade`, `fly`, `scale`, `crossfade`), `svelte/animate` (`flip` for list reordering when filters change) and the `Spring`/`Tween` classes from `svelte/motion`. A small wrapper reads `prefersReducedMotion.current` (from `svelte/motion`) and shortens all durations. Page transitions use the View Transitions API via `onNavigate`.

- Page transitions: crossfade with slight upward translate.
- Content Card entry: spring slide-up from bottom.
- List view card reveal: staggered fade-in on load.
- Badge award modal: scale spring pop.
- Bulletin board open: fan-out card animation (cards fly in from center).
- Exercise overview card: spring scale-in from card center.
- **Lecture/Term switch transition:** Smooth fade-to-black and fade-in when switching lectures/terms.
- **Changelog modal:** Slide-in from the right with a subtle bounce.

### 22.7 Accessibility

Accessibility is a first-class concern, not an afterthought. The platform must be fully usable on tablets (the primary device in labs) as well as desktops.

- All interactive elements have visible focus rings (custom pixel-style ring, 3px offset).
- ARIA labels on all icon-only buttons and canvas interactive zones.
- Color is never the sole indicator of state — every state uses icon + text label + color together.
- `prefers-reduced-motion`: disables mythictree-fairydust entirely; Svelte transition durations reduce to 50ms.
- **Keyboard navigation in game view:** WASD / arrow keys for movement; `Enter` (or `E`) to interact with nearest POI; `Escape` to close cards; `N` next goal, `H` port, `L` island list, `?` help (all exist today); `Tab` cycles between interactive POIs on the current island (new).
- The map canvas has `role="application"` and an ARIA live region that announces location changes and unlocks (exists today).
- A skip link and a published accessibility statement (`barrierefreiheit.html`) exist today and are kept.
- **Touch targets on tablet:** All interactive elements (POI tooltip, card buttons, filter chips) are minimum 44×44px touch targets.
- **Tap-to-move on canvas:** Single tap on a tile moves the character to that position; double-tap on a POI triggers immediate interaction.
- Screen reader support for list view, profile, glossary, and all modal cards. The game canvas itself is not screen-reader navigable, but all game content is accessible via the list view as an equivalent alternative.
- Focus trap in all modals and sheet panels.
- All localization strings (via mythictree-rosetta) support right-to-left layout switching.

### 22.8 Guided Tours (exist today)

`tour.js` provides two guided tours with hand-drawn SVG highlight rings: one for the Übungsplaner and one for an exercise page; they start automatically on the first visit, can be restarted with `?tour`, and continue across pages. They become a Svelte `<Tour>` component with tour definitions as data; a third tour for the map replaces today's help dialog on first visit.

---

## 23. Responsive Breakpoints & Device Strategy


| Breakpoint       | Devices                            | Available Views                                              |
| ---------------- | ---------------------------------- | ------------------------------------------------------------ |
| `sm` < 640px     | Mobile phones                      | List view, glossary, profile, content cards only             |
| `md` 640–1024px  | Tablets (portrait)                 | Island canvas (touch controls) + list view + exercise plugin |
| `lg` 1024–1280px | Tablets (landscape), small laptops | Full island + list view + exercise plugin                    |
| `xl` > 1280px    | Laptops, desktops                  | Full island + list view + side panel + exercise plugin       |


### Mobile (`sm`)

- The island canvas and exercise coding view are **not available** on mobile. The coding plugin requires a screen large enough to see code, output, and task description simultaneously; phones are explicitly out of scope for coding. **Exception:** quiz exercises without a code editor (Parsons, matching, predict-the-output, §11.6) are usable on phones and stay available.
- The bottom nav shows: Home (list), Exercises, Glossary, Profile, **Lectures**.
- Content cards, the bulletin board, exercise overview cards, and the badge profile are fully accessible.
- Students can mark exercises as Finished or Skipped from their mobile device.
- Live coding share flow is **not** available on mobile (no coding view to submit from).
- **Lecture/term enrollment** and **attempt/version changelog viewing** are fully supported on mobile.

### Tablet (`md` / `lg`)

- The island canvas renders and is the default view. Movement uses **tap-to-move** (tap a destination tile) or **touch-drag** (drag the character directly). A virtual D-pad overlay is available as an option in settings.
- POI interaction is triggered by tapping the proximity tooltip bubble that appears when the character is near a POI.
- The Content Card / Exercise Overview slides over the canvas as a bottom sheet.
- The exercise coding plugin is fully supported. The plugin must be verified to be usable at `md` breakpoint widths (~768px); if not, a minimum width warning is shown.
- The Map Editor (`/admin/[lecture]/[term]/map`) is available on tablets in landscape orientation only. Tile painting uses touch with a tool-toggle sidebar adapted for touch targets.
- **Lecture/term switcher** is available in the navigation sidebar.
- **Version indicators** and **changelog modals** are fully functional.

### Desktop (`xl`)

- Full experience: island canvas, side panels, list view, editor.
- The exercise coding plugin has adequate space for task description + code editor + output panel side by side.
- **Lecture/term switcher** is available in the top navigation bar.
- **Version status** is prominently displayed in exercise cards and overview panels.

---

## 24. Infrastructure & Docker Stack

### 24.1 Services

```yaml
# docker-compose.yml (abbreviated)
services:

  app:
    build: .
    image: learning-env:latest
    ports: ["3000:3000"]
    environment:
      ORIGIN: https://learn.university.example   # required by adapter-node (CSRF checks for form actions)
      PORT: 3000
      BODY_SIZE_LIMIT: 1M
      DATABASE_URL: postgres://...
      BETTER_AUTH_SECRET: ...
      OLLAMA_BASE_URL: http://ollama:11434
      PUBLIC_LERNWERK_MODE: server               # 'static' builds have no server features
      PUBLIC_DEFAULT_LECTURE: gdi                # Optional: default lecture for new users
      PUBLIC_AUTOSAVE_INTERVAL: 30               # seconds, today's AUTOSAVE_INTERVAL in .env
      LERNWERK_MODULES: gdi=/app/content/modules/gdi   # modules auto-registered on startup
    depends_on: [db, ollama]
    volumes:
      - ./modules:/app/content/modules:ro        # Exercise modules (source of truth for exercises)

  db:
    image: postgres:16-alpine
    volumes: ["pg_data:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: learning_env
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ...

  ollama:
    image: ollama/ollama:latest
    volumes: ["ollama_models:/root/.ollama"]
    # No ports exposed to host — internal network only
    # Pull desired model on first start via entrypoint script

  caddy:  # or nginx
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

volumes:
  pg_data:
  ollama_models:
  caddy_data:
```

### 24.2 Environment Variables

All secrets managed via `.env` files (not committed). A `.env.example` is provided in the repository with all required keys documented, including:

- `PUBLIC_DEFAULT_LECTURE`: The default lecture for new users (optional).
- `PUBLIC_LECTURE_THEMES`: JSON object mapping lecture IDs to accent colors (optional).
- `PUBLIC_LERNWERK_MODE`: `static` or `server` (§6).

Note: today's `.env` is fetched by the browser at runtime and therefore public; in SvelteKit only `PUBLIC_*` variables reach the client, everything else stays on the server.
- `LERNWERK_MODULES`: modules registered automatically on startup (`id=path,…`); further modules are registered in the admin UI.

### 24.3 Migrations

Drizzle migrations run automatically on container start (`drizzle-kit migrate`). A `--dry-run` mode is available for inspection before applying in production. **Migrations include all lecture/term-related tables, exercise version tables, and backend abstraction tables.**

### 24.4 Asset Hosting

Static assets are served from SvelteKit's `static/` directory: the language runtimes and libraries (`js/`: CodeBlocks, TeaVM, Pyodide, Skulpt, three.js, d3, …), the tilemap art (`assets/`), fonts, and icons. These are large (tens of MB) and versioned by folder (`teavm/v102`, `python/v103`), so they get long-lived cache headers. Exercise folders are served from the mounted `modules/` volume. For larger deployments, these can be moved behind a CDN by setting `PUBLIC_ASSET_BASE_URL`.

**Licensed assets:** some scene images are licensed (Freepik) and must not be in the public repository; they are shipped separately (`lernwerk-licensed-assets.zip`, unpacked by `tools/licensed-assets.mjs extract`). The Docker build unpacks them from a build secret/volume. The CodeBlocks tilemap art is CC BY-NC 4.0 — attribution in `THIRD-PARTY-NOTICES.md` must stay reachable from the UI.

**Badge Images:** For v1, badge images are **part of the existing art set** and served from `static/assets/badges/`. Upload functionality for custom badge images is planned for a future version.

### 24.5 Static Build (transition & fallback)

`PUBLIC_LERNWERK_MODE=static npm run build` with `adapter-static` produces a folder that can be copied to today's web server (`gdi.cs.fau.de/livecompile/`) with a configured `paths.base`. All pages are prerendered from the content files; progress stays in the browser exactly as today. This keeps the public site running during the migration and remains a supported deployment for anyone who wants Lernwerk without accounts.

### 24.6 Backups

A companion `backup` service runs `pg_dump` on a cron schedule and deposits encrypted archives to a configured mount point. Restore scripts are included in `/scripts/restore.sh`. **Backups include all lecture/term data, exercise versions, and user progress.**

---

## 25. Map Editor & Content Authoring

### 25.1 Overview

The backend UI for lecturers has two parts:

- **Curriculum Editor** (`/admin/[lecture]/curriculum`, §25.3a): creates and edits lectures, chapters, concept introductions and exercise assignments. This replaces hand-editing `data/curriculum.json`.
- **Map Editor** (`/admin/[lecture]/[term]/map`): adjusts the generated island world of a term — names, house selection, POI positions, themes, decorations — and binds content (schedule, homework, badges, unlock rules) to POIs.

Both are accessible to **lecturer** and **admin** roles. **The editors are lecture/term-aware: lecturers can edit the draft version of any term they have access to, within any lecture they own.** Exercises themselves are not edited here — they come from module files (§4).

The editors are routes within the same SvelteKit application, protected by the role guard in `hooks.server.ts` and a `+layout.server.ts` check. The map editor reuses `@lernwerk/world` in an authoring mode.

### 25.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│          /admin/[lecture]/[term]/map  (+page.svelte)            │
│                                                                  │
│  ┌──────────────┐  ┌────────────────────────────────────────┐   │
│  │  Lecture     │  │   <WorldCanvas mode="edit">            │   │
│  │  [GdI ▼]     │  │   generated world + overrides          │   │
│  └──────────────┘  │   pan / zoom / move POIs / paint       │   │
│  ┌──────────────┐  └────────────────────────────────────────┘   │
│  │  Term        │  ┌────────────────────────────────────────┐   │
│  │  [SoSe 26 ▼] │  │  Inspector Panel (right rail)          │   │
│  └──────────────┘  │  island props / POI props /            │   │
│                     │  exercise linker (term-scoped)         │   │
│                     └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │  form actions / remote functions (lecture/term-scoped)
         ▼
   PostgreSQL (curricula, layouts)  ←  Module Registry (cached module files)
```

The editor state lives in a dedicated rune-based class (`EditorState` in `src/lib/editor/editor.svelte.ts`, holding the draft overrides and the undo stack) that is completely separate from the student game state. All saves are explicit (no auto-save — a "Save" button commits changes) with an optional "Publish" step that makes changes visible to students.

**Draft / Published split:** the world layout of a term (`world_layouts`) exists as **draft** and **published**. The editor always works on the draft for the selected lecture/term. "Publish" copies draft → published and materializes islands/POIs. Students always see the last published version; they are never shown works in progress.

### 25.3 Lecture/Term Selection in Editor

- The editor opens with a **lecture selector** dropdown in the top-left corner.
- After selecting a lecture, a **term selector** dropdown appears for that lecture.
- Lecturers can only edit lectures they own and terms they have access to.
- Tutors can only edit terms they are assigned to.
- The editor **cannot** edit locked or expired terms.

### 25.3a Curriculum Editor

The curriculum is edited as a list, not on the map:

```
GdI — Curriculum (Vorlage)          [ Import JSON ] [ Export JSON ]
──────────────────────────────────────────────────────────────────
Modules used:  [gdi ✓]  [+ Modul hinzufügen]

▾ Kapitel 0  Einführung OOP                          [⋮]
    Concepts introduced:  [grundlagen ×] [+]
    Exercises:  ⠿ 📖 gdi/00_einfuehrung/beispiel_universum
                ⠿ ✏️ gdi/00_einfuehrung/nachricht
                ⠿ 🧩 gdi/00_einfuehrung/anordnen
                [ + Übung aus Modul suchen … ]
▸ Kapitel 1  Variablen
▸ Kapitel 2  Operationen
   ⊕ Neues Kapitel
```

- Exercises are picked from the module registry (search by title, concept, kind; drafts/hidden shown with a marker); drag handles reorder exercises and chapters.
- Editing the **template** affects future terms only. Editing a **term's curriculum** (same UI, opened from the term) changes the running term; if this removes exercises students already worked on, a confirmation lists the affected counts (their data is kept and visible in "Archiv" in the list view).
- The **schedule** (lecture dates, slides and PDF links, homework topic/link/start/due per chapter — today `data/karte.json`, generated by `tools/karte-kursdaten.mjs`) is a table view of the same term, with a CSV/JSON import for bulk dates.
- Validation as in §4.4; saving is blocked while refs are dangling.
- **Import:** `data/curriculum.json` + `data/karte.json` → lecture "GdI", term "SoSe 2026" (one-time migration, §29).

### 25.4 Canvas & Coordinate System

The world is **generated** (§9.1); the editor does not start from an empty ocean. It shows the generated layout for the term's curriculum, seed and generator version, and stores the lecturer's changes as **overrides** on top of it:

| Override | Example |
| -------- | ------- |
| Island names | village and castle names per chapter (today `villages`/`castles` in `data/karte.json`) |
| House selection | which suggested exercises get a house (today `houses` in `data/karte.json`, max. 3) |
| Seed / theme | re-roll an island's shape or pick its theme (valley, beach, desert, snow) |
| POI position | drag the castle, a house, the volcano or a port to another tile (the path is re-routed) |
| Extra POIs | well, library |
| Painted tiles (later) | manual tile/decoration edits for a hand-crafted look (§25.5) |

When the curriculum changes (chapter added, exercises moved), the generator re-runs and the overrides are re-applied by stable keys (chapter number, exercise uuid); overrides that no longer apply are listed for review.

- **World space** uses integer tile coordinates `(tileX, tileY)`; the viewport is a panning window over this space.
- **Pan:** drag, middle-mouse drag or Space + left-drag.
- **Zoom:** Mouse wheel, or `+` / `-` keys (integer zoom levels as in the game view).
- **Grid overlay:** Toggleable grid lines at tile boundaries.
- **Island bounding boxes:** Each island's tile extent is shown as a labeled, colored rectangle when zoomed out.
- **Connection lines:** the ship routes between departure and arrival ports, showing the content flow sequence at a glance.
- **Fog of war preview:** toggle to see the map as a new student would (only the first island discovered).

### 25.5 Tool Panel

The left rail contains the active tool selector and, for the tile paint tool, the tile palette. **Staging:** the first editor version ships *Select* (move POIs, edit properties), *POI* (add well/library) and *Debug*. *Paint*/*Erase* (tile overrides) come later. Islands are not drawn by hand: an island exists because its chapter exists in the curriculum (§25.3a); the *Island* tool only re-rolls or resizes a generated island.

```
┌────────────┐
│  🖱️  Select │  ← select / move existing POIs or islands
│  ✏️  Paint  │  ← paint tiles (shows palette below)
│  🧹 Erase  │  ← paint ocean/empty tile
│  🚩 POI    │  ← click to place a new POI
│  🔲 Island │  ← draw a new island bounding box
│  🔗 Link   │  ← draw a port-to-port connection
│  🔍 Debug  │  ← show tile coords, island boundaries, fog state
└────────────┘

[Tile Palette]  (visible when Paint tool active)
  Sprite sheet thumbnail with scrollable grid.
  Click to select active tile; right-click to pick from canvas.
  Palette is organized by category tabs:
    Ground | Decoration | Water | Structures | Props
```

**Tile layers:** The canvas supports three layers painted independently:


| Layer        | Contents                                | Rendered |
| ------------ | --------------------------------------- | -------- |
| `ground`     | Base terrain tiles                      | Bottom   |
| `decoration` | Trees, rocks, flowers                   | Middle   |
| `object`     | Structures, chests, signs (POI visuals) | Top      |


The active layer is selected from a layer dropdown in the tool panel. Layers can be toggled visible/hidden for editing clarity.

### 25.6 Island Management

Selecting an island (one per chapter of the term's curriculum) opens its properties **for the selected lecture/term**. Name, order and description come from the curriculum; size, seed and theme are layout overrides. The inspector panel shows:

```
Island Properties
─────────────────
Name:        [ Lecture 3: Trees & Graphs     ]
Slug:        [ lecture-3-trees-graphs        ]  (auto-generated, editable)
Order:        3   (drag-to-reorder in island list)
Lecture:     CS101
Term:         Summer 2026
Description: [ Multi-line textarea           ]
Status:       ● Draft  ○ Published

Tile extent:  (12, 44) → (38, 72)   [Recalculate from tiles]

[ Delete Island ]   [ Publish Island ]
```

The **Order** field determines the content flow sequence used in the list view and the connection arrows on the editor canvas. Islands can be reordered by dragging in a sidebar island list.

### 25.7 POI Placement & Configuration

Selecting the POI tool and clicking a tile places a new POI at that tile coordinate **for the selected lecture/term**. The inspector panel opens immediately for configuration:

```
POI Properties
──────────────
Label:        [ Landing Port                 ]
Type:         ○ Content  ○ Exercise  ● Port  ○ Bulletin Board
Island:       [ Lecture 3 (auto-assigned)    ]
Lecture:      CS101
Term:         Summer 2026
Tile:         (24, 58)   [ Pick on canvas ]

Sprite:       [ chest_closed.png  ▼ ]   (picked from asset browser)

Port settings (visible when type = Port):
  ○ Arrival Port      ● Departure Port
  Links to island:    [ Lecture 4: Sorting ▼ ]

Unlock rule:
  [ Requires: all suggested exercises finished ▼ ]
  (rule builder — see §25.8)
```

For **Content POIs**, the inspector expands to show a content item list:

```
Content Items
─────────────
  + Add Content Item
  ┌────────────────────────────────────────────┐
  │ 📄 Slides: "Lecture 3 Slides"              │
  │    URL: https://slides.uni.example/lec3    │
  │    [ Edit ] [ Remove ]                     │
  ├────────────────────────────────────────────┤
  │ 🎬 Video: "BST Introduction"               │
  │    URL: https://mediaserver.uni.example/…  │
  │    [ Edit ] [ Remove ]                     │
  └────────────────────────────────────────────┘
```

For **Exercise POIs**, the inspector shows the exercise linker (see §25.9).

### 25.8 Unlock Rule Builder

Rather than writing unlock conditions as raw JSON, the inspector presents a simple rule builder UI:

```
Unlock when:
  [ All content POIs on this island ] [ are marked Viewed ▼ ]

  + Add condition   (AND logic between conditions)

Available conditions:
  • [POI: ___] is [Viewed / Finished / Skipped]
  • [All content POIs on island: ___] are Viewed
  • [All suggested exercises on island: ___] are Finished
  • [Mandatory exercise: ___] is [Finished / Skipped]
  • [Manual unlock by: tutor / lecturer / admin]
```

Conditions are serialized to a `jsonb` unlock rule descriptor stored on the POI record (see §21.1). The unlock evaluation engine in the backend deserializes and evaluates these rules **in the context of the active lecture/term**.

### 25.9 Exercise Linker

When a POI of type **Exercise** is selected, the inspector shows the exercise linker. This is the bridge between the **module registry** (§4.2) and a placed POI **for the selected lecture/term**:

```
Linked Exercise
───────────────
  Search exercises:  [ 🔍 binary search...              ]

  ┌──────────────────────────────────────────────────────┐
  │  📦 bst-insertion  (Lecture 3: Trees)                │
  │  Tags: Trees, Recursion  │  Difficulty: ★★★☆☆       │
  │  Current Version: e5f6g7h8... (May 20)              │
  │                                  [ Link to this POI ]│
  ├──────────────────────────────────────────────────────┤
  │  📦 bst-traversal  (Lecture 3: Trees)                │
  │  Tags: Trees, DFS            │  Difficulty: ★★☆☆☆   │
  │  Current Version: a1b2c3d4... (May 18)              │
  │                                  [ Link to this POI ]│
  └──────────────────────────────────────────────────────┘

Currently linked:  bst-insertion  [ Unlink ]

Override type for this island:
  (Default: suggested)
  ○ Use default   ● Override:  [ Mandatory ▼ ]

Badge on completion:
  [ 🏅 Tree Master ▼ ]   [ + Create new badge for this term ]

Lecture: CS101
Term: Summer 2026
```

Key behaviors:

- The search queries the **module registry** (§26.3) live as the user types; it only lists exercises of modules the lecture uses (or all registered modules, to add a new one).
- The **current version** of each exercise is displayed in the search results.
- **Override role** allows a lecturer to designate an exercise as mandatory on this island even if its kind defaults to optional (§8.1). The override is stored in `exercise_placements` for this term.
- Sandbox exercises (live coding) are added from the same linker with type set to `sandbox`; they appear in the lecture overview card but receive no map POI.
- **Badge creation:** Lecturers can create new badges directly from the linker for the current lecture/term.

### 25.10 Multi-User Editing

- **No Automatic Locking:** The editor does **not** implement automatic locking for concurrent edits.
- **Last Write Wins:** If multiple users edit the same term simultaneously, the **last saved change wins**.
- **User Coordination:** Lecturers are expected to **coordinate edits** among themselves (e.g., via external communication).
- **Conflict Warnings:** If a user attempts to save changes that conflict with newer changes from another user, they receive a warning:
  > *"This term was edited by [User] since you started editing. Your changes will overwrite theirs. [Force Save] [Cancel]"*

### 25.11 Exercise Version Management (Future UI)

While exercise creation is currently filesystem-based, the editor UI is prepared for future **in-UI exercise editing**:

- **Version History Panel:** For linked exercises, lecturers can view the **version history** (hash, changelog, date, `isIncompatible` flag).
- **Changelog Editor:** A textarea allows lecturers to describe changes when creating a new version.
- **Incompatible Flag:** A checkbox allows lecturers to mark a version as incompatible (emergency flag).

### 25.12 Island List Sidebar

A collapsible sidebar (left, below the tool panel) lists all islands in order **for the selected lecture/term**:

```
Islands (CS101 — Summer 2026)
───────
  1. 🏝️  Lecture 1: Intro          [Published]  [ ▶ ]
  2. 🏝️  Lecture 2: Data Types     [Published]  [ ▶ ]
  3. 🏝️  Lecture 3: Trees          [Draft]      [ ▶ ]
  4. 🏝️  Lecture 4: Sorting        [Draft]      [ ▶ ]
     ⊕ New Island
```

Clicking `▶` pans the camera to that island's bounding box. Drag handles allow reordering the content flow sequence.

### 25.13 Term Cloning in Editor

Lecturers/admins can **clone a term** directly from the editor:

1. Select the source lecture from the lecture dropdown.
2. Select the source term from the term dropdown.
3. Click **"Clone Term"** in the editor toolbar.
4. Enter a name, slug, and optional start/end dates for the new term.
5. The system:
  - Copies all islands, POIs, exercises, and content from the source term.
  - Resets all student-specific data (discovery state, attempts, unlock progress).
  - **Preserves exercise versions and changelogs** (students will see the full history in the new term).
  - Sets the new term's status to **Review Mode**.
  - Opens the editor for the new term.

### 25.14 Module Sync

- **Admin Operation:** Sync re-reads a registered module's files into the cache (§4.2). It is triggered manually in the admin UI ("Modul neu einlesen"), by the deploy pipeline (`POST /api/admin/modules/:moduleId/sync` with an API key), or on server start. There is no file watching in production.
- **Sync report:** added/updated/removed exercises, new versions (with or without changelog), schema errors, and **dangling curriculum references** in any lecture/term (exercise removed or renamed without a stable `uuid`).
- The editors show a banner when the curriculum of the open lecture has dangling references after a sync.

### 25.15 Undo / Redo

The editor maintains a local action history stack in `EditorState`:

- **Undo / Redo:** `Ctrl+Z` / `Ctrl+Shift+Z` (or `Cmd` on macOS).
- History is scoped to the current editing session (lost on page reload — not persisted).
- Supported operations: tile paint, tile erase, POI place, POI move, POI delete, property change, island resize.
- Batch tile paints (while mouse button held) are grouped as a single undo step.

### 25.16 Save & Publish Flow

```
[ Save Draft ]    — persists all pending changes to the DB as draft state for the selected lecture/term;
                    does NOT affect what students see.

[ Preview ]       — opens the game view in a separate tab with a special
                    ?preview=true&lecture=<lectureId>&term=<termId> query param, which loads draft state for
                    the current user only. Useful for testing unlock flows.

[ Publish ]       — copies draft → live state for the selected lecture/term.
                    Confirmation dialog lists what has changed.
                    If students are currently online on affected islands,
                    a warning is shown (changes take effect on next page load).
```

### 25.17 Asset Browser

A modal asset browser (opened from the sprite picker in the POI inspector) shows all tile and sprite assets available in `public/assets/`:

- Organized by folder (ground, decoration, objects, characters, badges).
- Thumbnail grid with pixel-perfect rendering.
- Search by filename.
- Upload new assets (lecturer+) — accepted formats: PNG only; max 512×512 px; auto-placed into the correct folder by type.

---

## 26. Exercise Modules & Module Registry API

### 26.1 Module Layout (Filesystem, Source of Truth)

A module is a folder that is deployed as-is (today: `modules/gdi/`, ~150 exercises in 21 chapter folders). Folder names inside a module are free; by convention they follow the chapters of the lecture the module was written for.

```
modules/
  └── gdi/                                   -- module id --
      ├── exercises.json                     -- module index (ExerciseModuleSchema) --
      ├── common/                            -- module-wide code: scenes, playgrounds --
      │   └── scene/{cherrygame,robots,tree,…}
      ├── img/
      │   ├── previews/*.webp                -- card images (tools/capture_previews.mjs) --
      │   └── concepts/*.png                 -- pixel-art concept icons (tools/concept_icons.py) --
      ├── 00_einfuehrung/
      │   ├── nachricht/                     -- exercise folder, id "00_einfuehrung/nachricht" --
      │   │   ├── index.html                 -- `elements` (uuid, title, content[]) --
      │   │   ├── exercise.html              -- task text --
      │   │   ├── explanation.html           -- solution explanation --
      │   │   ├── Nachricht.java             -- //#START STUDENT|SOLUTION|STATIC|API sections --
      │   │   └── config.json / puzzle.json / overlay.json / … (optional)
      │   ├── beispiel_universum/            -- kind "lecture" (Vorlesungsbeispiel) --
      │   └── anordnen/                      -- Parsons puzzle --
      └── …
```

Module code imports shared Java classes from the TeaVM class library (`de.fau.tf.lgdv.*`) instead of copying them; app-level shared code (`common/quiz/*`, `common/canvas.js`, `common/simple_args.js`) belongs to the platform, not to a module.

**Planned change to exercise folders:** today each `index.html` is a full HTML page that bootstraps itself (relative `../../../../` paths to the app, inline `elements`). For the SvelteKit app, the `elements` object moves into an `exercise.json` (or `index.json`) next to the content files; `index.html` stays as a thin generated wrapper for static mode and old links. A one-time script converts the existing folders.

### 26.2 Module Index Schema

`exercises.json` follows `ExerciseModuleSchema` (today `data/exercises.schema.ts`; moves to `src/lib/schemas/`):

```jsonc
{
  "version": 1,
  "id": "gdi",
  "title": "Grundlagen der Informatik",
  "concepts": [
    { "id": "grundlagen", "label": "Grundlagen", "icon": "img/concepts/grundlagen.png" }
  ],
  "exercises": [
    {
      "id": "00_einfuehrung/nachricht",
      "uuid": "d8cde87e-badb-4e3e-8412-4b27044bbc52",   // new: mirrored from index.html
      "title": "Einfaches Programm",
      "description": "…",
      "link": "00_einfuehrung/nachricht",
      "type": "exercise",                                 // = kind (§8.1)
      "difficulty": 0,
      "tags": ["grundlagen"],
      "hasSolution": true, "hasExplanation": true, "hasExperiments": false,
      "isNew": true, "isDraft": true,
      "image": "img/previews/00_einfuehrung-nachricht.webp",
      "history": [                                        // new, optional (§5.1)
        { "hash": "sha256:…", "changelog": "Initial version", "date": "2026-04-10T10:00:00Z", "isIncompatible": false }
      ]
    }
  ]
}
```

New fields (`uuid`, `history`) are optional so existing modules stay valid. The module tooling (`tools/`) gets a validator (`tools/validate_module.mjs`) that runs the zod schema, checks that every `link` folder exists, and compares `uuid`s with the `index.html` files — usable locally and in CI before a module is deployed.

### 26.3 Module Registry API

All routes are `+server.ts` endpoints. Read routes serve the cache (§4.2); write routes only trigger reading the files — there is no API to create or modify exercises.

```
# Modules (admin)
GET    /api/admin/modules                         — registered modules with last sync status
POST   /api/admin/modules                         — register { id, path } and read its exercises.json
POST   /api/admin/modules/:moduleId/sync          — re-read the files (also used by deploy pipelines, API key)
DELETE /api/admin/modules/:moduleId               — unregister (refused while curricula reference it)

# Exercises & concepts (read, cached from files)
GET  /api/content/exercises                       — list (?module=, ?concept=, ?kind=, ?search=)
GET  /api/content/exercises/:uuid                 — single exercise metadata (latest version)
GET  /api/content/exercises/:uuid/versions        — all versions seen, with changelogs from the files
GET  /api/content/concepts                        — concepts of all registered modules

# Curricula (database, lecturer+)
GET  /api/admin/lectures/:lectureId/curriculum    — template, as curriculum.json format
PUT  /api/admin/lectures/:lectureId/curriculum    — replace template (import), validated against the registry
GET  /api/admin/terms/:termId/curriculum          — term snapshot
PUT  /api/admin/terms/:termId/curriculum          — replace term snapshot
GET  /api/admin/terms/:termId/schedule            — lectures + homework per chapter
PUT  /api/admin/terms/:termId/schedule
```

Students never call these routes directly: their pages get the merged **term catalog** (curriculum snapshot + cached module metadata + schedule — the server-side equivalent of `catalog.js`'s `merge()`) from `load` functions. In static mode the same catalog is prerendered as JSON.

### 26.4 Sync Implementation

On register/sync (§4.2, §25.14) the registry:

1. Reads and validates `exercises.json`.
2. For each exercise, reads its folder, extracts the `uuid` and static hints, and computes the content checksum (§5.1).
3. Upserts `module_exercises` and `module_concepts`; marks missing exercises `removedAt`.
4. Inserts unseen hashes into `exercise_versions`, taking changelog/`isIncompatible` from the file's `history`.
5. Checks all curricula for dangling refs and returns the sync report.

### 26.5 Version Diffing

- **Current Approach:** For v1, we **rely on git history** of the module repository for version diffing.
- **Future:** A visual diff of two versions (rendered task text + template blocks) may be added to the admin UI, reading old versions from git.

---

## 27. Term Archiving & Data Export

### 27.1 Term Expiration

- **Automatic Expiration:** Terms are **automatically marked as expired** 5 years after their `endDate`.
  - This is **only a flag** (no data is automatically deleted).
  - Expired terms remain visible to students and lecturers but are **read-only**.
- **Manual Expiration:** Lecturers/admins can manually mark terms as expired at any time.

### 27.2 Student Data Export

- **Self-Service Export:** Students can **export all their data** for a lecture/term as a JSON file.
  - **Scope:** Includes attempts, snapshots, hints, badges, discovery state, and progress for the selected lecture/term.
  - **Format:** A single JSON file with a structured export of all relevant data.
  - **Access:** Available from the student’s profile page under "My Data" → "Export Term Data".
- **Export Example:**
  ```json
  {
    "lecture": "CS101",
    "term": "Summer 2026",
    "exportedAt": "2026-05-29T12:00:00Z",
    "data": {
      "attempts": [...],
      "snapshots": [...],
      "hints": [...],
      "badges": [...],
      "discoveryState": {...}
    }
  }
  ```

### 27.3 Student Data Deletion

- **Self-Service Deletion:** Students can **delete all their data** for a lecture/term.
  - **Scope:** Deletes attempts, snapshots, hints, discovery state, and progress for the selected lecture/term.
  - **Confirmation:** Requires a **two-step confirmation** with a warning that the action cannot be undone.
  - **Access:** Available from the student’s profile page under "My Data" → "Delete Term Data".
- **Admin Deletion:** Lecturers/admins can delete student data for their assigned lectures/terms.

### 27.4 Data Retention Policy

- **Student Control:** Students have full control over their own data and can export/delete it at any time.
- **No Automatic Deletion:** The system **does not automatically delete** any data (even for expired terms).
- **Future:** Automated data cleanup (e.g., purging expired terms after a grace period) may be added in a later version.

---

## 28. Open Questions & Future Considerations

### 28.1 Resolved Decisions


| Decision                                 | Resolution                                                                                                                                                                                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student-facing "session" terminology** | Renamed to **"attempt"** (more intuitive for students).                                                                                                                                                                                                          |
| **Multiple lectures**                    | Supported. Each lecture has its own terms, maps, and student cohorts. Students can enroll in multiple lectures.                                                                                                                                                  |
| **External exercise server marking**     | No webhook available yet; **rely on manual marking for now**.                                                                                                                                                                                                    |
| **Fog of war granularity**               | **Island-based for logic, cell-based for visuals** (§9.1). Only the island-level discovery is queried; the visual fog is an opaque blob.                                                                                                                       |
| **Ollama model selection**               | **Default to none.** A drop-down with available models is provided for selection.                                                                                                                                                              |
| **System prompt templates**              | **Yes**, default system prompts are provided for different lecture types (e.g., beginner vs. advanced).                                                                                                                                                              |
| **Badge images**                         | For v1, **part of the existing art set**. Upload functionality planned for a future version.                                                                                                                                                                     |
| **Map editor multi-user**                | **No automatic locking**. User-side coordination expected. **Last edit wins**.                                                                                                                                                                                   |
| **Exercise ownership**                   | **Module files are the source of truth** (`modules/<id>/exercises.json` + folders, maintained in git). Modules are registered and synced by an admin or the deploy pipeline; the database is only a cache. No exercise editing in the platform UI.          |
| **Curriculum ownership**                 | **Database**, edited in the backend UI. `data/curriculum.json` / `data/karte.json` are import/export formats.                                                                                                                                                 |
| **Framework**                            | **SvelteKit + Svelte 5 (runes)** (§7).                                                                                                                                                                                                                         |
| **Theming**                              | All UI is themable through design tokens; today's 8 themes carry over; components never hard-code colors or fonts (§22).                                                                                                                                       |
| **Anonymous use**                        | Stays supported (local-first); login is optional and adds sync and server features.                                                                                                                                                                           |
| **Exercise version**                     | Content checksum over task text + template blocks (same algorithm as today's autosave), not a hash of the metadata JSON.                                                                                                                                      |
| **World map**                            | Procedurally generated per term (pinned seed + generator version) with editor overrides, not hand-painted from scratch.                                                                                                                                      |
| **Default unlock rules**                 | Preset `open` (today's behavior: departure opens when all houses are done); the stricter v0.7 sequence is preset `guided`.                                                                                                                                    |
| **Term archiving**                       | Terms **marked as expired after 5 years** (flag only). Students can **export/delete their data**. Data removal is manual for now.                                                                                                                                |
| **Term enrollment deadlines**            | Supported, but **default to always open** (no deadline).                                                                                                                                                                                                         |
| **Cross-term analytics**                 | **Yes**, if lecturers can manage all involved lectures.                                                                                                                                                                                                         |
| **Exercise version diffing**             | For v1, **rely on git history**. Future: visual diff tool.                                                                                                                                                                                                       |
| **Attempt migration limits**             | Changes can be **flagged as incompatible** (`isIncompatible`). If incompatible, students **cannot load old attempts**. Otherwise, heuristically load last attempt and show changelog. **New records (snapshots, hints) are always stored with the latest hash.** |
| **Term cloning across lectures**          | **Yes**, lecturers can clone a term from one lecture to another (e.g., copy "CS101 Summer 2026" to "CS201 Summer 2026").                                                                                                                                                 |
| **Exercise sharing between lectures**     | **Yes**, exercises are shareable between lectures (e.g., reuse "BST Insertion" in both CS101 and CS201).


### 28.2 Open Questions

- **Lecture templates:** Should we provide pre-configured curriculum templates for common lecture types (e.g., "Intro to Programming", "Data Structures")?
- **CodeBlocks API:** Which events (change, run, compile error, test result, quiz solved) and accessors (`getBlocks`/`loadBlocks`) can CodeBlocks expose, and in which release? This blocks snapshots and LLM hints (§11.1).
- **Exercise page format:** Convert `index.html` + inline `elements` to a JSON file per exercise (§26.1) in one step, or support both for a while?
- **Static mode lifetime:** Keep the static `livecompile` deployment permanently, or retire it once the server version runs?
- **Login provider timing:** Is FAU SSO available early enough to skip email/password accounts for students entirely?
- **Homework on the map:** Should homework (volcano) ever gate travel, or stay informational (current decision: informational)?
- **Draft/hidden exercises:** Today `?showDrafts`/`?showHidden` reveal unfinished exercises to anyone with the URL. In the server version, should this become a role-based preview (lecturer/tutor only)?

### 28.3 Future Considerations (Out of Scope for v1)

- **Public/shared profiles** with opt-in badge showcase (with lecture/term grouping).
- **Leaderboards** (most badges, fastest completion) — requires careful fairness review. Should leaderboards be per-lecture/term or global?
- **Co-op mode:** Two students can share an attempt (pair programming). Should this be restricted to the same lecture/term?
- **Instructor analytics dashboard:** Aggregate heatmap of stuck points, completion funnels. Now with **cross-lecture/term filtering** (enabled for lecturers with management rights over all involved lectures) and **version awareness**.
- **i18n:** Multi-language support (glossary, UI labels).
- **Mobile island view:** A simplified top-down island view optimized for mobile touch.
- **Offline mode / PWA:** Cache lecture content for offline access.
- **Webhook outbound:** Notify an LMS (e.g., Moodle) when a mandatory exercise is completed (with lecture/term context).
- **Map editor collaboration:** Real-time multi-cursor editing for co-authoring islands (with conflict resolution).
- **Module CLI:** extend today's `tools/` scripts (uuids, previews, concept icons) into one command-line tool to scaffold exercise folders, validate a module, bump versions with changelog entries and generate a diff report.
- **Exercise authoring helpers:** a local preview/authoring mode in the dev server (live reload of a module folder). Exercises stay files in git; the platform does not become an exercise editor.
- **Exercise version rollback:** done by reverting the module in git and re-syncing; the platform only needs to show that the "new" version equals an older hash.
- **Student version feedback:** Allow students to provide feedback on exercise versions (e.g., "This version is harder than the previous one").
- **Automated data cleanup:** Add a cron job to purge expired term data after a configurable grace period (e.g., 1 year after expiration).

---

## 29. Evolution Roadmap (from Lernwerk v0 to the Platform)

### 29.1 Principles

- Every phase is **deployable** and keeps the public site working.
- **No content rewrite:** exercise folders and module files are only touched by scripts (uuid mirroring, `elements` extraction).
- **No data loss for students:** data stored in browsers today (`done`, self-assessment, map state, autosaves) is read by the new app and can be imported into an account.
- Port behavior first, then improve: the Svelte versions of Übungsplaner and Abenteuerkarte start with today's behavior (and URL parameters), covered by Playwright tests, before new features are added.

### 29.2 Phases

| Phase | Goal | Main work | Deploy |
| ----- | ---- | --------- | ------ |
| **0 — Today** | Static Lernwerk | Vanilla JS pages, `catalog.js`, CodeBlocks, local storage | Static files on `livecompile` |
| **1 — SvelteKit shell** | Same site, new foundation | SvelteKit + TS project; `static/` serves `js/`, `assets/`, `modules/` unchanged; catalog/curriculum loader ported to TS with executable zod schemas; old pages still reachable; module validator in CI | `adapter-static`, same URL |
| **2 — Views in Svelte** | Port the student UI | Übungsplaner → Svelte (incl. learner model §14.6); exercise page → `<ExerciseView>` with CodeBlocks attachment; `karte.js` → `@lernwerk/world` + Svelte HUD; themes, tours; `ProgressStore` with `LocalProgressStore` on today's storage keys; **skipped** state; old URLs redirect | `adapter-static` |
| **3 — Server & accounts** | Login optional | `adapter-node`, Docker (app + PostgreSQL + Caddy); Better-Auth (email, then FAU SSO); module registry + cache; **curriculum and schedule import** from `data/curriculum.json`/`data/karte.json` into lecture "GdI" / term "SoSe 2026"; `RemoteProgressStore`, local-data import; multiple attempts; privacy statement update | Server mode next to the static site |
| **4 — Backend UI** | Lecturers stop editing JSON | Curriculum editor, schedule editor, term lifecycle (create from template, clone, lock), tutor assignment, staff progress views | Server |
| **5 — Versioning & bridge** | Track change | Content checksums in sync, `history` in module files, changelog UI, outdated/incompatible attempts; CodeBlocks events → snapshots (with consent) | Server |
| **6 — Game features** | More whimsy | Badges, unlock rule builder and `guided` preset, wells, bulletin board UI, map editor (overrides first, painting later), particle FX | Server |
| **7 — Live coding & hints** | In-lecture use | Sandbox sharing, lecturer review/present pages (SSE), publish solution; Ollama hints with hint economy; glossary | Server |

Phases 4–7 can partly run in parallel; 5 depends on the CodeBlocks API (§28.2).

### 29.3 Local Data Migration

The `LocalProgressStore` reads today's keys directly; on first login the student is offered an import:

| Today (browser) | Imported as |
| --------------- | ----------- |
| `lernwerk.uebungsplaner.v1` → `done[]` | `exercise_progress` (`finished`), ids resolved via `catalog.js`'s `resolveId` mapping to `uuid` |
| `lernwerk.uebungsplaner.v1` → `overrides`, `lastHeard` | `concept_assessments`, `user_term_preferences.lastHeardChapter` |
| `lernwerk.uebungsplaner.v1` → `view`, `sort`, `scope`, filters | `user_term_preferences.planner` |
| `lernwerk.karte.v1[...]` → `fog`, `hero`, `ships`, `visited`, `zoom`, `sig` | `user_world_state` (fog kept only if `sig` matches the term's published layout) |
| IndexedDB `lernwerk`/`solutions` → `{uuid, checksum, blocks, savedAt}` | `exercise_attempts` (name "Im Browser gespeichert", `exerciseVersion = checksum`, `importedFromLocal = true`) |
| `lernwerk.numbers.*`, `lernwerk.graph.*` | `data` block of the corresponding attempt |
| `lernwerk-theme`, `lernwerk.tour.*`, `lernwerk.karte.liftBar` | user preferences (or left local) |

After import, the local copy is kept as an offline cache; "Lokale Daten löschen" in the profile removes it.

### 29.4 Content Migration

1. Mirror each exercise's `uuid` from `index.html` into `modules/gdi/exercises.json` (script).
2. Register module `gdi`; first sync computes checksums and creates the initial version per exercise.
3. Import `data/curriculum.json` → lecture "GdI" (template) and term "SoSe 2026" (snapshot); import `data/karte.json` → schedule (`lectures`, `homework`, `lectureChapters`, `homeworkChapters`) and layout overrides (`houses`, `villages`, `castles`).
4. Pin the world seed and `generatorVersion` (today `GENERATOR = 15`) of the term so the published map looks exactly like today's.
5. Keep `data/curriculum.json` and `data/karte.json` only as the static-mode build input until static mode is retired; afterwards they are exports.

---

## Appendix A: Lernwerk v0 → Design Concepts

| Today (file / feature) | Concept in this document | Section |
| ---------------------- | ------------------------ | ------- |
| `modules/gdi/` + `exercises.json` | Module (source of truth for exercises) | §4, §26 |
| `data/curriculum.json` (`chapters`, `types`, `modules`) | Curriculum (DB), kinds, module registry | §4.4, §21 |
| `data/*.schema.ts` (zod, docs only) | Executable schemas in `src/lib/schemas/` | §20.3 |
| `catalog.js` (`load`, `merge`, `resolveId`, `migrateDone`) | Module registry + term catalog; id migration | §4.2, §26.3, §29.3 |
| Exercise `type` (`lecture`, `sandbox`, `exercise`, `test`, `tool`) | `kind`; per-term `role` | §8.1 |
| Concepts (`tags`, icons) | Concept / topic tags | §2.3, §14.6 |
| Chapter (0–21) | Island | §8.1, §9 |
| `data/karte.json` `houses` | Suggested exercises (houses) | §8.1, §25.4 |
| `data/karte.json` `villages`, `castles` | Island name overrides | §25.4 |
| `data/karte.json` `lectures`, `homework` (+ `tools/karte-kursdaten.mjs`) | Term schedule; castle content; volcano homework | §21, §25.3a |
| `karte.js` (generator, fog, hero, ships, HUD) | `@lernwerk/world` + `<WorldCanvas>` + HUD | §9 |
| Departure port opens when all houses done | Unlock preset `open` | §10.1 |
| `lernwerk.karte.v1` | `user_world_state` | §21, §29.3 |
| `uebersicht.html` / `uebungsplaner.js` | List view | §14 |
| Self-assessment (`lastHeard`, `overrides`), scopes, scoring | Learner model | §14.6 |
| `done[]` | Exercise progress `finished` (+ new `skipped`) | §8.2 |
| `autosave.js` (IndexedDB, checksum, download/upload) | Attempt (single, local); content version; attempt export | §5.1, §11.3 |
| `content.js` (`elements` → DOM, Java section parser) | `<ExerciseView>` | §11.1 |
| `codeblocks.umd.js` (+ TeaVM, Pyodide) | Exercise engine + bridge | §11.1 |
| `common/quiz/*` (Parsons, output, matching, numbers, graph) | Quiz exercise kinds | §11.6 |
| `<hint>` boxes | Static hints / LLM fallback | §18.7 |
| `?embedded` iframe + `lernwerk:close` | Overlay via shallow routing | §9.3 |
| `theme.js` (8 themes, menu, breadcrumb, footer) | Themes, app shell | §22.2 |
| `tour.js` | Guided tours | §22.8 |
| `?showDrafts`, `?showHidden` | Draft/hidden flags (role-based preview?) | §28.2 |
| `tools/*` (uuids, previews, concept icons, licensed assets) | Module tooling / CLI | §26.2, §28.3 |
| `impressum.html`, `datenschutz.html`, `barrierefreiheit.html` | Legal pages (privacy statement to extend) | §15.3 |
| — | Lectures/terms, accounts, roles, badges, hints, live coding, glossary, editors | new |

---

*End of Document — v0.8 Draft*

*Next step: Start phase 1 of the roadmap (§29): SvelteKit skeleton that serves today's content unchanged, the catalog/curriculum port with executable schemas, and the CodeBlocks API needed for the exercise bridge.*