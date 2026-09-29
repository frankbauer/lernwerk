export default {
    // Nicht ausführbarer Playground (v102): Zahlendarstellung mit zufällig erzeugten 8-Bit-Zahlen.
    // Beim ersten Öffnen werden Zahlen erzeugt und im localStorage abgelegt. Sie bleiben erhalten (samt der
    // bisherigen Eingaben), bis "Neue Zahlen" gedrückt wird.
    // Die Konfiguration kommt aus einem DATA-Block namens "config":
    //
    //   {
    //     "task": "sum",                 // "sum"     Addition zur Basis n
    //                                    // "binsum"  binäre Addition (USG/B1/B2), nur Bits
    //                                    // "binop"   bitweises & und |
    //                                    // "convert" Basis B <-> dezimal (Basis wählbar)
    //                                    // "encode"  8-Bit-Muster <-> dezimal in einer Kodierung
    //     "overflow": true,              // nur binsum: Ergebnis passt nicht in 8 Bit, gefragt ist der gespeicherte Wert
    //     "enc": "B2",                   // nur encode: "USG" | "VZ" (Vorzeichenbit) | "B1" | "B2"
    //     "view": "exercise",            // "exercise" (Eingabe) oder "solution" (zeigt die Lösung derselben Zahlen)
    //     "storageKey": "19_Zahlen/addition"   // gemeinsamer Schlüssel für Aufgabe und Lösung
    //   }
    //
    // Alle Werte liegen im 8-Bit-Bereich (0..255 bzw. -128..127), die Klausur verwendet 10 Bit bzw. 4 Stellen.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    VERSION: 2,
    BITS: 8,
    MAX: 255,
    DIGITS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    LETTERS: 'abcdefghijklmnopqrstuvwxyz',
    SYSTEMS: { 2: 'Binärsystem', 8: 'Oktalsystem', 10: 'Dezimalsystem', 16: 'Hexadezimalsystem' },
    BASES: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16],
    ENC_NAMES: {
        USG: 'für <b>vorzeichenlose Zahlen</b>',
        VZ: 'mit <b>Vorzeichenbit</b>',
        B1: 'im <b>B1</b>-Komplement',
        B2: 'im <b>B2</b>-Komplement',
    },
    ENC_IN: {
        USG: 'als <b>vorzeichenlose Zahl</b>',
        VZ: 'mit <b>Vorzeichenbit</b>',
        B1: 'im <b>B1</b>-Komplement',
        B2: 'im <b>B2</b>-Komplement',
    },
    OP_NAMES: { '&': 'UND', '|': 'ODER' },

    setupDOM: function () {
        this.config = this.DATA.config
        this.task = this.config.task
        this.key = 'lernwerk.numbers.' + (this.config.storageKey || this.task)
        this.canvasElement.addClass('quiz-canvas')
        this.load()
        this.render()
        if (this.config.view === 'solution') {
            // Aufgabe und Lösung sind getrennte Playgrounds; die Sandbox erlaubt nur postMessage zur Abstimmung
            window.addEventListener('message', e => {
                if (e.origin !== location.origin || !e.data || e.data.type !== 'lernwerk-numbers-changed' || e.data.key !== this.key) return
                this.load()
                this.render()
            })
        }
    },
    init: function () { },
    update: function () { return undefined },
    reset: function () { },

    // ------------------------------------------------------------------ Speicher

    load: function () {
        let stored
        try {
            stored = JSON.parse(localStorage.getItem(this.key))
        } catch (e) {
            stored = undefined
        }
        if (stored && stored.v === this.VERSION && stored.puzzle && stored.puzzle.task === this.task) {
            this.puzzle = stored.puzzle
            this.answer = stored.answer || {}
        } else {
            this.puzzle = this.generate()
            this.answer = {}
            this.save()
        }
    },
    save: function () {
        try {
            localStorage.setItem(this.key, JSON.stringify({ v: this.VERSION, puzzle: this.puzzle, answer: this.answer }))
        } catch (e) { }
    },
    // choice: nur beim Umrechnen die gewählte Basis ('random' oder Zahl)
    newNumbers: function (choice) {
        this.puzzle = this.generate(choice === undefined ? this.puzzle.choice : choice)
        this.answer = {}
        this.save()
        this.render()
        window.postMessage({ type: 'lernwerk-numbers-changed', key: this.key }, location.origin)
    },

    // ------------------------------------------------------------------ Zahlen-Helfer

    rndInt: function (min, max) { // inklusive max
        return min + Math.floor(Math.random() * (max - min + 1))
    },
    pick: function (list) {
        return list[this.rndInt(0, list.length - 1)]
    },
    shuffle: function (list) {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const t = list[i]; list[i] = list[j]; list[j] = t
        }
        return list
    },
    toBase: function (v, base, len) {
        let s = v.toString(base).toUpperCase()
        while (len && s.length < len) s = '0' + s
        return s
    },
    bits: function (p) {
        return this.toBase(p, 2, this.BITS)
    },
    // 8-Bit-Muster mit Leerzeichen zwischen den Nibbles (für Erklärungstexte)
    fmtBits: function (p, len) {
        const s = this.toBase(p, 2, len || this.BITS)
        return s.length > 4 ? s.slice(0, s.length - 4) + ' ' + s.slice(-4) : s
    },
    // Stellen, die 255 zur Basis base braucht (hex: 2, oktal: 3, Basis 5: 4, ...)
    digitsFor: function (base) {
        return this.toBase(this.MAX, base).length
    },
    // Ziffernwerte, niederwertigste Stelle zuerst
    digitList: function (v, base, len) {
        const res = []
        for (let i = 0; i < len; i++) {
            res.push(v % base)
            v = Math.floor(v / base)
        }
        return res
    },
    // Überträge in jede Stelle (Index 0 = niederwertigste Stelle, dort nie ein Übertrag; Index len = Übertrag nach außen)
    carries: function (a, b, base, len) {
        const da = this.digitList(a, base, len), db = this.digitList(b, base, len)
        const res = [0]
        let c = 0
        for (let i = 0; i < len; i++) {
            c = da[i] + db[i] + c >= base ? 1 : 0
            res.push(c)
        }
        return res
    },
    range: function (enc) {
        if (enc === 'USG') return [0, this.MAX]
        if (enc === 'B2') return [-128, 127]
        return [-127, 127]
    },
    // Bitmuster (0..255) einer Zahl in der jeweiligen Kodierung
    encode: function (v, enc) {
        if (v >= 0) return v
        if (enc === 'VZ') return 128 | -v
        if (enc === 'B1') return (~(-v)) & this.MAX
        return v & this.MAX
    },
    decode: function (p, enc) {
        if (enc === 'USG' || p < 128) return p
        if (enc === 'B2') return p - 256
        if (enc === 'VZ') return -(p & 127)
        return -((~p) & this.MAX)
    },
    // Summe der Bitmuster (gespeicherte 8 Bit); im B1-Komplement wird der Übertrag aus dem höchsten Bit wieder addiert
    binSum: function (x, y, enc) {
        const s = x + y
        if (s > this.MAX && enc === 'B1') return (s & this.MAX) + 1
        return s & this.MAX
    },
    binOp: function (x, y, op) {
        return op === '&' ? x & y : x | y
    },
    systemName: function (base) {
        return this.SYSTEMS[base] ? this.SYSTEMS[base] + ' (Basis ' + base + ')' : 'Zahlensystem zur Basis ' + base
    },
    // Summe der Stellenwerte eines vorzeichenlosen Bitmusters, z.B. "64 + 8 + 1 = 73"
    powerSum: function (p) {
        const parts = []
        for (let i = this.BITS - 1; i >= 0; i--) if (p & (1 << i)) parts.push(1 << i)
        if (parts.length === 0) return '0'
        return parts.length === 1 ? String(p) : parts.join(' + ') + ' = ' + p
    },

    // ------------------------------------------------------------------ Aufgaben erzeugen

    generate: function (choice) {
        const make = {
            sum: () => this.makeSum(),
            binsum: () => this.makeBinSum(this.config.overflow === true),
            binop: () => this.makeBinOp(),
            convert: () => this.makeConvert(choice === undefined ? 'random' : choice),
            encode: () => this.makeEncode(this.config.enc || 'B2'),
        }[this.task]
        return { task: this.task, choice: choice === undefined ? 'random' : choice, items: make() }
    },

    // Addition zur Basis n: Summanden bis 255, Ergebnis mit einer zusätzlichen Stelle (höchstens 510)
    makeSum: function () {
        return [16, 8, this.pick([4, 5, 7]), this.pick([9, 11, 12])].map(base => {
            const d = this.digitsFor(base)
            const low = Math.pow(base, d - 1)
            for (let attempt = 0; ; attempt++) {
                const a = this.rndInt(low, this.MAX), b = this.rndInt(low, this.MAX)
                const carries = this.carries(a, b, base, d).filter(c => c).length
                if (carries >= 2 || attempt > 200) return { base: base, digits: d, resultDigits: d + 1, a: a, b: b }
            }
        })
    },

    // Binäre Addition. Ohne overflow liegt die Summe im 8-Bit-Bereich der Kodierung, mit overflow gerade nicht.
    makeBinSum: function (overflow) {
        const specs = overflow ? [
            { enc: 'USG', signs: '++' },
            { enc: 'B1', signs: this.pick(['++', '--']) },
            { enc: 'B2', signs: '++' },
            { enc: 'B2', signs: '--' },
        ] : [
            { enc: 'USG', signs: '++' },
            { enc: 'B1', signs: this.pick(['+-', '-+', '--']) },
            { enc: 'B2', signs: this.pick(['+-', '-+']) },
            { enc: 'B2', signs: '--' },
        ]
        return specs.map(s => {
            const r = this.range(s.enc)
            for (let attempt = 0; ; attempt++) {
                const val = sign => sign === '+' ? this.rndInt(5, s.enc === 'USG' ? 250 : r[1]) : -this.rndInt(5, -r[0])
                const a = val(s.signs[0]), b = val(s.signs[1])
                const sum = a + b
                if (sum === 0) continue
                if ((sum < r[0] || sum > r[1]) !== overflow) continue
                const x = this.encode(a, s.enc), y = this.encode(b, s.enc)
                const res = this.binSum(x, y, s.enc)
                if (!overflow && this.decode(res, s.enc) !== sum) continue // Sicherheitsnetz
                if (s.enc === 'B1' && res === this.MAX) continue // -0 vermeiden
                const carries = this.carries(x, y, 2, this.BITS).filter(c => c).length
                if (carries >= 2 || attempt > 200) return { enc: s.enc, a: a, b: b }
            }
        })
    },

    // Bitweise Verknüpfung zweier 8-Bit-Muster, je zweimal & und |
    makeBinOp: function () {
        return this.shuffle(['&', '|', '&', '|']).map(op => {
            for (; ;) {
                const x = this.rndInt(1, 254), y = this.rndInt(1, 254)
                const r = this.binOp(x, y, op)
                if (r === x || r === y || r === 0 || r === this.MAX) continue
                return { op: op, x: x, y: y }
            }
        })
    },

    // Umrechnen: drei Basen (zufällig oder die gewählte), je einmal Basis B -> dezimal und dezimal -> Basis B
    makeConvert: function (choice) {
        const bases = choice === 'random' ? this.shuffle(this.BASES.slice()).slice(0, 3) : [choice, choice, choice]
        const items = []
        const used = []
        bases.forEach(base => {
            const d = this.digitsFor(base)
            ;['digits', 'dec'].forEach(given => {
                let v
                do v = this.rndInt(Math.max(base + 1, 20), this.MAX)
                while (used.indexOf(v) >= 0 || (base === 16 && !/[A-F]/.test(this.toBase(v, 16))))
                used.push(v)
                items.push({ base: base, digits: d, given: given, value: v })
            })
        })
        return items
    },

    // Kodieren: drei Bitmuster -> dezimal, dann drei Dezimalwerte -> Bitmuster; bei Vorzeichen zwei negative je Richtung
    makeEncode: function (enc) {
        const r = this.range(enc)
        const used = []
        const items = []
        ;['digits', 'dec'].forEach(given => {
            const signs = enc === 'USG' ? ['+', '+', '+'] : this.shuffle(['-', '-', '+'])
            signs.forEach(sign => {
                let v
                do v = sign === '+' ? this.rndInt(enc === 'USG' ? 20 : 5, r[1]) : -this.rndInt(5, -r[0])
                while (used.indexOf(v) >= 0)
                used.push(v)
                items.push({ enc: enc, given: given, value: v })
            })
        })
        return items
    },

    // ------------------------------------------------------------------ erwartete Ergebnisse

    // { base, len, value (Ziffern als String) oder undefined, dec (Zahl) oder undefined }
    expected: function (item) {
        switch (this.task) {
            case 'sum':
                return { base: item.base, len: item.resultDigits, value: this.toBase(item.a + item.b, item.base, item.resultDigits) }
            case 'binsum': {
                const r = this.binSum(this.encode(item.a, item.enc), this.encode(item.b, item.enc), item.enc)
                return { base: 2, len: this.BITS, value: this.bits(r), dec: this.config.overflow ? this.decode(r, item.enc) : undefined }
            }
            case 'binop':
                return { base: 2, len: this.BITS, value: this.bits(this.binOp(item.x, item.y, item.op)) }
            case 'convert':
                return item.given === 'digits'
                    ? { base: item.base, len: item.digits, dec: item.value }
                    : { base: item.base, len: item.digits, value: this.toBase(item.value, item.base, item.digits) }
            case 'encode':
                return item.given === 'digits'
                    ? { base: 2, len: this.BITS, dec: item.value }
                    : { base: 2, len: this.BITS, value: this.bits(this.encode(item.value, item.enc)) }
        }
    },
    // vorgegebene Ziffern, wenn die Zahl zur Basis B gegeben und der Dezimalwert gesucht ist
    givenDigits: function (item) {
        return this.task === 'encode' ? this.bits(this.encode(item.value, item.enc)) : this.toBase(item.value, item.base)
    },
    // Summanden als { op, value (String), base }
    operands: function (item) {
        switch (this.task) {
            case 'sum':
                return [
                    { op: '', value: this.toBase(item.a, item.base), base: item.base },
                    { op: '+', value: this.toBase(item.b, item.base), base: item.base },
                ]
            case 'binsum':
                return [
                    { op: '', value: this.bits(this.encode(item.a, item.enc)), base: 2 },
                    { op: '+', value: this.bits(this.encode(item.b, item.enc)), base: 2 },
                ]
            case 'binop':
                return [
                    { op: '', value: this.bits(item.x), base: 2 },
                    { op: item.op, value: this.bits(item.y), base: 2 },
                ]
        }
        return []
    },
    intro: function (item, nr) {
        const L = '<b>' + this.LETTERS[nr] + ')</b> '
        switch (this.task) {
            case 'sum':
                return L + 'Berechnen Sie im ' + this.systemName(item.base) + ':'
            case 'binsum':
                return L + 'Berechnen Sie ' + this.ENC_NAMES[item.enc] + ' mit 8 Bit' + (this.config.overflow
                    ? '. Geben Sie die gespeicherten 8 Bit und deren Dezimalwert an:' : ':')
            case 'binop':
                return L + 'Berechnen Sie das bitweise <b>' + this.OP_NAMES[item.op] + '</b> (<code>' + item.op + '</code>):'
            case 'convert':
                return item.given === 'digits'
                    ? L + 'Gegeben ist eine Zahl im ' + this.systemName(item.base) + '. Bestimmen Sie den Dezimalwert.'
                    : L + 'Gegeben ist ein Dezimalwert. Bestimmen Sie die Darstellung im ' + this.systemName(item.base) + '.'
            case 'encode':
                return item.given === 'digits'
                    ? L + 'Das 8-Bit-Muster ist ' + this.ENC_IN[item.enc] + ' kodiert. Bestimmen Sie den Dezimalwert.'
                    : L + 'Kodieren Sie den Dezimalwert in 8 Bit ' + this.ENC_IN[item.enc] + '.'
        }
    },

    // ------------------------------------------------------------------ DOM-Helfer

    el: function (tag, cls, text) {
        const e = document.createElement(tag)
        if (cls) e.className = cls
        if (text !== undefined) e.textContent = text
        return e
    },
    html: function (tag, cls, html) {
        const e = this.el(tag, cls)
        e.innerHTML = html
        return e
    },
    // Zeile der Zahlentabelle: op | ( | Ziffern (rechtsbündig in cols Spalten) | )_base [ = ( dec )_10 ]
    numberRow: function (cls, op, cells, cols, base, decCell) {
        const tr = this.el('tr', cls)
        tr.appendChild(this.el('td', 'op', op))
        for (let i = 0; i < cols - cells.length; i++) tr.appendChild(this.el('td', 'digit'))
        tr.appendChild(this.el('td', 'paren', '('))
        cells.forEach(c => tr.appendChild(c))
        if (base === 2) {
            // Nibbles gruppieren
            const digits = Array.from(tr.querySelectorAll('td.digit')).slice(-cols)
            digits.forEach((td, i) => { if (i > 0 && (digits.length - i) % 4 === 0) tr.insertBefore(this.el('td', 'nibble'), td) })
        }
        tr.appendChild(this.html('td', 'paren', ')<sub>' + base + '</sub>'))
        if (decCell) {
            tr.appendChild(this.el('td', 'eq', '='))
            tr.appendChild(this.el('td', 'paren', '('))
            tr.appendChild(decCell)
            tr.appendChild(this.html('td', 'paren', ')<sub>10</sub>'))
        }
        return tr
    },
    digitCells: function (str) {
        return str.split('').map(ch => this.el('td', 'digit', ch))
    },
    fmtDec: function (v) {
        return v < 0 ? '−' + (-v) : String(v)
    },
    // '−5' / '-5' / ' 12 ' -> Zahl, sonst undefined
    parseDec: function (text) {
        const t = String(text || '').trim().replace(/^[−–]/, '-').replace(/^\+/, '')
        return /^-?\d+$/.test(t) ? Number(t) : undefined
    },

    // ------------------------------------------------------------------ Aufbau

    render: function () {
        const solution = this.config.view === 'solution'
        const root = this.el('div', 'quiz quiz-numbers')
        this.feedback = this.el('div', 'quiz-feedback')
        this.feedback.setAttribute('aria-live', 'polite')
        if (this.task === 'convert' && !solution) root.appendChild(this.buildBaseChoice())
        const body = this.el('div', 'quiz-num-body')
        root.appendChild(body)
        this.body = body
        if (!Array.isArray(this.answer.items)) this.answer.items = this.puzzle.items.map(() => ({ digits: [], dec: '' }))
        this.rows = this.puzzle.items.map((item, nr) => this.buildItem(item, nr, solution))
        const ref = this.buildReference()
        if (ref) root.appendChild(ref)

        if (solution) {
            root.appendChild(this.el('p', 'quiz-num-note',
                'Lösung für die Zahlen aus „Ihre Lösung“. Mit „Neue Zahlen“ wird dort eine neue Aufgabe erzeugt.'))
        } else {
            const actions = this.el('div', 'quiz-actions')
            const check = this.el('button', '', 'Prüfen')
            const clear = this.el('button', 'secondary', 'Zurücksetzen')
            const shuffle = this.el('button', 'secondary', '↻ Neue Zahlen')
            check.type = clear.type = shuffle.type = 'button'
            clear.title = 'Eingaben löschen, Zahlen behalten'
            shuffle.title = 'Neue zufällige Zahlen erzeugen'
            check.addEventListener('click', () => this.check())
            clear.addEventListener('click', () => {
                this.answer = {}
                this.save()
                this.render()
            })
            shuffle.addEventListener('click', () => this.newNumbers())
            actions.append(check, clear, shuffle)
            root.append(actions, this.feedback)
        }
        this.canvasElement.empty().append(root)
    },

    // Auswahl der Basis beim Umrechnen; eine Änderung erzeugt neue Zahlen
    buildBaseChoice: function () {
        const bar = this.el('label', 'quiz-num-choice')
        bar.appendChild(this.el('span', '', 'Basis: '))
        const select = this.el('select')
        const add = (value, text) => {
            const o = this.el('option', '', text)
            o.value = String(value)
            if (String(this.puzzle.choice) === String(value)) o.selected = true
            select.appendChild(o)
        }
        add('random', 'zufällig (3 verschiedene)')
        this.BASES.forEach(b => add(b, b + (this.SYSTEMS[b] ? ' (' + this.SYSTEMS[b] + ')' : '')))
        select.addEventListener('change', () => this.newNumbers(select.value === 'random' ? 'random' : Number(select.value)))
        bar.appendChild(select)
        return bar
    },

    buildItem: function (item, nr, solution) {
        const exp = this.expected(item)
        const ops = this.operands(item)
        const a = this.answer.items[nr] || (this.answer.items[nr] = { digits: [], dec: '' })
        const cols = Math.max(exp.len, ...ops.map(o => o.value.length))
        const box = this.el('div', 'quiz-num-item')
        box.appendChild(this.html('p', 'quiz-num-intro', this.intro(item, nr)))
        const table = this.el('table', 'quiz-num-table')
        const res = { item: item, exp: exp, inputs: [], decInput: undefined, box: box }

        ops.forEach(o => table.appendChild(this.numberRow('', o.op, this.digitCells(o.value), cols, o.base)))

        // Übertrag aus dem höchsten Bit (passt nicht in die 8 Bit): steht links neben der Klammer und ist durchgestrichen
        let carryOut = false
        if (solution && (this.task === 'sum' || this.task === 'binsum')) {
            const x = this.task === 'sum' ? item.a : this.encode(item.a, item.enc)
            const y = this.task === 'sum' ? item.b : this.encode(item.b, item.enc)
            const c = this.carries(x, y, exp.base, exp.len)
            carryOut = c[exp.len] === 1
            const cells = []
            for (let i = exp.len - 1; i >= 0; i--) cells.push(this.el('td', 'digit carry', c[i] ? '1' : ''))
            const carryRow = this.numberRow('carry', carryOut ? '1' : '', cells, cols, exp.base)
            carryRow.children[1].textContent = ''
            carryRow.lastChild.innerHTML = ''
            table.appendChild(carryRow)
        }

        // Ergebniszeile
        let resultCells
        if (exp.value === undefined) {
            resultCells = this.digitCells(this.givenDigits(item))
        } else if (solution) {
            resultCells = this.digitCells(exp.value)
        } else {
            resultCells = []
            for (let i = 0; i < exp.len; i++) {
                const td = this.el('td', 'digit')
                const input = this.el('input', 'quiz-num-digit')
                input.type = 'text'
                input.maxLength = 1
                input.autocomplete = 'off'
                input.spellcheck = false
                if (exp.base <= 10) input.inputMode = 'numeric'
                input.value = a.digits[i] || ''
                input.setAttribute('aria-label', 'Teilaufgabe ' + this.LETTERS[nr] + ', Stelle ' + (i + 1) + ' von ' + exp.len)
                input.addEventListener('input', () => {
                    const v = input.value.toUpperCase().slice(-1)
                    input.value = v
                    a.digits[i] = v
                    input.classList.remove('ok', 'bad')
                    this.save()
                    if (v && res.inputs[i + 1]) { res.inputs[i + 1].focus(); res.inputs[i + 1].select() }
                })
                input.addEventListener('keydown', ev => this.moveFocus(ev, res.inputs, i))
                td.appendChild(input)
                resultCells.push(td)
                res.inputs.push(input)
            }
        }
        let decCell
        if (exp.dec !== undefined || item.given === 'dec') {
            decCell = this.el('td', 'dec')
            if (item.given === 'dec') {
                decCell.textContent = this.fmtDec(item.value)
            } else if (solution) {
                decCell.textContent = this.fmtDec(exp.dec)
            } else {
                const input = this.el('input', 'quiz-num-dec')
                input.type = 'text'
                input.autocomplete = 'off'
                input.maxLength = 6
                input.value = a.dec || ''
                input.setAttribute('aria-label', 'Teilaufgabe ' + this.LETTERS[nr] + ', Dezimalwert')
                input.addEventListener('input', () => {
                    a.dec = input.value
                    input.classList.remove('ok', 'bad')
                    this.save()
                })
                decCell.appendChild(input)
                res.decInput = input
            }
        }
        const resultRow = this.numberRow(ops.length ? 'result' : 'single', carryOut ? '1' : '', resultCells, cols, exp.base, decCell)
        if (carryOut) {
            resultRow.firstChild.classList.add('overflow')
            resultRow.firstChild.title = 'passt nicht in die ' + this.BITS + ' Bit'
        }
        table.appendChild(resultRow)
        const tableBox = this.el('div', 'quiz-num-tablebox')
        tableBox.appendChild(table)
        box.appendChild(tableBox)
        if (solution) box.appendChild(this.html('p', 'quiz-num-way', this.explain(item, exp)))
        this.body.appendChild(box)
        return res
    },
    moveFocus: function (ev, inputs, i) {
        const input = ev.target
        let to
        if (ev.key === 'ArrowLeft') to = i - 1
        else if (ev.key === 'ArrowRight') to = i + 1
        else if (ev.key === 'Backspace' && input.value === '') to = i - 1
        if (to === undefined || !inputs[to]) return
        ev.preventDefault()
        inputs[to].focus()
        inputs[to].select()
    },

    // ------------------------------------------------------------------ Rechenwege (Beispiellösung)

    explain: function (item, exp) {
        const sup = (b, e) => b + '<sup>' + e + '</sup>'
        switch (this.task) {
            case 'sum':
                return 'Kontrolle im Dezimalsystem: ' + item.a + ' + ' + item.b + ' = ' + (item.a + item.b) +
                    '. Überträge entstehen, sobald eine Stellensumme ≥ ' + item.base + ' ist.'
            case 'binsum': {
                const x = this.encode(item.a, item.enc), y = this.encode(item.b, item.enc)
                const stored = this.binSum(x, y, item.enc)
                const sum = item.a + item.b
                const r = this.range(item.enc)
                const txt = []
                if (x + y > this.MAX) {
                    if (item.enc === 'B1') {
                        txt.push('Aus dem höchsten Bit entsteht ein Übertrag. Im B1-Komplement wird er zum Ergebnis addiert: ' +
                            this.fmtBits((x + y) & this.MAX) + ' + 1 = ' + this.fmtBits(stored) + '.')
                    } else if (item.enc === 'B2') {
                        txt.push('Der Übertrag aus dem höchsten Bit wird im B2-Komplement verworfen.')
                    } else {
                        txt.push('Der Übertrag aus dem höchsten Bit passt nicht mehr in die 8 Bit und geht verloren.')
                    }
                }
                if (this.config.overflow) {
                    txt.push('Das richtige Ergebnis ' + this.fmtDec(item.a) + ' + ' + this.fmtDec(item.b) + ' = ' + this.fmtDec(sum) +
                        ' liegt außerhalb des 8-Bit-Bereichs ' + this.fmtDec(r[0]) + ' bis ' + r[1] + ': Es gibt einen <b>Überlauf</b>.')
                    txt.push('Gespeichert wird nur ' + this.fmtBits(stored) + '. ' + this.decWay(stored, item.enc))
                } else {
                    txt.push('Kontrolle im Dezimalsystem: ' + this.fmtDec(item.a) + ' + ' + this.fmtDec(item.b) + ' = ' + this.fmtDec(sum) + '.')
                }
                return txt.join(' ')
            }
            case 'binop':
                return item.op === '&'
                    ? 'Ein Bit ist 1, wenn es in <i>beiden</i> Zahlen 1 ist.'
                    : 'Ein Bit ist 1, wenn es in <i>mindestens einer</i> Zahl 1 ist.'
            case 'convert': {
                const ds = this.toBase(item.value, item.base).split('')
                if (item.given === 'digits') {
                    return ds.map((d, i) => this.DIGITS.indexOf(d) + '·' + sup(item.base, ds.length - 1 - i)).join(' + ') +
                        ' = ' + ds.map((d, i) => this.DIGITS.indexOf(d) * Math.pow(item.base, ds.length - 1 - i)).join(' + ') +
                        ' = ' + item.value
                }
                const steps = []
                for (let v = item.value; v > 0; v = Math.floor(v / item.base)) {
                    const r = v % item.base
                    steps.push(v + ' : ' + item.base + ' = ' + Math.floor(v / item.base) + ' Rest ' + r +
                        (r > 9 ? ' (' + this.DIGITS[r] + ')' : ''))
                }
                return steps.join('<br>') + '<br>Die Reste von unten nach oben gelesen ergeben ' + ds.join('') +
                    (ds.length < item.digits ? ', mit führenden Nullen ' + exp.value : '') + '.'
            }
            case 'encode':
                return item.given === 'digits' ? this.decWay(this.encode(item.value, item.enc), item.enc) : this.encWay(item.value, item.enc)
        }
    },
    // Dezimalwert eines Bitmusters in der jeweiligen Kodierung
    decWay: function (p, enc) {
        if (enc === 'USG') return 'Summe der Stellenwerte: ' + this.powerSum(p) + '.'
        if (p < 128) return 'Das höchste Bit ist 0, die Zahl ist positiv: ' + this.powerSum(p) + '.'
        const neg = 'Das höchste Bit ist 1, die Zahl ist negativ. '
        if (enc === 'VZ') {
            return neg + 'Die übrigen 7 Bit geben den Betrag an: ' + this.fmtBits(p & 127, 7) + ' = ' + (p & 127) +
                ', der Wert ist also ' + this.fmtDec(-(p & 127)) + '.'
        }
        const inv = (~p) & this.MAX
        if (enc === 'B1') {
            return neg + 'Invertiert ergibt sich ' + this.fmtBits(inv) + ' = ' + inv + ', der Wert ist also ' + this.fmtDec(-inv) + '.'
        }
        return neg + 'Invertiert und +1 ergibt sich ' + this.fmtBits(inv + 1) + ' = ' + (inv + 1) +
            ', der Wert ist also ' + this.fmtDec(-(inv + 1)) + '.'
    },
    // Bitmuster zu einem Dezimalwert in der jeweiligen Kodierung
    encWay: function (v, enc) {
        const m = Math.abs(v)
        const parts = this.powerSum(m).replace(/ = \d+$/, '')
        const abs = (v < 0 ? 'Betrag ' : '') + m + (parts !== String(m) ? ' = ' + parts : '') + ', also ' + this.fmtBits(m) + '.'
        if (v >= 0) return abs + (enc === 'USG' ? '' : ' Die Zahl ist positiv, das höchste Bit bleibt 0.')
        if (enc === 'VZ') return abs + ' Für das negative Vorzeichen wird das höchste Bit gesetzt: ' + this.fmtBits(128 | m) + '.'
        const inv = (~m) & this.MAX
        if (enc === 'B1') return abs + ' Für die negative Zahl werden alle Bits invertiert: ' + this.fmtBits(inv) + '.'
        return abs + ' Für die negative Zahl werden alle Bits invertiert (' + this.fmtBits(inv) + ') und 1 addiert: ' +
            this.fmtBits((inv + 1) & this.MAX) + '.'
    },

    // Tafelwerk (nur beim Umrechnen): Ziffer mal Stellenwert
    buildReference: function () {
        if (this.task !== 'convert') return undefined
        const refs = {}
        this.puzzle.items.forEach(it => { refs[it.base] = Math.max(refs[it.base] || 0, it.digits - 1) })
        const wrap = this.el('div', 'quiz-num-ref')
        wrap.appendChild(this.el('p', 'quiz-num-reftitle', 'Tafelwerk: Stellenwerte im Dezimalsystem'))
        wrap.appendChild(this.el('p', 'quiz-num-note', 'Jede Zelle zeigt den Dezimalwert aus Ziffer mal Stellenwert.'))
        Object.keys(refs).map(Number).sort((x, y) => x - y).forEach(base => {
            const table = this.el('table', 'quiz-num-reftable')
            const head = this.el('tr')
            head.appendChild(this.el('th', 'pow', 'Basis ' + base))
            for (let d = 0; d < base; d++) head.appendChild(this.el('th', '', this.DIGITS[d]))
            table.appendChild(head)
            for (let e = 0; e <= refs[base]; e++) {
                const tr = this.el('tr')
                tr.appendChild(this.html('th', 'pow', base + '<sup>' + e + '</sup>'))
                for (let d = 0; d < base; d++) tr.appendChild(this.el('td', '', String(d * Math.pow(base, e))))
                table.appendChild(tr)
            }
            const box = this.el('div', 'quiz-num-tablebox')
            box.appendChild(table)
            wrap.appendChild(box)
        })
        return wrap
    },

    // ------------------------------------------------------------------ Prüfen

    setFeedback: function (kind, html) {
        this.feedback.className = 'quiz-feedback' + (kind ? ' ' + kind : '')
        this.feedback.innerHTML = html
    },

    check: function () {
        this.setFeedback('', '')
        const tips = []
        const addTip = t => { if (t && tips.indexOf(t) < 0) tips.push(t) }
        let correct = 0, empty = 0
        this.rows.forEach(row => {
            const exp = row.exp
            let ok = true, filled = false
            let given = ''
            if (exp.value !== undefined) {
                // führende leere Felder zählen als 0, außer bei Binärzahlen (dort sind alle 8 Bit anzugeben)
                let leading = true
                row.inputs.forEach((input, i) => {
                    let v = input.value.trim().toUpperCase()
                    if (v) filled = true
                    if (v === '' && leading && exp.base !== 2 && i < exp.len - 1) v = '0'
                    if (v !== '' && v !== '0') leading = false
                    given += v === '' ? ' ' : v
                    const good = v === exp.value[i]
                    input.classList.remove('ok', 'bad')
                    input.classList.add(good ? 'ok' : 'bad')
                    ok = ok && good
                    const dv = this.DIGITS.indexOf(v)
                    if (v !== '' && (dv < 0 || dv >= exp.base)) {
                        addTip('Zur Basis ' + exp.base + ' gibt es nur die Ziffern 0 bis ' + this.DIGITS[exp.base - 1] + '.')
                    }
                })
                if (exp.base === 2 && given.indexOf(' ') >= 0 && filled) addTip('Geben Sie alle 8 Bit an, auch führende Nullen.')
            }
            let decGiven
            if (row.decInput) {
                decGiven = this.parseDec(row.decInput.value)
                if (row.decInput.value.trim() !== '') filled = true
                const good = decGiven === exp.dec
                row.decInput.classList.remove('ok', 'bad')
                row.decInput.classList.add(good ? 'ok' : 'bad')
                ok = ok && good
            }
            if (!filled) { empty++; return }
            if (ok) { correct++; return }
            this.tipsFor(row.item, exp, given.trim(), decGiven).forEach(addTip)
        })
        const total = this.rows.length
        if (correct === total) {
            this.setFeedback('success', '<b>Richtig!</b> Alle ' + total + ' Teilaufgaben stimmen. Mit „Neue Zahlen“ können Sie weiter üben.')
            return
        }
        if (empty) addTip(empty === 1 ? 'Eine Teilaufgabe ist noch leer.' : empty + ' Teilaufgaben sind noch leer.')
        this.setFeedback(correct === 0 ? 'error' : 'warning', '<b>' + correct + ' von ' + total + ' Teilaufgaben richtig.</b> ' + tips.join(' '))
    },

    // typische Fehler erkennen; g = eingegebene Ziffern, dec = eingegebener Dezimalwert
    tipsFor: function (item, exp, g, dec) {
        const tips = []
        const strip = s => s.replace(/^0+/, '')
        switch (this.task) {
            case 'sum': {
                let noCarry = ''
                const da = this.digitList(item.a, item.base, exp.len), db = this.digitList(item.b, item.base, exp.len)
                for (let i = exp.len - 1; i >= 0; i--) noCarry += this.DIGITS[(da[i] + db[i]) % item.base]
                if (g !== '' && strip(noCarry) === strip(g)) {
                    tips.push('Denken Sie an die Überträge: Ist eine Stellensumme ≥ ' + item.base + ', wird ' + item.base +
                        ' abgezogen und 1 in die nächste Stelle übertragen.')
                }
                if (g !== '' && strip(g) === String(item.a + item.b)) {
                    tips.push('Das Ergebnis ist im Dezimalsystem angegeben, gesucht ist die Darstellung zur Basis ' + item.base + '.')
                }
                break
            }
            case 'binsum': {
                const x = this.encode(item.a, item.enc), y = this.encode(item.b, item.enc)
                if (item.enc === 'B1' && x + y > this.MAX && g === this.bits((x + y) & this.MAX)) {
                    tips.push('Im B1-Komplement wird ein Übertrag aus dem höchsten Bit wieder zum Ergebnis addiert.')
                }
                if (this.config.overflow && g === exp.value && dec !== undefined) {
                    if (dec === item.a + item.b) {
                        tips.push('Das richtige Ergebnis passt nicht in 8 Bit. Gesucht ist der Wert der tatsächlich gespeicherten 8 Bit.')
                    } else {
                        tips.push(this.decTip(parseInt(exp.value, 2), item.enc, dec))
                    }
                }
                break
            }
            case 'binop': {
                const other = this.binOp(item.x, item.y, item.op === '&' ? '|' : '&')
                if (g === this.bits(other)) {
                    tips.push('Verwechselt? <code>&</code> (UND) ergibt nur dort 1, wo beide Bits 1 sind, <code>|</code> (ODER) überall, wo mindestens ein Bit 1 ist.')
                }
                break
            }
            case 'convert':
                if (item.given === 'dec' && strip(g.split('').reverse().join('')) === strip(exp.value) && strip(g) !== strip(exp.value)) {
                    tips.push('Die Reste der Division werden von unten nach oben gelesen: Der erste Rest ist die niederwertigste Stelle.')
                }
                if (item.given === 'digits' && dec !== undefined && dec === parseInt(this.toBase(item.value, item.base), 10)) {
                    tips.push('Die Ziffern müssen mit ihrem Stellenwert (Potenzen von ' + item.base + ') multipliziert werden.')
                }
                break
            case 'encode':
                if (item.given === 'digits') {
                    if (dec !== undefined) tips.push(this.decTip(this.encode(item.value, item.enc), item.enc, dec))
                } else {
                    tips.push(this.encTip(item.value, item.enc, g))
                }
                break
        }
        return tips
    },
    // Dezimalwert falsch: Wurde das Muster in einer anderen Kodierung gelesen?
    decTip: function (p, enc, dec) {
        const other = ['USG', 'VZ', 'B1', 'B2'].find(e => e !== enc && this.decode(p, e) === dec)
        if (other === 'USG') return 'Das höchste Bit ist 1, ' + this.ENC_IN[enc] + ' ist die Zahl also negativ.'
        if (enc === 'USG' && other) return 'Vorzeichenlos sind alle 8 Bit Stellenwerte, das höchste Bit zählt 128.'
        if (enc === 'B1' && other === 'B2') return 'Im B1-Komplement wird zum Umrechnen nur invertiert, nicht zusätzlich 1 addiert.'
        if (enc === 'B2' && other === 'B1') return 'Im B2-Komplement wird nach dem Invertieren noch 1 addiert.'
        if (enc === 'VZ' && other) return 'Mit Vorzeichenbit geben die übrigen 7 Bit direkt den Betrag an, es wird nicht invertiert.'
        if (other === 'VZ') return 'Im Komplement geben die übrigen 7 Bit nicht direkt den Betrag an: Erst invertieren' +
            (enc === 'B2' ? ' und 1 addieren.' : '.')
        return 'Prüfen Sie die Umrechnung ins Dezimalsystem.'
    },
    // Bitmuster falsch: Wurde in einer anderen Kodierung kodiert?
    encTip: function (v, enc, g) {
        if (v >= 0) return 'Rechnen Sie die positive Zahl wie eine vorzeichenlose Zahl um (Summe der Stellenwerte).'
        if (g === this.bits(-v)) return 'Das ist der Betrag. Für die negative Zahl fehlt noch ' +
            (enc === 'VZ' ? 'das Vorzeichenbit.' : enc === 'B1' ? 'das Invertieren.' : 'das Invertieren und +1.')
        const other = ['VZ', 'B1', 'B2'].find(e => e !== enc && g === this.bits(this.encode(v, e)))
        if (enc === 'B2' && other === 'B1') return 'Im B2-Komplement wird nach dem Invertieren noch 1 addiert.'
        if (enc === 'B1' && other === 'B2') return 'Im B1-Komplement wird nur invertiert, nicht zusätzlich 1 addiert.'
        if (enc === 'VZ' && other) return 'Mit Vorzeichenbit wird nur das höchste Bit gesetzt, der Betrag bleibt unverändert.'
        if (other === 'VZ') return 'Im Komplement reicht es nicht, das höchste Bit zu setzen: Alle Bits werden invertiert' +
            (enc === 'B2' ? ' und dann 1 addiert.' : '.')
        return 'Bestimmen Sie zuerst den Betrag als 8-Bit-Muster und wenden Sie dann die Kodierung an.'
    },
}
