// Darstellungs-Themes für die Übungsseiten.
// content.js setzt das gespeicherte Theme bereits beim Laden (html[data-lw-theme]) und lädt
// css/themes.css sowie dieses Skript. Hier werden das Menü oben rechts und die Kapitelzeile
// über dem Titel erzeugt.
(function () {
    const STORAGE_KEY = 'lernwerk-theme'
    const DEFAULT_THEME = 'abenteuer' // muss zu content.js passen
    const base = new URL('.', document.currentScript.src)

    // colors: [Hintergrund, Fläche, Akzent 1, Akzent 2] für die Vorschau im Menü
    const THEMES = [
        { id: 'klassisch', name: 'Klassisch', hint: 'Das ursprüngliche Aussehen', colors: ['#ffffff', '#ffffff', '#f7eb47', '#9c27b0'] },
        { id: 'heft', name: 'Heft', hint: 'Papier, Serifen, Textmarker', colors: ['#f7f3ea', '#fffdf8', '#ffe27a', '#8e5bb8'] },
        { id: 'karten', name: 'Karten', hint: 'Hell, ruhig, aufgeräumt', colors: ['#f2f4f7', '#ffffff', '#f5b400', '#4f46e5'] },
        { id: 'terminal', name: 'Terminal', hint: 'Dunkel wie eine IDE', colors: ['#0d1017', '#121620', '#fbbf24', '#34d399'] },
        { id: 'abenteuer', name: 'Abenteuer', hint: 'Kräftig und verspielt', colors: ['#fff4dc', '#ffffff', '#ffd23f', '#b69cff'] },
        { id: 'raster', name: 'Raster', hint: 'Klares Schweizer Raster', colors: ['#ffffff', '#ffffff', '#111111', '#e30613'] },
        { id: 'tafel', name: 'Tafel', hint: 'Kreide auf grüner Tafel', colors: ['#26392f', '#1c2b23', '#f7d774', '#f4a6c6'] },
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
        if (id === 'klassisch') delete document.documentElement.dataset.lwTheme
        else document.documentElement.dataset.lwTheme = id
    }

    // content.js hat evtl. einen unbekannten (veralteten) Wert gesetzt
    applyTheme(loadTheme())

    function createMenu(topbar) {
        const anchor = document.createElement('div')
        anchor.className = 'lw-menu-anchor'

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

        const title = document.createElement('div')
        title.className = 'lw-menu-title'
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

        function updateChecked() {
            const current = loadTheme()
            items.forEach(item => item.setAttribute('aria-checked', String(item.dataset.theme === current)))
        }

        function open() {
            updateChecked()
            menu.hidden = false
            button.setAttribute('aria-expanded', 'true')
            const checked = items.find(i => i.getAttribute('aria-checked') === 'true') ?? items[0]
            checked.focus()
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
            const idx = items.indexOf(document.activeElement)
            if (e.key === 'Escape') {
                close()
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                const step = e.key === 'ArrowDown' ? 1 : -1
                items[(idx + step + items.length) % items.length].focus()
            } else if (e.key === 'Tab') {
                close(false)
            }
        })

        anchor.append(button, menu)
        topbar.append(anchor)
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
        const folder = relative.split('/').filter(Boolean)[0]
        if (!folder) return
        crumb.textContent = folder.replace(/_/g, ' ')
        try {
            const response = await fetch(new URL('data/exercises.json', base))
            const data = await response.json()
            const chapter = data.chapters?.find(c => c.folder === folder)
            if (chapter) crumb.textContent = `Kapitel ${chapter.number} · ${chapter.title}`
        } catch (e) { }
    }

    function init() {
        const topbar = document.querySelector('div.topbar')
        if (!topbar) return
        createCrumb(topbar)
        createMenu(topbar)
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
    else init()
})()
