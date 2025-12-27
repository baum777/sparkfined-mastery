# Architektur-Dokumentation

## 1. Überblick & Tech Stack

Dieses Projekt ist eine moderne React-Anwendung für Trading-Journaling und Analyse. Die Architektur folgt einem modularen, feature-basierten Ansatz, um Wartbarkeit und Skalierbarkeit zu gewährleisten.

### Core Stack
*   **Framework**: React 18 (TypeScript)
*   **Build Tool**: Vite 5 (SWC)
*   **Styling**: Tailwind CSS 3
*   **Routing**: React Router DOM v6

### UI & UX
*   **Component Library**: Shadcn UI (basierend auf Radix UI Primitives)
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **Animation**: Tailwindcss-animate
*   **Forms**: React Hook Form + Zod (Validation)

### State Management & Data Persistence
*   **Lokaler State**: React `useState`, `useReducer`
*   **Globaler State**: Custom Stores basierend auf `useSyncExternalStore` (keine externe Library wie Redux/Zustand notwendig für den aktuellen Scope)
*   **Persistenz**: Browser `localStorage` als primärer Datenspeicher (Client-side only architecture)

---

## 2. Projektstruktur

Die Codebasis ist nach **Features** organisiert, nicht primär nach technischen Schichten. Dies kapselt Logik, Typen und Komponenten, die zusammengehören.

```
/workspace/src/
├── components/         # Geteilte UI-Komponenten (Atoms/Molecules)
│   ├── ui/             # Shadcn UI Basis-Komponenten (Button, Tabs, Dialog...)
│   └── ...             # Feature-übergreifende Business-Komponenten
├── config/             # App-weite Konfigurationen (Navigation, Konstanten)
├── features/           # Feature-Module (Domain Logic)
│   ├── alerts/         # Alarm-Logik & Hooks
│   ├── chart/          # Charting-Engine
│   ├── journal/        # Trading-Journal (Core Feature)
│   ├── oracle/         # KI/Analyse-Features
│   ├── shell/          # App-Layout (Sidebar, Header)
│   └── watchlist/      # Watchlist-Management
├── hooks/              # Allgemeine Utility-Hooks (useMobile, useToast)
├── lib/                # Hilfsfunktionen (utils.cn)
├── pages/              # Routen-Einstiegspunkte (verbinden Features)
└── ...
```

---

## 3. Architektur-Konzepte

### 3.1 Feature-Based Architecture
Jedes Feature-Verzeichnis (z.B. `src/features/journal`) enthält alles, was für dieses Feature spezifisch ist:
*   `components/`: Feature-spezifische UI-Komponenten.
*   `types.ts`: TypeScript-Definitionen für das Domänenmodell.
*   `use{Feature}Store.ts`: Zustandsmanagement und Business-Logik.
*   `index.ts`: Public API des Features (Exports für den Rest der App).

### 3.2 State Management Pattern
Wir verwenden ein leichtgewichtiges Store-Pattern mit `useSyncExternalStore` für globale Daten (z.B. Trades, Alerts), die persistiert werden müssen.

**Beispiel Flow (Journal Store):**
1.  **Store Definition**: Ein Singleton-Objekt hält die Daten (`trades`).
2.  **Persistence**: Initialisierung aus `localStorage` beim Start; Schreiben bei Updates.
3.  **Reactivity**: `emitChange()` benachrichtigt alle Subscriber über Änderungen.
4.  **Hook**: `useTradesStore()` gibt Komponenten Zugriff auf Daten und Actions (`addTrade`, `deleteTrade`).

### 3.3 Navigation & Routing
*   **AppShell**: Zentrales Layout (`src/features/shell/AppShell.tsx`), das Sidebar und Header bereitstellt.
*   **Routing**: Definiert in `main.tsx` oder `App.tsx`.
*   **Navigation Config**: Zentralisiert in `src/config/navigation.ts` für einfache Erweiterbarkeit der Menüs.

---

## 4. Geplante Erweiterungen (Tabs & Flows)

Zur Verbesserung der UX wird die Architektur um explizite Konzepte für **Navigation Tabs** und **User Flows** erweitert (siehe `docs/SOLL_SPEZIFIKATION_TABS_FLOWS.md`).

### 4.1 Tab-Architektur
Tabs dienen der horizontalen Segmentierung von Inhalten innerhalb einer Page.
*   **Implementierung**: Nutzung von `src/components/ui/tabs.tsx` (Radix UI).
*   **State**: Der aktive Tab kann lokal (`defaultValue`) oder via URL-Parameter gesteuert werden, um Deep-Linking zu ermöglichen.
*   **Einsatzorte**: Settings (Gruppierung von Einstellungen), Journal (Wechsel zwischen Liste/Analyse).

### 4.2 Flow-Architektur
Flows sind geführte Prozesse, die oft modal sind und einen isolierten State benötigen.
*   **Onboarding Flow**:
    *   Globaler Check beim App-Start (via `localStorage` Flag).
    *   Implementiert als Multi-Step Dialog/Wizard.
*   **Trade Entry Flow**:
    *   Trennung in **Quick Add** (minimales Modal) und **Detailed Log** (Vollbild/Drawer).
    *   Nutzung von `react-hook-form` für Validierung über mehrere Schritte hinweg.

---

## 5. Coding Conventions

*   **Typisierung**: Strikte TypeScript-Typen für alle Props und State-Objekte.
*   **Imports**: Nutzung von Aliasen (`@/components/...`) statt relativen Pfaden (`../../`).
*   **Komponenten**: Funktional, Nutzung von Hooks für Logik.
*   **Dateinamen**: PascalCase für Komponenten (`MyComponent.tsx`), camelCase für Hooks/Utils (`useMyHook.ts`).
