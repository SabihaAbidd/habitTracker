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
- Tailwind's utility classes let me work at the speed of thought and keep the design system consistent using custom tokens (`bg`, `card`, `elevated`, `border`, `amber`, `success`, etc.) defined once in `tailwind.config.js`.
- Framer Motion gives professional-quality animations without writing keyframes by hand — the checkmark toggle spring, row entrance, empty state float, and badge scale all take 2–3 props each.
- Vite makes the dev loop instant. No Webpack config to fight.

A vanilla JS approach would have worked for this scope but the component model made the `HabitRow` rename-in-place interaction (with its focus management, escape handling, and blur-commit) much easier to reason about.

### Design decision 1 — Today's column uses a full-height amber glow, not just a header marker

The amber tint and border run the full height of every habit row, not just the header. This means when a user glances at the grid at any viewport size, their eye is immediately drawn to the right column without having to scan the header first. The gradient is intentionally soft (`rgba(255,184,106,0.06)`) so the green checkmarks and orange badge still dominate — the column highlight is a location cue, not a color statement. This is the most important information design decision in the app: the user must always know where "now" is.

### Design decision 2 — Streak badge sits between the habit name and the grid, not at the far right

Reading order is: name → momentum → weekly performance. Placing the streak badge immediately after the name means the user reads *what the habit is* and *how it's going* in one left-to-right pass before they reach the grid cells. If the streak were on the far right, it would come after seven cells of scanning — buried and forgettable. The badge also uses a warm gradient background and a flame icon specifically so it reads as a reward signal, not a label.

### Week start: Monday

Monday start is the ISO 8601 standard and matches how most productivity tools (Linear, Notion, Google Calendar in most locales) render weeks. Crucially, it places Saturday and Sunday adjacent on the right side of the grid, letting users read their work-week compliance as a block (Mon–Fri) and their rest-day behavior as a visual pair (Sat–Sun). A Sunday start splits the weekend across both edges of the grid, which obscures this natural rhythm.

### Streak counting rule

The streak counts consecutive days ending at today. If today is not yet checked, the streak is calculated starting from yesterday — a "grace period" that means you don't lose a 30-day streak at 7am just because you haven't completed your morning run yet. A streak only resets when a *confirmed past day* has no check. This is the most forgiving interpretation and avoids punishing users who open the app first thing in the morning.

---

## 3. Responsive & accessibility

### 360px phone

The weekly grid uses `overflow-x: auto` on a wrapper with `min-width: 560px` on the inner content. This means the grid never becomes crushed — the habit names remain fully readable at their fixed width (180px), and the 7 check cells retain usable tap targets (32×32px buttons). The header nav wraps cleanly: logo on the left, week nav centered, and the "This week" button hides its label on small screens (shows icon only). The Add Habit input takes full width at the bottom of the card.

### 1440px desktop

The app centers at `max-width: 1024px` with generous padding. The grid columns expand proportionally (`flex: 1` on each day column). With 3 habits the grid breathes; with 15 habits the rows stack comfortably at 56px each without any layout shift. No horizontal scroll needed on desktop.

### Accessibility — handled

Every checkmark button has an `aria-label` that includes the full habit name and date — e.g. *"Check Exercise on 2026-05-22"* — and an `aria-pressed` attribute that reflects the checked state. Screen readers announce both what is being toggled and whether it is currently active, without relying on visual-only cues. All interactive elements (checkmarks, rename/delete buttons, nav buttons, add button, input) have visible `focus-visible` rings using a 2px amber outline that meets WCAG 3:1 contrast on the dark background.

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
