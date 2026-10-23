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

Impressum (`impressum.html`), Datenschutzerklärung (`datenschutz.html`), Erklärung zur Barrierefreiheit (`barrierefreiheit.html`) und der KI-Hinweis (`ki-hinweis.html`) gelten für [gdi.cs.fau.de/livecompile](https://gdi.cs.fau.de/livecompile/uebersicht.html) und müssen bei eigenem Hosting angepasst werden.

## KI-Kennzeichnung

Inhalte, an denen KI beteiligt war, erhalten eine Plakette, eine pro Datei (Aufgabenstellung, Erklärung, Klassenbeschreibung). Sie ist in `theme.js` definiert und steht in jedem HTML-Fragment einer Übung zur Verfügung:

```html
<lw-ai-badge idea="human" written="ai" proofreading="human" content="text"></lw-ai-badge>
```

| Attribut | Werte (Voreinstellung fett) |
| --- | --- |
| `idea` | **`human`**, `ai`, `none` (keine eigene Idee nötig, z. B. bei Klassenbeschreibungen) |
| `written` | `human`, **`ai`** |
| `proofreading` | **`human`**, `none` |
| `spellchecking` | `ai`, **`none`** (nur bei `written="human"`) |
| `content` | **`text`**, `code`, `image` (Symbol im Kern, Bezeichnung des mittleren Beitrags) |
| `compact` | ohne Wert: beim Überfahren geht eine Sprechblase mit dem Text auf; ohne `compact` reihen sich die Monde mit ihren Etiketten auf |
| `hide-text` | ohne Wert: kein Text neben dem Symbol; beim Überfahren reihen sich die Monde mit ihren Etiketten auf, ohne „Mehr im KI-Hinweis“ (Screenreader lesen den Text weiterhin) |
| `hover-text` | ohne Wert, zusammen mit `hide-text`: der Text ist in Ruhe ausgeblendet, erscheint aber beim Überfahren neben den aufgereihten Monden |
| `size` | Höhe in px, **24** |

Wie sich die Plakette beim Überfahren öffnet, legen nur die Attribute fest (`compact`, `hide-text`). Ihre Lage in einer Box bestimmt lediglich die Richtung: Steht sie direkt nach der Überschrift (`<h3>` als erstes Element der Datei), sitzt sie rechts in deren Kopfzeile; steht sie als letztes Element einer Box ohne Überschrift davor, sitzt sie unten rechts. In beiden Fällen öffnet sie sich nach links (die Monde lesen sich von links weiterhin Idee, Umsetzung, Prüfung):

```html
<h3>Aufgabe</h3>
<lw-ai-badge hide-text idea="human" written="ai" proofreading="human"></lw-ai-badge>
```

Die Plakette zeigt die Beiträge von Mensch und KI, entfaltet beim Überfahren eine Aufschlüsselung und verlinkt auf die passende Erklärung in `ki-hinweis.html#kennzeichnung`. Screenreader lesen die Aufschlüsselung und die Erklärung als Linktext vor. Die Highlightfarbe für menschliche Beiträge steht je Theme in `css/site.css` (`--lw-ai-hl`). Für Legenden gibt es `<lw-ai-symbol kind="human|ai|none|na|text|code|image">` (`na`: Idee entfällt) (mit `decorative`, wenn der Name daneben im Text steht). Entwürfe der Plakette: `ki-plaketten-entwurf.html` (nicht verlinkt).

## Image Credits

Jedes Bild im Repository ist mit seiner Herkunft in `image-credits.json` eingetragen. `tools/image_credits.py` schreibt diese Angaben als EXIF- und IPTC/XMP-Metadaten (Herkunft, Urheber, Copyright) in die Bilddateien. Ausgewählte KI-Bilder erhalten zusätzlich einen sichtbaren Hinweis „generated with …“. Benötigt werden Python 3 und Pillow (`pip install pillow`). `tools/` wird nicht eingecheckt; dasselbe Werkzeug liegt eingecheckt in `tools/` von CodeBlocks.

```json
"modules/gdi/img/previews/05_Objekte-vector.webp": {"generator": "Generated", "name": "Krea 2", "overlay": true}
```

| Feld | Bedeutung |
| --- | --- |
| `generator` | `Generated` (KI), `Human` (von Hand), `Automated` (Screenshots und aus anderen Bildern abgeleitete Dateien) oder `Unknown` (noch nicht eingeordnet) |
| `name` | KI-Modell oder Urheber, z. B. `Krea 2`, `T. Miehm`, `F. Bauer` |
| `source` | [IPTC Digital Source Type](https://cv.iptc.org/newscodes/digitalsourcetype/). Pflicht bei `Automated` (z. B. `screenCapture` für die Vorschau-Screenshots, `algorithmicMedia` für die Konzept-Icons); Voreinstellung `trainedAlgorithmicMedia` bei `Generated`, `digitalCreation` bei `Human` |
| `overlay` | Hinweis „generated with *name*“ einbrennen (nur bei `Generated`). Optional: `position` (`bottom-right`, `bottom-left`, `top-right`, `top-left`), `scale` (Größenfaktor), `offset` (`[x, y]` in Bildpixeln) |

Pfade, die auf ein Muster in `exclude` passen (z. B. `js/*`), werden ignoriert.

Neue Bilder eintragen:

1. `python3 tools/image_credits.py add` trägt alle noch fehlenden Bilder als `Unknown` ein (`--dry-run` listet sie nur auf).
2. Bei den neuen Einträgen `generator`, `name` und bei `Automated` `source` setzen.
3. `python3 tools/image_credits.py meta` entfernt alle Metadaten und schreibt EXIF und XMP neu; `Unknown`-Bilder bleiben unverändert.
4. `python3 tools/image_credits.py overlay` rendert den Hinweis für Einträge mit `overlay: true`. Nach Änderungen an `position`, `scale` oder `offset` erneut ausführen; aktuelle Bilder werden übersprungen.
5. `python3 tools/image_credits.py check` meldet fehlende, veraltete und `Unknown`-Einträge sowie Overlays ohne Original und schlägt fehl, solange es welche gibt.

Die Bilder in `assets/` kommen aus CodeBlocks (`npm run build-lernwerk`) und werden dort eingeordnet und gestempelt; hier tragen sie dieselbe Angabe (Pfad ohne `public/`). Ein Kontaktbogen aller Bilder beider Repositorys, nach Herkunft gruppiert, entsteht in CodeBlocks mit `npm run build-credits-review`. Er meldet auch abweichende Angaben.

Der Hinweis wird immer auf das ungestempelte Original gerendert. Die Originale dürfen nicht eingecheckt werden und liegen in dem Ordner, den `IMAGE_ORIGINALS_FOLDER` in `.env` angibt (gleiche relative Pfade wie in `image-credits.json`). Fehlt das Original eines noch ungestempelten Bildes, legt `overlay` es dort zuerst ab.

## Schriften

Die Schriften liegen im Repository und werden vom eigenen Server geladen. Sie stehen unter der [SIL Open Font License 1.1](https://openfontlicense.org), nicht unter der MIT-Lizenz des übrigen Codes; der Lizenztext liegt jeweils im Ordner der Schrift:

| Schrift | Ordner | Quelle |
| --- | --- | --- |
| Geist | `js/codeblocks-js/fonts/` | [vercel/geist-font](https://github.com/vercel/geist-font) (mit CodeBlocks ausgeliefert) |
| Caveat | `fonts/caveat/` | [googlefonts/caveat](https://github.com/googlefonts/caveat), Dateien aus [@fontsource-variable/caveat](https://fontsource.org/fonts/caveat) |
| Grenze Gotisch | `fonts/grenze-gotisch/` | [Omnibus-Type/Grenze-Gotisch](https://github.com/Omnibus-Type/Grenze-Gotisch), Dateien aus [@fontsource-variable/grenze-gotisch](https://fontsource.org/fonts/grenze-gotisch) |
