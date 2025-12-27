# UI/UX Architektur & Soll-Spezifikation: Tabs & Flows

**Status:** Entwurf
**Datum:** 27.12.2025
**Geltungsbereich:** Frontend Applikation (React/Tailwind)

## 1. Einführung
Dieses Dokument definiert die Architekturrichtlinien und die Soll-Spezifikation für die Implementierung von Navigations-Tabs und User-Flows. Ziel ist es, eine konsistente User Experience (UX) und eine wartbare Codebasis zu gewährleisten.

## 2. Architektur-Überblick
Die Applikation folgt einer Shell-basierten Architektur (`src/features/shell`), bestehend aus:
- **AppSidebar/MobileBottomNav:** Globale Navigation.
- **AppHeader:** Kontextbezogene Aktionen und Titel.
- **Main Content Area:** Router-Outlet für Seiteninhalte.

Tabs und Flows agieren innerhalb der *Main Content Area* oder als Overlays (Modals/Sheets) über der Shell.

---

## 3. Soll-Spezifikation: Tabs

### 3.1 Konzept & Einsatzgebiete
Tabs dienen der Organisation von Inhalten auf derselben Hierarchieebene. Sie ermöglichen Nutzern, zwischen verschiedenen Ansichten oder Datensätzen zu wechseln, ohne den Kontext (die Seite) zu verlassen.

### 3.2 Tab-Kategorien

#### A. Routing-Tabs (Top-Level)
Diese Tabs repräsentieren verschiedene Unterseiten einer Hauptressource.
*   **Verhalten:** Jeder Tab hat eine eigene URL-Route (z.B. `/settings/profile`, `/settings/security`).
*   **Navigation:** Nutzt den React Router (`NavLink` oder ähnliches).
*   **State:** Browser-History wird aktualisiert; Back-Button funktioniert wie erwartet.
*   **Anwendungsfall:** Einstellungsseiten, komplexe Dashboards mit thematisch getrennten Bereichen.

#### B. UI-Tabs (In-Page)
Diese Tabs schalten lokale Ansichten innerhalb einer Seite um.
*   **Verhalten:** URL ändert sich nicht zwingend, kann aber über Query-Parameter (`?view=chart`) gesteuert werden (empfohlen für Deep-Linking).
*   **Komponente:** Basiert auf `src/components/ui/tabs.tsx` (Radix UI / Shadcn).
*   **State:** Lokaler React State oder URL-Query-State.
*   **Anwendungsfall:** Wechsel zwischen Tabelle/Chart, Filtern von Listen (z.B. "Alle", "Offen", "Erledigt").

### 3.3 Technische Anforderungen (Soll)
1.  **Deep-Linking:**
    *   Der aktive Tab-Zustand **muss** bei Page-Reload wiederhergestellt werden.
    *   *Empfehlung:* Nutzung von URL Query Params (`useSearchParams`) als "Source of Truth" für den aktiven Tab.
2.  **Lazy Loading:**
    *   Inhalte schwerer Tabs (z.B. komplexe Charts) sollen erst beim Aktivieren des Tabs geladen/gerendert werden, um die initiale Ladezeit zu minimieren.
3.  **Responsivität:**
    *   Desktop: Horizontale Tab-Leiste.
    *   Mobile: Bei zu vielen Tabs automatische Umwandlung in ein Dropdown (`Select`) oder horizontal scrollbare Leiste (`ScrollArea`).
4.  **Barrierefreiheit:**
    *   Volle Tastaturnavigation (Pfeiltasten zum Wechseln).
    *   Korrekte ARIA-Attribute (`role="tablist"`, `aria-selected`, `aria-controls`).

---

## 4. Soll-Spezifikation: Flows

### 4.1 Konzept & Definition
Ein "Flow" beschreibt einen geführten Prozess, der aus mehreren Schritten besteht, um eine komplexe Aufgabe zu erledigen (z.B. Onboarding, Trade-Erstellung, Wizard).

### 4.2 Flow-Typen

#### A. Linearer Flow (Wizard)
*   **Struktur:** Schritt 1 -> Schritt 2 -> Schritt 3 -> Abschluss.
*   **UI:** Stepper-Komponente zeigt Fortschritt an.
*   **Navigation:** "Zurück" (wenn erlaubt) und "Weiter" Buttons.

#### B. Verzweigter Flow
*   **Struktur:** Dynamische Schritte basierend auf User-Input in vorherigen Schritten.

### 4.3 UI-Integration
Flows können auf zwei Arten dargestellt werden:
1.  **Modal/Dialog Flow:**
    *   Für kurze, kontextbezogene Prozesse (z.B. "Alert erstellen").
    *   Der Hintergrund bleibt sichtbar, aber inaktiv.
    *   Klick außerhalb oder "Esc" bricht ab (mit Sicherheitsabfrage bei ungespeicherten Daten).
2.  **Full-Page Flow:**
    *   Für komplexe, immersive Aufgaben (z.B. Erst-Einrichtung).
    *   Die App-Shell (Sidebar) wird oft ausgeblendet, um den Fokus zu maximieren.

### 4.4 Technische Anforderungen (Soll)
1.  **State Management:**
    *   Der Zustand des Flows (eingegebene Daten, aktueller Schritt) darf bei versehentlichem Neuladen nicht verloren gehen.
    *   *Lösung:* Persistierung im `localStorage` oder Session-Storage bis zum Abschluss.
2.  **Validierung:**
    *   Jeder Schritt muss validiert werden, bevor der Nutzer zum nächsten Schritt gehen kann.
    *   Fehler müssen inline und verständlich angezeigt werden.
3.  **Abbruch & Resumption:**
    *   Nutzer sollen Flows abbrechen können ("Cancel").
    *   Bei komplexen Flows: Möglichkeit, den Entwurf zu speichern ("Save for later").

---

## 5. Implementierungs-Guide

### Bestehende Komponenten nutzen
Greifen Sie auf die vorhandenen UI-Komponenten zurück, um Konsistenz zu wahren:
*   `src/components/ui/tabs.tsx`: Für alle In-Page Tabs.
*   `src/components/ui/dialog.tsx`: Für modale Flows.
*   `src/components/ui/form.tsx`: Für Formular-Validierung innerhalb von Flows (nutzt React Hook Form & Zod).

### Beispiel: URL-Synchronisierte Tabs

```tsx
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ManagedTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">...</TabsContent>
      <TabsContent value="details">...</TabsContent>
    </Tabs>
  );
}
```
