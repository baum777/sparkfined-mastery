## UI/UX Architektur — Übergabe-Dokument (1:1 umsetzbar)

**Projekt**: Sparkfined PWA (Vite + React + TypeScript + Tailwind + shadcn/ui)  
**Ziel dieses Dokuments**: Eine Person (oder Agent) soll die UI/UX **ohne Interpretationsspielraum** anhand der bestehenden Code-Struktur **1:1 weiterbauen / angleichen / refactoren** können.

---

## 0) Nicht-verhandelbare Leitplanken (bitte strikt befolgen)

- **Build-Quelle ist ausschließlich `src/`**  
  `index.html` lädt `/src/main.tsx` → nur `src/` ist zur Laufzeit relevant.  
  Der Ordner `ui/` ist ein Referenz-Snapshot/Blueprint, aber **nicht** Teil des Builds.

- **Dark-Mode-first ist Standard**  
  `ThemeProvider` nutzt `defaultTheme="dark"` und `enableSystem={false}` (`src/App.tsx`).  
  Light Mode ist erlaubt, aber muss token-konform bleiben.

- **Keine Hardcode-Farben in Komponenten**  
  Alle Farben laufen über Tokens (CSS-Variablen) + Tailwind-Mapping.  
  Ausnahme: neutrale Alpha-Werte, die ausdrücklich als Design-Rezept definiert sind (z.B. `rgb(255 255 255 / 0.05)` als Border-Subtle im Tailwind-Token).

- **Navigation ist zentral konfiguriert**  
  Nav-Items werden aus `src/config/navigation.ts` bezogen.  
  Sidebar, Mobile-Bottom-Nav und Mobile-Advanced-Sheet sollen daraus ableiten, nicht duplizieren.

- **A11y & UX-Qualität sind Teil der Definition of Done**  
  Fokus-Ringe (`focus-visible`), Tastatur-Navigation, sinnvolle `aria-*`, und konsistente Empty-/Loading-States sind verpflichtend.

---

## 1) Zielbild der UI/UX (Warum die App so gebaut ist)

### 1.1 UX-Prinzipien
- **Data-First**: Inhalte/Daten sind wichtiger als Dekor; UI ist „ruhig“ und lässt Daten wirken.
- **Efficiency**: Kernaktionen sind mit minimalen Interaktionen erreichbar (z.B. Journal Entry, Alerts, Chart).
- **Progressive Disclosure**: Komplexität wird nur bei Bedarf gezeigt (z.B. Quick Add/Sheet, Advanced Nav, Filter).
- **Mobile-Ready**: gleiche Kernfunktionalität, aber adaptierte Navigation (Bottom Nav + Sheets).

### 1.2 Primäre Nutzerziele
- **Übersicht** (Dashboard): KPIs + nächste Aktionen.
- **Erfassen/Review** (Journal): Auto-capture + Manual Entry + Segmentierung nach Status.
- **Analysieren** (Chart): Markt/Token wählen, Zeitrahmen wechseln, optional Replay.
- **Operieren** (Alerts/Watchlist/Oracle/Learn): schnelle Nebenflüsse, ohne die Kernarbeit zu stören.

---

## 2) Informationsarchitektur (IA) & Routing (Source of Truth)

### 2.1 Routen (Ist-Stand, build-relevant)
Definiert in `src/App.tsx` (unterhalb von `AppShell`):
- **Primary**:
  - `/` Dashboard
  - `/journal` Journal
  - `/lessons` Learn
  - `/chart` Chart
  - `/alerts` Alerts
  - `/settings` Settings
- **Secondary (Advanced)**:
  - `/watchlist` Watchlist
  - `/oracle` Oracle
  - `/handbook` Handbook
- **Alias/Legacy**:
  - `/replay` → `Replay` (Redirect zu `/chart?replay=true`)
  - `/learn` → `Learn` (Alias zu `/lessons`)
  - `/chart/replay` → `Replay` (Redirect zu `/chart?replay=true`)
- **Fallback**:
  - `*` → `NotFound`

### 2.2 Navigation Items (Single Source of Truth)
Definiert in `src/config/navigation.ts`:
- `primaryNavItems`: Dashboard, Journal, Learn, Chart, Alerts, Settings
- `secondaryNavItems`: Watchlist, Oracle, Handbook
- `activeRoutes`: z.B. Chart ist aktiv für `/chart`, `/chart/replay`, `/replay`

**Regel für Erweiterungen**:
- Neue Page hinzufügen ⇒ **immer**:
  - Route in `src/App.tsx`
  - Nav-Item in `src/config/navigation.ts` (falls navigierbar)
  - Active-State-Regel (`activeRoutes`) ergänzen, wenn Subroutes existieren
  - `data-testid` nach bestehendem Schema

---

## 3) Layout-Architektur (Shell) — Desktop & Mobile

### 3.1 AppShell (Layout Wrapper)
**Datei**: `src/features/shell/AppShell.tsx`

Struktur:
- `SidebarProvider defaultOpen`
- Desktop: `AppSidebar` + `SidebarInset`
- Header: `AppHeader` (sticky)
- Content: `<main className="... pb-20 md:pb-0">` (BottomNav-Space auf Mobile)
- Mobile: `MobileBottomNav` (fixed)

**Kernregeln**:
- Content muss innerhalb von `<Outlet />` rendern (React Router).
- Mobile BottomNav ist nur unter `md` sichtbar; Desktop Sidebar ab `md`.
- `pb-20` ist verpflichtend, damit BottomNav nichts überdeckt.

### 3.2 Desktop Sidebar
**Datei**: `src/features/shell/AppSidebar.tsx`

UX-Details:
- Kollabierbar auf Icon-only (`collapsible="icon"`).
- Active State:
  - aktiv: `bg-surface-hover`, `text-brand`, `border-l-2 border-brand`, `shadow-glow`
  - inaktiv: `text-text-secondary`, hover → `bg-surface-hover` + `text-text-primary`
- Advanced Section ist `Collapsible` und öffnet automatisch, wenn eine Secondary-Route aktiv ist.

### 3.3 Header
**Datei**: `src/features/shell/AppHeader.tsx`

Funktionen:
- Desktop: SidebarTrigger sichtbar, HandbookTrigger sichtbar.
- Mobile: Logo links, Advanced-Menu als Sheet rechts.
- Zentrum: „CA Search“ (mit History Dropdown).

Persistenzen/Keys:
- Search History: `localStorage["ca-search-history"]` (max 5)

Navigation:
- Suche navigiert zu `navigate(/chart?token=...)` (Chart muss QueryParam robust handhaben).

### 3.4 Mobile Navigation
**Datei**: `src/features/shell/MobileBottomNav.tsx`

Regeln:
- zeigt ausschließlich `primaryNavItems`.
- Active-Indikator als kleiner brandfarbener Balken unter dem Icon.
- Fokus-Ring: `focus-visible:ring-brand/60`.

Mobile Advanced Sheet:
- im Header implementiert (nicht in BottomNav)
- zeigt `secondaryNavItems` + Handbook Trigger.

---

## 4) Design System (Tokens → Tailwind → Komponenten)

### 4.1 Token-Quelle
- **CSS Tokens**: `src/styles/tokens.css`  
  Definiert RGB-Channel Tokens wie `--color-brand: 15 179 76;` (für Tailwind Alpha-Support).
- **Global CSS/Rezepte**: `src/index.css`  
  Importiert Tokens und definiert:
  - Base Typo-Defaults
  - Utility-Rezepte (`.card-default`, `.btn-primary`, `.input-base`, Badges, Table-Rezepte)

### 4.2 Tailwind Mapping
**Datei**: `tailwind.config.ts`

Zwei Token-Schichten:
- **Legacy shadcn Tokens**: `--background`, `--foreground`, `--primary`, ... (für shadcn-Kompatibilität)
- **Sparkfined Tokens**: `brand`, `surface`, `text`, `border-sf`, `sentiment`, etc.

**Regeln**:
- In neuen Komponenten bevorzugt Sparkfined Tokens (`bg-surface`, `text-text-primary`, `border-border-sf-subtle`, `shadow-glow`).
- shadcn-Komponenten dürfen weiterhin Legacy Tokens nutzen, solange Output visuell konsistent bleibt.

### 4.3 Verbindliche UI-Rezepte (Wiederverwendung statt Ad-hoc Klassen)
In `src/index.css` definierte Klassen sollen bevorzugt werden:
- Cards: `.card-default`, `.card-interactive`
- Buttons: `.btn-primary`, `.btn-secondary`
- Inputs: `.input-base`
- Badges: `.badge-bull`, `.badge-bear`, `.badge-neutral`
- Tables: `.table-wrapper`, `.table-header`, `.table-row-hover`
- Navigation: `.nav-header`, `.nav-mobile-bottom`

**Regel**: Wenn ein Pattern an 3+ Stellen gebraucht wird, wird es als Rezept in `src/index.css` (oder als Component) konsolidiert.

---

## 5) Komponenten-Schichten & Verantwortlichkeiten (damit nichts „ausfranst“)

### 5.1 Schichtenmodell (praktisch)
- **Pages (`src/pages/*`)**: Routing-Einstiegspunkte.  
  Keine UI-Primitives duplizieren; orchestrieren Daten + Page-Layout + Feature-Views.
- **Shell (`src/features/shell/*`)**: App-weite Navigation und Layout.
- **Feature Layer (`src/features/*`)**: Domain-Logik + Stores + Feature-Views (z.B. `journal/JournalView`).
- **Shared Components (`src/components/*`)**: Wiederverwendbare, aber nicht primitive Bausteine (z.B. Dashboard Cards, Alerts UI, Settings Sektionen).
- **UI Primitives (`src/components/ui/*`)**: shadcn/Radix-Komponenten (Button, Tabs, Dialog, Sheet, Input, Sidebar, …).
- **Hooks (`src/hooks/*`)**: Cross-cutting Hooks (z.B. `use-mobile`).
- **Lib (`src/lib/*`)**: Utility (z.B. `cn`).

### 5.2 Import-Regeln
- Shared Components dürfen `features/*` konsumieren (z.B. Hook), aber **kein unkontrolliertes Cross-Feature-Hopping**.
- UI-Primitives sind „leaf nodes“: sie importieren keine Features.
- Pages importieren typischerweise:
  - Page-spezifische Components aus `src/components/<feature>/`
  - Feature-Views/Stores aus `src/features/<feature>/`

### 5.3 Test-IDs
Viele Komponenten nutzen `data-testid`.  
**Regel**: Neue interaktive UI-Elemente bekommen `data-testid`, insbesondere:
- Nav, Buttons, Form-Submit, Dialog/Sheet, leere Zustände.

---

## 6) UX-Patterns (verbindliche Interaktionsmuster)

### 6.1 Empty States
Jede Page/Section mit Datenabhängigkeit braucht:
- **Empty State** (keine Daten)
- **Filtered Empty State** (Filter = Ergebnis 0)
- **Preview/Placeholder** (optional, wie Dashboard Widgets mit `opacity-60`)

Beispiele (Ist-Stand):
- Dashboard: `DashboardEmptyState` + Preview Widgets.
- Alerts: `AlertsEmptyState` + Filter-Empty.
- Watchlist: `WatchlistEmptyState` + Detail-Empty.
- Oracle: `OracleEmptyState` abhängig vom Filter.

### 6.2 Modals/Sheets (Mobile-first)
Regel:
- **Sheets** für „Flow“-Eingaben (Entry, Advanced Menu, Mobile Sidebar).
- Dialogs nur für harte Confirmations (z.B. Delete Confirm).

Ist-Stand:
- Journal Manual Entry: `Sheet` rechts (Desktop), fullscreen-ähnlich auf Mobile.
- Header Advanced: `Sheet` rechts.
- Chart Mobile Sidebar: `Sheet` links.

### 6.3 Fokus-Management
Verbindlich:
- `focus-visible` Ring-Styling (bereits in Navigation/Buttons).
- Wenn ein Add-Input aufklappt: Fokus setzen (Watchlist nutzt `setTimeout + focus()`).
- Dropdowns/Overlays müssen Klick-Außen schließen (Header History Dropdown implementiert das).

### 6.4 Progressive Disclosure
- Advanced Features sind in „Advanced“ Section (Desktop Collapsible, Mobile Sheet).
- Chart Right Panel nur Desktop; Mobile nutzt Sheets.

### 6.5 Tastaturkürzel
Chart Replay implementiert:
- Space/Enter: Play/Pause
- ArrowLeft/ArrowRight: Step

Regel:
- Wenn eine View keyboard-intensiv ist, bekommt sie `tabIndex={0}` und verarbeitet KeyDown nur im relevanten Modus (wie Chart Replay).

---

## 7) Page-by-Page Architektur (Ist-Stand, inkl. UX-Flow & Komponenten-Hierarchie)

### 7.1 Dashboard (`/`)
**Datei**: `src/pages/Dashboard.tsx`

Ziele:
- KPIs + schnelle Einstiege (Journal/Alerts/Chart/Oracle).
- „Bento“-artige Card-Zusammenstellung.

Komponenten-Orchestrierung:
- `DashboardHeader`, `DashboardKpiCards`
- Datenabhängig:
  - bei `!hasTrades`: `DashboardEmptyState` + Preview Widgets (opacity reduziert)
  - sonst: `DailyBiasCard`, Grid mit `HoldingsCard`/`LastTradesCard`, `JournalSnapshotCard`/`InsightCard`, `RecentEntriesCard`
- Mobile CTA: `DashboardFab`

Datenquellen:
- `useTradesStore()` (manual trades, localStorage-basiert)
- `useAlerts()` (aktuell UI-State/Mock, je nach Implementierung)

### 7.2 Journal (`/journal`)
**Datei**: `src/pages/Journal.tsx`

Ziel:
- Auto-capture + manuelle Ergänzung (Notes, etc.).
- Segmentierte Darstellung nach Status: Pending / Confirmed / Archived.

Ist-Flow:
- Header mit „Entry“-Button → öffnet `Sheet` „Manual Entry“ (`JournalEntryForm`).
- Darunter `JournalView` (Segmented Control / Tabs innerhalb des Views).

Datenquellen:
- `useJournalStore()` (counts: pending/archived/confirmed)

Wichtiger Hinweis (Architektur-Delta, dokumentiert):
- Parallel existiert auch `useTradesStore()` (Dashboard nutzt das).  
  Wenn „1:1“ Ziel ist: entweder **bewusst trennen** (Manual Trades vs Auto-Captured Entries) oder **konsolidieren** (siehe Working Paper).

### 7.3 Learn (`/lessons`)
**Datei**: `src/pages/Learn.tsx`

Ziel:
- Lernmodule, Filter + Sort, Unlock Hinweis.

UX:
- Header zeigt Unlock-Progress
- `UnlockCallout`
- `LessonFilters` (Category Multi-Select + Sort + Reset)
- Grid: `LessonCard` in responsive columns

### 7.4 Chart (`/chart`)
**Datei**: `src/pages/Chart.tsx`

Ziel:
- Markt/Token auswählen, Timeframe wechseln, optional Replay.
- Desktop: zusätzliche Tooling/Patterns rechts; Mobile: Sheet-basierte Navigation.

State/URL:
- Replay Mode via `?replay=true`
- Chart Banner Persistenz: `localStorage["chartShowTokenBanner"]` (Key wird live via `storage` Event synchronisiert)

Komponenten:
- `ChartTopBar` (Token Source: Watchlist/Recent; Token Select)
- Main Canvas (Placeholder), optional `ChartReplayControls`
- `ChartBottomPanels` (Bottom Tabs/Panels)
- `ChartFooter` (Pattern Library / Footer)
- Desktop Right Panel: `ChartRightPanel`
- Mobile Sidebar: `ChartSidebar` in `Sheet`

Integrationen:
- `useWatchlist()` liefert Items
- `useRecentlyViewed()` für Recent Tokens

### 7.5 Alerts (`/alerts`)
**Datei**: `src/pages/Alerts.tsx`

Ziel:
- Schnell neue Alerts anlegen, filtern, togglen, löschen.

UX:
- Empty State → CTA „Create“
- QuickCreate Form (optional einblendbar)
- Filter Pills (`AlertFilters`)
- Liste aus `AlertCard`
- Delete Confirmation Dialog (`AlertDeleteConfirm`)

Datenquellen:
- `useAlerts()` (filtering, create, delete, toggle)

### 7.6 Settings (`/settings`)
**Datei**: `src/pages/SettingsPage.tsx`

Ziel:
- Einstellungen als klare Sektionen, priorisierte Bereiche oben.

UX:
- Header + `SetupCompleteness`
- Sektionen via `SettingsSection`:
  - Appearance → `ThemeToggle`
  - Chart prefs → `ChartPrefsSettings`
  - Notifications → `NotificationsSettings`
  - Connected wallets → `ConnectedWalletsSettings`
  - Monitoring → `MonitoringSettings`
  - Journal data → `JournalDataSettings`
  - Token usage → `TokenUsageSettings`
  - Risk defaults → `RiskDefaultsSettings`
  - Backup & Restore → `DataExportImport`
  - Advanced → `AdvancedSettings`
  - Danger zone → `FactoryReset`
- CTA „Update app“ (derzeit UI-only)

Soll-Refactoring (aus Specs):
- Tabs/Routing-Tabs sind als Soll definiert (`docs/SOLL_SPEZIFIKATION_TABS_FLOWS.md`), Ist ist Single Scroll.

### 7.7 Watchlist (`/watchlist`)
**Datei**: `src/pages/Watchlist.tsx`

Ziel:
- Master-Detail: Liste links, Detail rechts (Desktop), stack auf Mobile.

UX:
- Wenn leer: Empty State + Add CTA (setzt Fokus auf Input)
- Wenn gefüllt:
  - `WatchlistQuickAdd` (Header)
  - Grid: Cards links, Detail rechts (`lg:grid-cols-[1fr,400px]`)
  - Detail Panel sticky auf Desktop

### 7.8 Oracle (`/oracle`)
**Datei**: `src/pages/Oracle.tsx`

Ziel:
- „AI insights“ konsumieren, filtern, als gelesen markieren.

UX:
- Header + `OracleFilters` (All/New/Read)
- Optional `OracleTodayTakeaway`
- `OracleRewardBanner` (streak)
- Liste `OracleInsightCard` oder `OracleEmptyState`

---

## 8) Tabs & Flows (Soll-Zustand, verbindliche Richtung)

Referenzen:
- `docs/SOLL_SPEZIFIKATION_TABS_FLOWS.md`
- `docs/SPEZIFIKATION_TABS_FLOWS.md` (Mapping/Tab-Strukturen)

### 8.1 Tabs: Wo und wie
- Für „Perspektivenwechsel im selben Kontext“:
  - Journal: Liste / Analyse / Kalender
  - Settings: General / Data / System (oder weitere)
  - Chart: Bottom Panels sind bereits vorhanden

Technik-Regel:
- Tabs-Komponente: `src/components/ui/tabs.tsx` (Radix/shadcn).
- Optional: URL-Sync (Deep-Linking) via Query Param (`?tab=` oder `?view=`), wenn der Tab state-ful ist.

### 8.2 Flows/Wizards
- Onboarding Flow (First Run) ist Soll: Welcome → Theme → Import/Start Fresh → Finish.
- Trade Logging Flow ist Soll: Quick Add (minimales Modal) → Review Flow (detailliert, ggf. Tabs „Data/Psych/Media“).

---

## 9) Persistenz, UI-State & UX-Konsequenzen

### 9.1 Bereits genutzte localStorage Keys (UI-relevant)
- `theme` (next-themes)
- `ca-search-history` (Header)
- `chartShowTokenBanner` (Chart UX)
- Journal/Trades Keys sind feature-abhängig (siehe `docs/TECHNICAL_SYSTEM_DOCUMENTATION.md` und Feature Stores).

**Regel**:
- Jeder neue Persistenz-Key muss:
  - dokumentiert werden (mind. in diesem Dokument oder in `TECHNICAL_SYSTEM_DOCUMENTATION.md`)
  - eine klare Ownership haben (welches Feature schreibt/liest)
  - einen Fallback für corrupt data haben (try/catch parse)

---

## 10) Praktische Umsetzungs-Checkliste (wenn du „als Nächstes“ etwas baust)

### 10.1 Neue Page / neuer Tab
- Route anlegen in `src/App.tsx`
- Falls navigierbar: Eintrag in `src/config/navigation.ts`
- Page-Wrapper: `px-4 py-4 md:px-6 lg:py-6` beibehalten (Konsistenz)
- `data-testid="page-..."` hinzufügen
- Empty/Loading/Filtered Empty definieren

### 10.2 Neue UI-Komponente
- Wenn primitive: in `src/components/ui/` (shadcn style)
- Wenn shared: in `src/components/<bereich>/` oder `src/components/` (klarer Ownership)
- Tokens verwenden (`bg-surface`, `text-text-primary`, etc.)
- Fokus-Ring & Keyboard prüfen
- Reusable pattern? → Rezeptklasse oder Component extrahieren

### 10.3 Styling-Regeln
- Keine Hex-Farben in JSX/TSX
- Keine „random“ Schatten; nutze `shadow-card-subtle`, `shadow-glow(-brand/-accent)`
- Abstände sind 8px-grid-orientiert; wenn du Custom brauchst: `gap-grid-*` / `p-grid-*` nutzen oder erweitern

---

## 11) Referenzen (wo du was findest)

- **UI/UX Zielbild**: `docs/UI_UX_ARCHITECTURE.md`
- **System + Tabs + Dataflows**: `docs/TECHNICAL_SYSTEM_DOCUMENTATION.md`
- **Tabs/Flows Soll**: `docs/SOLL_SPEZIFIKATION_TABS_FLOWS.md`
- **Frontend Handover (src vs ui, Journal Sync/Dexie Blueprint)**: `docs/WORKING_PAPER_GEMINI3_FRONTEND_ARCHITEKTUR_HANDOVER.md`
- **Navigation Config**: `src/config/navigation.ts`
- **Shell**: `src/features/shell/*`
- **Tokens**: `src/styles/tokens.css`, `src/index.css`, `tailwind.config.ts`

