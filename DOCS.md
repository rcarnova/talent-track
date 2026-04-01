# Talent Track — Documentazione Tecnica

> Tool di performance management e valutazione comportamentale per CVE.
> Consente ai manager di valutare i comportamenti del team e ai dipendenti di esprimere la propria prospettiva.

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Stack tecnologico](#2-stack-tecnologico)
3. [Struttura del progetto](#3-struttura-del-progetto)
4. [Architettura applicativa](#4-architettura-applicativa)
5. [Data model](#5-data-model)
6. [Backend — Supabase](#6-backend--supabase)
7. [State management](#7-state-management)
8. [Schermate e flussi UX](#8-schermate-e-flussi-ux)
9. [Funzionalità AI](#9-funzionalità-ai)
10. [Feature flags](#10-feature-flags)
11. [Design system](#11-design-system)
12. [Setup sviluppo](#12-setup-sviluppo)
13. [Build e deploy](#13-build-e-deploy)
14. [Testing](#14-testing)
15. [Evoluzione futura](#15-evoluzione-futura)

---

## 1. Panoramica

**Talent Track** è una single-page application (SPA) pensata per il performance management basato su comportamenti osservabili. Supporta due ruoli:

| Ruolo | Funzionalità |
|-------|-------------|
| **Manager** | Valuta i comportamenti dei membri del team, registra osservazioni, visualizza insight AI e heatmap |
| **Employee** | Consulta le valutazioni ricevute, esprime la propria prospettiva con note testuali |

L'applicazione funziona anche **senza backend**: se Supabase non è configurato, usa dati demo hardcoded come fallback.

---

## 2. Stack tecnologico

### Core

| Tecnologia | Versione | Ruolo |
|-----------|---------|-------|
| React | 18.3 | UI library |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool & dev server (SWC plugin) |
| Tailwind CSS | 3.4 | Utility-first CSS |
| shadcn/ui | — | 48+ componenti Radix UI-based |

### Data layer

| Tecnologia | Ruolo |
|-----------|-------|
| Supabase | Backend PostgreSQL + RLS |
| TanStack React Query | Fetching, caching, mutation |
| React Hook Form + Zod | Form state & validazione |

### UI aggiuntive

| Libreria | Uso |
|---------|-----|
| Lucide React | Icone |
| Recharts | Grafici |
| Embla Carousel | Carousel team members |
| sonner | Toast notification |
| date-fns | Formattazione date |
| next-themes | Supporto dark mode |

---

## 3. Struttura del progetto

```
src/
├── App.tsx                  # Applicazione principale (~2500 righe)
├── main.tsx                 # Entry point (React + QueryClientProvider)
├── index.css                # Variabili CSS globali + CVE brand
├── assets/
│   └── cve-logo.png
├── components/
│   ├── ui/                  # 48+ componenti shadcn/ui
│   └── NavLink.tsx
├── hooks/
│   ├── useBaseData.ts       # useTeams, usePeople, useBehaviors
│   ├── useEvaluations.ts    # CRUD evaluations + notes
│   ├── useFeatureFlags.ts   # Feature flag polling (5min cache)
│   ├── useCEODashboard.ts   # RPC: company overview & team comparison
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   ├── supabase.ts          # Client Supabase + tipi TypeScript
│   └── utils.ts             # cn() per classi CSS
├── pages/
│   ├── Index.tsx
│   └── NotFound.tsx
└── test/
    ├── setup.ts
    └── example.test.ts

supabase/
└── schema.sql               # DDL completo + seed data + RPC functions

docs/                         # Output build (GitHub Pages)
```

> **Nota:** La quasi totalita della logica applicativa risiede in `src/App.tsx`. Questo e intenzionale per la fase di prototipo; una futura iterazione dovrebbe decomporre i componenti interni (BehaviorCardNew, QuickNoteModal, TeamDashboard, ecc.) in file separati.

---

## 4. Architettura applicativa

```
┌──────────────────────────────────────────────────────────┐
│                       App.tsx                            │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐ │
│  │  HOME   │  │ PROFILE │  │BEHAVIORS │  │   TEAM    │ │
│  │ screen  │  │ screen  │  │  screen  │  │  screen   │ │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └─────┬─────┘ │
│       │            │            │               │       │
│  ┌────┴────────────┴────────────┴───────────────┘       │
│  │  Componenti condivisi:                               │
│  │  - Avatar, Tip, QuickNoteModal, HistoryDrawer        │
│  │  - BehaviorCardNew, TeamDashboard                    │
│  └──────────────────────────────────────────────────────┤
│                                                          │
│  State: useState (screen, role, selectedPerson, ...)     │
│  Data:  React Query hooks → Supabase / demo fallback    │
└──────────────────────────────────────────────────────────┘
```

La navigazione tra schermate avviene tramite lo stato `screen` (non React Router, che e presente nel progetto ma non usato attivamente).

---

## 5. Data model

### Tipi TypeScript (`src/lib/supabase.ts`)

```typescript
type EvalLevel = "training" | "on_track" | "example"

interface Team {
  id: string; name: string; manager_id: string; created_at: string;
}

interface Person {
  id: string; name: string; initials: string;
  role: string; department: string; team_id: string;
}

interface Behavior {
  id: string; name: string;
  category: "dna" | "team";    // DNA = aziendale, team = specifico ruolo
  description: string; indicators: string[];
}

interface Evaluation {
  id: string; person_id: string; behavior_id: string;
  level: EvalLevel; evaluated_by: string;
  created_at: string; updated_at: string;
}

interface Note {
  id: string; person_id: string; behavior_id: string;
  text: string; level: EvalLevel;
  author: "manager" | "employee"; created_at: string;
}
```

### Livelli di valutazione

| Livello | Label IT | Icona | Colore |
|---------|----------|-------|--------|
| `training` | Da allenare | ↗ | Rosso `#DC2626` |
| `on_track` | In linea | ◆ | Verde `#22C9AC` |
| `example` | Di esempio | ★ | Teal `#0D9488` |

### Relazioni

```
teams 1──N people
teams 1──N behaviors (via team_id, per tipo "team")
people 1──N evaluations (person_id)
people 1──N behavior_notes (person_id)
behaviors 1──N evaluations (behavior_id)
behaviors 1──N behavior_notes (behavior_id)
evaluations: UNIQUE(person_id, behavior_id) → upsert
```

---

## 6. Backend — Supabase

### Schema (`supabase/schema.sql`)

6 tabelle: `teams`, `people`, `behaviors`, `evaluations`, `behavior_notes`, `feature_flags`.

### Row Level Security

Attualmente tutte le tabelle hanno **accesso pubblico in lettura** (anon key) per il demo. Le policy di scrittura sono aperte su `evaluations` e `behavior_notes`. In produzione vanno ristrette con autenticazione JWT.

### Stored procedures (RPC)

| Funzione | Descrizione | Usata da |
|----------|------------|----------|
| `get_company_overview()` | Aggregazione team × behavior con conteggi per livello | `useCEODashboard.ts` |
| `get_team_comparison()` | Ranking team con avg_score, strongest/weakest behavior | `useCEODashboard.ts` |

### Indici

```sql
idx_people_team            ON people(team_id)
idx_evaluations_person     ON evaluations(person_id)
idx_evaluations_behavior   ON evaluations(behavior_id)
idx_behavior_notes_person  ON behavior_notes(person_id)
idx_behavior_notes_behavior ON behavior_notes(behavior_id)
idx_behavior_notes_created ON behavior_notes(created_at DESC)
```

### Variabili d'ambiente richieste

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 7. State management

L'app usa un approccio ibrido:

### React Query — Dati server

```
useTeams()                        → lista team
usePeople(teamId?)                → persone (filtrabili per team)
useBehaviors(teamId?)             → comportamenti core + team
useEvaluations(personId)          → valutazioni di una persona
useTeamEvaluations(personIds[])   → valutazioni di tutto il team
useNotes(personId)                → note per persona
useBehaviorNotes(personId, behaviorId) → note specifiche per comportamento
useFeatureFlags()                 → feature flags (cache 5 min)
useCompanyOverview()              → dashboard CEO (RPC)
useTeamComparison()               → ranking team (RPC)
```

### Mutations

```
useSaveEvaluation()     → upsert evaluation (invalida cache evaluations)
useSaveNote()           → insert nota (invalida cache notes)
useSaveBehaviorNote()   → insert nota comportamento (invalida cache behavior-notes)
```

### useState — Stato UI locale

```typescript
screen           → "home" | "profile" | "behaviors" | "team"
role             → "manager" | "employee"
selectedPerson   → ID persona selezionata
quickNote        → boolean (modale aperta/chiusa)
quickNoteContext → { personId?, behaviorId? }
historyOpen      → { personId, behaviorId } | null
notes            → Record<string, Note[]>   // fallback demo
evals            → Record<string, Record<string, EvalLevel>>  // fallback demo
employeeNotes    → Record<string, string>
profileOk        → { manager: boolean, employee: boolean }
teamValidated    → boolean
activeTeam       → Person[]
```

### Pattern fallback

Se Supabase non e raggiungibile, l'app usa dati demo hardcoded (`INITIAL_NOTES`, `INITIAL_EVALS`, `ORG_ALL`, `TEAM`, `BEHAVIORS`). Questo garantisce che il tool sia sempre dimostrabile senza infrastruttura.

---

## 8. Schermate e flussi UX

### 8.1 Team Validation (primo accesso)

Wizard iniziale in cui il manager conferma il proprio team:
- Lista persone dell'organizzazione con team suggerito pre-selezionato
- Possibilita di aggiungere/rimuovere persone
- Conferma con conteggio: "Conferma team (X persone)"

### 8.2 Home

**Manager:** Saluto personalizzato, CTA nota rapida, carosello team con badge valutazioni per persona.

**Employee:** Saluto motivazionale, vista semplificata.

### 8.3 Profile

Scheda persona con:
- Header (avatar, nome, ruolo, dipartimento)
- Obiettivo di ruolo
- Doppia conferma (Manager OK / Employee OK)
- Card comportamenti raggruppati per categoria (DNA / Team)
- Per ogni comportamento:
  - **Manager:** selettore livello, indicatore AI counter, pulsante storico
  - **Employee:** valutazione manager in sola lettura, textarea "La tua prospettiva"

### 8.4 Behaviors

Vista dettagliata libreria comportamenti con descrizione e indicatori.

### 8.5 Team Dashboard

- **AI Insights:** area critica (piu valutazioni training) e punto di forza (piu valutazioni example)
- **Heatmap comportamenti:** griglia Comportamenti × Persone con colori per livello
- **Card individuali:** punti di forza e aree di sviluppo per ogni membro

### 8.6 Modali

**QuickNoteModal:** Selezione persona → selezione comportamento → textarea osservazione (con AI check linguaggio) → livello → salva.

**HistoryDrawer:** Drawer laterale con note raggruppate per autore (manager/employee), ordinate per data.

---

## 9. Funzionalità AI

Le funzionalità AI sono attualmente **rule-based** (non usano LLM), implementate direttamente in `App.tsx`.

### 9.1 Rilevamento linguaggio giudicante

Nella QuickNoteModal, il testo viene controllato per keyword giudicanti:

```
"passiv", "timid", "pigr", "scarso"
```

Se trovate, appare un suggerimento AI per riformulare l'osservazione in modo fattuale.

### 9.2 AI Counter Indicator

Quando un manager imposta il livello `training` per un comportamento, ma lo storico contiene note positive (`on_track`/`example`), appare un messaggio:

> "Questo comportamento e stato osservato in altre situazioni"

Invita il manager a rivedere lo storico prima di confermare.

### 9.3 Team Insights

`getTeamInsights()` analizza la distribuzione delle valutazioni:
- **Area critica:** comportamento con piu valutazioni `training`
- **Punto di forza:** comportamento con piu valutazioni `example`

### 9.4 Gating

Le feature AI sono controllate dal feature flag `ai_insights` (attualmente abilitato).

---

## 10. Feature flags

Gestiti tramite tabella Supabase `feature_flags`, letti con `useFeatureFlags()` (cache 5 min).

| Flag | Default | Descrizione |
|------|---------|------------|
| `peer_notes` | `false` | Abilita note tra colleghi (peer-to-peer) |
| `employee_self_notes` | `true` | Abilita la textarea "prospettiva employee" |
| `ai_insights` | `true` | Mostra sezione insight AI nella team dashboard |
| `ceo_dashboard` | `false` | Abilita dashboard CEO con company overview |

---

## 11. Design system

### Palette CVE

| Token | Valore | Uso |
|-------|--------|-----|
| `accent` | `#22C9AC` | Verde acqua CVE — accent primario |
| `bg` | `#F5F6F8` | Sfondo neutro chiaro |
| `surface` | `#FFFFFF` | Card e contenitori |
| `text` | `#1A1A1A` | Testo primario |
| `textMuted` | `#6B7280` | Testo secondario |
| `border` | `#EAECF0` | Bordi e divisori |

### Tipografia

| Font | Uso | Pesi |
|------|-----|------|
| **Sora** | Titoli, heading | 400, 600, 700 |
| **Inter** | Body, UI | 400, 500, 600, 700 |

### Spacing & Radius

| Token | Valore |
|-------|--------|
| `radiusSm` | 8px |
| `radiusMd` | 12px |
| `radiusLg` | 16px |
| `shadowSoft` | `0 1px 3px rgba(0,0,0,0.08)` |
| `shadowMedium` | `0 4px 12px rgba(0,0,0,0.1)` |
| `shadowElevated` | `0 8px 24px rgba(0,0,0,0.12)` |

### Dark mode

Supportato tramite variabili CSS in `index.css` (classe `.dark`) e `next-themes`. Tutti i colori sono definiti in formato HSL per facilitare il theming.

---

## 12. Setup sviluppo

### Prerequisiti

- Node.js >= 18
- npm

### Installazione

```bash
git clone <repo-url>
cd cvedemotool
npm install
```

### Configurazione Supabase (opzionale)

Crea un file `.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Poi esegui lo schema su Supabase:
```bash
# Copia il contenuto di supabase/schema.sql nel SQL Editor di Supabase
```

> Senza `.env.local`, l'app funziona comunque con dati demo.

### Avvio dev server

```bash
npm run dev
# → http://localhost:8080
```

---

## 13. Build e deploy

### Build

```bash
npm run build
# Output → /docs (per GitHub Pages)
```

La configurazione Vite imposta:
- `base: "/talent-track/"` — path base per GitHub Pages
- `outDir: "docs"` — cartella di output

### Deploy su GitHub Pages

1. Assicurarsi che il branch di deploy contenga la cartella `docs/`
2. In **Settings > Pages**: Source = "Deploy from a branch", Branch = `main`, Folder = `/docs`
3. Il sito sara disponibile su `https://<username>.github.io/talent-track/`

### Preview locale della build

```bash
npm run preview
```

---

## 14. Testing

```bash
npm run test          # Esecuzione singola
npm run test:watch    # Watch mode
```

Framework: **Vitest** con `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.

I test risiedono in `src/test/`. Al momento e presente un test di esempio.

---

## 15. Evoluzione futura

### Architettura

- [ ] Decomporre `App.tsx` in componenti/pagine separate
- [ ] Introdurre React Router per navigazione URL-based
- [ ] Implementare autenticazione Supabase (JWT) e restringere le RLS policy

### Funzionalità

- [ ] **CEO Dashboard** (gia predisposto: hooks + RPC + feature flag)
- [ ] **Peer notes** (flag `peer_notes` gia presente)
- [ ] Integrazione LLM per insight AI piu sofisticati (attualmente rule-based)
- [ ] Notifiche push per nuove valutazioni
- [ ] Export dati (CSV/PDF)

### Infrastruttura

- [ ] CI/CD pipeline (lint + test + build)
- [ ] Staging environment
- [ ] Monitoring e analytics
