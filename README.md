# streak. — Habit Tracker

A premium single-page habit tracker built for the Dev Weekends Fellowship 2026 assessment.

## Live demo

> **[https://habit-tracker-YOUR-NAME.vercel.app](https://habit-tracker-olive-alpha.vercel.app/)**

---

## Run locally

**Requirements:** Node.js 18+

```bash
git clone https://github.com/YOUR_USERNAME/habit-tracker.git
cd habit-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production build

```bash
npm run build
npm run preview
```

---

## Stack

- **React 18** — component architecture, hooks
- **Tailwind CSS 3** — utility-first styling, custom design tokens
- **Framer Motion 11** — animations (entrance, exit, checkmark toggle)
- **Lucide React** — icon system
- **Vite 5** — build tool

---

## Features

- Add, rename, and delete habits
- Weekly grid: Mon–Sun, habits on the left
- Toggleable checkmarks per day — animated
- Streak counter per habit with flame badge
- Today's column highlighted with amber vertical accent
- Week navigation (prev / next / back to this week)
- Historical checkmarks preserved across weeks
- Future dates visible but disabled
- Full localStorage persistence across reloads
- Empty state with onboarding copy
- Duplicate habit name prevention
- Responsive: 360px phone → 1440px desktop
- Dark mode always-on (luxury dark theme)
- Accessible: aria-labels, aria-pressed, focus rings, keyboard nav
