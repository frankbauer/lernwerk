# GDI Lernwerk

Eine Sammlung von Übungsaufgaben als Begleitmaterial vür die Veranstaltung [**Grundlagen der Informatik**](https://gdi.cs.fau.de/livecompile/uebersicht.html) an der [Friedrich-Alexander-Universität Erlangen-Nürnberg](https://fau.de).

## Licensed assets

Einige Bilder der Szenen in `common/scene/` sind bei [Freepik](https://www.freepik.com) lizenziert (Liste in `IMAGE-LICENSE.md`). Sie dürfen in diesem Projekt verwendet, aber nicht im Repository veröffentlicht werden. Sie sind daher per `.gitignore` ausgeschlossen und werden separat als `lernwerk-licensed-assets.zip` (inkl. `IMAGE-LICENSE.md`) bereitgestellt.

Installation:

1. `lernwerk-licensed-assets.zip` vom geschützten Download-Ort herunterladen (bei den Maintainern erfragen) und im Wurzelverzeichnis des Repositorys ablegen.
2. Bilder entpacken:
   ```
   node tools/licensed-assets.mjs extract
   ```

Maintainer erstellen das Archiv aus ihrer Arbeitskopie mit `node tools/licensed-assets.mjs build`.
