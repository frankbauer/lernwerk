let helperIdCounter = 0
function nextHelperId(prefix) {
    helperIdCounter += 1
    return `${prefix}-${helperIdCounter}`
}

function processTabs() {
    const tabs = $('tabbar')
    tabs.each((_index, tabContainer) => {
        tabContainer = $(tabContainer);
        const tabs = tabContainer.find('>div[data-tab]')
        const buttonBar = $(document.createElement('DIV'))
        buttonBar.addClass('buttonbar')
        // Tabs nach dem WAI-ARIA-Muster: Pfeiltasten wechseln den Tab, nur der aktive Tab liegt in der Tab-Reihenfolge
        buttonBar.attr('role', 'tablist')
        const buttons = []

        function activate(nr, moveFocus) {
            tabs.removeClass('active').addClass('inactive')
            buttonBar.find('button').removeClass('active').addClass('inactive')
                .attr({ 'aria-selected': 'false', tabindex: '-1' })

            $(tabs[nr]).removeClass('inactive').addClass('active')
            buttons[nr].removeClass('inactive').addClass('active')
                .attr({ 'aria-selected': 'true', tabindex: '0' })
            if (moveFocus) buttons[nr].trigger('focus')
        }

        for (let nr = 0; nr < tabs.length; nr++) {
            const tab = $(tabs[nr])
            const tabId = tab.attr('data-tab')
            const tabName = tab.attr('data-name')
            const button = $(document.createElement('BUTTON'))
            const buttonId = nextHelperId('lw-tab')
            const panelId = tab.attr('id') || nextHelperId('lw-tabpanel')

            //set the label of the bbutton to tabName
            button.text(tabName)
            button.attr({ type: 'button', role: 'tab', id: buttonId, 'aria-controls': panelId })
            tab.attr({ id: panelId, role: 'tabpanel', 'aria-labelledby': buttonId })
            //if the tab is the first tab, add the active class to the button
            if (nr === 0) {
                button.addClass('active').attr({ 'aria-selected': 'true', tabindex: '0' })
                tab.addClass('active')
            } else {
                button.addClass('inactive').attr({ 'aria-selected': 'false', tabindex: '-1' })
                tab.addClass('inactive')
            }
            buttonBar.append(button)
            buttons.push(button)
            console.log(tabId, tabName)

            //add click event to the button. When clicked, remove the active class from all other tabs and buttons and add the active class to the clicked button and tab
            button.on('click', () => activate(nr, false))
            button.on('keydown', (e) => {
                const last = tabs.length - 1
                const target = { ArrowRight: nr === last ? 0 : nr + 1, ArrowLeft: nr === 0 ? last : nr - 1, Home: 0, End: last }[e.key]
                if (target === undefined) return
                e.preventDefault()
                activate(target, true)
            })
        }

        tabContainer.prepend(buttonBar)
    })
}

function processHints() {
    const hints = $('hint')
    hints.each((_index, hint) => {
        hint = $(hint)
        const isSolution = hint.attr("solution")!==undefined
        const rect = hint[0].getBoundingClientRect()

        const hintContainer = $('<div class="hint-container"></div>')
        const button = $(document.createElement('BUTTON'))
        const hintId = hint.attr('id') || nextHelperId('lw-hint')
        if (rect.height < 35) button.addClass('slim')
        button.addClass('expanded')
        button.attr({ type: 'button', 'aria-expanded': 'false', 'aria-controls': hintId })
        //set the label of the button to tabName
        if (isSolution){
            button.text("Beispiel zeigen")
        } else {
            button.text("Hinweis zeigen")
        }
        // Der verschwommene Hinweis ist für Screenreader und Tastatur unerreichbar, bis er aufgedeckt wird
        hint.attr({ id: hintId, tabindex: '-1' })
        hint.prop('inert', true)
        //replace hint with hintContainer
        hint.replaceWith(hintContainer)
        hintContainer.append(button)
        hintContainer.append(hint)
        hint.addClass('animate')
        button.on('click', () => {
            if (hint.hasClass('expanded')) {
                hint.removeClass('expanded')
                hint.prop('inert', true)
                button.addClass('expanded')
                button.attr({ 'aria-expanded': 'false', 'aria-hidden': null, tabindex: null })
                //button.text("Hinweis Zeigen")
            } else {
                hint.addClass('expanded')
                hint.prop('inert', false)
                button.removeClass('expanded')
                // der Knopf wird unsichtbar: aus der Tab-Reihenfolge nehmen und den Fokus auf den Hinweis setzen
                button.attr({ 'aria-expanded': 'true', 'aria-hidden': 'true', tabindex: '-1' })
                hint.trigger('focus')
                //button.text("Verbergen")
            }
        })
    })

}

// Die Kästen (Aufgabe, Erklärung, ...) nutzen <h3> direkt unter der <h1> der Seite. Für Screenreader
// wird die Hierarchie ohne Sprung angegeben (WCAG 1.3.1), die Darstellung bleibt unverändert.
function fixHeadingLevels() {
    $('div#content h3').attr('aria-level', '2')
    $('div#content h4').attr('aria-level', '3')
}

function betterInlineCode() {
    const inlineCode = $('code')
    inlineCode.each((_index, code) => {
        code = $(code)
        code.html('<span code>' + code.html() + '</span>')
        code.addClass('inline-code')
        // Programmcode ist englisch (WCAG 3.1.2), damit Screenreader ihn nicht mit deutscher Aussprache vorlesen
        if (!code.attr('lang')) code.attr('lang', 'en')
    })

}

// Die Code-Editoren (CodeMirror) entstehen erst in codeblocks.umd.js und werden bei Bedarf neu aufgebaut.
// Sie und ihre Tooltips (Fehlermeldungen des Compilers) als englisch auszeichnen; die deutschen Kommentare
// der Overlays (.cb-ov-*) liegen im Editor und bleiben deutsch.
function markCodeLanguage() {
    const content = document.getElementById('content')
    if (!content) return
    const mark = node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return
        const editors = node.matches('.cm-editor') ? [node] : node.querySelectorAll('.cm-editor')
        editors.forEach(e => e.setAttribute('lang', 'en'))
        const overlays = node.matches('.cb-ov-pills, .cb-ov-cards, .cb-ov-bubble') ? [node]
            : node.querySelectorAll('.cb-ov-pills, .cb-ov-cards, .cb-ov-bubble')
        overlays.forEach(e => e.setAttribute('lang', 'de'))
    }
    mark(content)
    new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(mark)))
        .observe(content, { childList: true, subtree: true })
}

function initHelpers() {
    betterInlineCode()
    fixHeadingLevels()
    processHints()
    markCodeLanguage()
    setTimeout(() => processTabs(), 100);
}
/** URL flags of the overview (uebersicht.html) that must survive a round trip through an exercise. */
const OVERVIEW_FLAGS = ["showHidden", "showDrafts"]

/** Appends the overview flags present in the current URL to `href`. */
function withOverviewFlags(href) {
    const current = new URLSearchParams(location.search)
    const flags = OVERVIEW_FLAGS.filter(flag => current.has(flag))
    if (flags.length === 0) return href
    const [base, hash] = href.split('#')
    const sep = base.includes('?') ? '&' : '?'
    return base + sep + flags.join('&') + (hash !== undefined ? '#' + hash : '')
}

/**
 * The Abenteuerkarte (karte.html) shows exercises in an iframe with ?embedded. There the back link
 * becomes a close button that asks the map to close the iframe (as does Escape outside the editor).
 */
const EMBEDDED = new URLSearchParams(location.search).has('embedded') && window.parent !== window

function closeEmbedded() {
    window.parent.postMessage({ type: 'lernwerk:close' }, location.origin)
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.backlink').forEach(link => {
        link.setAttribute('href', withOverviewFlags(link.getAttribute('href')))
        if (EMBEDDED) {
            if (!document.getElementById('lw-close-style')) {
                const style = document.createElement('style')
                style.id = 'lw-close-style'
                style.textContent = 'html div.topbar>a.backlink.lw-close::before { content: "✕ " / "" !important; }'
                document.head.append(style)
            }
            link.textContent = 'Schließen'
            link.classList.add('lw-close')
            link.addEventListener('click', event => {
                event.preventDefault()
                closeEmbedded()
            })
        }
    })
})

if (EMBEDDED) {
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || event.defaultPrevented) return
        if (event.target.closest?.('.cm-editor, input, textarea, select, [contenteditable], .lw-menu, [role="dialog"]')) return
        closeEmbedded()
    })
}
