Alles klar — hier ist eine **Codex-ready “Handbook Content Matrix”** (Pages × Flows × Steps), als **datengetriebene Specs** pro Route.

## Ziel-Ablage (empfohlen)

* `src/content/handbook/pages/dashboard.json`
* `src/content/handbook/pages/journal.json`
* `src/content/handbook/pages/lessons.json`
* `src/content/handbook/pages/watchlist.json`
* `src/content/handbook/pages/chart.json`
* `src/content/handbook/pages/alerts.json`
* `src/content/handbook/pages/settings.json`
* `src/content/handbook/pages/oracle.json` *(falls Oracle Tab existiert; sonst weglassen)*
* `src/content/handbook/handbook.index.json` *(Registry: route → file)*

---

## Action-Schema (damit CTA “1:1” mappbar ist)

**String-Formate (konsequent überall):**

* `nav:/route`
* `open:modal/<name>`
* `open:sheet/<name>`
* `open:panel/<name>`
* `do:<verb>` (z.B. `do:connectWallet`, `do:refreshHoldings`)
* `focus:<fieldId>`
* `scroll:<anchorId>`

**Gates/Context Keys (für Branch-Entscheidung):**

* `walletConnected`
* `hasMonitoredWallet`
* `hasHoldings`
* `hasEntries`
* `hasWatchlist`
* `hasAlerts`
* `isOffline`
* `hasLessonProgress`
* `hasSelectedToken`

---

## 0) Registry (Route → Spec)

```json
{
  "version": 1,
  "routes": {
    "/dashboard": "dashboard.json",
    "/journal": "journal.json",
    "/lessons": "lessons.json",
    "/watchlist": "watchlist.json",
    "/chart": "chart.json",
    "/alerts": "alerts.json",
    "/settings": "settings.json",
    "/oracle": "oracle.json"
  }
}
```

---

## 1) Dashboard — `dashboard.json`

```json
{
  "id": "dashboard",
  "route": "/dashboard",
  "title": "Dashboard",
  "purpose": "Dein tägliches Command Center: Snapshot, Quick Actions, Holdings, Alerts und letzter Journal-Stand.",
  "prerequisites": [
    { "label": "Wallet verbinden (optional, aber empfohlen)", "gate": "walletConnected" },
    { "label": "Monitored Wallet gesetzt (für Holdings)", "gate": "hasMonitoredWallet" }
  ],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (2 Minuten Daily Check)",
      "level": "basic",
      "steps": [
        {
          "id": "scan_kpis",
          "title": "KPIs scannen",
          "userAction": "Überfliege KPI Strip (z.B. Entries/Alerts/Winrate/XP).",
          "systemBehavior": "Dashboard lädt Snapshot-Daten und zeigt States (loading/empty/error).",
          "outcome": "Du weißt sofort, ob heute Action nötig ist.",
          "cta": { "label": "Zu Journal (Log Entry)", "action": "open:modal/logEntry" }
        },
        {
          "id": "check_bias",
          "title": "Daily Bias checken",
          "userAction": "Bias Card lesen (Bull/Bear/Neutral + Notiz).",
          "systemBehavior": "Bias wird aus Settings/letzter Session gezogen (oder Default).",
          "outcome": "Kontext gesetzt, weniger impulsive Trades.",
          "cta": { "label": "Bias anpassen", "action": "open:sheet/dailyBias" }
        },
        {
          "id": "holdings_glance",
          "title": "Holdings Überblick",
          "userAction": "Holdings Panel prüfen (Top Positions/Delta).",
          "systemBehavior": "Wenn Wallet vorhanden: lädt holdings; sonst zeigt Empty State.",
          "outcome": "Du siehst Exposure & Risiko sofort.",
          "gates": ["hasMonitoredWallet"],
          "cta": { "label": "Holdings refresh", "action": "do:refreshHoldings" }
        },
        {
          "id": "alerts_review",
          "title": "Alerts prüfen",
          "userAction": "Alerts Snapshot öffnen und aktive Alerts checken.",
          "systemBehavior": "Listet aktive/ausgelöste Alerts, verlinkt zu Chart/Alert Detail.",
          "outcome": "Du weißt, was heute potenziell triggert.",
          "cta": { "label": "Zu Alerts", "action": "nav:/alerts" }
        },
        {
          "id": "jump_to_chart",
          "title": "In Chart springen",
          "userAction": "Wähle Token aus Holdings/Watchlist Teaser und öffne Chart.",
          "systemBehavior": "Setzt selectedToken und navigiert in Chart.",
          "outcome": "Du bist direkt im Ausführungs-Context.",
          "cta": { "label": "Chart öffnen", "action": "nav:/chart" }
        }
      ],
      "branches": [
        {
          "when": "If wallet not connected or no monitored wallet",
          "steps": [
            {
              "id": "connect_wallet",
              "title": "Wallet verbinden / Monitored Wallet setzen",
              "userAction": "Wallet verbinden oder Adresse in Settings eintragen.",
              "systemBehavior": "Validiert Adresse, speichert Settings, triggert Holdings-Reload.",
              "outcome": "Holdings Panel wird aktiv.",
              "cta": { "label": "Zu Settings", "action": "nav:/settings" },
              "gates": ["walletConnected"]
            }
          ]
        },
        {
          "when": "If no journal entries yet",
          "steps": [
            {
              "id": "create_first_entry",
              "title": "Ersten Journal Entry erstellen",
              "userAction": "Klicke “Log entry”.",
              "systemBehavior": "Öffnet Journal Entry Modal, required fields sind markiert.",
              "outcome": "History/Insights beginnen sich aufzubauen.",
              "cta": { "label": "Log entry", "action": "open:modal/logEntry" }
            }
          ]
        }
      ]
    },
    {
      "id": "advanced",
      "label": "Advanced (Setup & Routine)",
      "level": "advanced",
      "steps": [
        {
          "id": "quick_actions",
          "title": "Quick Actions einrichten",
          "userAction": "Nutze FAB/Quick Actions (Entry/Alert/Note).",
          "systemBehavior": "Persistiert zuletzt genutzte Aktionen für schnelleren Zugriff.",
          "outcome": "Routine wird schneller.",
          "cta": { "label": "Quick Actions öffnen", "action": "open:sheet/quickActions" }
        },
        {
          "id": "grok_pulse",
          "title": "Grok Pulse nutzen",
          "userAction": "Öffne Grok Pulse Panel für Sentiment/Context.",
          "systemBehavior": "Lädt Context Builder Output und zeigt Zusammenfassung.",
          "outcome": "Besserer Macro/CT Kontext vor Execution.",
          "cta": { "label": "Grok Pulse Panel", "action": "open:panel/grokPulse" }
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" },
    { "keys": "J", "does": "Journal öffnen" },
    { "keys": "A", "does": "Alerts öffnen" }
  ],
  "pitfalls": [
    { "problem": "Holdings bleiben leer", "fix": "Monitored Wallet setzen + refresh", "cta": { "label": "Zu Settings", "action": "nav:/settings" } },
    { "problem": "Daten laden nicht", "fix": "Offline/Rate Limit prüfen, später refresh", "cta": { "label": "Refresh", "action": "do:refreshDashboard" } }
  ],
  "glossary": [
    { "term": "Bias", "meaning": "Deine bevorzugte Marktrichtung/Grundhaltung für den Tag." },
    { "term": "Snapshot", "meaning": "Kurzansicht zentraler Kennzahlen und Status." }
  ]
}
```

---

## 2) Journal — `journal.json`

```json
{
  "id": "journal",
  "route": "/journal",
  "title": "Journal",
  "purpose": "Trading Journal als Habit Builder: Emotion → Thesis → Kontext → Insights → Progress.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Entry in 60–120 Sekunden)",
      "level": "basic",
      "steps": [
        {
          "id": "emotional_state",
          "title": "Emotional State wählen (required)",
          "userAction": "Wähle deinen Zustand (z.B. Unsicher/Neutral/Optimistisch).",
          "systemBehavior": "Validiert required Field, setzt State Badge/Color, aktiviert Save.",
          "outcome": "Entry hat emotionalen Kontext.",
          "cta": { "label": "Zum Feld springen", "action": "focus:emotionalState" }
        },
        {
          "id": "thesis",
          "title": "Thesis schreiben (required)",
          "userAction": "Formuliere 1–2 Sätze: Setup, Erwartung, Invalidierung.",
          "systemBehavior": "Autosave draft, zeigt Validation wenn leer.",
          "outcome": "Klarer Plan statt Impuls.",
          "cta": { "label": "Zum Feld springen", "action": "focus:thesis" }
        },
        {
          "id": "market_context",
          "title": "Market Context (optional)",
          "userAction": "Fülle optional Context aus (Trend, News, Levels).",
          "systemBehavior": "Collapsible Section, Layout bleibt stabil, autosave.",
          "outcome": "Mehr Aussagekraft im Review.",
          "cta": { "label": "Context öffnen", "action": "open:sheet/marketContext" }
        },
        {
          "id": "templates",
          "title": "Template nutzen (optional)",
          "userAction": "Wähle ein Template und passe es an.",
          "systemBehavior": "Template kann overwrite/merge/suggest anwenden.",
          "outcome": "Schneller, konsistenter Input.",
          "cta": { "label": "Templates öffnen", "action": "open:sheet/journalTemplates" }
        },
        {
          "id": "save",
          "title": "Speichern",
          "userAction": "Klicke Save/Done.",
          "systemBehavior": "Persistiert Entry, aktualisiert History + Insights.",
          "outcome": "Entry erscheint in History.",
          "cta": { "label": "History ansehen", "action": "scroll:journalHistory" }
        },
        {
          "id": "review_insights",
          "title": "Insights lesen",
          "userAction": "Lies Score/Archetype + 2x2 Metrics + Insight Cards.",
          "systemBehavior": "Berechnet Ableitungen, zeigt klare Next Steps.",
          "outcome": "Du lernst aus dem Eintrag.",
          "cta": { "label": "Nächsten Schritt", "action": "open:sheet/nextSteps" }
        }
      ],
      "branches": [
        {
          "when": "If required fields missing",
          "steps": [
            {
              "id": "validation_fix",
              "title": "Validation fixen",
              "userAction": "Klicke auf Fehlerhinweis oder nutze Jump-to-field.",
              "systemBehavior": "Scrollt/fokussiert das fehlende Feld, zeigt kurze Hilfetexte.",
              "outcome": "Save wird möglich.",
              "cta": { "label": "Zum ersten Fehler", "action": "do:jumpToFirstError" }
            }
          ]
        },
        {
          "when": "If offline",
          "steps": [
            {
              "id": "offline_autosave",
              "title": "Offline Autosave",
              "userAction": "Erstelle Entry normal weiter.",
              "systemBehavior": "Speichert lokal, markiert Sync-Pending.",
              "outcome": "Keine Daten gehen verloren.",
              "cta": { "label": "Sync Status", "action": "open:sheet/syncStatus" },
              "gates": ["isOffline"]
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" },
    { "keys": "Ctrl/⌘ + Enter", "does": "Entry speichern" }
  ],
  "pitfalls": [
    { "problem": "Entry fühlt sich zu groß an", "fix": "Nutze Templates + 2-Satz Thesis", "cta": { "label": "Templates", "action": "open:sheet/journalTemplates" } }
  ],
  "glossary": [
    { "term": "Thesis", "meaning": "Warum du tradest, was du erwartest, was dich invalidiert." },
    { "term": "Autosave", "meaning": "Zwischenspeicherung ohne manuelles Speichern." }
  ]
}
```

---

## 3) Lessons — `lessons.json`

```json
{
  "id": "lessons",
  "route": "/lessons",
  "title": "Lessons",
  "purpose": "Learning Path für Retention: Module → Lesson → Completion → Progress.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Lernen in 3 Schritten)",
      "level": "basic",
      "steps": [
        {
          "id": "pick_module",
          "title": "Modul auswählen",
          "userAction": "Wähle ein Modul aus der Liste.",
          "systemBehavior": "Zeigt Progress pro Modul, lockt Advanced wenn nötig.",
          "outcome": "Du bist im richtigen Track.",
          "cta": { "label": "Modul öffnen", "action": "do:openSelectedModule" }
        },
        {
          "id": "start_lesson",
          "title": "Lesson starten",
          "userAction": "Starte die nächste Lesson.",
          "systemBehavior": "Lädt Lesson Content, merkt zuletzt gesehene Stelle.",
          "outcome": "Kontinuität statt Random Scroll.",
          "cta": { "label": "Start", "action": "do:startLesson" }
        },
        {
          "id": "complete",
          "title": "Abschließen + Progress",
          "userAction": "Markiere als completed.",
          "systemBehavior": "Speichert Progress, updated Module % und evtl. XP.",
          "outcome": "Track wird sichtbar und motivierend.",
          "cta": { "label": "Nächste Lesson", "action": "do:nextLesson" }
        }
      ],
      "branches": [
        {
          "when": "If no progress yet",
          "steps": [
            {
              "id": "first_lesson_hint",
              "title": "Starte mit den Basics",
              "userAction": "Öffne das Einsteiger-Modul.",
              "systemBehavior": "Empfiehlt Starter-Lesson und setzt Fokus.",
              "outcome": "Keine Überforderung am Anfang.",
              "cta": { "label": "Starter öffnen", "action": "do:openStarterModule" }
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" }
  ],
  "pitfalls": [
    { "problem": "Du konsumierst Lessons, aber setzt nichts um", "fix": "Nach jeder Lesson: 1 Journal Entry mit 'Was setze ich um?'", "cta": { "label": "Log entry", "action": "open:modal/logEntry" } }
  ],
  "glossary": [
    { "term": "Progress", "meaning": "Dein Fortschritt im Learning Path (pro Modul/Lesson)." }
  ]
}
```

---

## 4) Watchlist — `watchlist.json`

```json
{
  "id": "watchlist",
  "route": "/watchlist",
  "title": "Watchlist",
  "purpose": "Fokus halten: Tokens sammeln, taggen, sortieren und in Chart/Alerts springen.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Token → Chart → Alert)",
      "level": "basic",
      "steps": [
        {
          "id": "add_token",
          "title": "Token hinzufügen",
          "userAction": "Suche Token und füge ihn hinzu.",
          "systemBehavior": "Validiert Token, verhindert Dubletten, speichert Watchlist.",
          "outcome": "Token ist trackbar.",
          "cta": { "label": "Token hinzufügen", "action": "open:modal/addToken" }
        },
        {
          "id": "tag_sort",
          "title": "Taggen & Sortieren",
          "userAction": "Gib Tags (z.B. 'A+ Setup', 'Meme', 'Earnings') und sortiere.",
          "systemBehavior": "Persistiert Sort/Filter, zeigt Empty/No-match States.",
          "outcome": "Weniger Noise, mehr Signal.",
          "cta": { "label": "Filter öffnen", "action": "open:sheet/watchlistFilters" }
        },
        {
          "id": "open_chart",
          "title": "Chart öffnen",
          "userAction": "Klicke Token → Chart.",
          "systemBehavior": "Setzt selectedToken und navigiert.",
          "outcome": "Sofort in Execution.",
          "cta": { "label": "Zu Chart", "action": "nav:/chart" }
        },
        {
          "id": "create_alert",
          "title": "Alert erstellen",
          "userAction": "Erstelle Alert aus Watchlist/Token Context.",
          "systemBehavior": "Prefill Token, öffnet Create Alert UI.",
          "outcome": "Du wirst bei deinem Level getriggert, nicht durch FOMO.",
          "cta": { "label": "Create Alert", "action": "open:modal/createAlert" }
        }
      ],
      "branches": [
        {
          "when": "If token already exists",
          "steps": [
            {
              "id": "duplicate_hint",
              "title": "Dubletten vermeiden",
              "userAction": "Nutze Tags statt denselben Token mehrfach.",
              "systemBehavior": "Zeigt Hinweis + springt zum existierenden Eintrag.",
              "outcome": "Watchlist bleibt clean.",
              "cta": { "label": "Zum Eintrag", "action": "do:jumpToExistingToken" }
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" },
    { "keys": "W", "does": "Watchlist öffnen" }
  ],
  "pitfalls": [
    { "problem": "Zu viele Tokens", "fix": "Max 10–20 aktiv, Rest archivieren", "cta": { "label": "Archiv öffnen", "action": "open:sheet/watchlistArchive" } }
  ],
  "glossary": [
    { "term": "Tag", "meaning": "Label zur Strukturierung (Setup, Risiko, Kategorie)." }
  ]
}
```

---

## 5) Chart — `chart.json`

```json
{
  "id": "chart",
  "route": "/chart",
  "title": "Chart",
  "purpose": "Execution Hub: Token auswählen, Setup prüfen, Notizen/Alerts erstellen, Context (Grok Pulse) nutzen.",
  "prerequisites": [
    { "label": "Token auswählen (aus Watchlist oder Search)", "gate": "hasSelectedToken" }
  ],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Setup → Note → Alert)",
      "level": "basic",
      "steps": [
        {
          "id": "select_token",
          "title": "Token auswählen",
          "userAction": "Wähle Token (Search oder Watchlist).",
          "systemBehavior": "Setzt selectedToken, lädt Chart Daten, zeigt Loading/Error States.",
          "outcome": "Chart ist bereit.",
          "cta": { "label": "Token Search", "action": "open:modal/tokenSearch" }
        },
        {
          "id": "timeframe_levels",
          "title": "Timeframe & Levels",
          "userAction": "Wähle Timeframe, markiere Levels (mental oder via Tool).",
          "systemBehavior": "Persistiert View-Settings pro Token (optional).",
          "outcome": "Du bist im richtigen Kontext für den Trade.",
          "cta": { "label": "Chart Settings", "action": "open:sheet/chartSettings" }
        },
        {
          "id": "journal_note",
          "title": "Journal Note aus Chart",
          "userAction": "Notiz hinzufügen (Setup/Level/Plan).",
          "systemBehavior": "Speichert Note kontextuell (token + timeframe + timestamp).",
          "outcome": "Chart → Journal Verbindung entsteht.",
          "cta": { "label": "Add Note", "action": "open:modal/addChartNote" }
        },
        {
          "id": "create_alert",
          "title": "Alert aus Chart",
          "userAction": "Alert erstellen (z.B. Price crosses level).",
          "systemBehavior": "Prefill token + level, validiert Inputs, speichert Alert.",
          "outcome": "Du bekommst Signal statt dauernd zu checken.",
          "cta": { "label": "Create Alert", "action": "open:modal/createAlert" }
        },
        {
          "id": "context_grok",
          "title": "Context check (optional)",
          "userAction": "Öffne Grok Pulse für Sentiment/News/Context.",
          "systemBehavior": "Lädt Context Builder, zeigt kurze Summary + Risiken.",
          "outcome": "Bessere Entscheidung vor Entry.",
          "cta": { "label": "Grok Pulse", "action": "open:panel/grokPulse" }
        }
      ],
      "branches": [
        {
          "when": "If chart data fails",
          "steps": [
            {
              "id": "retry_data",
              "title": "Daten neu laden",
              "userAction": "Retry klicken oder Token wechseln.",
              "systemBehavior": "Zeigt Error State mit Retry CTA.",
              "outcome": "Chart lädt wieder oder du wechselst Quelle.",
              "cta": { "label": "Retry", "action": "do:retryChartData" }
            }
          ]
        },
        {
          "when": "If offline",
          "steps": [
            {
              "id": "offline_mode",
              "title": "Offline Mode",
              "userAction": "Nutze Notes/Journal weiter, vermeide Live-Daten.",
              "systemBehavior": "Zeigt Offline Badge, deaktiviert Live Actions optional.",
              "outcome": "App bleibt nutzbar.",
              "cta": { "label": "Offline Info", "action": "open:sheet/offlineInfo" },
              "gates": ["isOffline"]
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" },
    { "keys": "C", "does": "Chart öffnen" }
  ],
  "pitfalls": [
    { "problem": "Du analysierst zu lange", "fix": "Setze ein 'Decision Timer' + schreibe 1 Satz Thesis", "cta": { "label": "Log entry", "action": "open:modal/logEntry" } }
  ],
  "glossary": [
    { "term": "Level", "meaning": "Preisbereich, der für S/R, Breakout oder Reclaim relevant ist." }
  ]
}
```

---

## 6) Alerts — `alerts.json`

```json
{
  "id": "alerts",
  "route": "/alerts",
  "title": "Alerts",
  "purpose": "Signals statt Dauer-Chart: Alerts erstellen, verwalten, auslösen lassen und direkt in Chart handeln.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Alert in 60 Sekunden)",
      "level": "basic",
      "steps": [
        {
          "id": "create",
          "title": "Alert erstellen",
          "userAction": "Wähle Token + Condition (z.B. Price > X).",
          "systemBehavior": "Validiert Inputs, speichert Alert, zeigt aktiv Status.",
          "outcome": "Alert ist live.",
          "cta": { "label": "Create Alert", "action": "open:modal/createAlert" }
        },
        {
          "id": "manage",
          "title": "Alerts organisieren",
          "userAction": "Aktive Alerts taggen/pausieren/löschen.",
          "systemBehavior": "Persistiert Status, zeigt Empty/Filter States.",
          "outcome": "Saubere Signal-Liste.",
          "cta": { "label": "Filter", "action": "open:sheet/alertsFilters" }
        },
        {
          "id": "react",
          "title": "Bei Trigger reagieren",
          "userAction": "Öffne Trigger → Chart.",
          "systemBehavior": "Deep link in Chart mit token + context.",
          "outcome": "Schnelle Execution ohne Context loss.",
          "cta": { "label": "Zum Chart", "action": "nav:/chart" }
        }
      ],
      "branches": [
        {
          "when": "If user has no tokens",
          "steps": [
            {
              "id": "add_watchlist_first",
              "title": "Erst Watchlist füllen",
              "userAction": "Füge 3–10 Tokens hinzu.",
              "systemBehavior": "Erleichtert Alert-Erstellung via Prefill.",
              "outcome": "Alerts werden schneller gebaut.",
              "cta": { "label": "Zu Watchlist", "action": "nav:/watchlist" }
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" },
    { "keys": "A", "does": "Alerts öffnen" }
  ],
  "pitfalls": [
    { "problem": "Zu viele Alerts", "fix": "Max 5–15 aktive Alerts, Rest pausieren", "cta": { "label": "Bulk Pause", "action": "do:bulkPauseAlerts" } }
  ],
  "glossary": [
    { "term": "Condition", "meaning": "Auslösebedingung (Preis, Volumen, Event, etc.)." }
  ]
}
```

---

## 7) Settings — `settings.json`

```json
{
  "id": "settings",
  "route": "/settings",
  "title": "Settings",
  "purpose": "Setup & Kontrolle: Wallet, Preferences, Data/Network und Experience-Settings.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Grund-Setup in 2 Minuten)",
      "level": "basic",
      "steps": [
        {
          "id": "wallet_setup",
          "title": "Wallet verbinden / Monitored Wallet setzen",
          "userAction": "Verbinde Wallet oder setze Adresse.",
          "systemBehavior": "Validiert Adresse, speichert, triggert Holdings Reload.",
          "outcome": "Holdings & wallet-abhängige Features funktionieren.",
          "cta": { "label": "Wallet verbinden", "action": "do:connectWallet" }
        },
        {
          "id": "prefs",
          "title": "Preferences setzen",
          "userAction": "Setze UI/UX Optionen (z.B. Shortcuts, Panels, Units).",
          "systemBehavior": "Persistiert Preferences, wendet sie sofort an.",
          "outcome": "App fühlt sich “deins” an.",
          "cta": { "label": "Preferences", "action": "scroll:preferences" }
        },
        {
          "id": "data_network",
          "title": "Data/Network prüfen",
          "userAction": "Prüfe Netzwerk/Provider Einstellungen (falls vorhanden).",
          "systemBehavior": "Zeigt Status/Health, optional Diagnose.",
          "outcome": "Weniger “why no data?” Momente.",
          "cta": { "label": "Diagnose", "action": "open:sheet/diagnostics" }
        }
      ],
      "branches": [
        {
          "when": "If wallet address invalid",
          "steps": [
            {
              "id": "invalid_wallet_fix",
              "title": "Adresse korrigieren",
              "userAction": "Korrigiere die Adresse (Copy/Paste) und speichere neu.",
              "systemBehavior": "Zeigt konkrete Fehlermeldung und validiert live.",
              "outcome": "Holdings können geladen werden.",
              "cta": { "label": "Zum Feld springen", "action": "focus:monitoredWallet" }
            }
          ]
        }
      ]
    }
  ],
  "shortcuts": [
    { "keys": "?", "does": "Handbook Panel öffnen/schließen" }
  ],
  "pitfalls": [
    { "problem": "Wallet-Features fehlen", "fix": "Monitored Wallet setzen + refresh", "cta": { "label": "Refresh Holdings", "action": "do:refreshHoldings" } }
  ],
  "glossary": [
    { "term": "Monitored Wallet", "meaning": "Adresse, deren Assets/Holdings für Dashboard genutzt werden." }
  ]
}
```

---

## 8) Oracle (optional) — `oracle.json`

```json
{
  "id": "oracle",
  "route": "/oracle",
  "title": "Oracle",
  "purpose": "Decision Support: Signale/Insights bündeln und in klare Next Actions übersetzen.",
  "prerequisites": [],
  "flows": [
    {
      "id": "happy_path",
      "label": "Happy Path (Insight → Action)",
      "level": "basic",
      "steps": [
        {
          "id": "scan_insights",
          "title": "Insights scannen",
          "userAction": "Lies die Top 3 Insights (kurz).",
          "systemBehavior": "Aggregiert Daten aus Journal/Alerts/Market Context.",
          "outcome": "Du hast eine klare Richtung.",
          "cta": { "label": "Grok Pulse öffnen", "action": "open:panel/grokPulse" }
        },
        {
          "id": "pick_action",
          "title": "Next Action wählen",
          "userAction": "Wähle: (a) Journal Entry (b) Chart Review (c) Alert erstellen.",
          "systemBehavior": "Bietet direkte CTA Deep Links.",
          "outcome": "Insight endet in Handlung.",
          "cta": { "label": "Chart", "action": "nav:/chart" }
        }
      ]
    }
  ],
  "shortcuts": [{ "keys": "?", "does": "Handbook Panel öffnen/schließen" }],
  "pitfalls": [{ "problem": "Oracle bleibt “nice to read”", "fix": "Immer 1 Action ausführen", "cta": { "label": "Log entry", "action": "open:modal/logEntry" } }],
  "glossary": [{ "term": "Insight", "meaning": "Verdichtete Aussage mit Implikation für eine Entscheidung." }]
}
```

---

# Mini “Matrix” (Übersicht)

* **Dashboard:** Daily Check → Holdings → Alerts → Chart (+ Branch: no wallet / no entries)
* **Journal:** Emotion → Thesis → Context → Template → Save → Insights (+ Branch: validation / offline)
* **Lessons:** Module → Lesson → Complete (+ Branch: no progress)
* **Watchlist:** Add → Tag/Sort → Chart → Alert (+ Branch: duplicate)
* **Chart:** Select → Timeframe → Note → Alert → Grok (+ Branch: data fail / offline)
* **Alerts:** Create → Manage → React (+ Branch: no tokens)
* **Settings:** Wallet/Monitored → Prefs → Diagnostics (+ Branch: invalid addr)
* **Oracle (optional):** Insights → Action

Wenn du magst, liefere ich als nächstes **die “CTA Action Map”** als kleines TS-Interface (Action-String → konkrete Handler), damit Codex das Panel ohne Interpretationsspielraum verdrahten kann.
