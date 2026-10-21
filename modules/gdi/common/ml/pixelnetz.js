export default {
    // Playground (v102) für die Aufgaben "Pixel-Erkennung" (11_Arrays_nDim) und "Tensor" (12_Instanzen),
    // jeweils mit dataDomLibs: tf-2.0.0.
    // Links wird ein Bild mit 10 x 12 Pixeln gezeichnet und als args[0] an das Java-Programm übergeben
    // (Zeilen durch "/", Werte 0 bis 255 durch "," getrennt). Das Programm schickt die vorbereitete
    // Eingabe zurück ({ zeilen, spalten, vektor }, optional die Form des Tensors als form und einen
    // Statustext als meldung). Dieses Feld wird unverändert in ein kleines neuronales Netz gegeben. Seine
    // Gewichte liegen fertig trainiert in pixelnetz-gewichte.json (siehe tools/pixelnetz-training.html).
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    R: 10,
    C: 12,
    FULL: 255,
    SOFT: 100,
    classes: ['Waagrechte Linie', 'Senkrechte Linie', 'Kreuz', 'Plus', 'Kreis'],
    ink: '#1f3b57',
    accent: '#00B1B0',
    model: undefined,
    loading: false,
    failed: undefined,
    result: undefined,
    stale: false,

    setupDOM: function () {
        this.canvasElement.css({
            border: 'none', 'box-shadow': 'none', 'background-color': 'transparent', overflow: 'auto'
        })
    },

    noticeStyle: function () {
        return {
            'max-width': '230px', padding: '6px 10px', 'border-radius': '6px', 'font-weight': 'bold',
            background: '#fff4d6', border: '1px solid #e6b84d', color: '#5c4300'
        }
    },

    init: function () {
        if (this.grid === undefined) this.grid = this.exampleImage()
        this.buildUI()
        this.drawGrid()
        this.drawPreview()
        this.drawBars()
        this.loadModel()
    },

    // Die Gewichte stehen danach in this.gewichte. Der Pfad ist relativ zur Übungsseite
    // (modules/gdi/<Kapitel>/<Übung>/index.html).
    getResources() {
        return [{ uri: '../../common/ml/pixelnetz-gewichte.json', type: 'json', name: 'gewichte' }]
    },

    addArgumentsTo(args) {
        args[0] = this.grid.map(row => row.join(',')).join('/')
    },

    reset() { },

    update: function (txt, json) {
        if (json === undefined || json === null || !Array.isArray(json.vektor)) return
        // Nur die erwarteten Felder übernehmen, Texte und Zahlen bereinigt
        this.result = {
            vektor: json.vektor,
            form: Array.isArray(json.form) ? json.form.slice(0, 8).map(x => Math.trunc(+x) || 0) : undefined,
            meldung: this.plainText(json.meldung, 200)
        }
        this.stale = false
        this.drawPreview()
        this.predict()
    },

    // ---------- Oberfläche ----------

    // Text aus dem Java-Programm: nur Strings, ohne Steuerzeichen, gekürzt. Eingefügt wird er
    // ausschließlich mit .text() (textContent), also nie als HTML interpretiert.
    plainText: function (value, max) {
        if (typeof value !== 'string') return undefined
        // Steuerzeichen über ihren Code ersetzen: Escape-Sequenzen wie in einem regulären Ausdruck
        // überstehen das Einbetten des Codes in die Seite nicht
        let clean = ''
        for (const ch of value) {
            const c = ch.charCodeAt(0)
            clean += c < 32 || (c >= 127 && c < 160) || c === 8232 || c === 8233 ? ' ' : ch
        }
        clean = clean.trim()
        if (clean.length === 0) return undefined
        return clean.length > max ? clean.slice(0, max - 3) + '...' : clean
    },

    buildUI: function () {
        // Codeblocks führt diesen Code erst aus, wenn TensorFlow.js geladen ist. Bis dahin zeigt die Seite den
        // Hinweis aus common/ml/laden.html, der jetzt nicht mehr gebraucht wird.
        this.scope.find('.pixelnetz-laden').hide()
        const root = this.canvasElement
        root.empty()
        root.show()
        const wrap = $('<div></div>').css({
            display: 'flex', 'flex-wrap': 'wrap', gap: '16px', 'align-items': 'flex-start',
            'justify-content': 'center', padding: '8px', 'font-family': 'inherit', 'font-size': '14px'
        })
        const panel = title => {
            const p = $('<div></div>').css({ display: 'flex', 'flex-direction': 'column', gap: '6px' })
            p.append($('<b></b>').text(title))
            wrap.append(p)
            return p
        }

        const left = panel('Zeichnen Sie eine Form')
        this.drawCanvas = $('<canvas></canvas>').attr({ width: this.C * 22, height: this.R * 22 })
            .css({ cursor: 'crosshair', 'touch-action': 'none', border: '1px solid #999', background: '#fff' })
        left.append(this.drawCanvas)
        const clear = $('<button type="button">Löschen</button>').css({ 'align-self': 'flex-start' })
        left.append(clear)
        clear.on('click', () => {
            this.grid = this.emptyGrid()
            this.markStale()
            this.drawGrid()
        })

        const mid = panel('So sieht das Netz die Eingabe')
        this.previewCanvas = $('<canvas></canvas>').attr({ width: this.C * 14, height: this.R * 14 })
            .css({ border: '1px solid #999', background: '#fff' })
        mid.append(this.previewCanvas)
        this.previewInfo = $('<div></div>').css({ 'max-width': (this.C * 14) + 'px', 'font-size': '12px' })
        mid.append(this.previewInfo)

        const right = panel('Erkennung')
        // Gut sichtbarer Hinweis, solange das Netz noch nicht bereit ist
        this.notice = $('<div></div>').css(this.noticeStyle()).hide()
        right.append(this.notice)
        this.bars = $('<div></div>').css({ display: 'flex', 'flex-direction': 'column', gap: '4px', width: '230px' })
        right.append(this.bars)
        this.status = $('<div></div>').css({ 'font-size': '12px', 'max-width': '230px' })
        right.append(this.status)

        root.append(wrap)
        this.attachPointer()
    },

    attachPointer: function () {
        const cv = this.drawCanvas[0]
        let last
        const paint = e => {
            const rect = cv.getBoundingClientRect()
            const c = Math.floor((e.clientX - rect.left) / rect.width * this.C)
            const r = Math.floor((e.clientY - rect.top) / rect.height * this.R)
            if (r < 0 || r >= this.R || c < 0 || c >= this.C) return
            // Bei schnellen Bewegungen die Lücke zum letzten Pixel schließen
            if (last === undefined) this.stamp(this.grid, r, c)
            else this.line(this.grid, last[0], last[1], r, c)
            last = [r, c]
            this.markStale()
            this.drawGrid()
        }
        cv.addEventListener('pointerdown', e => { last = undefined; cv.setPointerCapture(e.pointerId); paint(e) })
        cv.addEventListener('pointermove', e => { if (e.buttons) paint(e) })
        cv.addEventListener('pointerup', () => { last = undefined })
        cv.addEventListener('pointercancel', () => { last = undefined })
    },

    markStale: function () {
        if (this.result === undefined || this.stale) return
        this.stale = true
        this.drawBars()
    },

    drawCells: function (canvas, value) {
        const ctx = canvas.getContext('2d')
        const w = canvas.width / this.C
        const h = canvas.height / this.R
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        for (let r = 0; r < this.R; r++) {
            for (let c = 0; c < this.C; c++) {
                const v = value(r, c)
                if (v === undefined) {
                    // Eintrag fehlt im Feld
                    ctx.fillStyle = '#f3d6dd'
                    ctx.fillRect(c * w, r * h, w, h)
                } else if (v > 1) {
                    ctx.fillStyle = '#E42256'
                    ctx.fillRect(c * w, r * h, w, h)
                } else if (v > 0) {
                    ctx.globalAlpha = v
                    ctx.fillStyle = this.ink
                    ctx.fillRect(c * w, r * h, w, h)
                    ctx.globalAlpha = 1
                }
            }
        }
        ctx.strokeStyle = '#e4e4e4'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let c = 1; c < this.C; c++) { ctx.moveTo(c * w + 0.5, 0); ctx.lineTo(c * w + 0.5, canvas.height) }
        for (let r = 1; r < this.R; r++) { ctx.moveTo(0, r * h + 0.5); ctx.lineTo(canvas.width, r * h + 0.5) }
        ctx.stroke()
    },

    drawGrid: function () {
        this.drawCells(this.drawCanvas[0], (r, c) => this.grid[r][c] / this.FULL)
    },

    drawPreview: function () {
        if (this.result === undefined) {
            this.drawCells(this.previewCanvas[0], () => 0)
            this.previewInfo.text('Führen Sie das Programm aus.')
            return
        }
        const v = this.result.vektor
        if (v.length === 0 && this.result.meldung) {
            this.drawCells(this.previewCanvas[0], () => 0)
            this.previewInfo.text('')
            return
        }
        // Das Feld wird so gelesen, wie das Netz trainiert wurde: zeilenweise
        this.drawCells(this.previewCanvas[0], (r, c) => v[r * this.C + c])
        const n = this.R * this.C
        let info = v.length + ' Einträge'
        if (Array.isArray(this.result.form)) info = 'Form [' + this.result.form.join(', ') + '], ' + info
        if (v.length !== n) info += ', erwartet ' + n + '. Fehlende Einträge sind rosa markiert.'
        else if (v.some(x => x > 1)) info += '. Werte über 1.0 sind rot markiert.'
        this.previewInfo.text(info)
    },

    drawBars: function () {
        this.bars.empty()
        const p = this.probs || this.classes.map(() => 0)
        const best = this.probs ? p.indexOf(Math.max(...p)) : -1
        this.classes.forEach((name, i) => {
            const row = $('<div></div>').css({ display: 'flex', 'align-items': 'center', gap: '6px' })
            row.append($('<span></span>').text(name).css({ width: '110px', 'flex-shrink': '0', 'font-weight': i === best ? 'bold' : 'normal' }))
            const track = $('<div></div>').css({ flex: '1', height: '14px', background: '#eee', position: 'relative' })
            track.append($('<div></div>').css({
                width: Math.round(p[i] * 100) + '%', height: '100%',
                background: i === best ? this.accent : '#9fb3c4', opacity: this.stale ? 0.35 : 1
            }))
            row.append(track)
            row.append($('<span></span>').text(Math.round(p[i] * 100) + ' %').css({ width: '40px', 'text-align': 'right' }))
            this.bars.append(row)
        })
        let notice = ''
        if (this.failed !== undefined) notice = this.failed
        else if (this.model === undefined) notice = 'Das neuronale Netz wird geladen ...'
        this.notice.text(notice).toggle(notice !== '')
        this.bars.css('opacity', notice === '' ? 1 : 0.4)
        let msg = ''
        if (this.model === undefined) msg = ''
        else if (this.result === undefined) msg = 'Bereit. Führen Sie das Programm aus.'
        else if (this.result.meldung) msg = this.result.meldung
        else if (this.result.vektor.length === 0) msg = 'Die Eingabe ist leer.'
        else if (this.stale) msg = 'Das Bild wurde geändert. Führen Sie das Programm erneut aus.'
        else if (best >= 0) msg = 'Erkannt: ' + this.classes[best] + ' (' + Math.round(p[best] * 100) + ' %)'
        this.status.text(msg)
    },

    // ---------- Bilder ----------

    emptyGrid: function () {
        const g = []
        for (let r = 0; r < this.R; r++) g.push(new Array(this.C).fill(0))
        return g
    },

    exampleImage: function () {
        const g = this.emptyGrid()
        this.line(g, 1, 2, 8, 9)
        this.line(g, 1, 9, 8, 2)
        return g
    },

    // Pinsel: volles Pixel, die vier Nachbarn halbhell
    stamp: function (g, r, c) {
        if (r < 0 || r >= this.R || c < 0 || c >= this.C) return
        g[r][c] = this.FULL
        const soft = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        soft.forEach(([dr, dc]) => {
            const rr = r + dr
            const cc = c + dc
            if (rr >= 0 && rr < this.R && cc >= 0 && cc < this.C) g[rr][cc] = Math.max(g[rr][cc], this.SOFT)
        })
    },

    line: function (g, r0, c0, r1, c1) {
        const n = Math.ceil(Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0))) * 2 + 1
        for (let i = 0; i <= n; i++) {
            const t = i / n
            this.stamp(g, Math.round(r0 + (r1 - r0) * t), Math.round(c0 + (c1 - c0) * t))
        }
    },

    randInt: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)) },
    rand: function (a, b) { return a + Math.random() * (b - a) },

    // Zufällige Trainingsbilder der fünf Formen (verwendet von tools/pixelnetz-training.html)
    sample: function (label) {
        const g = this.emptyGrid()
        const ri = (a, b) => this.randInt(a, b)
        if (label === 0) {
            const r = ri(1, 8)
            this.line(g, r, ri(0, 3), r + ri(-1, 1), ri(8, 11))
        } else if (label === 1) {
            const c = ri(1, 10)
            this.line(g, ri(0, 2), c, ri(7, 9), c + ri(-1, 1))
        } else if (label === 2) {
            const top = ri(0, 2)
            const bottom = ri(7, 9)
            const left = ri(0, 4)
            const right = Math.min(11, left + ri(6, 9))
            this.line(g, top, left, bottom, right)
            this.line(g, top, right, bottom, left)
        } else if (label === 3) {
            const cr = ri(3, 6)
            const cc = ri(4, 7)
            this.line(g, cr, cc - ri(3, 4), cr, cc + ri(3, 4))
            this.line(g, cr - ri(2, 3), cc, cr + ri(2, 3), cc)
        } else {
            const cr = 4.5 + this.rand(-1, 1)
            const cc = 5.5 + this.rand(-1.5, 1.5)
            const ry = this.rand(2.5, 4)
            const rx = this.rand(3, 5)
            for (let a = 0; a < 2 * Math.PI; a += 0.1) {
                this.stamp(g, Math.round(cr + ry * Math.sin(a)), Math.round(cc + rx * Math.cos(a)))
            }
        }
        // etwas Rauschen
        for (let k = ri(0, 2); k > 0; k--) {
            const r = ri(0, this.R - 1)
            const c = ri(0, this.C - 1)
            g[r][c] = Math.max(g[r][c], this.SOFT)
        }
        return g
    },

    // Zeilenweise und auf 0..1 normiert, also genau wie die Musterlösung von zuVektor
    flatten: function (g) {
        const v = []
        for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C; c++) v.push(g[r][c] / this.FULL)
        return v
    },

    // ---------- Netz ----------

    // tf wird von der Sandbox bereitgestellt (dataDomLibs), nicht über window
    getTF: function () {
        return typeof tf === 'undefined' ? undefined : tf
    },

    waitForTF: async function () {
        for (let i = 0; i < 200 && this.getTF() === undefined; i++) await new Promise(res => setTimeout(res, 50))
        return this.getTF()
    },

    // Baut das Netz aus den mitgelieferten Gewichten (pixelnetz-gewichte.json, erzeugt mit
    // tools/pixelnetz-training.html). Im Browser wird nicht trainiert.
    loadModel: async function () {
        if (this.model !== undefined || this.loading) return
        this.loading = true
        this.drawBars()
        const tfjs = await this.waitForTF()
        const g = this.gewichte
        if (tfjs === undefined || g === undefined || !Array.isArray(g.schichten)) {
            this.loading = false
            this.failed = tfjs === undefined ? 'TensorFlow.js konnte nicht geladen werden.' : 'Das Netz konnte nicht geladen werden.'
            this.drawBars()
            return
        }
        // Für das kleine Netz ist das CPU-Backend schneller als WebGL, vor allem in Safari
        await tfjs.setBackend('cpu')
        await tfjs.ready()
        const model = tfjs.sequential()
        g.schichten.forEach((schicht, i) => {
            const config = { units: schicht.bias.length, activation: schicht.aktivierung }
            if (i === 0) config.inputShape = [schicht.kernel.length]
            model.add(tfjs.layers.dense(config))
        })
        const tensoren = []
        g.schichten.forEach(schicht => {
            tensoren.push(tfjs.tensor2d(schicht.kernel), tfjs.tensor1d(schicht.bias))
        })
        model.setWeights(tensoren)
        tensoren.forEach(t => t.dispose())
        this.model = model
        this.loading = false
        if (this.result !== undefined) this.predict()
        else this.drawBars()
    },

    predict: function () {
        if (this.model === undefined) {
            this.drawBars()
            return
        }
        const n = this.R * this.C
        const v = this.result.vektor
        if (v.length === 0) {
            this.probs = undefined
            this.drawBars()
            return
        }
        // Fehlende Einträge werden mit 0 aufgefüllt, überzählige abgeschnitten
        const input = []
        for (let i = 0; i < n; i++) input.push(i < v.length && isFinite(+v[i]) ? +v[i] : 0)
        const tfjs = this.getTF()
        this.probs = Array.from(tfjs.tidy(() => this.model.predict(tfjs.tensor2d([input])).dataSync()))
        this.drawBars()
    },
}
