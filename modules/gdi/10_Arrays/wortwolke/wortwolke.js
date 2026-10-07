export default {
    // Playground (v102) zur Aufgabe "Wortwolke", portiert vom v101-Playground (d3-cloud) der StudOn-Aufgabe.
    // Zeigt die von Wortwolke.sendeErgebnis() geschickten Wörter ([{ text, count }, ...]) als Wortwolke an.
    // Die Wörter werden (ohne externe Bibliothek) entlang einer Spirale um die Mitte platziert, häufige Wörter
    // zuerst und größer. Die Top 3 gibt bereits das Java-Programm aus.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    maxWords: 200,
    last: undefined,

    setupDOM: function () {
        this.canvasElement.css({ border: 'none', 'box-shadow': 'none', 'background-color': 'transparent' })
        this.canvasElement.hide()
    },

    init: function () { },

    addArgumentsTo(args) { },

    reset() { },

    update: function (txt, json) {
        if (!Array.isArray(json) || json.length === 0) {
            this.last = undefined
            this.canvasElement.hide()
            return
        }
        this.last = json
            .filter(w => w && typeof w.text === 'string' && +w.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, this.maxWords)
        this.canvasElement.show()
        // Liegt der Playground in einem gerade nicht sichtbaren Reiter, hat er beim Zeichnen die Größe 0.
        if (this.resizeObserver === undefined && window.ResizeObserver) {
            let lastWidth = -1
            this.resizeObserver = new ResizeObserver(() => {
                const w = this.canvasElement.width()
                if (w !== lastWidth) {
                    lastWidth = w
                    this.draw()
                }
            })
            this.resizeObserver.observe(this.canvasElement[0])
        }
        this.draw()
    },

    // Farbe hängt nur vom Wort ab, damit es bei jedem Lauf gleich eingefärbt wird
    colorFor: function (text) {
        let h = 0
        for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
        return this.colors[Math.abs(h) % this.colors.length]
    },

    draw: function () {
        const words = this.last
        if (words === undefined) return
        const W = this.canvasElement.width()
        const H = this.canvasElement.height()
        if (!(W > 0 && H > 0)) return

        const box = $('<div></div>').css({ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' })
        this.canvasElement.empty().append(box)

        const min = words[words.length - 1].count
        const max = words[0].count
        const size = c => 10 + (max > min ? Math.sqrt((c - min) / (max - min)) : 1) * 50
        const placed = []
        const overlaps = r => placed.some(p => r.x < p.x + p.w && p.x < r.x + r.w && r.y < p.y + p.h && p.y < r.y + r.h)
        const ratio = W / H

        for (const w of words) {
            const span = $('<span></span>')
                .text(w.text)
                .attr('title', w.text + ' (' + w.count + ')')
                .css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    visibility: 'hidden',
                    'white-space': 'nowrap',
                    'line-height': 1,
                    'font-family': 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
                    'font-size': Math.round(size(w.count)) + 'px',
                    color: this.colorFor(w.text),
                    cursor: 'default'
                })
            box.append(span)
            const bw = span[0].offsetWidth + 2
            const bh = span[0].offsetHeight
            const start = Math.random() * 2 * Math.PI
            let spot = undefined
            // archimedische Spirale, an das Seitenverhältnis angepasst
            for (let t = 0; t < 400; t += 0.1) {
                const x = W / 2 + ratio * 1.5 * t * Math.cos(t + start) - bw / 2
                const y = H / 2 + 1.5 * t * Math.sin(t + start) - bh / 2
                if (1.5 * t > W && 1.5 * t > H) break
                if (x < 0 || y < 0 || x + bw > W || y + bh > H) continue
                const r = { x: x, y: y, w: bw, h: bh }
                if (!overlaps(r)) {
                    spot = r
                    break
                }
            }
            if (spot === undefined) {
                span.remove()
                continue
            }
            placed.push(spot)
            span.css({ left: Math.round(spot.x) + 'px', top: Math.round(spot.y) + 'px', visibility: 'visible' })
        }
    }
}
