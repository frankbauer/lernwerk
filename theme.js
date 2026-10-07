// Darstellungs-Themes für die Übungsseiten und die Übersicht (uebersicht.html).
// Übungsseiten: content.js setzt das gespeicherte Theme bereits beim Laden (html[data-lw-theme]) und
// lädt die Stylesheets sowie dieses Skript. uebersicht.html bindet dieses Skript direkt im <head> ein.
// Hier werden das Menü oben rechts, (auf Übungsseiten) die Kapitelzeile über dem Titel und der Sprunglink
// sowie auf allen Seiten die Fußzeile mit Impressum, Datenschutz und Barrierefreiheit erzeugt.
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
        { id: 'prisma', name: 'Prisma', hint: 'Licht in allen Spektralfarben', colors: ['linear-gradient(90deg, #ef4444, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6)', '#ffffff', 'linear-gradient(90deg, #ef4444, #facc15, #3b82f6)', '#8b5cf6'] },
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
