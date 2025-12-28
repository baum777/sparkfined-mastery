# Technisches System-Abbild: Sparkfined PWA

**Dokumenttyp**: Technical Communication Orchestrator Input  
**Ziel**: Vollständige Dokumentation aller Tabs, deren Verdrahtung und Datenflüsse  
**Erstellt**: 28. Dezember 2025  
**Version**: 1.0.0

---

## 1. Executive Summary

Sparkfined ist eine Progressive Web Application (PWA) für Trading-Journaling und -Analyse. Die Anwendung verwendet eine client-side-only Architektur mit localStorage als primärem Datenspeicher. Das System besteht aus 9 Haupt-Tabs (Pages) mit komplexen Datenflüssen zwischen verschiedenen Features.

### Technologie-Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **UI**: Shadcn UI (Radix UI Primitives) + Tailwind CSS
- **State Management**: useSyncExternalStore + localStorage
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

---

## 2. Navigationsarchitektur

### 2.1 Routing-Struktur

Die Anwendung verwendet ein hierarchisches Routing-System mit einem zentralen `AppShell` als Layout-Wrapper.

```
App.tsx
└── BrowserRouter
    └── Routes
        └── AppShell (Layout)
            ├── / (Dashboard)
            ├── /journal
            ├── /learn
            ├── /chart
            ├── /alerts
            ├── /settings
            ├── /watchlist (Advanced)
            ├── /oracle (Advanced)
            ├── /replay (Chart Sub-Feature)
            └── * (NotFound)
```

### 2.2 Navigation-Kategorien

**Primary Navigation** (Haupt-Tabs, immer sichtbar):
- Dashboard (/)
- Journal (/journal)
- Learn (/learn)
- Chart (/chart)
- Alerts (/alerts)
- Settings (/settings)

**Secondary Navigation** (Advanced Features, kollapsierbar):
- Watchlist (/watchlist)
- Oracle (/oracle)

**Sub-Features** (nicht in Navigation):
- Replay (/replay) - Spezialansicht des Chart-Tabs

### 2.3 Navigation-Komponenten

```
AppShell
├── AppSidebar (Desktop: Sidebar, kollapsierbar)
│   ├── Primary Nav Items
│   └── Advanced Nav Items (Collapsible)
├── AppHeader (Mobile: Logo + Advanced Menu Trigger)
└── MobileBottomNav (Mobile: Bottom Tab Bar)
```

---

## 3. Detaillierte Tab-Beschreibungen

### 3.1 Dashboard (/)

**Zweck**: Zentrale Übersicht und Einstiegspunkt der Anwendung

**Komponenten-Hierarchie**:
```
Dashboard
├── MasteryProgressCard (Fortschrittsanzeige)
├── DashboardEmptyState (wenn keine Trades)
└── Dashboard Grid (wenn Trades vorhanden)
    ├── DailySnapshotCard
    ├── HoldingsCard
    ├── LastTradesCard
    ├── QuickActionsCard
    ├── InsightCard
    └── AlertsSnapshotCard
```

**Datenabhängigkeiten**:
- **Liest von**: `useTradesStore` (Journal)
- **Lokaler State**: 
  - `hasTrades`: Boolean (mindestens ein Trade vorhanden)
  - `trades`: Array von Trade-Objekten
  - `triggeredAlerts`: Anzahl ausgelöster Alerts (aktuell hardcoded zu 0)
  - `insightsReady`: Boolean (mindestens 5 Trades für Insights)
  - `masteryStep`: Nummer (0-5, basierend auf Anzahl Trades)

**Datenflüsse**:
```
localStorage (sparkfined_trades)
    ↓
useTradesStore
    ↓
Dashboard
    ↓ (Display only, keine Mutations)
DashboardCards
```

**Besonderheiten**:
- Zeigt Preview-Widgets mit reduzierter Opacity, auch wenn keine Daten vorhanden
- Mastery Progress basiert auf Trade-Anzahl (max 5 Steps)
- Insights werden ab 5 Trades als "ready" markiert

---

### 3.2 Journal (/journal)

**Zweck**: Erfassung und Verwaltung von Trading-Einträgen

**Komponenten-Hierarchie**:
```
Journal
├── Header
│   ├── Title & Description
│   └── JournalProgress (State Indicator)
├── TradeEntryForm
│   ├── Asset Input
│   ├── Direction Select (Long/Short)
│   ├── Entry Price & Date
│   ├── Exit Price (optional)
│   ├── PnL (optional)
│   ├── Notes Textarea (optional)
│   └── Tags Input (optional)
└── Trade List
    ├── JournalEmptyState (wenn leer)
    └── Trade Count Display
```

**Datenmodell (Trade)**:
```typescript
interface Trade {
  id: string;              // UUID
  asset: string;           // z.B. "BTC", "AAPL"
  direction: "long" | "short";
  entryPrice: string;
  entryDate: string;       // ISO String
  exitPrice?: string;      // Optional
  pnl?: string;            // Optional
  notes?: string;          // Optional
  tags?: string;           // Optional, comma-separated
  createdAt: string;       // ISO String
}
```

**State Management**:
```
useTradesStore (Global Store)
├── State: trades[] (Array)
├── Persistence: localStorage key "sparkfined_trades"
└── Actions:
    ├── addTrade(data) → Trade
    ├── getTrades() → Trade[]
    └── getRecentTrades(count) → Trade[]
```

**Datenflüsse**:
```
User Input
    ↓
TradeEntryForm (React Hook Form + Zod)
    ↓
handleTradeSubmit
    ↓
useTradesStore.addTrade()
    ↓
localStorage.setItem()
    ↓
emitChange() → Re-render all subscribers
    ↓
Dashboard, Journal (aktualisiert)
```

**Validierung**: React Hook Form + Zod (zu implementieren)

**Besonderheiten**:
- Alle Trades werden chronologisch absteigend gespeichert (neueste zuerst)
- UUID wird automatisch generiert
- createdAt wird automatisch beim Erstellen gesetzt
- Toast-Notification bei erfolgreichem Speichern

---

### 3.3 Learn (/learn)

**Zweck**: Progressive Lern-Module mit Unlock-Mechanismus

**Komponenten-Hierarchie**:
```
Learn
├── Header
│   ├── Icon + Title
│   └── Progress (X of Y lessons unlocked)
├── UnlockCallout (Anzahl gesperrter Lektionen)
├── LessonFilters
│   ├── Category Filters (Multi-Select)
│   └── Sort Options (Newest, Difficulty Asc/Desc)
└── Lesson Grid
    └── LessonCard[] (mehrere Karten)
        ├── Title
        ├── Category Badge
        ├── Difficulty Stars (1-5)
        ├── Lock Status
        ├── Completion Status
        ├── Unlock Hint (wenn gesperrt)
        ├── Apply Tip (wenn entsperrt)
        └── Drill Route Link
```

**Datenmodell (Lesson)**:
```typescript
interface Lesson {
  id: string;
  title: string;
  category: "Risk Management" | "Psychology" | 
            "Technical Analysis" | "Trade Setup";
  difficulty: number;     // 1-5
  isLocked: boolean;
  isCompleted: boolean;
  unlockHint: string;     // z.B. "Log 3 trades to unlock"
  applyTip: string;       // z.B. "Never risk more than 2% per trade"
  drillRoute: "/journal" | "/chart";
}
```

**State Management**:
```
useLessons Hook
├── State: LESSONS[] (Static Array, aktuell hardcoded)
├── Computed:
│   ├── categories: String[]
│   ├── unlockedCount: Number
│   └── totalCount: Number
└── Local Component State:
    ├── activeCategories: String[]
    └── sortOption: "newest" | "difficulty-asc" | "difficulty-desc"
```

**Datenflüsse**:
```
Static LESSONS Array
    ↓
useLessons Hook
    ↓
Learn Page
    ↓ (Filter & Sort)
filteredAndSortedLessons
    ↓
LessonCard Components
```

**Unlock-Logik**:
- **Aktuell**: Hardcoded isLocked-Property
- **Geplant**: Dynamische Unlock-Bedingungen basierend auf:
  - Anzahl geloggter Trades (useTradesStore)
  - Abgeschlossene andere Lektionen
  - Custom Achievements

**Besonderheiten**:
- Keine Persistenz (Lessons sind statisch)
- Unlock-Mechanismus ist vorbereitet, aber noch nicht implementiert
- Drill Routes verlinken zu Journal oder Chart für praktische Übungen

---

### 3.4 Chart (/chart)

**Zweck**: Chart-Analyse und Setup-Annotation

**Komponenten-Hierarchie**:
```
Chart
├── Header
│   ├── Title & Description
│   └── LogSetupCTA (Call-to-Action Button)
├── ChartParamsHint (Info zu URL-Parametern)
├── ChartToolbar (Drawing Tools, Settings)
└── ChartCanvas (Haupt-Chart-Komponente)
```

**Datenflüsse**:
```
Chart Canvas
├── Keine direkte Integration mit useTradesStore
├── Eigenständiges Feature für Chart-Analyse
└── Mögliche zukünftige Integration:
    - Screenshot-Upload zu Trades
    - Setup-Linking mit Journal-Einträgen
```

**Besonderheiten**:
- Aktuell isoliertes Feature
- URL-Parameter für Chart-Konfiguration vorbereitet
- Replay-Modus verfügbar unter /replay

---

### 3.5 Alerts (/alerts)

**Zweck**: Preis-Alarm-Verwaltung

**Komponenten-Hierarchie**:
```
Alerts
├── Header
├── AlertsEmptyState (wenn keine Alerts)
├── AlertQuickCreate (Create Form, toggle-bar)
├── AlertFilters
│   └── Filter: All | Active | Triggered | Paused
└── Alert List
    └── AlertCard[]
        ├── Symbol Badge
        ├── Condition & Target Price
        ├── Status Indicator
        ├── Created Date
        ├── Toggle Button (Active ↔ Paused)
        └── Delete Button
```

**Datenmodell (Alert)**:
```typescript
type AlertStatus = 'active' | 'triggered' | 'paused';

interface Alert {
  id: string;
  symbol: string;        // z.B. "BTC", "ETH"
  condition: string;     // z.B. "Price above", "Price below"
  targetPrice: number;
  status: AlertStatus;
  createdAt: Date;
}
```

**State Management**:
```
useAlerts Hook
├── State: alerts[] (Array, aktuell Mock-Daten im useState)
├── Local State: filter (FilterType)
└── Actions:
    ├── createAlert(symbol, condition, targetPrice)
    ├── deleteAlert(id)
    ├── toggleAlert(id) → Toggle zwischen active/paused
    ├── setFilter(filter)
    └── clearFilter()
```

**Datenflüsse**:
```
User Input (AlertQuickCreate)
    ↓
createAlert()
    ↓
alerts State (useState)
    ↓
filteredAlerts (useMemo)
    ↓
AlertCard Components
```

**Besonderheiten**:
- **Keine Persistenz**: Alerts leben nur im Component State (useState)
- **Mock-Daten**: Initialisiert mit 3 Beispiel-Alerts
- **Filter-Logik**: Client-side Filterung nach Status
- **Zukünftig geplant**: 
  - localStorage-Persistenz
  - Tatsächliche Preis-Checks (aktuell nur UI)
  - Push-Notifications

---

### 3.6 Settings (/settings)

**Zweck**: App-Konfiguration und Datenverwaltung

**Komponenten-Hierarchie**:
```
Settings
├── Header
├── SetupCompleteness (Onboarding Checklist)
├── SettingsSection: Appearance
│   └── ThemeToggle (Light/Dark Mode)
├── SettingsSection: Backup & Restore
│   └── DataExportImport
│       ├── Export Button (JSON Download)
│       └── Import Button (JSON Upload)
├── SettingsSection: Preferences (Coming Soon)
└── SettingsSection: Danger Zone
    └── FactoryReset
        └── Confirmation Dialog → localStorage.clear()
```

**Datenflüsse**:

**Theme Management**:
```
ThemeProvider (next-themes)
    ↓
localStorage key "theme"
    ↓
ThemeToggle Component
    ↓
CSS class "dark" on <html>
```

**Data Export**:
```
localStorage.getItem("sparkfined_trades")
    ↓
JSON.stringify()
    ↓
Blob Creation
    ↓
Download (filename: sparkfined_backup_YYYYMMDD.json)
```

**Data Import**:
```
User selects JSON file
    ↓
FileReader API
    ↓
JSON.parse()
    ↓
Validation (zu implementieren)
    ↓
localStorage.setItem("sparkfined_trades")
    ↓
Page Reload → Store Re-Init
```

**Factory Reset**:
```
User Confirmation Dialog
    ↓
localStorage.clear()
    ↓
window.location.reload()
```

**Besonderheiten**:
- SetupCompleteness zeigt Setup-Fortschritt (statisch, nicht dynamisch)
- Theme wird via next-themes verwaltet (separate Persistenz)
- Export/Import betrifft aktuell nur Trades, nicht Alerts/Watchlist
- Factory Reset löscht ALLE localStorage-Daten

---

### 3.7 Watchlist (/watchlist)

**Zweck**: Symbol-Tracking und Quick-Reference

**Komponenten-Hierarchie**:
```
Watchlist
├── Header
│   └── WatchlistQuickAdd (Input zum Hinzufügen)
├── WatchlistEmptyState (wenn leer)
└── Grid Layout
    ├── Watchlist Cards (Left/Main)
    │   └── WatchlistCard[]
    │       ├── Symbol + Name
    │       ├── Trend Indicator (Bullish/Bearish/Neutral)
    │       ├── Relevance Score (0-100%)
    │       ├── Added Date
    │       ├── Select Button
    │       └── Remove Button
    └── Detail Panel (Right/Sticky)
        └── WatchlistSymbolDetail
            ├── Symbol Header
            ├── Trend Analysis (placeholder)
            ├── Key Metrics (placeholder)
            └── Action Buttons
```

**Datenmodell (WatchlistItem)**:
```typescript
type TrendDirection = 'bullish' | 'bearish' | 'neutral';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  trend?: TrendDirection;
  relevance?: number;     // 0-100
  addedAt: Date;
}
```

**State Management**:
```
useWatchlist Hook
├── State: 
│   ├── items[] (useState, aktuell Mock-Daten)
│   └── selectedId (useState)
├── URL Sync: 
│   └── searchParams "selected" ↔ selectedId
└── Actions:
    ├── addItem(symbol, name?)
    ├── removeItem(id)
    └── selectItem(id)
```

**Datenflüsse**:

**URL Synchronisation**:
```
URL ?selected=BTC
    ↓ (useEffect on mount)
Find item by symbol
    ↓
setSelectedId(item.id)
    
User clicks card
    ↓
selectItem(id)
    ↓
setSearchParams({ selected: item.symbol })
    ↓
URL updates (replace: true, no history entry)
```

**Item Management**:
```
WatchlistQuickAdd
    ↓
addItem(symbol)
    ↓
setItems([...prev, newItem])
    ↓
WatchlistCard rendered

User clicks Remove
    ↓
removeItem(id)
    ↓
setItems(filtered)
    ↓
(wenn selectedId === id) → selectItem(null)
```

**Besonderheiten**:
- **Keine Persistenz**: Items leben nur im Component State
- **Mock-Daten**: Initialisiert mit 3 Beispiel-Items (BTC, ETH, SOL)
- **URL-State-Sync**: Selected item wird in URL reflektiert (Deep-Linking)
- **Master-Detail Pattern**: Links Liste, rechts Detail-Panel
- **Responsive**: Grid wird auf Mobile zu Stack

---

### 3.8 Oracle (/oracle)

**Zweck**: KI-generierte Insights und Trading-Weisheiten

**Komponenten-Hierarchie**:
```
Oracle
├── Header
│   └── OracleFilters (All | New | Read)
├── OracleTodayTakeaway (Featured Insight des Tages)
├── OracleRewardBanner (Reading Streak Gamification)
└── Insights List
    ├── OracleEmptyState (bei Filter ohne Ergebnisse)
    └── OracleInsightCard[]
        ├── Theme Badge (Risk/Discipline/Strategy/Mindset)
        ├── Title
        ├── Summary
        ├── Takeaway (Key Action)
        ├── Content (Expanded)
        ├── Read Status Indicator
        ├── Created Date
        └── Mark as Read Button
```

**Datenmodell (OracleInsight)**:
```typescript
interface OracleInsight {
  id: string;
  title: string;
  summary: string;        // Kurzbeschreibung
  takeaway: string;       // Actionable Tip
  content: string;        // Ausführlicher Text
  theme: 'risk' | 'discipline' | 'strategy' | 'mindset';
  isRead: boolean;
  createdAt: Date;
}
```

**State Management**:
```
useOracle Hook
├── State: 
│   ├── insights[] (useState, aktuell Mock-Daten)
│   └── filter (useState)
├── Computed (useMemo):
│   ├── counts { all, new, read }
│   ├── todayInsight (erste ungelesene von heute)
│   └── readingStreak (Anzahl gelesener Insights)
└── Actions:
    ├── setFilter(filter)
    └── markAsRead(id)
```

**Datenflüsse**:
```
MOCK_INSIGHTS (Static Array)
    ↓
useOracle Hook
    ↓
filteredInsights (useMemo basierend auf filter)
    ↓
OracleInsightCard Components

User clicks "Mark as Read"
    ↓
markAsRead(id)
    ↓
setInsights(updated)
    ↓
Re-compute counts & todayInsight
    ↓
Re-render
```

**Besonderheiten**:
- **Keine Persistenz**: Insights leben nur im Component State
- **Mock-Daten**: 3 Beispiel-Insights mit verschiedenen Themes
- **Today's Takeaway**: Erster ungelesener Insight von heute (Featured)
- **Reading Streak**: Gamification-Element (Anzahl gelesener Insights)
- **Filter-Logik**: All / New (ungelesen) / Read (gelesen)
- **Zukünftig**: 
  - Echte KI-Integration
  - Persistenz in localStorage
  - Trading-Daten-Analyse für personalisierte Insights

---

### 3.9 Replay (/replay)

**Zweck**: Chart-Replay-Modus (Sub-Feature von Chart)

**Komponenten-Hierarchie**:
```
Replay
├── ReplayPlayer
│   ├── Playback Controls
│   ├── Speed Selector
│   ├── Timeline Scrubber
│   └── Chart Canvas (Animated)
└── Settings Panel
```

**Besonderheiten**:
- Nicht in Haupt-Navigation sichtbar
- Wird von Chart-Tab verlinkt
- Eigenständige Route für bessere URL-Teilbarkeit
- Aktuell Proof-of-Concept-Implementierung

---

## 4. Datenfluss-Diagramme

### 4.1 Globaler Datenfluss (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│                     localStorage                             │
│  ┌────────────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │sparkfined_trades   │  │theme       │  │other_keys... │  │
│  └────────────────────┘  └────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓                         ↓
         ↓                    ThemeProvider
         ↓                         ↓
    useTradesStore           ThemeToggle
         ↓
    ├─→ Dashboard (read)
    ├─→ Journal (read/write)
    └─→ Learn (future: unlock logic)
```

### 4.2 Trade-Lifecycle

```
[User Input]
     ↓
TradeEntryForm (Journal Page)
     ↓
React Hook Form Validation
     ↓
onSubmit → addTrade({ asset, direction, ... })
     ↓
useTradesStore.addTrade()
     ├─→ Generate UUID
     ├─→ Add createdAt timestamp
     ├─→ Prepend to trades[]
     ├─→ localStorage.setItem()
     └─→ emitChange()
          ↓
     useSyncExternalStore (all subscribers)
          ↓
     ├─→ Dashboard (aktualisiert Karten)
     └─→ Journal (aktualisiert Liste)
```

### 4.3 Navigation-Flow

```
User Interaction
     ↓
├─ Desktop: AppSidebar Click
│      ↓
│  React Router Navigate
│      ↓
│  Route Matched
│      ↓
│  Page Component Rendered in <Outlet />
│
└─ Mobile: MobileBottomNav Click
       ↓
   React Router Navigate
       ↓
   (same as Desktop)
```

### 4.4 Settings Data Export Flow

```
User clicks "Export Data"
     ↓
DataExportImport Component
     ↓
localStorage.getItem("sparkfined_trades")
     ↓
Parse & Stringify (formatting)
     ↓
Create Blob (application/json)
     ↓
Create temporary <a> element
     ↓
Trigger download (sparkfined_backup_YYYYMMDD.json)
     ↓
User saves file to disk
```

### 4.5 Settings Data Import Flow

```
User clicks "Import"
     ↓
File Input Dialog
     ↓
User selects JSON file
     ↓
FileReader.readAsText()
     ↓
JSON.parse()
     ↓
Validation Check (aktuell minimal)
     ↓
localStorage.setItem("sparkfined_trades", data)
     ↓
window.location.reload()
     ↓
App re-initializes
     ↓
useTradesStore reads from localStorage
     ↓
All components aktualisiert
```

---

## 5. State-Management-Architektur

### 5.1 Store-Pattern (useTradesStore)

**Implementierung**: Leichtgewichtiges External Store Pattern

```typescript
// Singleton Store
let trades: Trade[] = [];
const listeners = new Set<() => void>();

// Initialization
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) trades = JSON.parse(stored);
} catch { trades = []; }

// Subscription System
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach(listener => listener());
}

// React Hook
export function useTradesStore() {
  const allTrades = useSyncExternalStore(
    subscribe, 
    getSnapshot, 
    getSnapshot
  );
  // ... actions
}
```

**Vorteile**:
- Keine externe State-Library nötig
- React 18 Native API (useSyncExternalStore)
- Automatic Batching
- Einfache Testbarkeit

**Pattern für andere Features**:
- Alerts: useState (kein Persist nötig aktuell)
- Watchlist: useState (Mock-Daten)
- Oracle: useState (Mock-Daten)
- Lessons: Static Array (keine Mutations)

### 5.2 Persistenz-Strategie

```
Feature          | Storage Key          | Persist Method       | Sync
-----------------+----------------------+----------------------+--------
Trades           | sparkfined_trades    | localStorage         | Auto
Theme            | theme                | next-themes library  | Auto
Alerts           | -                    | KEINE (useState)     | -
Watchlist        | -                    | KEINE (useState)     | -
Oracle Insights  | -                    | KEINE (useState)     | -
Lessons          | -                    | Static Array         | -
```

**Zukünftige Erweiterungen**:
- Alerts → `sparkfined_alerts`
- Watchlist → `sparkfined_watchlist`
- Oracle Read States → `sparkfined_oracle_read`
- Lesson Progress → `sparkfined_lesson_progress`

---

## 6. Komponenten-Verdrahtung

### 6.1 Shared UI Components

**Shadcn UI Library** (`src/components/ui/`):
- Alle Tabs nutzen gemeinsame UI-Primitives
- Beispiele: Button, Dialog, Tabs, Card, Badge, Select, Input, etc.
- Basieren auf Radix UI (Accessibility-first)

**Custom Shared Components**:
- `NavLink`: Wrapper um React Router Link mit Active States
- `SettingsSection`: Container für Settings-Bereiche
- Toasts: `useToast` Hook + Sonner Library

### 6.2 Feature-Specific Components

Jedes Feature hat eigenen Component-Folder:
```
src/components/
├── alerts/       (6 Komponenten)
├── chart/        (4 Komponenten)
├── dashboard/    (9 Komponenten)
├── journal/      (4 Komponenten)
├── lessons/      (4 Komponenten)
├── oracle/       (6 Komponenten)
├── settings/     (4 Komponenten)
└── watchlist/    (6 Komponenten)
```

**Keine Cross-Feature-Imports zwischen diesen Ordnern!**

### 6.3 Feature-Module (`src/features/`)

**Öffentliche APIs** über `index.ts`:

```typescript
// features/journal/index.ts
export { useTradesStore } from './useTradesStore';
export type { Trade } from './types';

// features/alerts/index.ts
export { useAlerts } from './useAlerts';
export type { Alert, AlertStatus } from './types';
```

**Import-Pattern**:
```typescript
// ✅ Gut: Über Feature-Index
import { useTradesStore, type Trade } from '@/features/journal';

// ❌ Schlecht: Direkter Import aus Implementierung
import { useTradesStore } from '@/features/journal/useTradesStore';
```

---

## 7. Abhängigkeits-Matrix

### 7.1 Inter-Tab-Abhängigkeiten

```
Tab          | Abhängig von (Reads)        | Mutiert
-------------+-----------------------------+------------------
Dashboard    | useTradesStore              | -
Journal      | useTradesStore              | useTradesStore
Learn        | (zukünftig: useTradesStore) | -
Chart        | -                           | -
Alerts       | -                           | Local State
Settings     | localStorage (all keys)     | localStorage (all)
Watchlist    | -                           | Local State
Oracle       | (zukünftig: useTradesStore) | Local State
Replay       | -                           | -
```

### 7.2 Data Dependencies Graph

```
                    useTradesStore
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
    Dashboard         Journal            Learn*
        ↓                                   ↓
  (Display only)                    (Unlock Logic*)
  
* = Geplant, nicht implementiert
```

### 7.3 Navigation Dependencies

```
AppShell (Layout)
    ├── AppSidebar (Desktop)
    │   └── navigation.ts (Primary + Secondary Items)
    ├── AppHeader (Mobile)
    │   └── navigation.ts (Secondary Items in Sheet)
    └── MobileBottomNav (Mobile)
        └── navigation.ts (Primary Items only)
```

**Zentrale Konfiguration**: `src/config/navigation.ts`
- Einzige Source of Truth für alle Nav-Items
- Changes in navigation.ts propagieren zu allen Nav-Komponenten

---

## 8. Routing & Deep-Linking

### 8.1 URL-Parameter-Nutzung

```
Route                | Parameter        | Zweck
---------------------+------------------+-----------------------------------
/watchlist           | ?selected=BTC    | Pre-select Watchlist Item
/chart               | (geplant)        | Chart-Konfiguration (Symbol, TF)
/replay              | (geplant)        | Replay-Daten-ID
/settings            | ?tab=backup      | Direct-Link zu Settings-Tab*
/journal             | ?tab=analysis    | Direct-Link zu Journal-Tab*

* = Geplant in Tab-Refactoring (siehe SOLL_SPEZIFIKATION_TABS_FLOWS.md)
```

### 8.2 Programmatic Navigation

**Verwendung von React Router Hooks**:
```typescript
import { useNavigate } from 'react-router-dom';

// Beispiel: Chart → Journal mit Kontext
const navigate = useNavigate();
navigate('/journal', { state: { prefilledAsset: 'BTC' } });
```

**Aktuell genutzt in**:
- QuickActionsCard (Dashboard → Journal)
- LessonCard (Learn → drillRoute)
- LogSetupCTA (Chart → Journal)

---

## 9. Responsive Design & Mobile Anpassungen

### 9.1 Breakpoints (Tailwind CSS)

```
sm:  640px   (Tablet Portrait)
md:  768px   (Tablet Landscape / Desktop Start)
lg:  1024px  (Desktop)
xl:  1280px  (Large Desktop)
2xl: 1536px  (Extra Large Desktop)
```

### 9.2 Navigation-Adaptierung

**Desktop (md:)**:
- Sidebar: Sichtbar, kollapsierbar zu Icon-only
- Header: Sidebar-Toggle + Logo (hidden on mobile)
- Bottom Nav: Hidden

**Mobile (< md:)**:
- Sidebar: Vollständig hidden
- Header: Logo + Advanced-Menu-Trigger (Sheet)
- Bottom Nav: Fixiert am unteren Rand (Primary Items only)

### 9.3 Layout-Anpassungen pro Tab

**Dashboard**:
- `md:grid-cols-2` → Karten stapeln sich auf Mobile

**Watchlist**:
- `lg:grid-cols-[1fr,400px]` → Master-Detail wird Stack auf Mobile
- Detail-Panel sticky nur auf Desktop

**Journal**:
- `sm:flex-row` → Header-Elemente vertikal auf Mobile

**Learn**:
- `sm:grid-cols-2 lg:grid-cols-3` → Lesson-Grid passt sich an

---

## 10. Geplante Erweiterungen (Roadmap)

### 10.1 Tab-System (siehe SOLL_SPEZIFIKATION_TABS_FLOWS.md)

**Settings**:
```
SettingsPage
└── Tabs
    ├── Tab: Allgemein (Theme, Setup)
    ├── Tab: Daten (Export/Import)
    └── Tab: System (Factory Reset, Version)
```

**Journal**:
```
JournalPage
└── Tabs
    ├── Tab: Liste (aktuell)
    ├── Tab: Analyse (Charts, Win-Rate)
    └── Tab: Kalender (Trade-Days Visualization)
```

### 10.2 Onboarding Flow

**Multi-Step Wizard** (Modal oder separate Route):
1. Welcome → App-Intro
2. Theme Selection
3. Data Import Option
4. First Trade Guidance
5. → Redirect zu Dashboard

**Trigger**: localStorage Flag `sparkfined_onboarding_complete`

### 10.3 Trade Entry Flow Refactoring

**Quick Add** (minimales Modal):
- Nur essentials: Asset, Direction, Entry, Size
- Für während des Tradings

**Detailed Review** (Drawer/Fullscreen):
- Vollständiges Formular
- Screenshot-Upload
- Multi-Step mit Tabs (Data, Psychology, Media)

### 10.4 Daten-Integration

**Chart ↔ Journal**:
- Screenshot aus Chart direkt zu Trade attachieren
- Setup-Markierungen als Trade-Metadata

**Learn ↔ Journal**:
- Unlock-Logik basierend auf Trade-Count
- Lesson-Completion durch Journal-Tags

**Oracle ↔ Trades**:
- Echte Analyse der Trade-Daten
- Pattern-Recognition
- Personalisierte Insights

---

## 11. Technische Limitationen & Offene Punkte

### 11.1 Fehlende Persistenz

**Aktuell nicht persistiert**:
- Alerts (useState only)
- Watchlist (useState only)
- Oracle Insights & Read-States (useState only)
- Lesson Progress (static)

**Impact**: Daten gehen bei Page Reload verloren

**Solution**: Migration zu localStorage analog zu Trades

### 11.2 Fehlende Validierung

**Export/Import**:
- Minimale Validierung beim Import
- Keine Schema-Versioning
- Keine Fehlermeldungen bei korrupten Backups

**Forms**:
- React Hook Form vorbereitet, Zod-Schemas teilweise missing

### 11.3 Mock-Daten

**Folgende Features verwenden Mock-Daten**:
- Alerts (3 hardcoded Beispiele)
- Watchlist (3 hardcoded Symbols)
- Oracle (3 hardcoded Insights)
- Lessons (6 hardcoded Lessons)

**Ziel**: Migration zu dynamischen Daten mit Backend-Integration

### 11.4 Fehlende Tests

- Keine Unit Tests
- Keine Integration Tests
- Nur manuelle Testids vorbereitet

---

## 12. Deployment & Build

### 12.1 Build Commands

```bash
npm run dev         # Development Server (Vite)
npm run build       # Production Build
npm run build:dev   # Development Build (with source maps)
npm run preview     # Preview Production Build locally
npm run lint        # ESLint Check
```

### 12.2 Build Output

```
dist/
├── assets/         # JS/CSS Bundles (hashed)
├── index.html      # Entry Point
└── favicon.ico, robots.txt, etc.
```

### 12.3 Environment

- **Node Version**: Modern (v18+)
- **Package Manager**: npm (oder bun, kompatibel)
- **Build Tool**: Vite 5 + SWC (schnelle Compilation)

---

## 13. Sicherheit & Datenschutz

### 13.1 Client-Side Only Architecture

**Vorteil**:
- Keine Server-Kosten
- Vollständige Datenkontrolle beim User
- Kein Account-System nötig

**Nachteil**:
- Keine Multi-Device-Sync
- Daten können bei localStorage-Clear verloren gehen
- Kein Backup außer manueller Export

### 13.2 Keine sensitiven Daten

- Trading-Daten bleiben lokal
- Keine persönlichen Identifikationsdaten
- Keine Finanz-Credentials

### 13.3 localStorage Limits

- **Quota**: ~5-10 MB (Browser-abhängig)
- **Risiko**: Bei sehr vielen Trades könnte Limit erreicht werden
- **Lösung**: Zukünftig Archivierung oder Compression

---

## 14. Performance-Überlegungen

### 14.1 Re-Render Optimierung

**useTradesStore**:
- useSyncExternalStore verhindert unnötige Re-Renders
- Subscribers werden nur bei emitChange() benachrichtigt

**useMemo/useCallback**:
- Filterlogik in Alerts, Oracle, Learn ist memoized
- Callbacks sind stabil (useCallback)

### 14.2 Bundle Size

- Shadcn UI: Tree-shakeable (nur verwendete Komponenten)
- Recharts: Lazy-Loading möglich (aktuell nicht implementiert)
- Lucide Icons: Tree-shakeable

### 14.3 Lazy Loading

**Aktuell**: Alle Routes werden eager geladen

**Zukünftig**:
```typescript
const Chart = lazy(() => import('./pages/Chart'));
const Replay = lazy(() => import('./pages/Replay'));
```

---

## 15. Zusammenfassung für Technical Communication Orchestrator

### 15.1 Kern-Erkenntnisse

**Architektur-Paradigma**: Feature-Based Modular Architecture
**State-Management**: useSyncExternalStore + localStorage für Persistence
**Routing**: Flat Hierarchy mit Sub-Features
**UI-Pattern**: Shadcn/Radix UI Composition
**Datenfluss**: Unidirektional (Store → Components)

### 15.2 Haupt-Datenflüsse

1. **Trade Lifecycle**: Journal Input → useTradesStore → localStorage → Dashboard Display
2. **Navigation**: User Click → React Router → Page Render in AppShell Outlet
3. **Settings Export**: localStorage → JSON Blob → File Download
4. **Settings Import**: File Upload → JSON Parse → localStorage → App Reload

### 15.3 Kritische Abhängigkeiten

- **Dashboard** ist abhängig von **Journal** (useTradesStore)
- **Learn** wird zukünftig abhängig von **Journal** (Unlock-Logik)
- **Alle Tabs** sind abhängig von **AppShell** (Layout)
- **Alle Tabs** nutzen **navigation.ts** (indirekt via Shell)

### 15.4 Erweiterungs-Punkte

1. **Persistenz**: Alerts, Watchlist, Oracle in localStorage migrieren
2. **Tab-System**: Settings & Journal mit Tab-Navigation ausstatten
3. **Onboarding**: First-Run-Flow implementieren
4. **Daten-Integration**: Chart ↔ Journal, Learn ↔ Journal verknüpfen
5. **Backend**: Optional für Multi-Device-Sync

---

## 16. Glossar

**Term**                | **Bedeutung**
------------------------|---------------------------------------------------------
PWA                     | Progressive Web Application
Trade                   | Ein Trading-Eintrag im Journal
Alert                   | Preis-Alarm-Regel
Watchlist Item          | Verfolgtes Trading-Symbol
Oracle Insight          | KI-generierte Trading-Weisheit
Lesson                  | Lern-Modul im Learn-Tab
Store                   | Globaler State-Container
useSyncExternalStore    | React 18 Hook für externe State-Subscriptions
localStorage            | Browser-API für persistente Client-Side-Daten
AppShell                | Layout-Wrapper mit Sidebar & Header
Master-Detail           | UI-Pattern mit Liste + Detail-Panel
Deep-Linking            | URL-basierte Navigation zu spezifischen App-States
Mock-Daten              | Hardcoded Beispiel-Daten für Entwicklung
Feature-Module          | Gekapselte Feature-Implementierung (features/ Ordner)

---

**Ende der Dokumentation**

Letzte Aktualisierung: 28. Dezember 2025  
Dokumentversion: 1.0.0  
Codebase Commit: cursor/pwa-documentation-and-data-flow-b678
