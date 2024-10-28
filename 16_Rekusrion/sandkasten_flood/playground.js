export default {
    scope: undefined,
    base: [
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    ],
    cells: [],
    setupDOM: function (canvasElement, outputElement, scope) {
        this.scope = scope

    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        canvasElement.html('')
        canvasElement.append(this.createTable(this.base))
    },
    addArgumentsTo(args) {
        args[0] = `${this.base.length}`
        args[1] = `${this.base[0].length}`
        let p = 2;
        for (let r = 0; r < this.base.length; r++) {
            const row = this.base[r]
            for (let c = 0; c < row.length; c++) {
                args[p++] = `${+row[c]}`
            }
        }
    },
    reset(canvasElement) { },
    update: function (txt, json, canvasElement, outputElement) {
        canvasElement.html('')
        canvasElement.append(this.createTable(this.base))
        this.delay = 100;
        this.testCells = []
        this.runCommand(json, 0)
    },
    createTable: function (elements) {
        this.cells = []
        let table = $(document.createElement('table'))
        for (let r = 0; r < elements.length; r++) {
            const row = elements[r]
            const cellRow = []
            this.cells.push(cellRow)
            let tr = $(document.createElement('tr'))
            for (let c = 0; c < row.length; c++) {
                let td = $(document.createElement('td'))
                if (row[c] === 0) {
                    td.addClass('empty_cell')
                } else {
                    td.addClass('filled_cell')
                    td.addClass('source_cell')
                }
                tr.append(td)
                cellRow.push(td)
            }
            table.append(tr)
        }
        this.cells[3][10].addClass('start_cell')
        return table;
    },
    testCells: [],
    delay: 100,
    runCommand(json, idx) {
        let delay = 100;
        if (idx >= json.length) {
            for (const c of this.testCells) {
                c.removeClass('tested')
            }
            this.testCells = []
            return;
        }
        const cmd = json[idx]

        if (cmd.command === 'delay') {
            this.delay = cmd.value
        } else if (cmd.r >= 0 && cmd.r < this.cells.length && cmd.c >= 0 && cmd.c < this.cells[cmd.r].length) {
            if (cmd.command === 'test') {
                const c = this.cells[cmd.r][cmd.c]
                if (c !== undefined) {
                    c.addClass('tested')
                    this.testCells.push(c)
                }
            } else if (cmd.command === 'fill') {
                for (const c of this.testCells) {
                    c.removeClass('tested')
                }
                this.testCells = []
                this.cells[cmd.r][cmd.c].removeClass('empty_cell')
                this.cells[cmd.r][cmd.c].addClass('filled_cell')
            }
        }

        setTimeout(() => {

            this.runCommand(json, idx + 1)

        }, this.delay)
    }
}