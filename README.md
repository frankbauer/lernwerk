# GDI Lernwerk

Eine Sammlung von Übungsaufgaben als Begleitmaterial für die Veranstaltung [**Grundlagen der Informatik**](https://gdi.cs.fau.de/livecompile/uebersicht.html) an der [Friedrich-Alexander-Universität Erlangen-Nürnberg](https://fau.de).

## Aufbau

Die Anwendung (Übungsplaner, Abenteuerkarte, Übungsseiten-Gerüst) und die Übungen sind getrennt:

| Ort | Inhalt |
| --- | --- |
| `*.html`, `*.js`, `css/`, `fonts/`, `img/` | Anwendung: `uebersicht.html` (Übungsplaner), `karte.html` (Abenteuerkarte), `content.js`/`helper.js` (Übungsseiten), `catalog.js` (Übungskatalog) |
| `common/` | Allgemein nutzbarer Code für Übungen aller Module (`simple_args.js`, `canvas.js`, `quiz/`, API-Beschreibungen der TeaVM-Klassenbibliothek) |
| `js/`, `assets/` | Laufzeitumgebungen und der Asset-Ordner von CodeBlocks (aus codeblocks.js übernommen, `@assets/` in den Übungen) |
| `data/curriculum.json` | Der Kurs: Übungstypen, eingebundene Module und die Kapitel; jedes Kapitel nennt die Konzepte, die es einführt, und seine Übungen (`{ "module": "gdi", "id": "05_Objekte/vector" }`). Schema: `data/curriculum.schema.ts` |
| `data/karte.json` | Einstellungen der Abenteuerkarte und Kursdaten (Vorlesungen, Hausaufgaben) je Kapitel |
| `modules/<id>/` | Ein Übungsmodul (vorerst nur `gdi`): `exercises.json` (Konzepte und Übungen, ohne Kapitelzuordnung; Pfade relativ zum Modul; Schema: `data/exercises.schema.ts`), die Übungsordner, `common/` mit modulspezifischem Code (z. B. `common/scene/`) und `img/` (Vorschaubilder, Konzept-Icons) |

Ein Modul liegt immer unter `modules/<id>/`; seine Übungsseiten (`<Ordner>/<Übung>/index.html`) binden die Anwendung im `<head>` über `../../../../` ein. In den `content`-Feldern der Seite steht `@root/` für das Wurzelverzeichnis (z. B. `@root/common/quiz/graph.js`) und `@module/` für den Modulordner (z. B. `@module/common/scene/graph/Graph.java`); alle anderen Pfade sind relativ zur Seite (siehe `resolvePath` in `content.js`). Die Übungs-IDs im Katalog tragen den Modulnamen als Präfix (`gdi/05_Objekte/vector`). Die Klassen der TeaVM-Klassenbibliothek (`de.fau.tf.lgdv.*`, z. B. `de.fau.tf.lgdv.math.Vec2D`) werden importiert und nicht als eigene Kopie mitgeliefert.

## Rechtstexte

Impressum (`impressum.html`), Datenschutzerklärung (`datenschutz.html`) und Erklärung zur Barrierefreiheit (`barrierefreiheit.html`) gelten für [gdi.cs.fau.de/livecompile](https://gdi.cs.fau.de/livecompile/uebersicht.html) und müssen bei eigenem Hosting angepasst werden.

## Schriften

Die Schriften liegen im Repository und werden vom eigenen Server geladen. Sie stehen unter der [SIL Open Font License 1.1](https://openfontlicense.org), nicht unter der MIT-Lizenz des übrigen Codes; der Lizenztext liegt jeweils im Ordner der Schrift:

| Schrift | Ordner | Quelle |
| --- | --- | --- |
| Geist | `js/codeblocks-js/fonts/` | [vercel/geist-font](https://github.com/vercel/geist-font) (mit CodeBlocks ausgeliefert) |
| Caveat | `fonts/caveat/` | [googlefonts/caveat](https://github.com/googlefonts/caveat), Dateien aus [@fontsource-variable/caveat](https://fontsource.org/fonts/caveat) |

## Licensed assets

Einige Bilder der Szenen in `modules/gdi/common/scene/` sind bei [Freepik](https://www.freepik.com) lizenziert (Liste in `IMAGE-LICENSE.md`). Sie dürfen in diesem Projekt verwendet, aber nicht im Repository veröffentlicht werden. Sie sind daher per `.gitignore` ausgeschlossen und werden separat als `lernwerk-licensed-assets.zip` (inkl. `IMAGE-LICENSE.md`) bereitgestellt.

Installation:

1. `lernwerk-licensed-assets.zip` vom geschützten Download-Ort herunterladen (bei den Maintainern erfragen) und im Wurzelverzeichnis des Repositorys ablegen.
2. Bilder entpacken:
   ```
   node tools/licensed-assets.mjs extract
   ```

Maintainer erstellen das Archiv aus ihrer Arbeitskopie mit `node tools/licensed-assets.mjs build`.
