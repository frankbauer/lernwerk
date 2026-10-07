export default {
    // Nicht ausführbarer Playground (v102): Parsons-Puzzle. Codezeilen per Drag & Drop (oder Pfeiltasten) anordnen.
    // Die Konfiguration kommt aus einem DATA-Block namens "config":
    //
    //   {
    //     "lines": [{ "code": "public class A {", "indent": 0 }, ...],
    //     "shuffle": true,                                    // Standard; false = Reihenfolge aus "lines"
    //     "rules": [                                          // Zeilennummern = Index in "lines"
    //       { "first": 0, "message": "..." },                 // Zeile 0 ganz oben
    //       { "last": 1, "message": "..." },                  // Zeile 1 ganz unten
    //       { "position": 2, "index": 1, "message": "..." },  // Zeile 2 an Position 1 (negativ = von hinten)
    //       { "before": [4, 5], "message": "..." },           // Zeile 4 vor Zeile 5
    //       { "group": [9, 11], "after": 10, "min": 1, "max": 1, "message": "..." }  // wie viele der Zeilen nach Zeile 10
    //     ],
    //     "successMessage": "..."
    //   }
    //
    // Regeln mit "warning": true bedeuten "kompiliert, ist aber nicht sinnvoll".
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
        const root = this.el('div', 'quiz quiz-parsons')
        this.list = this.el('ol', 'quiz-parsons-list')
        this.list.setAttribute('aria-label', 'Codezeilen, per Drag and Drop oder mit den Pfeiltasten sortierbar')
        const actions = this.el('div', 'quiz-actions')
        const check = this.el('button', '', 'Prüfen')
        const shuffle = this.el('button', 'secondary', this.config.shuffle === false ? 'Zurücksetzen' : 'Neu mischen')
        this.feedback = this.el('div', 'quiz-feedback')
        this.feedback.setAttribute('aria-live', 'polite')
        // neue Position nach dem Verschieben mit den Pfeil-Knöpfen, nur für Screenreader
        this.status = this.el('div', 'lw-sr-only')
        this.status.setAttribute('role', 'status')
        check.type = shuffle.type = 'button'
        check.addEventListener('click', () => this.check())
        shuffle.addEventListener('click', () => {
            this.order = this.initialOrder()
            this.clearFeedback()
            this.render()
        })
        actions.append(check, shuffle)
        root.append(this.list, actions, this.feedback, this.status)
        this.canvasElement.empty().append(root)

        this.order = this.initialOrder()
        this.render()
    },

    // Zufällig mischen, aber nie so, dass die Lösung schon (fast) fertig dasteht
    initialOrder: function () {
        const ids = this.config.lines.map((_, i) => i)
        if (this.config.shuffle === false) return ids
        for (let attempt = 0; attempt < 100; attempt++) {
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                const t = ids[i]; ids[i] = ids[j]; ids[j] = t
            }
            if (this.evaluate(ids).errors.length >= 2) break
        }
        return ids
    },

    clearFeedback: function () {
        this.feedback.className = 'quiz-feedback'
        this.feedback.innerHTML = ''
        this.list.querySelectorAll('.bad').forEach(e => e.classList.remove('bad'))
    },

    move: function (from, to) {
        if (to < 0 || to >= this.order.length || from === to) return
        const item = this.order.splice(from, 1)[0]
        this.order.splice(to, 0, item)
        this.clearFeedback()
        this.render()
    },

    render: function () {
        this.list.innerHTML = ''
        this.order.forEach((lineIdx, pos) => {
            const line = this.config.lines[lineIdx]
            const li = this.el('li')
            li.dataset.line = lineIdx
            li.style.setProperty('--indent', line.indent || 0)
            const grip = this.el('span', 'quiz-grip', '⋮⋮')
            grip.setAttribute('aria-hidden', 'true')
            const pre = this.el('pre')
            pre.lang = 'en'
            pre.appendChild(this.highlight(line.code))
            const moveBox = this.el('span', 'quiz-move')
            ;[[-1, '▲', 'Zeile nach oben'], [1, '▼', 'Zeile nach unten']].forEach(([dir, sym, label]) => {
                const b = this.el('button', '', sym)
                b.type = 'button'
                b.setAttribute('aria-label', label)
                b.disabled = pos + dir < 0 || pos + dir >= this.order.length
                b.addEventListener('click', () => {
                    this.move(pos, pos + dir)
                    const row = this.list.children[pos + dir]
                    const next = row && (row.querySelector('button:not([disabled])' + (dir < 0 ? ':first-child' : ':last-child')) || row.querySelector('button:not([disabled])'))
                    if (next) next.focus()
                    this.announce('Zeile ' + line.code + ' jetzt an Position ' + (pos + dir + 1) + ' von ' + this.order.length)
                })
                moveBox.appendChild(b)
            })
            li.append(grip, pre, moveBox)
            li.addEventListener('pointerdown', e => this.startDrag(e, li, pos))
            this.list.appendChild(li)
        })
    },

    announce: function (text) {
        this.status.textContent = ''
        setTimeout(() => { this.status.textContent = text }, 50)
    },

    // Pointer-Events statt HTML5-Drag&Drop, damit es auch auf Touch-Geräten funktioniert
    startDrag: function (e, li, fromPos) {
        if (e.button !== 0 || e.target.closest('button')) return
        e.preventDefault()
        const items = Array.from(this.list.children)
        const rects = items.map(x => x.getBoundingClientRect())
        const startY = e.clientY
        let toPos = fromPos
        li.classList.add('dragging')
        li.setPointerCapture(e.pointerId)

        const onMove = ev => {
            const dy = ev.clientY - startY
            li.style.transform = 'translateY(' + dy + 'px)'
            const center = rects[fromPos].top + rects[fromPos].height / 2 + dy
            toPos = rects.findIndex(r => center < r.bottom)
            if (toPos < 0) toPos = items.length - 1
            const h = rects[fromPos].height + 4
            items.forEach((x, i) => {
                if (i === fromPos) return
                const shift = (i > fromPos && i <= toPos) ? -h : (i < fromPos && i >= toPos) ? h : 0
                x.style.transform = shift ? 'translateY(' + shift + 'px)' : ''
            })
        }
        const onUp = () => {
            li.removeEventListener('pointermove', onMove)
            li.removeEventListener('pointerup', onUp)
            li.removeEventListener('pointercancel', onUp)
            items.forEach(x => { x.style.transform = '' })
            li.classList.remove('dragging')
            if (toPos !== fromPos) this.move(fromPos, toPos)
        }
        li.addEventListener('pointermove', onMove)
        li.addEventListener('pointerup', onUp)
        li.addEventListener('pointercancel', onUp)
    },

    evaluate: function (order) {
        const pos = {}
        order.forEach((lineIdx, p) => { pos[lineIdx] = p })
        const errors = []
        const warnings = []
        for (const rule of this.config.rules) {
            let ok = true
            let lines = []
            if (rule.first !== undefined) {
                ok = pos[rule.first] === 0
                lines = [rule.first]
            } else if (rule.last !== undefined) {
                ok = pos[rule.last] === order.length - 1
                lines = [rule.last]
            } else if (rule.position !== undefined) {
                ok = pos[rule.position] === (rule.index < 0 ? order.length + rule.index : rule.index)
                lines = [rule.position]
            } else if (rule.before !== undefined) {
                ok = pos[rule.before[0]] < pos[rule.before[1]]
                lines = rule.before
            } else if (rule.group !== undefined) {
                const n = rule.group.filter(l => pos[l] > pos[rule.after]).length
                ok = (rule.min === undefined || n >= rule.min) && (rule.max === undefined || n <= rule.max)
                lines = rule.group.concat([rule.after])
            }
            if (!ok) (rule.warning ? warnings : errors).push({ message: rule.message, lines: lines })
        }
        return { errors: errors, warnings: warnings }
    },

    check: function () {
        this.clearFeedback()
        const result = this.evaluate(this.order)
        const shown = result.errors.length ? result.errors : result.warnings
        if (shown.length) {
            shown[0].lines.forEach(l => {
                const row = this.list.querySelector('[data-line="' + l + '"]')
                if (row) row.classList.add('bad')
            })
        }
        if (result.errors.length) {
            this.feedback.classList.add('error')
            this.feedback.innerHTML = '<b>Noch nicht kompilierbar.</b> ' + result.errors[0].message
        } else if (result.warnings.length) {
            this.feedback.classList.add('warning')
            this.feedback.innerHTML = '<b>Kompiliert – aber:</b> ' + result.warnings[0].message
        } else {
            this.feedback.classList.add('success')
            this.feedback.innerHTML = this.config.successMessage || '<b>Richtig!</b> Das Programm ist kompilierbar.'
        }
    },
}
