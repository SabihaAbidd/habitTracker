# ANSWERS.md

---

## 1. How to run

**Requirements:** Node.js 18 or higher.

```bash
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

**Live URL:** https://habit-tracker-YOUR-NAME.vercel.app

No environment variables needed. Everything runs client-side with `localStorage`.

---

## 2. Stack & design choices

### Why this stack

I used **React + Tailwind CSS + Framer Motion** because:

- React's component model maps cleanly to the grid's structure: one `HabitRow` component, one `CheckCell`, rendered in a loop. State is easy to lift and pass down.
- Tailwind's utility classes let me work at the speed of thought and keep the design system consistent using custom tokens (`bg`, `surface`, `border`, `lime`, `limeSoft`, `muted`, etc.) defined once in `tailwind.config.js`.
- Framer Motion gives professional-quality animations without writing keyframes by hand — the checkmark toggle spring, row entrance, empty state float, and badge scale all take 2–3 props each.
- Vite makes the dev loop instant. No Webpack config to fight.

A vanilla JS approach would have worked for this scope but the component model made the `HabitRow` rename-in-place interaction (with its focus management, escape handling, and blur-commit) much easier to reason about.

### Design decision 1 — Neon-lime accent is rationed, not sprayed

The lime accent (`#D9FF3F`) appears on exactly four things: today's date pill, completed check cells, active streak badges, and focus rings. Everything else — habit names, week navigation, surface borders, muted text — sits in a quiet greyscale on a near-black background. This makes the lime *mean something*: when the user glances at the grid, their eye lands on signal (today, progress, momentum), not on chrome. Today's column uses a subtle radial halo behind the date pill rather than a full-height column band — enough to anchor the eye, not enough to compete with the completed cells themselves.

### Design decision 2 — Streak badge sits between the habit name and the grid, not at the far right

Reading order is: name → momentum → weekly performance. Placing the streak badge immediately after the name means the user reads *what the habit is* and *how it's going* in one left-to-right pass before they reach the grid cells. If the streak were on the far right, it would come after seven cells of scanning — buried and forgettable. The badge uses a lime-tinted pill with a flame icon and pulses gently at 7+ days, so it reads as a reward signal, not a label.

### Week start: Monday — defended

The week starts on **Monday**. Three reasons:

1. **ISO 8601 standard.** Monday-start is the international standard week and matches the calendar conventions used in most of Europe, Asia, and by most productivity tools (Linear, Notion, GitHub contribution graph, Google Calendar in most locales). It's what users of habit-tracking software already expect.
2. **Weekend reads as a block.** Monday-start places Saturday and Sunday adjacent on the right edge of the grid. The user can read their work-week compliance as a clean Mon–Fri block and their rest-day behavior as a visual Sat–Sun pair. A Sunday-start splits the weekend across both edges of the row, which destroys this rhythm — a user can no longer tell at a glance "I'm consistent on weekdays but skip weekends."
3. **Goal alignment.** Habit-trackers are mostly used to build *productive* routines (exercise, reading, deep work). Putting the weekend at the *end* of the row frames the week as work-leading-to-rest, which matches how most users mentally model their week — Monday is "the start of the push," not "the day after the weekend."

### Streak counting rule — defended

The streak counts consecutive days ending at today. **If today is not yet checked, the streak is calculated starting from yesterday** — a deliberate grace period. Rationale:

- **Don't punish the user for opening the app early.** Without grace, a user with a 30-day streak who opens the app at 7am — before they've gone for their run — sees "0." That's emotionally devastating and factually wrong: the streak hasn't broken, the day just hasn't ended.
- **Resets only fire on confirmed evidence.** A streak only goes to 0 when a *completed past day* (yesterday or earlier) is empty. Until then, the streak is intact-pending-today. This matches how a thoughtful coach would count it.
- **The today cell still shows unchecked**, so the user knows there's an action left to take — the streak number stays motivating, the empty checkbox stays accountable. Both signals are present, neither overpowers the other.

The alternative ("today must be checked or streak = 0") is more punitive but technically simpler. It was rejected because the cost of one demotivated user closing the app outweighs the cost of one user briefly seeing a streak number they haven't "earned" yet today.

---

## 3. Responsive & accessibility

### 360px phone

The weekly grid uses `overflow-x: auto` on a wrapper with `min-width: 620px` on the inner content (scrollbar hidden via `no-scrollbar`). This means the grid never becomes crushed — the habit names remain fully readable at their fixed width (~210px), and the 7 check cells retain comfortable touch targets (36×36px buttons, larger than the WCAG 44×44 recommendation when including the surrounding flex cell). The floating glass top bar collapses cleanly: logo on the left, week nav centered, and the "Today" button hides its label on small screens (chevron-icon only). The Add Habit input takes full width at the bottom of the list as a glass pill.

### 1440px desktop

The app centers at `max-width: 1024px` (`max-w-5xl`) with generous padding. The grid columns expand proportionally (`flex: 1` on each day column). With 3 habits the layered glass rows breathe; with 15 habits the rows stack comfortably at 64px each without any layout shift. No horizontal scroll needed on desktop. The ambient lime glow behind the header sits on a fixed layer so it doesn't reflow when content height changes.

### Accessibility — handled

Every checkmark button has an `aria-label` that includes the full habit name and date — e.g. *"Check Exercise on 2026-05-22"* — and an `aria-pressed` attribute that reflects the checked state. Screen readers announce both what is being toggled and whether it is currently active, without relying on visual-only cues. All interactive elements (checkmarks, rename/delete buttons, nav buttons, add button, input) have visible `focus-visible` rings using a 2px lime (`#D9FF3F`) outline that meets WCAG 3:1 contrast on the near-black background.

### Accessibility — knowingly skipped

Full ARIA grid keyboard navigation (arrow keys to move between cells). The ARIA `grid` role with `aria-rowindex`, `aria-colindex`, and directional keyboard handlers would allow a keyboard user to navigate the 7-day grid without tabbing through each cell sequentially. Tab navigation still works and moves through each interactive element, but arrow-key grid traversal was out of scope for the time available. I'd implement it next using the ARIA authoring practices grid pattern.

---

## 4. AI usage

I used Claude (claude.ai) throughout this project.

**Initial generation:** I provided a detailed spec describing the full feature set, visual design system, component structure, and data model. Claude generated the initial `App.jsx`, config files, and document templates.

**Specific change I made — the streak grace period:** Claude's initial `calcStreak` function broke the streak immediately if today's checkbox was unchecked — meaning a user with a 14-day streak would see "0" every morning before completing their habit. I rewrote the function to skip today if unchecked and start counting from yesterday instead. The streak only resets when a confirmed past day is empty. This is a material UX decision: the app should feel like it's working *with* the user's routine, not punishing them for opening it before they've acted.

**Second change — removing `<table>` in favour of CSS grid/flex:** The initial generation used an HTML `<table>` for the weekly grid. I replaced it with `display: flex` rows and `flex: 1` day cells. The reasons: CSS flex handles the responsive column resizing more naturally, the `overflow-x` scroll wrapper works without table-specific hacks, and the layout avoids the accessibility complexity of needing correct `<th scope>`, `<caption>`, and `role="grid"` attributes on a structure that is functionally a UI grid, not tabular data.

**Third change — summary bar chips:** Claude didn't include the summary bar above the grid. I added the "X checks this week / Y% completion / Z-day streak" chips because a user with many habits needs a one-line progress summary before they engage with the full grid. It's the first thing you read, before your eyes move into the rows.

---

## 5. Honest gap

The rename interaction has no visible affordance on mobile. On desktop, hovering a habit row reveals the pencil and trash icons at the right of the name. On a touch device, there's no hover state — the icons only appear if you tap the row (which on mobile might be interpreted as a tap on the habit name text, triggering rename mode directly). This works, but a new mobile user has no indication that renaming is possible until they accidentally discover it.

With another day I would add a persistent but subtle "⋯" overflow menu button visible at all times on mobile (and on hover on desktop), opening a small popover with Rename and Delete options. This gives the interaction a clear affordance at any screen size and eliminates the accidental-rename problem where a fat-finger tap on the habit name unexpectedly opens an input.
