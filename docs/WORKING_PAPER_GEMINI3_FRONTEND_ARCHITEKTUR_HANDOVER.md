## Working Paper (Übergabe) — Frontend-Architektur für Gemini3

**Ziel**: Detaillierte, ausführbare Frontend-Architektur-Übergabe, damit Gemini3 das **Main-Frontend** (build-relevant: `src/`) **entsprechend des Lovable-Frontends** (Referenz-Snapshot: `ui/`) angleicht.

**Datum**: 30.12.2025  
**Repo-Kontext**: Vite + React + TypeScript + Tailwind + shadcn-ui/Radix, React Router v6, TanStack Query.

---

## 1. Executive Summary (1 Minute)

Dieses Repo enthält **zwei nahezu vollständige Frontend-Bäume**:

- **Main App (build-relevant)**: `src/` (Entry in `index.html` zeigt auf `/src/main.tsx`)
- **Lovable Referenz-Snapshot (nicht im Build)**: `ui/` (quasi „zweite App“, dient als UI/Infra-Blueprint)

Die Kernaufgabe für Gemini3 ist **nicht** „neue UI erfinden“, sondern:

- `src/` soll **visuell + strukturell** auf den Lovable-Stand gebracht werden (Design System, Shell, Flows).
- Kritische Infra aus `ui/` (z.B. **ErrorBoundary + Wallet-Provider + Wallet-Guard + Dexie-basierter Journal-Store + Wallet-basierter Sync**) muss **sauber in `src/` portiert** werden.
- Duplikate/Parallelwelten (`src/*` vs. `ui/*`) müssen als Übergang akzeptiert, aber am Ende **konsolidiert** werden (Source of Truth: `src/`).

---

## 2. Muss gelesen werden (vor Ausführung)

- **UI/UX Zielbild**: `docs/UI_UX_ARCHITECTURE.md`
- **Ist-Dokumentation / Datenflüsse**: `docs/TECHNICAL_SYSTEM_DOCUMENTATION.md`
- **Bestehendes Mission Briefing (Gemini3)**: `docs/WORKING_PAPER_GEMINI3.md`

Zusätzlich als „Code-Blueprint“:

- **Lovable Snapshot**: `ui/` (insb. `ui/App.tsx`, `ui/journal/useJournalStore.ts`, `ui/components/*`)
- **Main App**: `src/App.tsx`, `src/features/shell/*`, `src/features/journal/*`

---

## 3. Nicht verhandelbare Constraints

- **Build-Einstiegspunkt**: `index.html` lädt `/src/main.tsx` → nur `src/` ist zur Laufzeit relevant.
- **Alias**: `@` zeigt auf `./src` (siehe `vite.config.ts`). Pfade aus `ui/` werden nicht automatisch aufgelöst.
- **Design-System**: Tokens sind **CSS-Variablen**, Tailwind nutzt diese Tokens (kein Hardcode-HEX in Komponenten).
- **Dark Mode**: Default ist **dark** (`ThemeProvider defaultTheme="dark"`).

---

## 4. Ist-Architektur der Main App (`src/`)

### 4.1 Boot/Runtime

- `index.html` → `/src/main.tsx` → `src/App.tsx`
- Globale Provider in `src/App.tsx`:
  - `ThemeProvider` (next-themes; `defaultTheme="dark"`, `enableSystem={false}`)
  - `QueryClientProvider` (TanStack Query)
  - `TooltipProvider`
  - `Toaster` + `Sonner` (Notifications)
  - `BrowserRouter` + `Routes`
  - `HandbookPanelProvider` + `HandbookSheet` + `GlobalActionHandler`

### 4.2 Routing

- Routing ist flach und hängt unter `AppShell`:
  - Primary: `/`, `/journal`, `/lessons`, `/chart`, `/alerts`, `/settings`
  - Secondary (Advanced): `/watchlist`, `/oracle`, `/handbook`
  - Alias/Legacy: `/replay`, `/learn`

### 4.3 Shell / Navigation (Zielbild-konform vorhanden)

- Layout: `src/features/shell/AppShell.tsx`
  - Desktop: Sidebar + Header
  - Mobile: Header + Bottom Nav
- Single Source of Truth für Nav Items: `src/config/navigation.ts`
- Komponenten:
  - `src/features/shell/AppSidebar.tsx` (Desktop)
  - `src/features/shell/AppHeader.tsx` (Header; in `src/` bereits erweitert mit CA-Suche + History)
  - `src/features/shell/MobileBottomNav.tsx` (Mobile Primary Tabs)

### 4.4 Design System / Styling

- Tailwind Tokens: `tailwind.config.ts`
- CSS:
  - `src/index.css` importiert `./styles/tokens.css`
  - `src/styles/tokens.css` enthält RGB-Channel Tokens (Brand/Surfaces/Text/Borders/Shadows/Radii)
- shadcn config: `components.json` (Aliases: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`)

### 4.5 State & Daten

Wichtig: Es existieren **mehrere parallele Datenpfade**, teils unverdrahtet:

- `useTradesStore` (`src/features/journal/useTradesStore.ts`):
  - minimaler External Store + `localStorage` Key `sparkfined_trades`
  - wird z.B. im Dashboard genutzt
- `useJournalStore` (`src/features/journal/useJournalStore.ts`):
  - External Store + `localStorage` Keys:
    - `sparkfined_pending_entries`, `sparkfined_archived_entries`, `sparkfined_confirmed_entries`
    - `sparkfined_extended_settings`
  - aber: UI-Views nutzen aktuell **Mock-Daten** als Default
- Wallet-/Sync-Infrastruktur:
  - `src/hooks/useJournalSync.ts` existiert und ruft `/api/tx/sync` auf
  - `src/features/journal/journal-entry-extended-logic.ts` existiert und persistiert Events in **Dexie** (`journal-db-schema.ts`)
  - ABER: `useJournalStore` in `src/` nutzt **nicht** Dexie, sondern localStorage. → Datenpfad ist inkonsistent.

---

## 5. Lovable Referenz-Architektur (`ui/`) — „Soll“-Blueprint

### 5.1 Provider-Stack (zusätzlich zu `src/`)

`ui/App.tsx` hat zusätzlich:

- `ErrorBoundary` (globales Crash-UI)
- `WalletContextProvider` (Solana Wallet Adapter, inkl. UI Styles Import)
- `WalletGuard` (Route Guard; schützt Journal ohne Wallet)

### 5.2 Journal als wallet-spezifische, lokale DB (Dexie)

`ui/journal/useJournalStore.ts` ist der wichtigste Blueprint:

- Wallet-Kontext (`currentWallet`) via `setJournalWallet(wallet)`
- Quelle der Wahrheit: **Dexie** (`db.entries`)
- Migration: `sparkfined_dexie_migration_v1` (localStorage → Dexie)
- UI-Reaktivität: in-memory mirrors + `useSyncExternalStore`
- CRUD:
  - Pending ↔ Archived ↔ Confirmed werden über `status` in derselben Dexie-Tabelle verwaltet

### 5.3 Wallet-basierter Sync

In `ui/pages/Journal.tsx`:

- generiert `sparkfined_device_secret` (für API Auth)
- setzt `setJournalWallet(publicKey)`
- startet `useJournalSync(wallet, secret)`

### 5.4 Konsequenz

`ui/` beschreibt ein **kohärentes** System:

Wallet → Sync (`/api/tx/sync`) → NormalizedTxEvent → `handleNewTransaction()` → Dexie DB → `useJournalStore` lädt Dexie → UI Views zeigen echte Daten.

---

## 6. Delta-Analyse: Was genau muss angeglichen werden?

### 6.1 Struktur/Source of Truth

- **Entscheidung**: `src/` ist Source of Truth (Build). `ui/` ist nur Referenz.
- Ziel: `src/` soll **funktional** den `ui/`-Stand erreichen; `ui/` kann danach archiviert/entfernt werden.

### 6.2 Missing in `src/` (aus `ui/` übernehmen)

- `ErrorBoundary` (global)
- Wallet Integration:
  - `WalletContextProvider`
  - `WalletGuard`
  - ggf. Wallet UI Styles (`@solana/wallet-adapter-react-ui/styles.css`)
- Journal Store Architektur:
  - `setJournalWallet()`
  - Dexie-basierte `loadFromDexie()`
  - Migration localStorage → Dexie
- Journal Route Flow:
  - Journal Page setzt Wallet + startet Sync (statt „Manual Entry“-Sheet-only)

### 6.3 Inkonsistenzen in `src/`, die bewusst aufgelöst werden müssen

- **Doppelte Journal-Welten**:
  - „Trades“ (`sparkfined_trades`) vs. „Auto-Captured Journal Entries“ (pending/archived/confirmed + Dexie)
  - Entscheidung nötig: entweder klar trennen (Manual Trades vs Wallet Journal) oder zusammenführen.
- **Mock-Daten in Views** (`ConfirmedView`, `PendingView`, `LogbookView`):
  - Diese müssen durch Store-Daten ersetzt werden.

---

## 7. Zielarchitektur (Sollbild für `src/`)

### 7.1 Layering

- **App Layer**: `src/App.tsx` (Provider, Routing)
- **Shell Layer**: `src/features/shell/*` (Navigation/Layout)
- **Feature Layer**: `src/features/*` (Journal, Alerts, Chart, …)
- **UI Kit Layer**: `src/components/ui/*` (shadcn)
- **Data Layer**:
  - Local DB: Dexie (`src/features/journal/journal-db-schema.ts`)
  - Services/Sync: `src/hooks/useJournalSync.ts`, `src/features/journal/journal-entry-extended-logic.ts`
  - Optional: später Supabase/Remote Services (Interface-first)

### 7.2 Datenfluss (Journal, Ziel)

1. Wallet verbunden (UI)
2. `useJournalSync(wallet, secret)` pollt `/api/tx/sync`
3. `handleNewTransaction(event)` dedupliziert und schreibt in Dexie
4. `useJournalStore` lädt Dexie nach Wallet-Wechsel und bei Änderungen
5. `JournalView` zeigt:
   - Pending = aktive Entries (24h Window)
   - Logbook = archived/expired
   - Journal = confirmed (mit Enrichment)

---

## 8. Konkreter Umsetzungsplan (für Gemini3, in Phasen)

### Phase A — Konsolidierungs-Entscheidung + Sicherheitsgeländer

- **A1**: Explizit dokumentieren: `src/` ist Build-Source-of-Truth, `ui/` ist Referenz.
- **A2**: Erstellen einer kurzen Mapping-Tabelle (Datei → Datei), z.B.:
  - `ui/components/ErrorBoundary.tsx` → `src/components/ErrorBoundary.tsx`
  - `ui/components/WalletContextProvider.tsx` → `src/components/WalletContextProvider.tsx`
  - `ui/components/WalletGuard.tsx` → `src/components/WalletGuard.tsx`
  - `ui/journal/useJournalStore.ts` → `src/features/journal/useJournalStore.ts` (ersetzen/mergen)
  - `ui/pages/Journal.tsx` → `src/pages/Journal.tsx` (Flow angleichen)

### Phase B — Provider-Layer (App.tsx) auf Lovable-Stand

- **B1**: `src/App.tsx` um `ErrorBoundary` wrappen.
- **B2**: `src/App.tsx` um `WalletContextProvider` erweitern (falls Wallet-Flow gewünscht).
- **B3**: Route Guard:
  - Journal-Route mit `WalletGuard` wrappen (wie `ui/App.tsx`), falls Journal zwingend walletbasiert sein soll.

**Dependency Note**: `ui/` referenziert Solana Wallet Adapter Packages. Wenn die Main App das wirklich nutzen soll, müssen diese Dependencies in `package.json` ergänzt werden (sonst Build-Fail).

### Phase C — Journal Data Layer kohärent machen (Dexie als Quelle)

- **C1**: `src/features/journal/useJournalStore.ts` auf Dexie-Pattern umstellen:
  - `currentWallet` + `setJournalWallet`
  - `loadFromDexie()`
  - Migration localStorage → Dexie (MIGRATION_KEY)
  - persist/delete via Dexie statt localStorage
- **C2**: Sicherstellen, dass `handleNewTransaction()` und Dexie Schema kompatibel sind mit dem Entry-Shape, den die UI erwartet.
- **C3**: Journal-Store soll mindestens folgende Exporte liefern:
  - `useJournalStore()`
  - `setJournalWallet(wallet: string | null)`
  - Actions: archive/confirm/delete/update + settings update

### Phase D — Journal UI verdrahten (Mocks raus, Store rein)

- **D1**: `src/pages/Journal.tsx` auf Lovable-Flow:
  - device secret
  - set wallet im Store
  - start sync loop
- **D2**: `src/features/journal/JournalView.tsx` so ändern, dass:
  - `ConfirmedView` echte `confirmedEntries` bekommt
  - `PendingView` echte `pendingEntries` bekommt + callbacks an Store-Actions bindet
  - `LogbookView` echte `archivedEntries` bekommt + confirm-from-archive erlaubt
- **D3**: Mock Defaults entfernen oder nur als Dev-Fallback hinter Feature Flag lassen.

### Phase E — UI/UX Feinangleichung

- **E1**: Validieren, dass `src/index.css`, `tailwind.config.ts` und Tokens exakt dem Lovable Design System entsprechen (sind aktuell bereits deckungsgleich).
- **E2**: Navigation / Shell finalisieren:
  - Desktop Collapsible Sidebar (ist vorhanden)
  - Mobile Bottom Nav + Advanced Sheet (ist vorhanden)
  - Optional: CA Search in Header (existiert nur in `src/`; Entscheidung: behalten oder Lovable-Stand „clean“ machen)

---

## 9. Testplan / Definition of Done

### Funktional (Minimum)

- [ ] App startet (`npm run dev`) ohne Runtime-Error
- [ ] Routing funktioniert (alle Tabs erreichbar)
- [ ] Dark Mode Default, Tokens aktiv (keine Hardcode-Farben)

### Journal (Lovable-Stand)

- [ ] Ohne Wallet: Journal zeigt Guard/CTA (wenn guard aktiv)
- [ ] Mit Wallet: Sync läuft (Network calls zu `/api/tx/sync`)
- [ ] Neue Events landen in Dexie und tauchen im Pending Tab auf
- [ ] Full Exit → Entry wird archived/logbooked (je nach Business Rules)
- [ ] Confirm Flow schreibt Enrichment und Entry erscheint in Confirmed Tab

### Qualität

- [ ] Keine ESLint Errors (`npm run lint`)
- [ ] Keine offensichtlichen Mock-Daten im Produktionspfad (oder klar geflaggt)

---

## 10. Risiko-Liste (und wie man sie entschärft)

- **R1: Wallet Dependencies fehlen**  
  `ui/` referenziert Solana Wallet Adapter Packages, die ggf. in `package.json` nicht vorhanden sind. → Früh im Projekt klären und Dependencies sauber hinzufügen.

- **R2: Zwei Journal-Modelle (Trades vs Entries)**  
  `useTradesStore` (manual) und `useJournalStore` (wallet/entries) sind parallel. → Entweder klar trennen (UX: zwei Konzepte) oder zusammenführen (komplexer).

- **R3: Dexie Schema vs UI Entry Shape**  
  `handleNewTransaction` schreibt `JournalEntry` Records. UI erwartet `AutoCapturedEntry`-Shape. → Mapping/Adapter einführen oder Schema angleichen.

- **R4: Nicht-Build Ordner `ui/` driftet weiter**  
  `ui/` ist Referenz; Änderungen müssen nach `src/`. → Nach Port: `ui/` einfrieren/archivieren.

---

## 11. Kurz-Checkliste für Gemini3 (Start heute)

- Lies `docs/UI_UX_ARCHITECTURE.md`
- Entscheide: Journal wallet-only oder hybrid
- Portiere Provider-Layer (ErrorBoundary, Wallet Provider/Guard)
- Migriere `src/features/journal/useJournalStore.ts` auf Dexie-Pattern (wie `ui/`)
- Verdrahte JournalView/Views mit echten Store-Daten (Mocks raus)

