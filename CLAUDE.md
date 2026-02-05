# CLAUDE.md

Guide for AI assistants working on this codebase.

## Project Overview

CVE Demo Tool is a **team performance evaluation and behavioral assessment platform** for CVE (an Italian payroll/administration company). Managers track, document, and evaluate key behaviors of team members. The UI is entirely in **Italian**.

Key features: behavior observation tracking, three-level evaluation (Training/In Line/Example), team dashboards, manager and employee role views, AI-generated behavioral insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.8 (strict: false) |
| Framework | React 18.3 with hooks |
| Build | Vite 5.4 with SWC plugin |
| Styling | Tailwind CSS 3.4 + PostCSS/Autoprefixer |
| UI Components | shadcn/ui (49 components in `src/components/ui/`) |
| Forms | React Hook Form + Zod validation |
| Routing | React Router DOM 6.30 |
| Data | TanStack React Query 5.83 |
| Charts | Recharts 2.15 |
| Icons | Lucide React |
| Testing | Vitest 3.2 + React Testing Library + jsdom |
| Linting | ESLint 9 with TypeScript + React hooks plugins |
| Package Manager | Bun (primary), npm (fallback) |

## Project Structure

```
src/
  App.tsx              # Main application (~2500 lines, all state and screens)
  main.tsx             # React DOM entry point
  index.css            # Tailwind global styles
  assets/              # Static assets (CVE logo)
  components/
    NavLink.tsx        # Custom React Router nav component
    ui/                # 49 shadcn/ui components (do not edit manually)
  hooks/
    use-mobile.tsx     # Responsive breakpoint detection (768px)
    use-toast.ts       # Toast notification system
  lib/
    utils.ts           # Tailwind class merge utility (cn())
  pages/
    Index.tsx          # Blank index page
    NotFound.tsx       # 404 page
  test/
    setup.ts           # Vitest setup (jsdom matchMedia polyfill)
    example.test.ts    # Example test
```

## Commands

```bash
npm run dev          # Start dev server on http://localhost:8080
npm run build        # Production build (outputs to dist/)
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode
```

## Architecture Notes

### Monolithic App.tsx

The entire application lives in `src/App.tsx`. It contains:

1. **Theme config** (top) - CVE brand palette object `T` with colors, typography, shadows
2. **Data models** - `ORG_ALL` (org roster), `TEAM` (team members), `BEHAVIORS` (behavior definitions), `INITIAL_NOTES`, `INITIAL_EVALS`
3. **Utility functions** - `getLevelCfg()`, `getAIInsight()`, `getTeamInsights()`
4. **Shared components** - `Avatar`, `Tip` (tooltip), `QuickNoteModal`, `HistoryDrawer`, `TeamDashboard`
5. **Screen components** - Home, Profile, Behaviors, Team screens
6. **Supporting components** - `BehaviorCardNew`, `TeamValidationScreen`

### State Management

Pure React hooks (`useState`). No external state library. Key state variables:

- `role`: `"manager"` | `"employee"`
- `screen`: `"home"` | `"profile"` | `"behaviors"` | `"team"`
- `selectedPerson`: team member ID
- `notes`: `{ [personId]: { [behaviorId]: Note[] } }`
- `evals`: `{ [personId]: { [behaviorId]: level } }`
- `teamValidated`: first-time setup gate

### No Backend

All data is in-memory. No HTTP requests, no database. Data resets on page reload.

### Path Alias

`@/*` resolves to `src/*`. Use this in all imports:
```typescript
import { Button } from "@/components/ui/button";
```

## Design System

### Brand Colors (CVE)

- **Primary**: `#22C9AC` (verde acqua CVE)
- **Dark**: `#1A1A1A`
- **Light**: `#F5F6F8`
- **Training level** (red): `#DC2626` - "Da allenare"
- **On Track level** (green): `#22C9AC` - "In linea"
- **Example level** (teal): `#0D9488` - "Di esempio"

### Typography

- Body font: Inter
- Heading font: Sora

### Dark Mode

Class-based dark mode via `next-themes`. Supported but not the primary experience.

## Conventions

### Code Style

- **Italian language** for all user-facing text, variable names for domain data (TEAM, BEHAVIORS, etc.)
- **English** for code constructs, component names, and utility functions
- Functional components with hooks only (no class components)
- shadcn/ui components in `src/components/ui/` - treat as library code, do not modify directly
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes

### TypeScript

TypeScript is configured with `strict: false` and `noImplicitAny: false`. The codebase uses loose typing. `@typescript-eslint/no-unused-vars` is disabled.

### ESLint Rules

- Based on `eslint/recommended` + `typescript-eslint/recommended`
- React hooks rules enforced
- React refresh component export warnings enabled
- Unused vars rule is disabled

### Testing

- Test files go in `src/` alongside source, matching pattern `*.{test,spec}.{ts,tsx}`
- Setup file at `src/test/setup.ts` configures jsdom environment
- Use React Testing Library for component tests
- Run `npm run test` before committing

### File Naming

- kebab-case for component files in `ui/` (e.g., `alert-dialog.tsx`)
- PascalCase for page and custom component files (e.g., `NavLink.tsx`, `NotFound.tsx`)
- kebab-case for hook files (e.g., `use-mobile.tsx`)

## Working with This Codebase

### Adding UI Components

Use shadcn/ui CLI or copy from the shadcn/ui registry. Components go in `src/components/ui/`. Configuration is in `components.json`.

### Adding New Screens

New screens are added as conditional renders inside `App.tsx` based on the `screen` state variable. Follow the existing pattern of screen components defined inline.

### Behavior Data Model

Each team member has 4 behaviors (`comportamento_1` through `comportamento_4`), categorized as either `"dna"` (company-wide) or `"team"` (role-specific). Each behavior can be evaluated at three levels and have observation notes attached.

### Running Checks Before Committing

```bash
npm run lint && npm run test && npm run build
```
