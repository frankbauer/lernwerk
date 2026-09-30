// Automatisches Speichern, Herunter- und Hochladen der eigenen Lösung auf den Übungsseiten.
//
// content.js lädt dieses Modul am Ende von buildContent(), also bevor codeblocks.umd.js importiert wird.
// Gespeicherter Code wird dann direkt in die <div as="block">-Elemente geschrieben, aus denen codeblocks
// seine Editoren erzeugt. Beim Tippen spiegelt codeblocks den Editorinhalt in versteckte Textareas
// (id "teQ<Frage>B<Block>"); von dort wird der Stand regelmäßig in die IndexedDB des Browsers geschrieben
// (deutlich mehr Platz als localStorage). Das Intervall kommt aus AUTOSAVE_INTERVAL (Sekunden) in der
// Datei .env im Wurzelverzeichnis; 0 schaltet das regelmäßige Speichern ab.
//
// Gespeichert (und heruntergeladen) wird nur Code, den die Studierenden selbst geändert haben, zusammen
// mit der UUID der Aufgabe (elements.uuid, siehe tools/add_exercise_uuids.py) und einer Prüfsumme über
// Aufgabentext und Codevorlage. Beim Hochladen wird eine Datei mit anderer UUID abgelehnt; hat sich die
// Prüfsumme geändert (Aufgabe wurde überarbeitet), gibt es eine Warnung.

const DEFAULT_INTERVAL = 30
const DB_NAME = 'lernwerk'
const DB_VERSION = 2
const STORE = 'solutions'
const FILE_TYPE = 'lernwerk-solution'
const FILE_VERSION = 1
// Kindelemente, die codeblocks als Block zählt (siehe qVe in codeblocks.umd.js)
const BLOCK_TYPES = new Set(['PLAYGROUND', 'LIBRARY', 'TEXT', 'BLOCKHIDDEN', 'BLOCKSTATIC', 'BLOCK', 'DATA'])

const base = new URL('.', import.meta.url)

async function loadConfig() {
    const config = { interval: DEFAULT_INTERVAL }
    try {
        const response = await fetch(new URL('.env', base), { cache: 'no-cache' })
        if (!response.ok) return config
        for (const line of (await response.text()).split(/\r?\n/)) {
            const match = line.match(/^\s*(?:export\s+)?AUTOSAVE_INTERVAL\s*=\s*["']?([\d.]+)["']?\s*(?:#.*)?$/)
            if (match) config.interval = Number(match[1])
        }
    } catch (e) { }
    return config
}

// --- IndexedDB ------------------------------------------------------------

let dbPromise
let openedDB = null // erlaubt es, Transaktionen synchron zu starten (wichtig beim Verlassen der Seite)
function openDB() {
    dbPromise ??= new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
            const db = request.result
            if (db.objectStoreNames.contains('exercise-state')) db.deleteObjectStore('exercise-state') // Entwurf
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' })
        }
        request.onsuccess = () => resolve(openedDB = request.result)
        request.onerror = () => reject(request.error)
    })
    return dbPromise
}

async function withStore(mode, fn) {
    const db = openedDB ?? await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const request = fn(tx.objectStore(STORE))
        tx.oncomplete = () => resolve(request?.result)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
    })
}

const readState = key => withStore('readonly', store => store.get(key))
const writeState = state => withStore('readwrite', store => store.put(state))
const deleteState = key => withStore('readwrite', store => store.delete(key))

// --- Blöcke ---------------------------------------------------------------

/**
 * Alle codeblocks-Container mit ihren Blöcken, indiziert wie codeblocks sie nummeriert, und den
 * davon bearbeitbaren Blöcken.
 */
function findBlocks(scope) {
    return [...scope.querySelectorAll('div[codeblocks]')].map(container => {
        const all = []
        const editable = new Map()
        for (const child of container.children) {
            const as = child.getAttribute('as')?.trim().toUpperCase()
            if (!BLOCK_TYPES.has(as || child.tagName.toUpperCase())) continue
            if (as === 'BLOCK' && child.dataset.static !== 'true' && child.dataset.hidden !== 'true') {
                editable.set(all.length, child)
            }
            all.push(child)
        }
        return { container, all, editable }
    })
}

/** SHA-256 über Aufgabentext und die Vorlage aller Container mit bearbeitbaren Blöcken. */
async function exerciseChecksum(scope, containers) {
    if (!crypto?.subtle) return null // nur in sicheren Kontexten (https, localhost) verfügbar
    const parts = [...scope.querySelectorAll('.aufgabe')].map(el => el.textContent.trim())
    containers.forEach(({ all, editable }, c) => {
        if (editable.size === 0) return // z.B. die Beispiellösung
        all.forEach((el, b) => parts.push([c, b, el.getAttribute('as') ?? el.tagName,
            el.dataset.static ?? '', el.dataset.hidden ?? '', el.textContent].join('\u0000')))
    })
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('\u0001')))
    return 'sha256:' + [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('')
}

function formatTime(date) {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fileName(title) {
    const slug = title.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss')
        .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
    return `${slug || 'aufgabe'}-loesung.json`
}

function downloadFile(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function pickFile(accept) {
    return new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true })
        input.addEventListener('cancel', () => resolve(null), { once: true })
        input.click()
    })
}

/** Liest eine hochgeladene Lösungsdatei; wirft einen Fehler mit deutscher Meldung, wenn sie ungültig ist. */
function parseSolutionFile(text) {
    let data
    try {
        data = JSON.parse(text)
    } catch (e) {
        throw new Error('Die Datei ist keine gültige Lösungsdatei (kein JSON).')
    }
    if (data?.type !== FILE_TYPE || typeof data.exercise !== 'object' || typeof data.blocks !== 'object') {
        throw new Error('Die Datei ist keine Lösungsdatei des Lernwerks.')
    }
    if (data.version > FILE_VERSION) {
        throw new Error('Die Datei stammt aus einer neueren Version des Lernwerks.')
    }
    const blocks = {}
    for (const [key, code] of Object.entries(data.blocks ?? {})) {
        if (!/^\d+:\d+$/.test(key) || typeof code !== 'string') throw new Error('Die Lösungsdatei ist beschädigt.')
        blocks[key] = code
    }
    return { ...data, blocks }
}

// --- Start ----------------------------------------------------------------

export async function init(scope = document, elements = {}) {
    if (!('indexedDB' in window)) return
    const uuid = typeof elements.uuid === 'string' ? elements.uuid : null
    if (!uuid) console.warn('Aufgabe ohne uuid: Herunter-/Hochladen nicht möglich (tools/add_exercise_uuids.py)')
    const pathKey = 'path:' + location.pathname.replace(/index\.html?$/, '')
    const storageKey = uuid ?? pathKey
    const title = elements.short ?? elements.title ?? document.title

    // Ohne bearbeitbaren Code (z.B. Quiz- oder reine Playground-Seiten) gibt es nichts zu speichern:
    // dann weder Menüeinträge noch Timer, und die Datenbank wird gar nicht erst geöffnet.
    const containers = findBlocks(scope)
    if (!containers.some(c => c.editable.size > 0)) return

    // Ausgangscode merken, bevor gespeicherter Code eingesetzt wird
    const original = {}
    containers.forEach(({ editable }, c) => editable.forEach((el, b) => { original[`${c}:${b}`] = el.textContent }))
    const isEditable = key => key in original

    const [config, checksum, saved] = await Promise.all([
        loadConfig(),
        exerciseChecksum(scope, containers).catch(() => null),
        readSaved(),
    ])

    async function readSaved() {
        try {
            const state = await readState(storageKey)
            if (state || storageKey === pathKey) return state
            // Stand aus der Zeit, bevor die Aufgabe eine uuid hatte, übernehmen
            const legacy = await readState(pathKey)
            if (legacy) {
                await writeState({ ...legacy, key: storageKey, uuid })
                await deleteState(pathKey)
            }
            return legacy
        } catch (e) {
            console.warn('Gespeicherter Stand nicht lesbar', e)
        }
    }

    let lastSaved = '{}' // JSON des zuletzt gespeicherten Stands; '{}' = nichts Eigenes gespeichert
    let lastSavedAt = null
    const restored = {}
    if (saved?.blocks) {
        for (const [key, code] of Object.entries(saved.blocks)) {
            const [c, b] = key.split(':').map(Number)
            const el = containers[c]?.editable.get(b)
            if (el) {
                el.textContent = code
                restored[key] = code
            }
        }
        if (saved.checksum && checksum && saved.checksum !== checksum) {
            console.info('Die Aufgabe wurde geändert, seit der gespeicherte Code geschrieben wurde.')
        }
        lastSaved = JSON.stringify(saved.blocks)
        lastSavedAt = new Date(saved.savedAt)
    }

    let ready = false // erst aus den Textareas lesen, wenn codeblocks sie erzeugt hat
    window.addEventListener('codeblocks:mounted', () => { ready = true }, { once: true })

    /** Der aktuelle Code; nur Blöcke, die vom Ausgangscode abweichen. */
    function collect() {
        const blocks = {}
        containers.forEach(({ container, editable }, c) => {
            const current = new Map()
            if (ready) {
                container.querySelectorAll('textarea[data-blocktype][id^="teQ"]').forEach(textarea => {
                    const b = textarea.id.match(/B(\d+)$/)?.[1]
                    if (b !== undefined) current.set(Number(b), textarea.value)
                })
            }
            for (const b of editable.keys()) {
                const key = `${c}:${b}`
                // fehlt eine Textarea (noch nicht gerendert), bleibt der zuletzt bekannte Stand erhalten
                const code = current.get(b) ?? restored[key] ?? original[key]
                if (code !== original[key]) blocks[key] = code
            }
        })
        return blocks
    }

    let suspended = false // nach Zurücksetzen/Hochladen bis zum Neuladen nichts mehr speichern

    async function store(blocks) {
        if (Object.keys(blocks).length === 0) {
            await deleteState(storageKey)
            return null
        }
        const savedAt = new Date()
        await writeState({ key: storageKey, uuid, checksum, savedAt: savedAt.toISOString(), blocks })
        return savedAt
    }

    async function save() {
        if (suspended || !ready) return false
        const blocks = collect()
        const json = JSON.stringify(blocks)
        if (json === lastSaved) return false
        lastSavedAt = await store(blocks)
        lastSaved = json
        return true
    }

    function saveQuietly() {
        save().catch(e => console.error('Automatisches Speichern fehlgeschlagen', e))
    }

    // Dezenter Hinweis unten rechts, dass gespeichert wurde (Stil: css/theme-menu.css)
    let toast, toastTimer
    function showSaved() {
        if (!toast) {
            toast = document.createElement('div')
            toast.className = 'lw-save-toast'
            toast.setAttribute('role', 'status')
            document.body.append(toast)
        }
        toast.innerHTML = '<span class="lw-save-toast-check" aria-hidden="true">✓</span>'
        toast.append(`Gespeichert ${lastSavedAt ? formatTime(lastSavedAt) : ''}`.trim())
        requestAnimationFrame(() => toast.classList.add('lw-visible'))
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => toast.classList.remove('lw-visible'), 2000)
    }

    function autosave() {
        save().then(changed => { if (changed) showSaved() })
            .catch(e => console.error('Automatisches Speichern fehlgeschlagen', e))
    }

    /** Speichert `blocks` als neuen Stand und lädt die Seite neu, damit die Editoren ihn anzeigen. */
    async function replaceAndReload(blocks, failMessage) {
        suspended = true
        try {
            await store(blocks)
        } catch (e) {
            suspended = false
            alert(failMessage)
            return
        }
        location.reload()
    }

    async function reset() {
        const ok = confirm('Ihren Code für diese Aufgabe verwerfen und die ursprüngliche Vorlage laden?\n'
            + 'Das kann nicht rückgängig gemacht werden.')
        if (ok) await replaceAndReload({}, 'Der gespeicherte Stand konnte nicht gelöscht werden.')
    }

    function download() {
        const blocks = collect()
        if (Object.keys(blocks).length === 0) {
            alert('Sie haben in dieser Aufgabe noch keinen eigenen Code geschrieben.')
            return
        }
        const data = {
            type: FILE_TYPE,
            version: FILE_VERSION,
            exercise: { uuid, title, checksum },
            exportedAt: new Date().toISOString(),
            blocks,
        }
        downloadFile(fileName(title), JSON.stringify(data, null, 2))
        saveQuietly()
    }

    async function upload() {
        const file = await pickFile('.json,application/json')
        if (!file) return
        let data
        try {
            data = parseSolutionFile(await file.text())
        } catch (e) {
            alert(e.message)
            return
        }
        if (data.exercise.uuid !== uuid) {
            const other = typeof data.exercise.title === 'string' ? ` („${data.exercise.title}“)` : ''
            alert(`Diese Lösungsdatei gehört zu einer anderen Aufgabe${other} und kann hier nicht geladen werden.`)
            return
        }
        const blocks = Object.fromEntries(Object.entries(data.blocks).filter(([key]) => isEditable(key)))
        const dropped = Object.keys(data.blocks).length - Object.keys(blocks).length

        const lines = []
        if (data.exercise.checksum !== checksum) {
            lines.push('Achtung: Die Aufgabe wurde geändert, seit diese Lösung heruntergeladen wurde. '
                + 'Der Code passt möglicherweise nicht mehr zur aktuellen Vorlage.')
        }
        if (dropped > 0) {
            lines.push(`${dropped} Codeblock(s) aus der Datei gibt es in der aktuellen Aufgabe nicht mehr; sie werden ignoriert.`)
        }
        lines.push(Object.keys(collect()).length > 0
            ? 'Ihr aktueller Code wird durch die Lösung aus der Datei ersetzt. Fortfahren?'
            : 'Lösung aus der Datei laden?')
        if (!confirm(lines.join('\n\n'))) return
        await replaceAndReload(blocks, 'Die Lösung konnte nicht gespeichert werden.')
    }

    if (config.interval > 0) setInterval(autosave, config.interval * 1000)
    // Beim Verlassen oder Wechseln des Tabs zusätzlich speichern
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveQuietly() })
    window.addEventListener('pagehide', saveQuietly)
    // Gibt es ungespeicherte Änderungen, zeigt der Browser beim Verlassen eine Rückfrage an (der Text lässt
    // sich nicht anpassen). Das Speichern wird vorher angestoßen und kann während der Rückfrage abschließen.
    window.addEventListener('beforeunload', event => {
        if (suspended || !ready || JSON.stringify(collect()) === lastSaved) return
        saveQuietly()
        event.preventDefault()
        event.returnValue = '' // ältere Browser
    })

    async function saveNow() {
        try {
            await save()
            showSaved() // auch ohne Änderung, als Bestätigung
        } catch (e) {
            alert('Speichern fehlgeschlagen: ' + (e?.message ?? e))
        }
    }

    // Cmd+S (macOS) bzw. Strg+S speichert sofort, statt den Browser-Dialog "Seite speichern" zu öffnen
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent)
    const shortcut = isMac ? '⌘S' : 'Strg+S'
    window.addEventListener('keydown', event => {
        if (event.key.toLowerCase() !== 's' || event.altKey || event.shiftKey) return
        if (!(isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)) return
        event.preventDefault()
        if (!event.repeat) saveNow()
    }, true)

    const svg = d => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    const section = 'Ihr Code'
    const actions = [
        {
            section,
            label: 'Jetzt speichern',
            icon: svg('M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6'),
            hint: () => lastSavedAt ? `Zuletzt gespeichert um ${formatTime(lastSavedAt)}` : 'Stand im Browser sichern',
            shortcut,
            onSelect: saveNow,
        },
    ]
    if (uuid) {
        actions.push(
            {
                section,
                label: 'Herunterladen',
                icon: svg('M12 4v11 M7 10l5 5 5-5 M5 20h14'),
                hint: () => 'Lösung als Datei sichern',
                onSelect: download,
            },
            {
                section,
                label: 'Hochladen',
                icon: svg('M12 15V4 M7 9l5-5 5 5 M5 20h14'),
                hint: () => 'Lösung aus einer Datei laden',
                onSelect: upload,
            },
        )
    }
    actions.push({
        section,
        label: 'Zurücksetzen',
        icon: svg('M4 12a8 8 0 1 0 2.4-5.7 M4 4v5h5'),
        hint: () => 'Vorlage wiederherstellen',
        onSelect: reset,
    })
    ;(window.lwMenuActions ??= []).push(...actions)
    window.dispatchEvent(new CustomEvent('lw-menu-actions'))
}
