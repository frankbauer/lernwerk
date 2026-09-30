# GDI Lernwerk

Eine Sammlung von Übungsaufgaben als Begleitmaterial für die Veranstaltung [**Grundlagen der Informatik**](https://gdi.cs.fau.de/livecompile/uebersicht.html) an der [Friedrich-Alexander-Universität Erlangen-Nürnberg](https://fau.de).

## Rechtstexte

Impressum (`impressum.html`), Datenschutzerklärung (`datenschutz.html`) und Erklärung zur Barrierefreiheit (`barrierefreiheit.html`) gelten für [gdi.cs.fau.de/livecompile](https://gdi.cs.fau.de/livecompile/uebersicht.html) und müssen bei eigenem Hosting angepasst werden.

## Schriften

Die Schriften liegen im Repository und werden vom eigenen Server geladen. Sie stehen unter der [SIL Open Font License 1.1](https://openfontlicense.org), nicht unter der MIT-Lizenz des übrigen Codes; der Lizenztext liegt jeweils im Ordner der Schrift:

| Schrift | Ordner | Quelle |
| --- | --- | --- |
| Geist | `js/codeblocks-js/fonts/` | [vercel/geist-font](https://github.com/vercel/geist-font) (mit CodeBlocks ausgeliefert) |
| Caveat | `fonts/caveat/` | [googlefonts/caveat](https://github.com/googlefonts/caveat), Dateien aus [@fontsource-variable/caveat](https://fontsource.org/fonts/caveat) |

## Licensed assets

Einige Bilder der Szenen in `common/scene/` sind bei [Freepik](https://www.freepik.com) lizenziert (Liste in `IMAGE-LICENSE.md`). Sie dürfen in diesem Projekt verwendet, aber nicht im Repository veröffentlicht werden. Sie sind daher per `.gitignore` ausgeschlossen und werden separat als `lernwerk-licensed-assets.zip` (inkl. `IMAGE-LICENSE.md`) bereitgestellt.

Installation:

1. `lernwerk-licensed-assets.zip` vom geschützten Download-Ort herunterladen (bei den Maintainern erfragen) und im Wurzelverzeichnis des Repositorys ablegen.
2. Bilder entpacken:
   ```
   node tools/licensed-assets.mjs extract
   ```

Maintainer erstellen das Archiv aus ihrer Arbeitskopie mit `node tools/licensed-assets.mjs build`.
