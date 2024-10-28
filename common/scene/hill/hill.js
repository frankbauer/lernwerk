export default {
    scope: undefined,
    factory: undefined,
    commandDelay: 200,
    commandTimer: undefined,
    renderTimer: undefined,
    objects: {},
    setupDOM: function (canvasElement, outputElement, scope) {
        canvasElement.html('')
        this.scope = scope
        this.resetFloatingWorld(canvasElement)
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        this.resetFactory(canvasElement)

        // this.runCommand([{ "command": "new", "object": { "type": "Hill", "id": 1 } }, { "command": "new", "object": { "treeStyle": 14, "type": "Tree", "id": 2 } }, { "command": "addTree", "tree": { "type": "Tree", "id": 2 }, "object": { "type": "Hill", "id": 1 } }, { "command": "new", "object": { "treeStyle": 4, "type": "Tree", "id": 3 } }, { "command": "addTree", "tree": { "type": "Tree", "id": 3 }, "object": { "type": "Hill", "id": 1 } }, { "command": "new", "object": { "treeStyle": 4, "type": "Tree", "id": 4 } }, { "command": "addTree", "tree": { "type": "Tree", "id": 4 }, "object": { "type": "Hill", "id": 1 } }, { "command": "new", "object": { "treeStyle": 15, "type": "Tree", "id": 5 } }, { "command": "addTree", "tree": { "type": "Tree", "id": 5 }, "object": { "type": "Hill", "id": 1 } }], 0)
    },
    addArgumentsTo(args) {
    },
    reset(canvasElement) {
        this.resetFactory(canvasElement)
    },
    update: function (txt, json, canvasElement, outputElement) {
        this.resetFactory(canvasElement)
        this.runCommand(json, 0)
    },
    render: function (passedTime, delta, width, height, scale) {
        Object.keys(this.objects).map(k => this.objects[k]).filter(o => o.type === 'Robot' && o.moving === true).forEach(robot => {
            const nx = delta * robot.speed + robot.x
            console.log('render', robot.x, nx, width, robot.speed)
            if (nx > width || nx < 0) {
                robot.speed *= -1
                robot.lastChange = passedTime
            } else if (Math.random() < 0.03) {
                if (robot.lastChange === undefined || passedTime - robot.lastChange > 0.8) {
                    robot.speed *= -1
                    robot.lastChange = passedTime
                }
            }
            robot.x = nx
            robot.element.css('transform', `translate(${scale * robot.x}px, ${scale * robot.y}px)`)
        })
    },
    //custom functions
    resetFactory: function (canvasElement) {
        if (this.renderTimer !== undefined) {
            clearInterval(this.renderTimer)
            this.renderTimer = undefined
        }
        if (this.commandTimer !== undefined) {
            clearTimeout(this.commandTimer)
            this.commandTimer = undefined
        }

        this.objects = {}

        const factory = $(document.createElement('div'))
        factory.attr('id', 'nature')

        canvasElement.html('')
        canvasElement.append(factory)
        canvasElement.css('border', 'none')

        this.factory = factory
    },
    runCommand(commands, idx) {
        //get css var called --width
        this.commandTimer = undefined
        if (idx < 0 || idx >= commands.length) return
        const cmd = commands[idx]
        const cmdName = cmd.command
        let hasDelay = true

        const self = this;

        if (cmdName === 'new') {
            const obj = cmd.object
            this.objects[cmd.object.id] = obj
            const newObjElement = $(document.createElement('div'))
            newObjElement.attr('id', obj.id)
            newObjElement.addClass(obj.type.toLowerCase())

            if (obj.type === 'Hill') {
                newObjElement.addClass("sunny")
                this.factory.append(newObjElement)
                this.factory.addClass('with-hill')

                obj.element = newObjElement
                obj.trees = []
            } else if (obj.type === 'Tree') {
                newObjElement.addClass(`t${obj.treeStyle}`)
                newObjElement.addClass("small transparent")
                hasDelay = false
                const scale = parseFloat(this.factory.css('--hill-scale'))
                const width = parseFloat(this.factory.css('--width'))
                const height = parseFloat(this.factory.css('--height'))

                const controlElement = $(document.createElement('div'))
                controlElement.addClass('control')
                controlElement.attr('data-id', obj.id)
                controlElement.attr('data-type', obj.type)
                controlElement.append(newObjElement)

                obj.treeElement = newObjElement
                obj.element = controlElement
                obj.x = Math.floor(Math.random() * (width - 200)) + 100
                obj.y = Math.floor(Math.random() * 110 + (height - 120))
                obj.element.css('transform', `translate(${obj.x}px, ${obj.y}px)`)
                obj.element.css('z-index', obj.y)
                obj.treeElement.css('z-index', obj.y)
            }
        } else if (cmdName === 'addTree') {
            const tree = this.objects[cmd.tree.id]
            const hill = this.objects[cmd.object.id]
            hill.trees.push(tree)
            hill.element.append(tree.element)
            setTimeout(() => {
                tree.treeElement.removeClass("small")
                tree.treeElement.removeClass("transparent")
            }, 10)
        }

        this.commandTimer = setTimeout(() => {
            this.runCommand(commands, idx + 1)
        }, hasDelay ? this.commandDelay : 10)
    }
}