// Darstellungs-Themes für die Übungsseiten und die Übersicht (uebersicht.html).
// Übungsseiten: content.js setzt das gespeicherte Theme bereits beim Laden (html[data-lw-theme]) und
// lädt die Stylesheets sowie dieses Skript. uebersicht.html bindet dieses Skript direkt im <head> ein.
// Hier werden das Menü oben rechts, (auf Übungsseiten) die Kapitelzeile über dem Titel und der Sprunglink
// sowie auf allen Seiten die Fußzeile mit Impressum, Datenschutz, Barrierefreiheit und KI-Hinweis erzeugt.
// Außerdem werden hier die KI-Kennzeichnung <lw-ai-badge> und <lw-ai-symbol> definiert.
(function () {
    const STORAGE_KEY = 'lernwerk-theme'
    const DEFAULT_THEME = 'abenteuer' // muss zu content.js passen
    const base = new URL('.', document.currentScript.src)

    // colors: [Hintergrund, Fläche, Akzent 1, Akzent 2] für die Vorschau im Menü
    const THEMES = [
        { id: 'klassisch', name: 'Klassisch', hint: 'Im Stil der Übersichtsseite', colors: ['#f6f2ee', '#ffffff', '#9a3f28', '#1a1614'] },
        { id: 'heft', name: 'Heft', hint: 'Papier, Serifen, Textmarker', colors: ['#f7f3ea', '#fffdf8', '#ffe27a', '#8e5bb8'] },
        { id: 'karten', name: 'Karten', hint: 'Hell, kühl, aufgeräumt', colors: ['#f2f4f7', '#ffffff', '#f5b400', '#4f46e5'] },
        { id: 'terminal', name: 'Terminal', hint: 'Dunkel wie eine IDE', colors: ['#0d1017', '#121620', '#fbbf24', '#34d399'] },
        { id: 'abenteuer', name: 'Abenteuer', hint: 'Kräftig und verspielt', colors: ['#fff4dc', '#ffffff', '#ffd23f', '#b69cff'] },
        { id: 'raster', name: 'Raster', hint: 'Klares Schweizer Raster', colors: ['#ffffff', '#ffffff', '#111111', '#e30613'] },
        { id: 'tafel', name: 'Tafel', hint: 'Kreide auf grüner Tafel', colors: ['#26392f', '#1c2b23', '#f7d774', '#f4a6c6'] },
        { id: 'shadows', name: 'Shadows', hint: 'Dunkel, mit Tiefe und Leuchten', colors: ['#101015', '#1a1a22', '#a78bfa', '#f472b6'] },
        { id: 'prisma', name: 'Prisma', hint: 'Licht in allen Spektralfarben', colors: ['linear-gradient(90deg, #ef4444, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6)', '#ffffff', 'linear-gradient(90deg, #ef4444, #facc15, #3b82f6)', '#8b5cf6'] },
        { id: 'koralle', name: 'Koralle', hint: 'Warm, mit Korallen-Verlauf', colors: ['#faf7f5', '#ffffff', 'linear-gradient(120deg, #ff6b6b, #c9401f)', '#1c1917'] },
    ]

    function isKnown(id) {
        return THEMES.some(t => t.id === id)
    }

    function loadTheme() {
        try {
            const id = localStorage.getItem(STORAGE_KEY)
            if (isKnown(id)) return id
        } catch (e) { }
        return DEFAULT_THEME
    }

    function saveTheme(id) {
        try {
            localStorage.setItem(STORAGE_KEY, id)
        } catch (e) { }
    }

    function applyTheme(id) {
        document.documentElement.dataset.lwTheme = id
    }

    // content.js hat evtl. einen unbekannten (veralteten) Wert gesetzt
    applyTheme(loadTheme())

    function createMenu(parent, floating = false) {
        const anchor = document.createElement('div')
        anchor.className = floating ? 'lw-menu-anchor lw-menu-anchor--floating' : 'lw-menu-anchor'

        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'lw-menu-button'
        button.setAttribute('aria-label', 'Darstellung wählen')
        button.setAttribute('aria-haspopup', 'true')
        button.setAttribute('aria-expanded', 'false')
        button.setAttribute('aria-controls', 'lw-theme-menu')
        button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
            + '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'

        const menu = document.createElement('div')
        menu.className = 'lw-menu'
        menu.id = 'lw-theme-menu'
        menu.setAttribute('role', 'menu')
        menu.hidden = true

        // Zusätzliche Befehle anderer Skripte (z.B. autosave.js) über window.lwMenuActions:
        // { section, label, icon (SVG-Pfad, 24x24), hint: () => string, shortcut (z.B. '⌘S'), onSelect }
        // Sie stehen oben, die Themes danach.
        const actionArea = document.createElement('div')
        actionArea.className = 'lw-menu-actions'
        menu.append(actionArea)

        const title = document.createElement('div')
        title.className = 'lw-menu-title lw-menu-title--themes'
        title.textContent = 'Darstellung'
        menu.append(title)

        const items = THEMES.map(theme => {
            const item = document.createElement('button')
            item.type = 'button'
            item.className = 'lw-menu-item'
            item.setAttribute('role', 'menuitemradio')
            item.dataset.theme = theme.id
            const [bg, surface, a1, a2] = theme.colors
            item.innerHTML = `<span class="lw-swatch" style="background:${bg}" aria-hidden="true">`
                + `<i style="background:${surface}"></i><b style="background:${a1}"></b><b style="background:${a2}"></b></span>`
                + `<span class="lw-menu-label"><span>${theme.name}</span><small>${theme.hint}</small></span>`
                + '<span class="lw-check" aria-hidden="true">✓</span>'
            item.addEventListener('click', () => {
                applyTheme(theme.id)
                saveTheme(theme.id)
                updateChecked()
                close()
            })
            menu.append(item)
            return item
        })


        function renderActions() {
            actionArea.replaceChildren()
            let section = null
            for (const action of window.lwMenuActions ?? []) {
                if (action.section !== section) {
                    section = action.section
                    const sectionTitle = document.createElement('div')
                    sectionTitle.className = 'lw-menu-title lw-menu-title--section'
                    sectionTitle.textContent = section ?? ''
                    actionArea.append(sectionTitle)
                }
                const item = document.createElement('button')
                item.type = 'button'
                item.className = 'lw-menu-item'
                item.setAttribute('role', 'menuitem')
                item.innerHTML = '<span class="lw-menu-icon" aria-hidden="true">'
                    + `<svg viewBox="0 0 24 24" width="20" height="20">${action.icon ?? ''}</svg></span>`
                    + '<span class="lw-menu-label"><span></span><small></small></span>'
                item.querySelector('.lw-menu-label>span').textContent = action.label
                item.querySelector('.lw-menu-label small').textContent = action.hint?.() ?? ''
                if (action.shortcut) {
                    const kbd = document.createElement('kbd')
                    kbd.className = 'lw-menu-kbd'
                    kbd.textContent = action.shortcut
                    item.setAttribute('aria-keyshortcuts', action.shortcut.replace('⌘', 'Meta+').replace('Strg', 'Control'))
                    item.append(kbd)
                }
                item.addEventListener('click', async () => {
                    close()
                    await action.onSelect?.()
                })
                actionArea.append(item)
            }
        }
        renderActions()
        window.addEventListener('lw-menu-actions', renderActions)

        function updateChecked() {
            const current = loadTheme()
            items.forEach(item => item.setAttribute('aria-checked', String(item.dataset.theme === current)))
        }

        function open() {
            updateChecked()
            renderActions()
            menu.hidden = false
            button.setAttribute('aria-expanded', 'true')
            menu.querySelector('.lw-menu-item')?.focus()
        }

        function close(returnFocus = true) {
            if (menu.hidden) return
            menu.hidden = true
            button.setAttribute('aria-expanded', 'false')
            if (returnFocus) button.focus()
        }

        button.addEventListener('click', () => (menu.hidden ? open() : close()))
        document.addEventListener('click', e => {
            if (!anchor.contains(e.target)) close(false)
        })
        menu.addEventListener('keydown', e => {
            const all = [...menu.querySelectorAll('.lw-menu-item')]
            const idx = all.indexOf(document.activeElement)
            if (e.key === 'Escape') {
                close()
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                const step = e.key === 'ArrowDown' ? 1 : -1
                all[(idx + step + all.length) % all.length].focus()
            } else if (e.key === 'Tab') {
                close(false)
            }
        })

        anchor.append(button, menu)
        parent.append(anchor)
    }

    // Kapitelzeile über dem Titel, z.B. "Kapitel 0 · Einführung OOP" (nur in den neuen Themes sichtbar)
    async function createCrumb(topbar) {
        const h1 = topbar.querySelector('h1')
        if (!h1) return
        const wrap = document.createElement('div')
        wrap.className = 'lw-title'
        const crumb = document.createElement('span')
        crumb.className = 'lw-crumb'
        h1.replaceWith(wrap)
        wrap.append(crumb, h1)

        const path = decodeURIComponent(location.pathname)
        const relative = path.startsWith(base.pathname) ? path.slice(base.pathname.length) : path
        // Übungen liegen in modules/<Modul>/<Kapitelordner>/<Übung>/, Seiten im Wurzelverzeichnis
        // (z.B. impressum.html) gehören zu keinem Kapitel
        const parts = relative.split('/').filter(Boolean)
        if (parts[0] !== 'modules' || parts.length < 4) return
        crumb.textContent = parts[2].replace(/_/g, ' ')
        try {
            await loadCatalogScript()
            const catalog = await LernwerkCatalog.load(base)
            const chapter = LernwerkCatalog.chapterOfPath(catalog, relative)
            if (chapter) crumb.textContent = `Kapitel ${chapter.number} · ${chapter.title}`
        } catch (e) { }
    }

    // catalog.js (Kapitel aus data/curriculum.json und den Modulen) ist auf den Übungsseiten nicht eingebunden
    function loadCatalogScript() {
        if (window.LernwerkCatalog) return Promise.resolve()
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = new URL('catalog.js?v=1.0.0', base).href
            script.onload = resolve
            script.onerror = reject
            document.head.append(script)
        })
    }

    // Fußzeile mit Impressum, Datenschutz, Barrierefreiheit und Copyright (auf allen Seiten, css/site.css)
    const LEGAL_LINKS = [
        { href: 'impressum.html', label: 'Impressum' },
        { href: 'datenschutz.html', label: 'Datenschutz' },
        { href: 'barrierefreiheit.html', label: 'Barrierefreiheit' },
        { href: 'ki-hinweis.html', label: 'KI-Hinweis' },
    ]
    const COPYRIGHT_START = 2024

    function createFooter(parent) {
        if (document.querySelector('footer.lw-footer')) return
        const footer = document.createElement('footer')
        footer.className = 'lw-footer'
        const inner = document.createElement('div')
        inner.className = 'lw-footer-inner'

        const nav = document.createElement('nav')
        nav.setAttribute('aria-label', 'Rechtliches')
        const list = document.createElement('ul')
        for (const { href, label } of LEGAL_LINKS) {
            const url = new URL(href, base)
            const link = document.createElement('a')
            link.href = url
            link.textContent = label
            if (url.pathname === location.pathname) link.setAttribute('aria-current', 'page')
            const item = document.createElement('li')
            item.append(link)
            list.append(item)
        }
        nav.append(list)

        const year = Math.max(new Date().getFullYear(), COPYRIGHT_START)
        const copyright = document.createElement('small')
        copyright.textContent = `© ${COPYRIGHT_START}–${year} Lehrstuhl für Graphische Datenverarbeitung, `
            + 'Friedrich-Alexander-Universität Erlangen-Nürnberg'

        inner.append(nav, copyright)
        footer.append(inner)
        parent.append(footer)
    }

    // KI-Kennzeichnung <lw-ai-badge> für Inhalte, an denen KI beteiligt war: eine Plakette pro Datei
    // (Aufgabenstellung, Erklärung, Klassenbeschreibung ...), Erklärung in ki-hinweis.html.
    // Attribute (Voreinstellung fett):
    //   idea = **human** | ai | none (keine eigene Idee nötig, z.B. Beschreibung einer vorhandenen Klasse),
    //   written = human | **ai**, proofreading = **human** | none,
    //   spellchecking = ai | **none** (nur bei written="human"), content = **text** | code | image,
    //   compact (beim Überfahren eine Sprechblase mit dem Text statt der aufgereihten Monde mit Etiketten),
    //   hide-text (kein Text neben dem Symbol), hover-text (mit hide-text: der Text
    //   erscheint beim Überfahren doch), size = Höhe in px (**24**)
    // Wie sie aufgeht, bestimmen nur diese Attribute; die Lage in einer Box (followHeading) nur die Richtung.
    // Beispiel: <lw-ai-badge idea="human" written="ai" proofreading="human" content="code"></lw-ai-badge>
    // Darstellung: ein Kern mit dem Symbol des Inhalts und drei Monde für Idee, Umsetzung und Prüfung/Korrektur
    // (Mensch: Highlightfarbe mit Mensch-Symbol, KI: schwarz mit Funke, nicht erfolgt: gestrichelt). Beim
    // Überfahren kreisen die Monde gegen den Uhrzeigersinn um den Kern, reihen sich auf und zeigen schräge
    // Etiketten. Die Plakette ist ein Link auf ihre Erklärung in ki-hinweis.html (#ki-<Stufe>); Screenreader lesen
    // den sichtbaren Text, die Aufschlüsselung der drei Beiträge und die Erklärung vor. Sie rendert in ein Shadow
    // DOM, Farben kommen über die --lw-* und --lw-ai-* Variablen (css/site.css).
    // <lw-ai-symbol kind="human|ai|none|text|code|image"> zeigt ein einzelnes Symbol (Legende in ki-hinweis.html).
    const AI_KINDS = { text: 'Text', code: 'Code', image: 'Bild' }
    // na: entfällt (für die Idee bei Inhalten, die nur Vorhandenes beschreiben)
    const AI_WHO = { human: 'Mensch', ai: 'KI', none: 'nicht erfolgt', na: 'entfällt' }
    const AI_LEVELS = {
        'ki-text-geprueft': {
            label: 'Idee & Prüfung: Mensch · {T}: KI',
            description: 'Von Menschen konzipiert, von einer KI umgesetzt und von Menschen geprüft.',
        },
        'ki-korrektur': {
            label: '{T}: Mensch · Korrektur: KI',
            description: 'Von Menschen erstellt; eine KI hat nur korrigiert, etwa Sprache und Rechtschreibung.',
        },
        'ki-text': {
            label: 'Idee: Mensch · {T}: KI',
            description: 'Inhalt und Aufbau von Menschen vorgegeben, von einer KI umgesetzt; noch nicht von Menschen geprüft.',
        },
        'ki-generiert-geprueft': {
            label: 'Prüfung: Mensch · {T}: KI',
            description: 'Von einer KI erstellt und von Menschen geprüft.',
        },
        'ki-generiert': {
            label: 'KI-generiert',
            description: 'Vollständig von einer KI erstellt, ohne Vorgabe oder Prüfung durch Menschen.',
        },
        'ki-beschreibung-geprueft': {
            label: '{T}: KI · Prüfung: Mensch',
            description: 'Beschreibt Vorhandenes, eine eigene Idee ist nicht nötig; von einer KI formuliert und von Menschen geprüft.',
        },
        'ki-beschreibung': {
            label: '{T}: KI',
            description: 'Beschreibt Vorhandenes, eine eigene Idee ist nicht nötig; von einer KI formuliert, noch nicht von Menschen geprüft.',
        },
        'ohne-ki': {
            label: 'Ohne KI',
            description: 'Von Menschen erstellt, ohne Beteiligung einer KI.',
        },
    }
    // Höhe der schrägen Etiketten und ihr Mindestabstand in px (bestimmen den Abstand der aufgereihten Monde)
    const AI_TAG_HEIGHT = 18
    const AI_TAG_GAP = 2.5
    // Abstand der Etiketten vom Rand ihres Monds in px
    const AI_TAG_OFFSET = 6
    // Radius der aufgereihten Monde in px (unabhängig von size, etwa so groß wie der Kern einer 24-px-Plakette)
    const AI_ROW_RADIUS = 10

    function aiLevel(idea, written, proofreading, spellchecking) {
        if (written === 'human') return spellchecking === 'ai' ? 'ki-korrektur' : 'ohne-ki'
        if (idea === 'none') return proofreading === 'human' ? 'ki-beschreibung-geprueft' : 'ki-beschreibung'
        if (idea === 'ai') return proofreading === 'human' ? 'ki-generiert-geprueft' : 'ki-generiert'
        return proofreading === 'human' ? 'ki-text-geprueft' : 'ki-text'
    }

    // Beiträge [Idee, Umsetzung, Prüfung/Korrektur] als 'human' | 'ai' | 'none'
    function aiParts(idea, written, proofreading, spellchecking) {
        const ideaBy = idea === 'ai' ? 'ai' : idea === 'none' ? 'na' : 'human'
        if (written === 'human') {
            if (spellchecking === 'ai') return { parts: [ideaBy, 'human', 'ai'], check: 'Korrektur' }
            return { parts: [ideaBy, 'human', proofreading === 'none' ? 'none' : 'human'], check: 'Prüfung' }
        }
        return { parts: [ideaBy, 'ai', proofreading === 'human' ? 'human' : 'none'], check: 'Prüfung' }
    }

    // --- Grafik (SVG; der Kern hat den Radius 12.5) ---
    const rad = a => a * Math.PI / 180
    const f = v => +v.toFixed(2)

    // 4-zackiger Funke (KI), Mittelpunkt (x, y), Radius r
    function sparkle(x, y, r, color) {
        const k = r * 0.28
        return `<path fill="${color}" d="M${f(x)} ${f(y - r)}Q${f(x + k)} ${f(y - k)} ${f(x + r)} ${f(y)}`
            + `Q${f(x + k)} ${f(y + k)} ${f(x)} ${f(y + r)}Q${f(x - k)} ${f(y + k)} ${f(x - r)} ${f(y)}`
            + `Q${f(x - k)} ${f(y - k)} ${f(x)} ${f(y - r)}Z"/>`
    }

    // Mensch-Symbol (Kopf und Schultern) in einem Mond mit Radius r
    function person(x, y, r, color) {
        const sw = r * 0.5, sy = y + r * 0.62
        return `<circle cx="${f(x)}" cy="${f(y - r * 0.24)}" r="${f(r * 0.27)}" fill="${color}"/>`
            + `<path fill="${color}" d="M${f(x - sw)} ${f(sy)}A${f(sw)} ${f(sw * 0.95)} 0 0 1 ${f(x + sw)} ${f(sy)}Z"/>`
    }

    // Mond für einen Beitrag. Alle Zustände haben dieselbe sichtbare Außenkante r (der gestrichelte Umriss liegt
    // etwas innen, weil Striche optisch größer wirken); ein Rand in Papierfarbe trennt ihn vom Kern.
    function aiDot(x, y, r, state) {
        let s = `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 1.2)}" fill="var(--b-paper)"/>`
        if (state === 'human') {
            s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="var(--b-hl)"/>`
                + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - 0.6)}" fill="none" stroke="var(--b-hl-line)" stroke-width="1.2"/>`
                + person(x, y, r * 0.95, 'var(--b-hl-fg)')
        } else if (state === 'ai') {
            s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="var(--b-ink)"/>` + sparkle(x, y, r * 0.6, 'var(--b-paper)')
        } else if (state === 'na') {
            // entfällt: dünner, durchgezogener Ring mit Strich (kein Mangel wie das gestrichelte "nicht erfolgt")
            s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - 0.6)}" fill="var(--b-paper)" stroke="var(--b-none)" stroke-width="1.2"/>`
                + `<path d="M${f(x - r * 0.45)} ${f(y)}H${f(x + r * 0.45)}" stroke="var(--b-none)" stroke-width="${f(r * 0.24)}" stroke-linecap="round"/>`
        } else {
            s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - 1.1)}" fill="var(--b-paper)" stroke="var(--b-none)" `
                + 'stroke-width="1" stroke-dasharray="1.6 1.4"/>'
        }
        return s
    }

    // Symbol für die Art des Inhalts (Text: Zeilen, Code: </>, Bild: Berge mit Sonne), halbe Breite m
    function aiMark(content, x, y, m) {
        const color = 'var(--b-paper)'
        const line = `fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"`
        const p = (dx, dy) => `${f(x + dx * m)} ${f(y + dy * m)}`
        if (content === 'code') {
            return `<path ${line} stroke-width="${f(m * 0.22)}" d="M${p(-0.4, -0.5)}L${p(-0.9, 0)}L${p(-0.4, 0.5)}`
                + `M${p(0.4, -0.5)}L${p(0.9, 0)}L${p(0.4, 0.5)}M${p(0.16, -0.62)}L${p(-0.16, 0.62)}"/>`
        }
        if (content === 'image') {
            return `<path fill="${color}" d="M${p(-0.9, 0.6)}L${p(-0.3, -0.2)}L${p(0.05, 0.25)}L${p(0.35, -0.05)}L${p(0.9, 0.6)}Z"/>`
                + `<circle cx="${f(x + 0.38 * m)}" cy="${f(y - 0.52 * m)}" r="${f(0.22 * m)}" fill="${color}"/>`
        }
        return `<path ${line} stroke-width="${f(m * 0.24)}" d="M${p(-0.75, -0.5)}H${f(x + 0.75 * m)}`
            + `M${p(-0.75, 0)}H${f(x + 0.75 * m)}M${p(-0.75, 0.5)}H${f(x + 0.15 * m)}"/>`
    }

    // Farben: Kern und KI in Schriftfarbe, Mensch in der Highlightfarbe des Themes (css/site.css, --lw-ai-*)
    const AI_VARS = `
        --b-ink: var(--lw-fg, #111);
        --b-paper: var(--lw-surface-solid, var(--lw-surface, var(--lw-bg, #fff)));
        --b-none: var(--lw-muted, #777);
        --b-hl: var(--lw-ai-hl, #ffd23f);
        --b-hl-fg: var(--lw-ai-hl-fg, #111);
        --b-hl-line: var(--lw-ai-hl-line, var(--b-ink));`

    const AI_BADGE_CSS = `
        :host {
            ${AI_VARS}
            display: inline-block;
            vertical-align: middle;
            max-width: 100%;
            font-family: var(--lw-font, inherit);
            font-size: 12.5px;
            font-style: normal;
            font-weight: 500;
            line-height: 1.3;
            letter-spacing: normal;
            text-transform: none;
        }
        :host([hidden]) { display: none; }
        .kb {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: gap 0.3s ease 0.1s;
            max-width: 100%;
            color: var(--lw-muted, #595959);
            text-decoration: none;
        }
        .kb:is(:hover, :focus-visible) { color: var(--lw-fg, #111); }
        /* aufgeklappt mehr Abstand zwischen den aufgereihten Monden und dem Text */
        :host(:not([compact])) .kb:is(:hover, :focus-visible) {
            gap: 16px;
            transition: gap 0.45s ease 0.55s;
        }
        .kb:focus-visible { outline: 2px solid var(--lw-link, var(--lw-accent, #1c63c7)); outline-offset: 3px; border-radius: 4px; }
        svg { display: block; overflow: visible; }
        .label { min-width: 0; }
        /* unsichtbare Kopie eines Textteils, misst seine Breite unabhängig vom Zustand der Sprechblase */
        .measure {
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            pointer-events: none;
        }
        .sr {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
        }

        /* Breite wächst beim Aufreihen mit, der Text rückt nach */
        .sym {
            position: relative;
            flex: none;
            width: var(--w0);
            transition: width 0.35s ease 0.1s;
        }
        .kb:is(:hover, :focus-visible) .sym {
            width: var(--w1);
            transition: width 0.45s cubic-bezier(0.2, 0.9, 0.35, 1.05) 0.55s;
        }

        /* Symbol im Kern: in Ruhe nach links versetzt (Platz für die Monde), aufgereiht mittig */
        .mark {
            translate: calc(var(--mx) * 1px) 0;
            transition: translate 0.3s ease 0.1s;
        }
        .kb:is(:hover, :focus-visible) .mark {
            translate: 0 0;
            transition: translate 0.4s cubic-bezier(0.2, 0.9, 0.35, 1) 0.6s;
        }

        /* Monde: .orb dreht um den Kern, ihr Inhalt gegenläufig (Symbole bleiben aufrecht). Hin: umlaufen und
           noch im Schwung in die Reihe gleiten; zurück: erst einfahren, dann zurückdrehen. */
        .orb {
            transform-box: view-box;
            transform-origin: 14px 14px;
            rotate: var(--a0);
            translate: 0 0;
            transition: translate 0.25s ease var(--d), rotate 0.6s cubic-bezier(0.3, 0, 0.2, 1) calc(var(--d) + 0.15s);
        }
        .orb>g {
            transform-box: fill-box;
            transform-origin: center;
            rotate: calc(-1 * var(--a0));
            scale: 1;
            transition: scale 0.25s ease var(--d), rotate 0.6s cubic-bezier(0.3, 0, 0.2, 1) calc(var(--d) + 0.15s);
        }
        .kb:is(:hover, :focus-visible) .orb {
            rotate: -360deg;
            translate: calc(var(--tx) * 1px) 0;
            transition: rotate 0.7s cubic-bezier(0.45, 0, 0.75, 0.8) var(--d),
                translate 0.45s cubic-bezier(0.2, 0.9, 0.35, 1.12) calc(var(--d) + 0.55s);
        }
        /* aufgereiht wachsen die Monde auf AI_ROW_RADIUS (--s) */
        .kb:is(:hover, :focus-visible) .orb>g {
            rotate: 360deg;
            scale: var(--s);
            transition: rotate 0.7s cubic-bezier(0.45, 0, 0.75, 0.8) var(--d),
                scale 0.45s cubic-bezier(0.2, 0.9, 0.35, 1.12) calc(var(--d) + 0.55s);
        }

        /* Schräge Etiketten: Drehpunkt ist die Mitte des Monds, das Etikett beginnt hinter dessen Rand (--gap).
           data-flip: zu wenig Platz nach oben, die Etiketten zeigen nach unten. */
        .tag {
            --rot: -40deg;
            position: absolute;
            left: var(--x);
            z-index: 20;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            gap: 0.3em;
            height: ${AI_TAG_HEIGHT}px;
            padding: 0 8px 0 11px;
            border: 1.5px solid var(--b-ink);
            border-radius: 999px;
            font-size: 11px;
            font-weight: 300;
            line-height: 1;
            white-space: nowrap;
            transform-origin: 0 50%;
            transform: translateY(-50%) rotate(var(--rot)) translateX(var(--gap)) scale(0.4);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.12s, transform 0.15s;
        }
        .kb[data-flip] .tag { --rot: 40deg; }
        .tag b { font-weight: 700; }
        .tag[data-s="human"] { border-color: var(--b-hl-line); background: var(--b-hl); color: var(--b-hl-fg); }
        .tag[data-s="ai"] { background: var(--b-ink); color: var(--b-paper); }
        .tag[data-s="none"] { border-style: dashed; border-color: var(--b-none); background: var(--b-paper); color: var(--lw-muted, #595959); }
        /* eine entfallene Idee bekommt kein Etikett */
        .tag[data-s="na"] { display: none; }
        .kb:is(:hover, :focus-visible) .tag {
            transform: translateY(-50%) rotate(var(--rot)) translateX(var(--gap));
            opacity: 1;
            transition: opacity 0.2s calc(0.7s + var(--d)), transform 0.35s cubic-bezier(0.34, 1.5, 0.64, 1) calc(0.7s + var(--d));
        }

        /* Text der Plakette (Behälter, z.B. für den Abstand bei hover-text) */
        .text {
            position: relative;
            display: flex;
            min-width: 0;
        }
        /* Pfeil der Sprechblase (compact) stupst beim Überfahren nach rechts */
        @keyframes nudge {
            0%, 60%, 100% { translate: 0 0; }
            30% { translate: 2px 0; }
        }

        /* Rechtsbündig (in der Kopfzeile oder am Fuß einer Box, data-heading/data-foot): alles gespiegelt, der Kern
           sitzt rechts, die Monde reihen sich nach links auf, die Etiketten steigen nach links oben. Die Grafik
           wird als Ganzes gespiegelt, das Symbol im Kern zurückgespiegelt. */
        :host(:is([data-heading], [data-foot]):not([compact])) .kb { flex-direction: row-reverse; }
        :host(:is([data-heading], [data-foot]):not([compact])) .sym {
            display: flex;
            justify-content: flex-end;
        }
        :host(:is([data-heading], [data-foot]):not([compact])) svg { transform: scaleX(-1); }
        :host(:is([data-heading], [data-foot]):not([compact])) .mark>* {
            transform-box: fill-box;
            transform-origin: center;
            scale: -1 1;
        }
        :host(:is([data-heading], [data-foot]):not([compact])) .tag {
            left: auto;
            right: var(--xm);
            transform-origin: 100% 50%;
            transform: translateY(-50%) rotate(calc(-1 * var(--rot))) translateX(calc(-1 * var(--gap))) scale(0.4);
        }
        :host(:is([data-heading], [data-foot]):not([compact])) .kb:is(:hover, :focus-visible) .orb {
            translate: calc(var(--txm) * 1px) 0;
        }
        :host(:is([data-heading], [data-foot]):not([compact])) .kb:is(:hover, :focus-visible) .tag {
            transform: translateY(-50%) rotate(calc(-1 * var(--rot))) translateX(calc(-1 * var(--gap)));
        }

        /* Pfeil am Ende der Sprechblase (nur compact) */
        .go {
            display: none;
            flex: none;
            place-items: center;
            width: 0;
            height: 16px;
            overflow: hidden;
            border-radius: 50%;
            background: var(--b-ink);
            color: var(--b-paper);
            opacity: 0;
            transition: width 0.3s ease, opacity 0.2s ease;
        }
        :host([compact]) .go { display: grid; }
        :host([compact]) .kb:is(:hover, :focus-visible) .go {
            width: 16px;
            opacity: 1;
            transition: width 0.3s ease 0.15s, opacity 0.25s ease 0.25s;
        }
        :host([compact]) .kb:is(:hover, :focus-visible) .go svg { animation: nudge 1.2s ease-in-out 1s infinite; }

        /* compact: die Monde kreisen nur auf die linke Seite des Kerns, statt Reihe und Etiketten fährt der Text als
           Sprechblase mit Pfeil heraus (für Screenreader bleibt er lesbar) */
        :host([compact]) .tag { display: none; }
        :host([compact]) .kb:is(:hover, :focus-visible) .sym { width: var(--w0); }
        :host([compact]) .kb:is(:hover, :focus-visible) .orb {
            rotate: calc(var(--a0) - 180deg);
            translate: 0 0;
            transition: rotate 0.6s cubic-bezier(0.3, 0, 0.2, 1) var(--d);
        }
        :host([compact]) .kb:is(:hover, :focus-visible) .orb>g {
            rotate: calc(180deg - var(--a0));
            scale: 1;
            transition: rotate 0.6s cubic-bezier(0.3, 0, 0.2, 1) var(--d);
        }
        /* data-mirror: rechts ist kein Platz, die Sprechblase öffnet sich nach links (Kern rechts, Pfeil links) und
           die Monde machen eine ganze Runde zurück auf die rechte Seite des Kerns */
        :host([compact]) .kb[data-mirror] {
            left: auto;
            right: 0;
            flex-direction: row-reverse;
        }
        :host([compact]) .kb[data-mirror]:is(:hover, :focus-visible) {
            left: auto;
            right: -4px;
            padding-left: 4px;
            padding-right: 6px;
        }
        :host([compact]) .kb[data-mirror]:is(:hover, :focus-visible) .orb {
            rotate: calc(var(--a0) - 360deg);
        }
        :host([compact]) .kb[data-mirror]:is(:hover, :focus-visible) .orb>g {
            rotate: calc(360deg - var(--a0));
        }
        :host([compact]) .kb:is(:hover, :focus-visible) .mark {
            translate: calc(var(--mx) * -1px) 0;
            transition: translate 0.4s ease 0.2s;
        }
        :host([compact]) .kb[data-mirror]:is(:hover, :focus-visible) .mark {
            translate: calc(var(--mx) * 1px) 0;
        }

        /* .box hält in der Zeile den Platz der Plakette in Ruhe frei; die aufgehende Sprechblase liegt darüber und
           verschiebt den umgebenden Text nicht */
        .box { display: contents; }
        :host([compact]) .box {
            position: relative;
            display: inline-block;
            width: var(--cw);
            height: var(--ch);
            vertical-align: middle;
        }
        :host([compact]) .kb {
            position: absolute;
            /* vertikal mittig, damit auch die zweizeilige Sprechblase gleichmäßig nach oben und unten wächst */
            top: 50%;
            translate: 0 -50%;
            left: 0;
            width: max-content;
            max-width: none;
            gap: 0;
            padding: 2px;
            border: 1px solid transparent;
            border-radius: 999px;
            transition: border-color 0.2s, background-color 0.2s, padding 0.3s, gap 0.3s;
        }
        :host([compact]) .label {
            max-width: 0;
            overflow: hidden;
            white-space: nowrap;
            opacity: 0;
            transition: max-width 0.4s ease, opacity 0.25s ease;
        }
        :host([compact]) .kb:is(:hover, :focus-visible) {
            z-index: 30;
            /* links Platz für die Monde, die auf die linke Seite des Kerns kreisen; der Kern bleibt an seiner Stelle */
            left: -4px;
            gap: 8px;
            padding-left: 6px;
            padding-right: 4px;
            border-color: var(--lw-border, rgba(0, 0, 0, 0.2));
            background: var(--b-paper);
        }
        :host([compact]) .kb:is(:hover, :focus-visible) .label { max-width: 24em; opacity: 1; }
        /* data-wrap: zu wenig Platz auf beiden Seiten; der Text steht mit festem Umbruch (an einem "·", in place()
           gesetzt) in zwei Zeilen, so hat die Sprechblase von Anfang an ihre Höhe und wächst nur in der Breite */
        :host([compact]) .kb[data-wrap] .label { white-space: pre; }
        :host([compact]) .kb[data-wrap]:is(:hover, :focus-visible) { border-radius: 14px; }

        /* hide-text: kein Text neben dem Symbol (für Screenreader bleibt er lesbar); beim Überfahren reihen sich die
           Monde trotzdem mit ihren Etiketten auf */
        :host([hide-text]) .label {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0 0 0 0);
            white-space: nowrap;
        }

        /* ohne sichtbaren Text kein Abstand neben dem Symbol; hover-text (mit hide-text): der Text fährt beim
           Überfahren heraus, sobald die Monde aufgereiht sind (Abstand dann über margin) */
        :host([hide-text]:not([compact])) .kb { gap: 0; }
        :host([hide-text][hover-text]:not([compact])) .label {
            position: static;
            width: auto;
            height: auto;
            clip: auto;
            max-width: 0;
            opacity: 0;
            transition: max-width 0.25s ease, opacity 0.15s ease;
        }
        :host([hide-text][hover-text]:not([compact])) .text {
            margin-left: 0;
            transition: margin 0.25s ease;
        }
        :host([hide-text][hover-text]:not([compact])) .kb:is(:hover, :focus-visible) .label {
            max-width: 24em;
            opacity: 1;
            transition: max-width 0.45s ease 0.65s, opacity 0.3s ease 0.75s;
        }
        :host([hide-text][hover-text]:not([compact])) .kb:is(:hover, :focus-visible) .text {
            margin-left: 16px;
            transition: margin 0.45s ease 0.65s;
        }
        /* gespiegelt steht der Text links vom Symbol */
        :host([hide-text][hover-text]:is([data-heading], [data-foot]):not([compact])) .kb:is(:hover, :focus-visible) .text {
            margin-left: 0;
            margin-right: 16px;
        }
        :host([hide-text]) .go { display: none; }
        :host([compact][hide-text]) .kb:is(:hover, :focus-visible) {
            gap: 0;
            left: 0;
            padding: 2px;
            border-color: transparent;
            background: none;
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { transition: none !important; animation: none !important; }
        }`

    class AiBadge extends HTMLElement {
        static observedAttributes = ['idea', 'written', 'proofreading', 'spellchecking', 'content', 'size']

        connectedCallback() {
            if (!this.shadowRoot) {
                // Platz für die Etiketten prüfen, bevor sie erscheinen
                this.addEventListener('pointerenter', () => this.place())
                this.addEventListener('focusin', () => this.place())
            }
            this.render()
            this.followHeading()
        }

        disconnectedCallback() {
            this.headingObservers?.forEach(observer => observer.disconnect())
        }

        attributeChangedCallback() {
            if (this.shadowRoot) this.render()
        }

        // Platz in einer Box (css/site.css), beide rechtsbündig und gespiegelt:
        // - direkt nach der Überschrift (<h3> als erstes Kind von .boxed): rechts in der Kopfzeile (data-heading), auf
        //   Höhe der letzten Textzeile der Überschrift. Deren Lage hängt vom Theme ab (Band, Etikett, Ziffer
        //   darüber ...) und wird daher gemessen: neu bei Größenänderungen von Überschrift, Box oder Plakette und
        //   beim Wechsel des Themes.
        // - als letztes Element einer Box ohne Überschrift davor: unten rechts (data-foot)
        followHeading() {
            this.headingObservers?.forEach(observer => observer.disconnect())
            const heading = this.previousElementSibling
            const box = this.parentElement
            const inBox = !!box?.matches('.boxed')
            const inHeading = inBox && !!heading?.matches('h3:first-child')
            this.toggleAttribute('data-heading', inHeading)
            this.toggleAttribute('data-foot', inBox && !inHeading && !this.nextElementSibling)
            if (!inHeading) return
            const align = () => {
                const range = document.createRange()
                range.selectNodeContents(heading)
                const lines = range.getClientRects()
                const line = lines[lines.length - 1] ?? heading.getBoundingClientRect()
                const top = line.top + line.height / 2 - box.getBoundingClientRect().top - box.clientTop
                this.style.top = `${Math.round(top - this.offsetHeight / 2)}px`
            }
            const resize = new ResizeObserver(align)
            for (const el of [heading, box, this]) resize.observe(el)
            const theme = new MutationObserver(align)
            theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lw-theme'] })
            this.headingObservers = [resize, theme]
        }

        value(name, fallback) {
            return (this.getAttribute(name) ?? fallback).trim().toLowerCase()
        }

        render() {
            const idea = this.value('idea', 'human'), written = this.value('written', 'ai')
            const proofreading = this.value('proofreading', 'human'), spellchecking = this.value('spellchecking', 'none')
            const content = AI_KINDS[this.value('content', 'text')] ? this.value('content', 'text') : 'text'
            const level = aiLevel(idea, written, proofreading, spellchecking)
            const { parts, check } = aiParts(idea, written, proofreading, spellchecking)
            const label = AI_LEVELS[level].label.replace('{T}', AI_KINDS[content])
            const roles = ['Idee', AI_KINDS[content], check]

            // Geometrie: Kern bei (14, 14), Monde (Radius 5) in Ruhe auf seinem Rand, aufgereiht ab x = 35 im
            // Abstand step; die um 40° gedrehten Etiketten liegen parallel im Abstand step · sin 40°
            const h = Math.max(16, Number(this.getAttribute('size')) || 24)
            const k = h / 28 // Pixel je Einheit
            const r = 5, cy = 14
            const rowR = Math.max(r, AI_ROW_RADIUS / k) // Radius aufgereiht (Einheiten)
            const step = Math.max(2 * rowR + 3, (AI_TAG_HEIGHT + AI_TAG_GAP) / Math.sin(rad(40)) / k)
            // erster Mond im selben Abstand zum Kern (Rand bei x = 26.5) wie die Monde untereinander
            const x0 = 26.5 + (step - 2 * rowR) + rowR
            const xs = [0, 1, 2].map(i => x0 + i * step)
            const width = xs[2] + rowR + 2
            const rest = [-50, 0, 50]

            const graphic = `<circle cx="14" cy="${cy}" r="12.5" fill="var(--b-ink)"/>`
                + `<g class="mark" style="--mx:-2.2">${aiMark(content, 14, cy, 6.25)}</g>`
                // jeder Mond liegt am Rechtspunkt des Orbits (x = 26.5) und wird in Ruhe auf seinen Winkel gedreht
                // --txm: Ziel in der gespiegelten Darstellung, dort in umgekehrter Reihenfolge, damit von links weiterhin
                // Idee, Umsetzung, Prüfung zu lesen ist
                + parts.map((state, i) => `<g class="orb" style="--a0:${rest[i]}deg;--tx:${f(xs[i] - 26.5)};--txm:${f(xs[2 - i] - 26.5)};`
                    + `--s:${f(rowR / r)};--d:${i * 0.07}s">`
                    + `<g>${aiDot(26.5, cy, r, state)}</g></g>`).join('')
            // --x: Abstand des Monds vom linken Rand der Grafik; --xm: in der gespiegelten (rechtsbündigen) Darstellung
            // sein Abstand vom rechten Rand (Reihenfolge wie bei --txm)
            const tags = parts.map((state, i) => `<span class="tag" data-s="${state}" style="--x:${f(xs[i] * k)}px;--xm:${f(xs[2 - i] * k)}px;`
                + `top:${f(cy * k)}px;--gap:${f(rowR * k + AI_TAG_OFFSET)}px;--d:${i * 0.07}s"><b>${roles[i]}:</b>${AI_WHO[state]}</span>`).join('')
            const arrow = '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M2 5h6M5.5 2.5 8 5 5.5 7.5" '
                + 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

            // Für Screenreader: Grafik und Etiketten sind ausgeblendet, stattdessen enthält der Link
            // vor und nach dem sichtbaren Text dieselben Angaben als Text (der sichtbare Text bleibt Teil des Namens)
            const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
            // compact: Platz in Ruhe (Symbol, Innenabstand 2 px und Rahmen 1 px je Seite)
            root.innerHTML = `<style>${AI_BADGE_CSS}</style>`
                + `<span class="box" style="--cw:${f(34 * k + 6)}px;--ch:${f(h + 6)}px"><a class="kb" part="link">`
                + `<span class="sym" aria-hidden="true" style="--w0:${f(34 * k)}px;--w1:${f(width * k)}px">`
                + `<svg viewBox="0 0 ${f(width)} 28" width="${f(width * k)}" height="${f(h)}">${graphic}</svg>`
                + `${tags}</span><span class="sr sr-before"></span><span class="text"><span class="label"></span></span>`
                + `<span class="sr sr-after"></span><i class="go" aria-hidden="true">${arrow}</i></a>`
                + '<span class="measure" aria-hidden="true"></span></span>'
            const link = root.querySelector('a')
            link.href = new URL(`ki-hinweis.html#${level}`, base)
            root.querySelector('.sr-before').textContent = `KI-Kennzeichnung (${AI_KINDS[content]}): `
            // Teile des Texts ("Idee & Prüfung: Mensch", "Text: KI"); ein Umbruch (place()) nur zwischen ihnen
            this.parts = label.split(' · ')
            root.querySelector('.label').textContent = label
            root.querySelector('.sr-after').textContent = '. '
                // eine entfallene Idee wird nicht vorgelesen
                + parts.map((state, i) => state === 'na' ? null : `${roles[i]}: ${AI_WHO[state]}`).filter(Boolean).join(', ') + '. '
                + AI_LEVELS[level].description
            this.dataset.level = level
        }

        // Vor dem Aufgehen prüfen, ob genug Platz ist (Fensterrand oder ein Vorfahre, der Überstehendes abschneidet,
        // z.B. die Boxen im Theme "Abenteuer"): Etiketten klappen nach unten (data-flip), die Sprechblase der
        // compact-Form öffnet sich nach links (data-mirror)
        place() {
            const link = this.shadowRoot?.querySelector('a')
            if (!link) return
            let top = 0, left = 0, right = document.documentElement.clientWidth
            for (let el = this.parentElement ?? this.getRootNode().host; el; el = el.parentElement ?? el.getRootNode().host) {
                const style = getComputedStyle(el)
                if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
                const rect = el.getBoundingClientRect()
                top = Math.max(top, rect.top)
                left = Math.max(left, rect.left)
                right = Math.min(right, rect.right)
            }
            if (this.hasAttribute('compact')) {
                // Breite der offenen Sprechblase: Symbol, Text (scrollWidth trotz max-width 0), Pfeil, Abstände.
                // Passt sie rechts nicht, öffnet sie sich zur Seite mit mehr Platz; reicht auch der nicht, bricht
                // der Text innerhalb des verfügbaren Platzes um (data-wrap, --label-max).
                const box = this.shadowRoot.querySelector('.box').getBoundingClientRect()
                const measure = this.shadowRoot.querySelector('.measure')
                const widthOf = text => {
                    measure.textContent = text
                    return measure.offsetWidth
                }
                const text = widthOf(this.parts.join(' · '))
                const rest = box.width + 16 + 2 * 8 + 10
                const room = { right: right - (box.left - 4), left: box.right + 4 - left }
                const mirror = rest + text > room.right && room.left > room.right
                const available = (mirror ? room.left : room.right) - rest
                // zu breit: die Teile auf Zeilen verteilen, die in den verfügbaren Platz passen
                const lines = [this.parts[0]]
                if (text > available) {
                    for (const part of this.parts.slice(1)) {
                        const joined = `${lines[lines.length - 1]} · ${part}`
                        if (widthOf(joined) <= available) {
                            lines[lines.length - 1] = joined
                        } else {
                            lines[lines.length - 1] += ' ·'
                            lines.push(part)
                        }
                    }
                } else {
                    lines[0] = this.parts.join(' · ')
                }
                link.toggleAttribute('data-mirror', mirror)
                link.toggleAttribute('data-wrap', lines.length > 1)
                this.shadowRoot.querySelector('.label').textContent = lines.join('\n')
                return
            }
            const tags = [...this.shadowRoot.querySelectorAll('.tag')]
            const longest = Math.max(...tags.map(tag => tag.offsetWidth))
            const svg = this.shadowRoot.querySelector('svg').getBoundingClientRect()
            const needed = (longest + AI_TAG_HEIGHT) * Math.sin(rad(40)) + 4
            link.toggleAttribute('data-flip', svg.top + svg.height / 2 - needed < top)
        }
    }

    // Einzelnes Symbol für Legenden: kind = human | ai | none (Mond) oder text | code | image (Kern). Für
    // Screenreader ein Bild mit Namen ("Mensch", "KI", "nicht erfolgt", "Text", "Code", "Bild"), mit dem Attribut
    // decorative ausgeblendet.
    class AiSymbol extends HTMLElement {
        static observedAttributes = ['kind', 'size', 'decorative']

        connectedCallback() {
            this.render()
        }

        attributeChangedCallback() {
            if (this.shadowRoot) this.render()
        }

        render() {
            let kind = (this.getAttribute('kind') ?? 'human').trim().toLowerCase()
            if (!AI_KINDS[kind] && !AI_WHO[kind]) kind = 'human'
            const size = Number(this.getAttribute('size')) || 18
            const graphic = AI_KINDS[kind]
                ? `<circle cx="8" cy="8" r="7.5" fill="var(--b-ink)"/>${aiMark(kind, 8, 8, 3.75)}`
                : aiDot(8, 8, 6.3, kind)
            // decorative: der Name steht schon im Text daneben, das Symbol wird nicht vorgelesen
            if (this.hasAttribute('decorative')) {
                this.setAttribute('aria-hidden', 'true')
            } else {
                this.setAttribute('role', 'img')
                this.setAttribute('aria-label', AI_KINDS[kind] ?? AI_WHO[kind])
            }
            const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
            root.innerHTML = `<style>:host { ${AI_VARS} display: inline-block; vertical-align: -0.2em; }</style>`
                + `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${graphic}</svg>`
        }
    }

    if (!customElements.get('lw-ai-badge')) customElements.define('lw-ai-badge', AiBadge)
    if (!customElements.get('lw-ai-symbol')) customElements.define('lw-ai-symbol', AiSymbol)

    // Übungsseiten: Inhaltsbereich als Hauptbereich auszeichnen und per Sprunglink erreichbar machen
    function createSkipLink(target) {
        if (!target.matches('main')) target.setAttribute('role', 'main')
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
        const skip = document.createElement('a')
        skip.className = 'lw-skip'
        skip.href = '#' + target.id
        skip.textContent = 'Zum Inhalt springen'
        document.body.prepend(skip)
    }

    function init() {
        const topbar = document.querySelector('div.topbar')
        if (topbar) {
            topbar.setAttribute('role', 'banner')
            const content = document.getElementById('content')
            if (content) createSkipLink(content)
            createCrumb(topbar)
            createMenu(topbar)
            createFooter(document.body)
            return
        }
        // Übersicht: der Kopfbereich schneidet Überstehendes ab, daher sitzt das Menü in .page
        const page = document.querySelector('.page')
        if (page && document.querySelector('.page-head')) {
            page.style.position = 'relative'
            createMenu(page, true)
            createFooter(page)
            return
        }
        // Editor (index.html): #content ist dort absolut positioniert, die Fußzeile gehört hinein
        createFooter(document.getElementById('content') ?? document.body)
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
    else init()
})()
