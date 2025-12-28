# 🔥 Sparkfined

> **Eine moderne PWA für Trading-Journaling und Performance-Analyse**

Sparkfined ist eine Progressive Web Application, die Trader dabei unterstützt, ihre Trading-Journey von impulsivem "Degen"-Verhalten hin zu diszipliniertem, systematischem Handeln zu entwickeln. Die App kombiniert strukturiertes Journaling mit Lern-Modulen, KI-basierten Insights und leistungsstarken Analyse-Tools.

---

## 🎯 Vision & Konzept

**Von Degen zu Master**: Sparkfined begleitet Trader auf ihrem Entwicklungsweg durch:
- **Strukturiertes Journaling** zur Dokumentation und Reflektion von Trades
- **Progressive Lern-Module** mit Unlock-Mechanismen für kontinuierlichen Fortschritt
- **KI-Insights (Oracle)** für personalisierte Trading-Weisheiten
- **Visuelle Analyse** mit Chart-Tools und Performance-Metriken
- **Gamification** durch Mastery-Progress und Reading-Streaks

---

## ✨ Features im Überblick

### Haupt-Features

| Tab | Zweck | Status |
|-----|-------|--------|
| **Dashboard** | Zentrale Übersicht mit Daily Snapshot, Holdings, Recent Trades und Quick Actions | ✅ Funktional |
| **Journal** | Trade-Erfassung mit Asset, Direction, Entry/Exit, PnL, Notes und Tags | ✅ Funktional + Persistenz |
| **Learn** | 6 progressive Lern-Module (Risk Management, Psychology, Technical Analysis) | ✅ Funktional |
| **Chart** | Chart-Analyse-Tool mit Annotations und Replay-Modus | ✅ Basis implementiert |
| **Alerts** | Preis-Alarm-System für Trading-Symbole | ✅ UI fertig (Mock-Daten) |
| **Settings** | Theme-Toggle, Backup/Restore, Factory Reset | ✅ Funktional |

### Erweiterte Features (Advanced)

| Tab | Zweck | Status |
|-----|-------|--------|
| **Watchlist** | Symbol-Tracking mit Trend-Analyse und Master-Detail-View | ✅ UI fertig (Mock-Daten) |
| **Oracle** | KI-generierte Trading-Insights nach Themen (Risk, Discipline, Strategy, Mindset) | ✅ UI fertig (Mock-Daten) |
| **Replay** | Chart-Replay-Modus für Analyse historischer Daten | 🚧 Proof-of-Concept |

---

## 🏗️ Architektur

### Tech Stack

```
Frontend:  React 18 + TypeScript + Vite (SWC)
Routing:   React Router DOM v6
UI:        Shadcn UI (Radix Primitives) + Tailwind CSS
State:     useSyncExternalStore + localStorage
Charts:    Recharts
Forms:     React Hook Form + Zod
```

### Design-Prinzipien

- **Feature-Based Architecture**: Modulare Organisation nach Domain-Features
- **Client-Side Only**: Keine Backend-Abhängigkeiten, volle Datenkontrolle beim User
- **Progressive Enhancement**: Schrittweiser Unlock von Features basierend auf User-Progress
- **Accessibility First**: WCAG-konforme UI-Komponenten via Radix UI
- **Mobile First**: Responsive Design mit dedizierter Mobile-Navigation

### Projekt-Struktur

```
src/
├── components/          # Shared & Feature-spezifische UI-Komponenten
│   ├── ui/              # Shadcn UI Primitives (Button, Dialog, Tabs, etc.)
│   ├── dashboard/       # Dashboard-spezifische Komponenten
│   ├── journal/         # Journal-spezifische Komponenten
│   ├── alerts/          # Alert-spezifische Komponenten
│   └── ...              # Weitere Feature-Komponenten
├── features/            # Feature-Module mit Business-Logik
│   ├── journal/         # Trade-Store & Typen
│   ├── alerts/          # Alert-Hooks & Logik
│   ├── watchlist/       # Watchlist-Management
│   ├── oracle/          # Oracle-Insights
│   └── shell/           # App-Layout (Sidebar, Header, Navigation)
├── pages/               # Routen-Einstiegspunkte (1 Page pro Tab)
├── config/              # App-Konfiguration (Navigation, Konstanten)
├── hooks/               # Utility-Hooks (useMobile, useToast, useLessons)
├── lib/                 # Hilfsfunktionen (utils.ts)
└── main.tsx             # App-Einstiegspunkt
```

---

## 🔄 Datenfluss & Persistenz

### Datenspeicherung

```
Feature          | Storage Key          | Persistenz | Status
-----------------+----------------------+------------+--------
Trades           | sparkfined_trades    | ✅ localStorage | Funktional
Theme            | theme                | ✅ next-themes  | Funktional
Alerts           | -                    | ❌ Nur State    | Geplant
Watchlist        | -                    | ❌ Nur State    | Geplant
Oracle Insights  | -                    | ❌ Nur State    | Geplant
```

### Kern-Datenflüsse

**Trade-Lifecycle** (Journal → Dashboard):
```
User Input → TradeEntryForm → useTradesStore.addTrade() 
→ localStorage → emitChange() → Re-Render (Dashboard + Journal)
```

**Navigation** (Multi-Device):
```
Desktop: Sidebar (kollapsierbar) + Header
Mobile:  Bottom Tab Bar (Primary) + Sheet (Advanced)
```

**Backup/Restore** (Settings):
```
Export: localStorage → JSON Blob → Download
Import: File Upload → JSON Parse → localStorage → Reload
```

---

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+ ([Installation via nvm](https://github.com/nvm-sh/nvm))
- npm oder bun

### Lokale Entwicklung

```bash
# Repository klonen
git clone <YOUR_GIT_URL>
cd sparkfined

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Der Development Server läuft auf `http://localhost:5173`

### Verfügbare Scripts

```bash
npm run dev          # Development Server mit HMR
npm run build        # Production Build
npm run build:dev    # Development Build mit Source Maps
npm run preview      # Preview des Production Builds
npm run lint         # ESLint Check
```

---

## 📚 Dokumentation

### Detaillierte Dokumentation

Für eine vollständige technische Dokumentation siehe:

- **[TECHNICAL_SYSTEM_DOCUMENTATION.md](./docs/TECHNICAL_SYSTEM_DOCUMENTATION.md)** - Komplettes System-Abbild mit allen Tabs, Datenflüssen und Verdrahtungen
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architektur-Überblick und Design-Patterns
- **[SOLL_SPEZIFIKATION_TABS_FLOWS.md](./docs/SOLL_SPEZIFIKATION_TABS_FLOWS.md)** - Geplante Tab-Erweiterungen und User-Flows

### Navigation der Dokumentation

```
docs/
├── TECHNICAL_SYSTEM_DOCUMENTATION.md  # Vollständiges System-Abbild (alle Tabs detailliert)
├── ARCHITECTURE.md                    # Tech Stack, Projekt-Struktur, Conventions
└── SOLL_SPEZIFIKATION_TABS_FLOWS.md   # Roadmap: Tab-Refactoring & Onboarding
```

**Empfohlen für**:
- **Neue Entwickler**: Start mit ARCHITECTURE.md → TECHNICAL_SYSTEM_DOCUMENTATION.md
- **Feature-Entwicklung**: SOLL_SPEZIFIKATION_TABS_FLOWS.md für Roadmap
- **Orchestrator/AI**: TECHNICAL_SYSTEM_DOCUMENTATION.md als vollständiger System-Kontext

---

## 🎨 Design-System

### Theme

- **Dark Mode** (Standard) + Light Mode
- Umschaltbar via Settings → Appearance
- Persistiert in localStorage via next-themes

### UI-Komponenten

Basiert auf **Shadcn UI** (Radix UI Primitives):
- Accessibility-first (ARIA-konform)
- Voll anpassbar mit Tailwind CSS
- Tree-shakeable (nur verwendete Komponenten im Bundle)

### Responsive Breakpoints

```
sm:  640px   (Tablet Portrait)
md:  768px   (Desktop Start - Sidebar sichtbar)
lg:  1024px  (Desktop)
xl:  1280px  (Large Desktop)
```

---

## 🗺️ Roadmap

### Phase 1: Core Stabilität ✅
- [x] Basis-Navigation mit allen 9 Tabs
- [x] Journal mit localStorage-Persistenz
- [x] Dashboard mit Trade-Integration
- [x] Settings mit Backup/Restore

### Phase 2: Persistenz-Ausbau 🚧
- [ ] Alerts in localStorage persistieren
- [ ] Watchlist in localStorage persistieren
- [ ] Oracle Read-States persistieren
- [ ] Lesson Progress speichern

### Phase 3: Tab-System 📋
- [ ] Settings mit Tabs (Allgemein, Daten, System)
- [ ] Journal mit Tabs (Liste, Analyse, Kalender)
- [ ] URL-Parameter-Sync für Tab-States

### Phase 4: User Flows 🎯
- [ ] Onboarding Wizard (First-Run)
- [ ] Trade Entry Flow (Quick Add + Detailed Review)
- [ ] Chart-to-Journal Integration (Screenshots)

### Phase 5: Intelligente Features 🤖
- [ ] Learn Unlock-Logik basierend auf Trades
- [ ] Oracle mit echter Trading-Daten-Analyse
- [ ] Performance-Dashboard mit Metriken
- [ ] Pattern-Recognition in Trades

---

## 🔒 Sicherheit & Datenschutz

### Client-Side Only
- **Keine Server**: Alle Daten bleiben lokal im Browser
- **Keine Accounts**: Keine Registrierung oder Login erforderlich
- **Volle Kontrolle**: User besitzt 100% seiner Daten

### Daten-Management
- **Backup**: Manueller Export als JSON-Datei
- **Restore**: Import von Backup-Dateien
- **Factory Reset**: Komplette Löschung aller localStorage-Daten

### Limitationen
- Keine Multi-Device-Sync (zukünftig optional via Backend)
- localStorage Quota: ~5-10 MB (Browser-abhängig)

---

## 🤝 Contribution

### Development Workflow

1. Branch von `main` erstellen
2. Feature implementieren
3. Tests schreiben (sobald Test-Setup vorhanden)
4. Commit Messages: [Conventional Commits](https://www.conventionalcommits.org/)
5. Pull Request erstellen

### Code Style

- **TypeScript**: Strikte Typisierung für alle Props und State
- **Imports**: Aliase verwenden (`@/components/...`)
- **Komponenten**: Funktional mit Hooks
- **Dateinamen**: PascalCase für Komponenten, camelCase für Hooks/Utils

### Commit Message Format

```
feat(journal): add trade export to CSV
fix(dashboard): correct PnL calculation
docs(readme): update architecture section
```

---

## 📊 Status & Metriken

### Current State

```
✅ Funktional & Persistiert:  2 Features (Journal, Settings)
✅ UI Komplett:               6 Features (Dashboard, Learn, Chart, Alerts, Watchlist, Oracle)
🚧 In Entwicklung:            Tab-System, Onboarding
📋 Geplant:                   Persistenz-Ausbau, Daten-Integration
```

### Code-Metriken

- **9 Pages** (Tabs/Routen)
- **6 Feature-Module** (mit eigenen Stores/Hooks)
- **49 UI-Komponenten** (Shadcn Basis-Komponenten)
- **~40 Custom Components** (Feature-spezifisch)
- **TypeScript Coverage**: 100%

---

## 📝 Lizenz

Dieses Projekt ist für den privaten und kommerziellen Gebrauch verfügbar.

---

## 🔗 Links

- **Dokumentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/YOUR_REPO/issues)
- **Projekt-Board**: [GitHub Projects](https://github.com/YOUR_REPO/projects)

---

**Built with 🔥 for Traders by Traders**
