export default {
    scope: undefined,
    factory: undefined,
    commandDelay: 500,
    commandTimer: undefined,
    renderTimer: undefined,
    objects: {},
    setupDOM: function (canvasElement, outputElement, scope) {
        canvasElement.html('')
        this.scope = scope
        this.resetFactory(canvasElement)
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        this.resetFactory(canvasElement)

        // this.runCommand([
        //     { "command": "new", "object": { "style": "main", "visible": false, "type": "Room", "id": 1 } },
        //     { "visible": true, "command": "show", "object": { "type": "Room", "id": 1 } },
        //     { "command": "new", "object": { "robotType": 1, "type": "Robot", "id": 2 } },
        //     { "x": 394, "y": 424, "command": "setLocation", "object": { "type": "Robot", "id": 2 } },
        //     { "command": "setRoom", "room": { "type": "Room", "id": 1 }, "object": { "type": "Robot", "id": 2 } },
        //     { "command": "setMoving", "moving": true, "object": { "type": "Robot", "id": 2 } }
        // ], 0)
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
        factory.attr('id', 'factory')

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
            hasDelay = false
            const obj = cmd.object
            this.objects[cmd.object.id] = obj
            const newObjElement = $(document.createElement('div'))
            newObjElement.attr('id', obj.id)
            newObjElement.addClass(obj.type.toLowerCase())


            if (obj.type === 'Room') {
                newObjElement.addClass(obj.style.toLowerCase())
                if (!obj.visible) {
                    newObjElement.addClass('transparent')
                    hasDelay = false
                }
                newObjElement.addClass('animated fast')

                obj.element = newObjElement
                obj.robots = []
                this.factory.append(newObjElement)
                this.factory.addClass('with-room')

                if (this.renderTimer === undefined) {
                    const now = new Date()
                    const scale = parseFloat(this.factory.css('--room-scale'))
                    const width = parseFloat(this.factory.css('--width'))
                    const height = parseFloat(this.factory.css('--height'))

                    let lastTime = 0;
                    this.renderTimer = setInterval(() => {
                        //call render with the passed time since now in seconds
                        const passedTime = (new Date() - now) / 1000
                        const delta = passedTime - lastTime;
                        lastTime = passedTime
                        this.render(passedTime, delta, width, height, scale)
                    }, 1000 / 25)
                }
            } else if (obj.type === 'Robot') {
                hasDelay = false
                newObjElement.addClass(`r${obj.robotType}`)

                const controlElement = $(document.createElement('div'))
                controlElement.addClass('control')
                controlElement.attr('data-id', obj.id)
                controlElement.attr('data-type', obj.type)
                controlElement.append(newObjElement)
                controlElement.addClass('transparent')
                controlElement.addClass('animated')

                obj.element = controlElement
                obj.room = undefined
                obj.moving = false
                obj.speed = Math.random() * 150 + 70;
            }
        } else if (cmdName === 'show') {
            const obj = this.objects[cmd.object.id]
            if (obj && obj.element) {
                if (cmd.visible) obj.element.removeClass('transparent')
                else obj.element.addClass('transparent')
            }
        } else if (cmdName === 'setLocation') {
            const obj = this.objects[cmd.object.id]
            if (obj && obj.element) {
                const scale = parseFloat(this.factory.css('--room-scale'))
                obj.x = cmd.x
                obj.y = cmd.y
                obj.element.css('transform', `translate(${scale * obj.x}px, ${scale * obj.y}px)`)
                if (obj.room === undefined) hasDelay = false
            }
        } else if (cmdName === 'setRoom') {
            const obj = this.objects[cmd.object.id]
            if (obj && obj.element) {
                console.log('setRoom', obj, cmd.room)
                //add to room
                const room = this.objects[cmd.room.id]
                if (room) {
                    if (obj.room === undefined) {
                        this.factory.append(obj.element)
                        setTimeout(() => obj.element.removeClass('transparent'), 10)
                    } else {
                        obj.room.robots = obj.room.robots.filter(r => r.id !== obj.id)
                    }

                    obj.room = room
                    room.robots.push(obj)
                }
            }
        } else if (cmdName === 'setMoving') {
            const obj = this.objects[cmd.object.id]
            if (obj && obj.element) {
                obj.moving = cmd.moving
            }
        }

        this.commandTimer = setTimeout(() => {
            this.runCommand(commands, idx + 1)
        }, hasDelay ? this.commandDelay : 10)
    }
}