export default {
    // Playground (v102) zur Aufgabe "Kraftwerke abschalten", portiert vom v101-Playground der StudOn-Aufgabe.
    // Liest die benötigte Leistung aus dem Eingabefeld #arginput (Programmargument args[0]), zeigt die
    // Kraftwerke als Tabelle in #plants und das Ergebnis (JSON von MainOverride) als gestapeltes
    // Balkendiagramm (Chart.js, dataDomLibs: chart-3.6.0).
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    powerPlants: [600, 12, 35, 75, 200, 20, 400, 1400, 64, 1000, 18, 13, 100],
    colors: ['#391817', '#4D242C', '#5D3346', '#654562', '#645B7E', '#587396', '#428BA7', '#22A3AF', '#15BAAD', '#40CFA1', '#73E28F', '#ABF27B', '#E7FE6A'],
    chart: undefined,

    setupDOM: function () {
        this.canvasElement.css({ border: 'none', 'box-shadow': 'none', 'background-color': 'transparent' })
    },

    init: function () {
        this.registerLinePlugin()
        this.buildTable()
        const sum = this.powerPlants.reduce((a, b) => a + b, 0)
        this.draw({ needed: this.neededInput(), produced: sum })

        // Enter im Eingabefeld soll die Seite nicht neu laden
        this.scope.find('#arginput').on('keydown', e => { if (e.keyCode === 13) e.preventDefault() })
    },

    addArgumentsTo(args) {
        args[0] = '' + this.neededInput()
    },

    reset() { },

    update: function (txt, json) {
        if (json === undefined || json === null || typeof json !== 'object') return
        if (this.chart === undefined) this.draw(json)
        else this.updateChart(json)
    },

    neededInput: function () {
        return +String(this.scope.find('#arginput').val()).trim()
    },

    color: function (id) {
        return this.colors[Math.max(0, Math.min(id, this.colors.length - 1))]
    },

    // Chart.js-Plugin, das senkrechte Linien für benötigte und verfügbare Leistung zeichnet (nur einmal registrieren)
    registerLinePlugin: function () {
        if (window.__gdiDrawLineRegistered) return
        window.__gdiDrawLineRegistered = true
        Chart.register({
            id: 'drawLine',
            afterDraw: function (chart, args, allOptions) {
                const { ctx } = chart
                const scaleY = chart.scales['y']
                const scaleX = chart.scales['x']
                if (!Array.isArray(allOptions)) return
                allOptions.forEach(options => {
                    const x = scaleX.getPixelForValue(options.value)
                    const bottom = scaleY.bottom - scaleY.top
                    let align = options.align
                    let tx = align === 'right' ? -2 : 2
                    const ty = options.baseline === 'bottom' ? bottom - 2 : 2
                    if (align === 'left' && scaleX.right - x < 150) {
                        align = 'right'
                        tx = -2
                    }
                    ctx.save()
                    ctx.translate(x, scaleY.top)
                    ctx.lineWidth = options.lineWidth
                    ctx.strokeStyle = options.color
                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    ctx.lineTo(0, bottom)
                    ctx.stroke()
                    ctx.font = options.font
                    ctx.fillStyle = options.color
                    ctx.textBaseline = options.baseline
                    ctx.textAlign = align
                    ctx.fillText(options.label, tx, ty)
                    ctx.restore()
                })
            }
        })
    },

    buildTable: function () {
        const target = this.scope.find('#plants')
        if (target.length === 0 || target.children().length > 0) return
        const table = $('<table class="gdi-plants"></table>')
        const idRow = $('<tr><th>ID</th></tr>')
        const powerRow = $('<tr><th>Leistung in MW</th></tr>')
        this.powerPlants.forEach((power, idx) => {
            idRow.append($('<td></td>').text(idx).css({
                'background-color': this.color(idx), color: idx < 9 ? 'white' : 'black', 'font-weight': 'bold'
            }))
            powerRow.append($('<td></td>').text(power).css('border', '1px dashed ' + this.color(idx)))
        })
        table.append(idRow, powerRow)
        target.append(table)
    },

    buildData: function (json) {
        const disabled = (json.off || []).map(o => +o.id)
        return {
            labels: ['Verfügbar', 'Offline'],
            datasets: this.powerPlants.map((power, idx) => {
                const off = disabled.indexOf(idx) >= 0
                return {
                    data: [off ? 0 : power, off ? power : 0],
                    label: 'Kraftwerk ' + idx,
                    backgroundColor: this.color(idx)
                }
            })
        }
    },

    draw: function (json) {
        this.canvasElement.empty()
        const canvas = $('<canvas></canvas>').css({ width: '100%', height: '100%' })
        this.canvasElement.append(canvas)
        this.canvasElement.show()
        // Liegt der Playground in einem gerade nicht sichtbaren Reiter, hat er beim Zeichnen die Größe 0.
        // Sobald der Reiter sichtbar wird, muss das Diagramm daher neu skaliert werden.
        if (this.resizeObserver === undefined && window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => { if (this.chart) this.chart.resize() })
            this.resizeObserver.observe(this.canvasElement[0])
        }
        this.chart = new Chart(canvas[0], {
            type: 'bar',
            data: this.buildData(json),
            options: {
                maintainAspectRatio: false,
                animation: { duration: 600 },
                plugins: {
                    legend: false,
                    title: false,
                    drawLine: [{
                        value: +json.needed, lineWidth: 1, color: '#E42256', font: 'bold 12px Roboto',
                        label: 'Benötigte Leistung', align: 'right', baseline: 'top'
                    }, {
                        value: +json.produced, lineWidth: 1, color: '#00B1B0', font: 'bold 12px Roboto',
                        label: 'Verfügbare Leistung', align: 'left', baseline: 'bottom'
                    }]
                },
                indexAxis: 'y',
                scales: {
                    x: { stacked: true, beginAtZero: true },
                    y: { stacked: true }
                }
            }
        })
    },

    updateChart: function (json) {
        const fresh = this.buildData(json)
        this.chart.data.datasets.forEach((ds, idx) => { ds.data = fresh.datasets[idx].data })
        this.chart.options.plugins.drawLine[0].value = +json.needed
        this.chart.options.plugins.drawLine[1].value = +json.produced
        this.chart.update()
    },
}
