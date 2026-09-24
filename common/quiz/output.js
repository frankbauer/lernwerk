export default {
    // Nicht ausführbarer Playground (v102): Ausgabe vorhersagen. Neben ausgewählten Codezeilen steht ein
    // Eingabefeld, in das die Ausgabe dieser Zeile eingetragen wird.
    // Die Konfiguration kommt aus einem DATA-Block namens "config":
    //
    //   {
    //     "lines": [
    //       { "code": "public class Foo {" },
    //       { "code": "        System.out.println(\"GdI\");", "answer": ["GdI"] },   // alle akzeptierten Antworten
    //       { "label": "b)" },                                                  // Überschrift, z.B. für mehrere Teilaufgaben
    //       ...
    //     ],
    //     "ignoreCase": false,        // Groß-/Kleinschreibung ignorieren (Standard: false)
    //     "hint": "...",              // wird bei Fehlern an die Rückmeldung angehängt
    //     "successMessage": "..."
    //   }
    //
    // Führende und abschließende Leerzeichen einer Antwort werden ignoriert, Leerzeichen dazwischen nicht.
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
        const root = this.el('div', 'quiz quiz-output')
        const code = this.el('div', 'quiz-output-code')
        this.inputs = []
        this.config.lines.forEach((line, nr) => {
            if (line.label !== undefined) {
                code.appendChild(this.el('div', 'quiz-output-label', line.label))
                return
            }
            const row = this.el('div', 'quiz-output-line')
            const pre = this.el('pre')
            pre.appendChild(this.highlight(line.code))
            row.appendChild(pre)
            if (line.answer !== undefined) {
                row.classList.add('has-gap')
                const input = this.el('input', 'quiz-answer')
                input.type = 'text'
                input.autocomplete = 'off'
                input.spellcheck = false
                input.placeholder = 'Ausgabe'
                input.setAttribute('aria-label', 'Ausgabe von Zeile ' + (nr + 1))
                input.addEventListener('input', () => input.classList.remove('ok', 'bad'))
                input.addEventListener('keydown', e => { if (e.key === 'Enter') this.check() })
                this.inputs.push({ input: input, answers: [].concat(line.answer) })
                row.appendChild(input)
            } else {
                row.appendChild(this.el('span'))
            }
            code.appendChild(row)
        })

        const actions = this.el('div', 'quiz-actions')
        const check = this.el('button', '', 'Prüfen')
        const clear = this.el('button', 'secondary', 'Zurücksetzen')
        check.type = clear.type = 'button'
        check.addEventListener('click', () => this.check())
        clear.addEventListener('click', () => {
            this.inputs.forEach(g => { g.input.value = ''; g.input.classList.remove('ok', 'bad') })
            this.setFeedback('', '')
        })
        actions.append(check, clear)
        this.feedback = this.el('div', 'quiz-feedback')
        this.feedback.setAttribute('aria-live', 'polite')

        root.append(code, actions, this.feedback)
        this.canvasElement.empty().append(root)
    },

    normalize: function (s) {
        s = String(s).trim()
        return this.config.ignoreCase ? s.toLowerCase() : s
    },

    setFeedback: function (kind, html) {
        this.feedback.className = 'quiz-feedback' + (kind ? ' ' + kind : '')
        this.feedback.innerHTML = html
    },

    check: function () {
        let correct = 0
        let empty = 0
        this.inputs.forEach(g => {
            const value = this.normalize(g.input.value)
            const ok = g.answers.some(a => this.normalize(a) === value)
            g.input.classList.remove('ok', 'bad')
            if (value === '') {
                empty++
                return
            }
            g.input.classList.add(ok ? 'ok' : 'bad')
            if (ok) correct++
        })
        const total = this.inputs.length
        if (correct === total) {
            this.setFeedback('success', this.config.successMessage || '<b>Richtig!</b> Alle Ausgaben stimmen.')
        } else {
            const missing = empty ? ' ' + empty + (empty === 1 ? ' Feld ist' : ' Felder sind') + ' noch leer.' : ''
            this.setFeedback(correct === 0 ? 'error' : 'warning',
                '<b>' + correct + ' von ' + total + ' Ausgaben richtig.</b>' + missing + (this.config.hint ? ' ' + this.config.hint : ''))
        }
    },
}
