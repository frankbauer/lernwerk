export default {
    // Nicht ausführbarer Playground (v102): Zuordnen. Zu jedem Ausdruck wird aus einer gemeinsamen
    // Auswahl von Werten der passende gewählt.
    // Die Konfiguration kommt aus einem DATA-Block namens "config":
    //
    //   {
    //     "options": ["true", "false", "2"],                      // Auswahl, in dieser Reihenfolge angezeigt
    //     "items": [{ "code": "12 == 5", "answer": "false" }, ...],   // "answer" darf auch eine Liste sein
    //     "hint": "...",                                          // wird bei Fehlern an die Rückmeldung angehängt
    //     "successMessage": "..."
    //   }
    //
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    setupDOM: function () {
        this.config = this.DATA.config
        this.canvasElement.addClass('quiz-canvas')
        this.build()
    },
    init: function () { },
    update: function () { return undefined },
    reset: function () { },

    el: function (tag, cls, text) {
        const e = document.createElement(tag)
        if (cls) e.className = cls
        if (text !== undefined) e.textContent = text
        return e
    },
    highlight: function (code) {
        const frag = document.createDocumentFragment()
        const re = /("[^"]*"|'[^']*')|\b(public|private|protected|static|final|void|class|new|byte|short|int|long|float|double|boolean|char|return|if|else|for|while|true|false)\b|\b(\d+(?:\.\d+)?[fFlLdD]?)\b/g
        let last = 0
        let m
        while ((m = re.exec(code)) !== null) {
            if (m.index > last) frag.appendChild(document.createTextNode(code.slice(last, m.index)))
            frag.appendChild(this.el('span', m[1] ? 'q-str' : m[2] ? 'q-kw' : 'q-num', m[0]))
            last = re.lastIndex
        }
        frag.appendChild(document.createTextNode(code.slice(last)))
        return frag
    },

    build: function () {
        const root = this.el('div', 'quiz quiz-match')
        const list = this.el('div', 'quiz-match-list')
        this.rows = this.config.items.map((item, nr) => {
            const row = this.el('div', 'quiz-match-row')
            const pre = this.el('pre')
            pre.appendChild(this.highlight(item.code))
            const options = this.el('div', 'quiz-options')
            options.setAttribute('role', 'group')
            options.setAttribute('aria-label', 'Ergebnis von ' + item.code)
            const entry = { row: row, answer: item.answer, value: undefined, buttons: [] }
            this.config.options.forEach(opt => {
                const b = this.el('button', '', opt)
                b.type = 'button'
                b.setAttribute('aria-pressed', 'false')
                b.addEventListener('click', () => {
                    entry.value = entry.value === opt ? undefined : opt
                    entry.buttons.forEach(x => x.setAttribute('aria-pressed', String(x.textContent === entry.value)))
                    row.classList.remove('ok', 'bad')
                })
                entry.buttons.push(b)
                options.appendChild(b)
            })
            row.append(pre, options)
            list.appendChild(row)
            return entry
        })

        const actions = this.el('div', 'quiz-actions')
        const check = this.el('button', '', 'Prüfen')
        const clear = this.el('button', 'secondary', 'Zurücksetzen')
        check.type = clear.type = 'button'
        check.addEventListener('click', () => this.check())
        clear.addEventListener('click', () => {
            this.rows.forEach(r => {
                r.value = undefined
                r.row.classList.remove('ok', 'bad')
                r.buttons.forEach(x => x.setAttribute('aria-pressed', 'false'))
            })
            this.setFeedback('', '')
        })
        actions.append(check, clear)
        this.feedback = this.el('div', 'quiz-feedback')
        this.feedback.setAttribute('aria-live', 'polite')

        root.append(list, actions, this.feedback)
        this.canvasElement.empty().append(root)
    },

    setFeedback: function (kind, html) {
        this.feedback.className = 'quiz-feedback' + (kind ? ' ' + kind : '')
        this.feedback.innerHTML = html
    },

    check: function () {
        let correct = 0
        let empty = 0
        this.rows.forEach(r => {
            r.row.classList.remove('ok', 'bad')
            if (r.value === undefined) {
                empty++
                return
            }
            const ok = [].concat(r.answer).indexOf(r.value) >= 0
            r.row.classList.add(ok ? 'ok' : 'bad')
            if (ok) correct++
        })
        const total = this.rows.length
        if (correct === total) {
            this.setFeedback('success', this.config.successMessage || '<b>Richtig!</b> Alle Zuordnungen stimmen.')
        } else {
            const missing = empty ? ' ' + empty + (empty === 1 ? ' Ausdruck hat' : ' Ausdrücke haben') + ' noch keinen Wert.' : ''
            this.setFeedback(correct === 0 ? 'error' : 'warning',
                '<b>' + correct + ' von ' + total + ' richtig.</b>' + missing + (this.config.hint ? ' ' + this.config.hint : ''))
        }
    },
}
