# Soll-Spezifikation für Tabs & Flows

## 1. Überblick
Dieses Dokument definiert die Anforderungen (Soll-Zustand) für die Implementierung von Navigations-Tabs und User-Flows, um die Benutzerfreundlichkeit (UX) und Übersichtlichkeit der Anwendung zu verbessern. Das Ziel ist eine strukturiertere Darstellung von Informationen und eine intuitive Führung des Nutzers durch komplexe Prozesse.

## 2. Navigations-Konzept (Tabs)
**Ziel**: Reduktion von Scroll-Wegen und logische Gruppierung von Inhalten.

### 2.1 Allgemeine UX-Richtlinien
- **Verwendung**: Tabs sollen genutzt werden, um zwischen verschiedenen Ansichten desselben Datenkontextes zu wechseln oder um komplexe Einstellungsseiten zu unterteilen.
- **Komponente**: Nutzung der existierenden `src/components/ui/tabs.tsx` (basierend auf Radix UI).
- **Verhalten**: 
  - Der aktive Tab sollte visuell klar hervorgehoben sein.
  - Optional: Der Tab-Status sollte in der URL (z.B. `?tab=appearance`) reflektiert werden, um Deep-Linking und Browser-Navigation (Back-Button) zu unterstützen.

### 2.2 Spezifische Anwendungsbereiche

#### A. Settings (Einstellungen)
*Refactoring der `src/pages/SettingsPage.tsx`*

**Ist-Zustand**: 
Eine lange vertikale Liste mit Sektionen (`Appearance`, `Backup & Restore`, `Danger Zone`), die teilweise gescrollt werden muss.

**Soll-Zustand**: 
Aufteilung der Einstellungen in logische Kategorien mittels Tabs.

*   **Tab "Allgemein" (Appearance/General)**
    *   Theme Toggle (Light/Dark Mode)
    *   Setup Completeness Anzeige
*   **Tab "Daten" (Data Management)**
    *   Data Export/Import (Backup & Restore)
*   **Tab "System" (System/Danger)**
    *   Factory Reset (Danger Zone)
    *   Versionsinformationen

#### B. Journal
*Erweiterung der `src/pages/Journal.tsx`*

**Ist-Zustand**: 
Fokus auf Listenansicht.

**Soll-Zustand**: 
Einführung von Tabs zur Umschaltung der Perspektive.

*   **Tab "Liste"**: Tabellarische Übersicht aller Trades (bestehende Ansicht).
*   **Tab "Analyse"**: Grafische Auswertung (z.B. Win-Rate, PnL-Entwicklung, Tagesschnitt).
*   **Tab "Kalender"** (Feature-Request): Kalenderansicht zur Visualisierung von Trading-Tagen und Ergebnissen pro Tag.

## 3. User Flows (Prozesse)
**Ziel**: Geführte Prozesse (Wizards) für komplexe Aufgaben, die mehrere Schritte erfordern, statt alles auf einer Seite anzuzeigen.

### 3.1 Onboarding Flow ("Erste Schritte")
*Erweiterung von `src/components/settings/SetupCompleteness.tsx`*

**Ist-Zustand**: 
Eine statische Checkliste (`SetupCompleteness`), die anzeigt, was fehlt.

**Soll-Zustand**: 
Ein dedizierter Onboarding-Wizard (Modal oder separate Route), der beim ersten Start erscheint.

*   **Schritt 1: Willkommen**: Kurze Einführung in die App.
*   **Schritt 2: Personalisierung**: Auswahl des Themes (Dark/Light).
*   **Schritt 3: Daten**: Option zum Importieren eines Backups (für wiederkehrende Nutzer) oder Starten mit leerem Datensatz.
*   **Schritt 4: Abschluss**: Weiterleitung zum Dashboard.

### 3.2 Trade Logging Flow
*Optimierung in `src/features/journal`*

**Soll-Zustand**: 
Unterscheidung zwischen "Schnellerfassung" und "Detaillierter Analyse".

*   **Quick Add Flow**: Ein vereinfachtes Modal, das nur die essentiellen Daten abfragt (Symbol, Richtung, Entry, Size), um während des Handels nicht zu stören.
*   **Review Flow**: Ein detaillierterer Prozess (z.B. am Ende des Tages), bei dem Screenshots hinzugefügt, Notizen ergänzt und Tags vergeben werden. Hier können Tabs innerhalb des Modals genutzt werden (z.B. "Daten", "Psychologie", "Media").

## 4. Technische Umsetzungsschritte & Priorisierung

### Phase 1: Grundlagen & Settings
1.  Implementierung von Tabs in `SettingsPage.tsx` als Proof-of-Concept.
2.  Sicherstellen, dass `src/components/ui/tabs.tsx` korrekt gestylt ist und responsive funktioniert.

### Phase 2: Journal Erweiterung
1.  Umstrukturierung der `Journal.tsx` Page, um `Tabs` als Container für die `JournalList` zu nutzen.
2.  Erstellung von Platzhalter-Komponenten für "Analyse" und "Kalender".

### Phase 3: Flows
1.  Design und Implementierung des "Onboarding Modals".
2.  Implementierung der Logik zur Erkennung des "First Run" (erster Start der App).

---
*Dokumentenstatus: Entwurf*
*Erstellt: 27.12.2025*
