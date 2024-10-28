export default {
    scope: undefined,
    runner: undefined,
    maze: [],
    setupDOM: function (canvasElement, outputElement, scope) {
        this.maze = this.DATA['preset'].maze
        this.canvasElement = canvasElement
        const maze = document.createElement('div')
        maze.id = 'theMaze'
        this.canvasElement.append(maze)


        this.scope = scope;
        this.setupUI(scope)
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.runner = runner
        this.scope = scope
        this.canvasElement = canvasElement

        // this.runCommand([{"value":200,"command":"delay"},{"value":1,"command":"right"},{"value":1,"command":"right"},{"value":1,"command":"right"},{"value":1,"command":"right"},{"value":1,"command":"down"},{"value":1,"command":"down"},{"value":1,"command":"left"},{"value":1,"command":"left"},{"value":1,"command":"left"},{"value":1,"command":"down"},{"value":1,"command":"down"},{"value":1,"command":"down"},{"value":1,"command":"down"},{"value":1,"command":"left"},{"value":1,"command":"left"},{"value":1,"command":"left"},{"value":1,"command":"up"},{"value":1,"command":"up"},{"value":1,"command":"right"},{"value":1,"command":"up"},{"value":1,"command":"up"},{"value":1,"command":"left"},{"value":1,"command":"up"},{"value":1,"command":"up"},{"value":1,"command":"up"}], 0)
    },
    update: function (txt, json, canvasElement, outputElement) {
        console.log("UPDATE", JSON.stringify(json))
        this.canvasElement = canvasElement
        this.delay = 100;
        this.generateMaze(this.scope)
        
        //console.log("UPDATE", JSON.stringify(json))
        this.runCommand(json, 0)
    },
    addArgumentsTo(args) {
        const w = this.maze[0].length
        const h = this.maze.length

        args[0] = "" + (+this.DATA['preset'].col)
        args[1] = "" + (+this.DATA['preset'].row)
        args[2] = "" + w
        args[3] = "" + h

        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                args[r * w + c + 4] = this.maze[r][c] ? "1" : "0"
            }
        }
    },
    reset(canvasElement) {
    },
    showResults(json) {
        this.showPath(json.path)
    },
    //custom helpers --------------------------------------------------------------------------------------------------------------------------------    
    setupUI: function (scope) {
        this.generateMaze(scope)
    },
    pos: {x:0, y:0},    
    generateMaze(scope) {
        if (scope === undefined) scope = this.scope
        const div = scope.find('#theMaze')
        const w = this.maze[0].length 
        const h = this.maze.length 
        const startX = this.DATA['preset'].col
        const startY = this.DATA['preset'].row
        this.pos.x = startX
        this.pos.y = startY

        let rows = ''

        //generate table
        for (let r = 0; r < h; r++) {
            let columns = ''
            for (let c = 0; c < w; c++) {
               columns += `<td id="maze_${r }_${c }"><div></div></td>`
            }
            rows += `<tr id="maze_${r }">${columns}</tr>`
        }
        div.html(`<table id="maze">${rows}</table>`)
        const self = this;
        function wallPattern(r, c) {
            if (r < 0 || r >= h || c < 0 || c >= w) {
                return '0';
            }
            if (self.maze[r] === undefined) self.maze[r] = []
            return self.maze[r][c] ? '1' : '0'
        }

        function setWallImage(r, c) {
            if (r < 0 || r >= h || c < 0 || c >= w) {
                return;
            }

            if (self.maze[r] === undefined) self.maze[r] = []
            const td = div.find(`#maze_${r}_${c}`);

            if (self.maze[r][c]) {
                const pattern = wallPattern(r - 1, c) + wallPattern(r, c + 1) + wallPattern(r + 1, c) + wallPattern(r, c - 1)
                 td.css('background-image', `url(../../common/scene/maze/img/wall/${pattern}.png)`)
            } else {
                td.css('background-image', 'none')
            }
        }

        // hook up events
        for (let r = 0; r < h; r++) {
            if (self.maze[r] === undefined) self.maze[r] = []
            for (let c = 0; c < w; c++) {
                const td = div.find(`#maze_${r}_${c}`);
                if (this.maze[r][c]) {
                    td.addClass('wall')
                    setWallImage(r, c)
                }
                if (r === startY && c === startX) {
                    td.addClass('start')
                    td.addClass('player')
                }
            }
        }
    },
    delay: 100,
    runCommand(json, idx) {
        const cmd = json[idx]
        if (cmd===undefined) return;

        const pushError = (msg) => {
            console.error(msg)
        }

        const move = (dx, dy) =>{
            const now = this.scope.find(`#maze_${this.pos.y}_${this.pos.x}`);
            const nPos = {x: this.pos.x + dx, y: this.pos.y + dy}
            const next = this.scope.find(`#maze_${nPos.y}_${nPos.x}`);

            if (next.length === 0) pushError(`Invalid move to ${nPos.x}/${nPos.y}`)
            else if (next.hasClass('wall')) {
                pushError(`Invalid move to wall at ${nPos.x}/${nPos.y}`)
                next.addClass('visited')
            } else {
                now.removeClass('player')
                next.addClass('player')
                now.addClass('visited')
                this.pos = nPos
            }
        }

        if (cmd.command === 'delay') {
            this.delay = cmd.value
        } else if (cmd.command === 'right') { 
            move(1, 0)
        } else if (cmd.command === 'left') {
            move(-1, 0)
        } else if (cmd.command === 'up') {
            move(0, -1)
        } else if (cmd.command === 'down') {
            move(0, 1)
        }

        setTimeout(() => {

            this.runCommand(json, idx + 1)

        }, this.delay)
    }
}