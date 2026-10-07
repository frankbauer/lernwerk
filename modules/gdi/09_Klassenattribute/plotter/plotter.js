export default {
    // Playground (v102) zur Aufgabe "Funktionsplotter", portiert vom v101-Playground (d3) der StudOn-Aufgabe.
    // Zeigt die von Plotter.sendeErgebnis() geschickten Messpunkte ({ points: [[x, y], ...], callCount })
    // als Liniendiagramm (Chart.js, dataDomLibs: chart-3.6.0). Weichen die Werte von den Sollwerten ab,
    // wird zusätzlich der Sollwert-Graph in Grau angezeigt.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    chart: undefined,

    // Sollwerte für die Parameter aus main: f(x, -12, 0.01) mit A = 100 und B = 10
    expected: function (x) {
        return 100 * Math.sqrt(Math.abs(x - 0.01 * 144)) + 0.01 * Math.abs(-12 + 10)
    },

    setupDOM: function () {
        this.canvasElement.css({ border: 'none', 'box-shadow': 'none', 'background-color': 'transparent' })
        this.canvasElement.hide()
    },

    init: function () { },

    addArgumentsTo(args) { },

    reset() { },

    update: function (txt, json) {
        if (json === undefined || json === null || !Array.isArray(json.points) || json.points.length === 0) {
            this.canvasElement.hide()
            return
        }
        const points = json.points.map(p => ({ x: +p[0], y: p[1] === null ? NaN : +p[1] }))
        const expected = points.map(p => ({ x: p.x, y: this.expected(p.x) }))
        const deviates = points.some((p, i) => !(Math.abs(p.y - expected[i].y) < 1e-3))
        this.draw(points, deviates ? expected : [])
    },

    draw: function (points, expected) {
        this.canvasElement.empty()
        const canvas = $('<canvas></canvas>').css({ width: '100%', height: '100%' })
        this.canvasElement.append(canvas)
        this.canvasElement.show()
        if (this.chart) this.chart.destroy()
        // Liegt der Playground in einem gerade nicht sichtbaren Reiter, hat er beim Zeichnen die Größe 0.
        if (this.resizeObserver === undefined && window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => { if (this.chart) this.chart.resize() })
            this.resizeObserver.observe(this.canvasElement[0])
        }
        this.chart = new Chart(canvas[0], {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Ihr Ergebnis',
                    data: points,
                    borderColor: '#ffab00',
                    backgroundColor: '#ffab00',
                    borderWidth: 3,
                    pointRadius: 4,
                    tension: 0.3,
                    order: 0
                }, {
                    label: 'Sollwert',
                    data: expected,
                    borderColor: '#9aa3b5',
                    backgroundColor: '#9aa3b5',
                    borderWidth: 6,
                    pointRadius: 5,
                    tension: 0.3,
                    order: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                animation: { duration: 400 },
                parsing: false,
                plugins: {
                    legend: { display: expected.length > 0 },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.dataset.label + ': x = ' + ctx.parsed.x.toFixed(2) + ', y = ' + ctx.parsed.y.toFixed(3)
                        }
                    }
                },
                scales: {
                    x: { type: 'linear' },
                    y: { type: 'linear' }
                }
            }
        })
    },
}
