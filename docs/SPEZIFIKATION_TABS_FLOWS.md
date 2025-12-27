
## Anhang A: Detaillierte Tab-Struktur & Komponenten-Mapping

Dieser Anhang listet die definierte Tab-Struktur für alle Hauptbereiche der Applikation auf und ordnet sie den entsprechenden Komponenten zu.

### 1. Chart Bereich (`/chart`)
*   **Typ:** In-Page Tabs (Bottom Panel)
*   **Komponente:** `src/components/chart/ChartBottomTabs.tsx`
*   **Status:** Implementiert

| Tab Name | URL Param | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **Positions** | `view=positions` | `PositionsTable` | Aktuell offene Positionen für das Symbol. |
| **Orders** | `view=orders` | `OrdersTable` | Offene Limit/Stop Orders. |
| **History** | `view=history` | `TradeHistoryTable` | Vergangene Trades für das Symbol. |
| **Alerts** | `view=alerts` | `ChartAlertsList` | Aktive Alarme für das Symbol. |

### 2. Journal Bereich (`/journal`)
*   **Typ:** Routing-Tabs (Empfohlen) oder In-Page Tabs
*   **Komponente:** `src/pages/Journal.tsx` (Refactoring benötigt)
*   **Status:** Geplant (Aktuell Single-View)

| Tab Name | Route / Param | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **Log** | `/journal` | `JournalEntryForm`, `RecentEntriesSection` | Eingabe neuer Trades und Liste der letzten Einträge. |
| **Analytics** | `/journal/analytics` | `JournalStats`, `WinRateChart`, `PnLCurve` | Detaillierte Auswertung der Performance. |
| **Calendar** | `/journal/calendar` | `JournalCalendar` | Kalenderansicht der Trades (Heatmap). |

### 3. Settings (`/settings`)
*   **Typ:** Routing-Tabs (Vertical Sidebar auf Desktop)
*   **Komponente:** `src/pages/SettingsPage.tsx`
*   **Status:** Geplant (Aktuell Single-Page Scroll)

| Tab Name | Route | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **General** | `/settings/general` | `ThemeToggle`, `SetupCompleteness` | Allgemeine Einstellungen & Setup. |
| **Chart** | `/settings/chart` | `ChartPrefsSettings` | Standard-Timeframes, Indikatoren. |
| **Notifications** | `/settings/notifications` | `NotificationsSettings` | Email & Push Einstellungen. |
| **Data** | `/settings/data` | `DataExportImport`, `TokenUsageSettings` | Backup, Restore, API-Limits. |
| **Risk** | `/settings/risk` | `RiskDefaultsSettings` | Standard Risiko-Parameter (1%, 2% etc.). |

### 4. Alerts (`/alerts`)
*   **Typ:** Filter-Tabs (Pills)
*   **Komponente:** `src/components/alerts/AlertFilters.tsx`
*   **Status:** Implementiert

| Tab Name | Filter Value | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **All** | `all` | `AlertCard[]` | Alle Alarme anzeigen. |
| **Active** | `active` | `AlertCard[]` (status='active') | Nur aktive, wartende Alarme. |
| **Triggered** | `triggered` | `AlertCard[]` (status='triggered') | Ausgelöste Alarme (Historie). |
| **Completed** | `completed` | `AlertCard[]` (status='completed') | Erledigte/Abgeschlossene Alarme. |

### 5. Oracle / Analysis (`/oracle`)
*   **Typ:** In-Page Tabs
*   **Komponente:** `src/features/oracle/OracleView.tsx` (Hypothetisch)
*   **Status:** Konzept

| Tab Name | Param | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **Bias** | `view=bias` | `DailyBiasCard` | Tägliche Richtungseinschätzung (Bullish/Bearish). |
| **Technicals** | `view=tech` | `TechnicalAnalysisView` | RSI, MACD, Support/Resistance Levels. |
| **Sentiment** | `view=sentiment` | `SentimentGauge` | Marktstimmung (Fear & Greed etc.). |
| **AI Insights** | `view=ai` | `AiAnalysisStream` | LLM-generierte Zusammenfassungen. |

### 6. Watchlist (`/watchlist`)
*   **Typ:** Kategorie-Tabs
*   **Komponente:** `src/features/watchlist/WatchlistView.tsx`
*   **Status:** Konzept

| Tab Name | Param | Inhalt / Komponente | Beschreibung |
| :--- | :--- | :--- | :--- |
| **Favorites** | `cat=fav` | `WatchlistTable` | Favorisierte Assets. |
| **Crypto** | `cat=crypto` | `WatchlistTable` (filter=crypto) | Kryptowährungen. |
| **Forex** | `cat=forex` | `WatchlistTable` (filter=forex) | Währungspaare. |
| **Indices** | `cat=indices` | `WatchlistTable` (filter=indices) | Indizes (SPX, NAS100). |
