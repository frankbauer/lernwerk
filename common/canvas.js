export default {
    scope: undefined,
    mainCanvas: undefined,
    commandDelay: 200,
    commandTimer: undefined,
    objects: {},
    setupDOM: function (canvasElement, outputElement, scope) {
        canvasElement.html('')
        this.scope = scope
        this.resetCanvas(canvasElement)
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        this.resetCanvas(canvasElement)

        // this.runCommand([
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6000000000000001, "ay": 1.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/tree.spring.png", "id": 1 } },
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6000000000000001, "ay": 1.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/tree.summer.png", "id": 2 } },
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6000000000000001, "ay": 1.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/tree.autumn.png", "id": 3 } },
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6000000000000001, "ay": 1.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/tree.winter.png", "id": 4 } },
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6000000000000001, "ay": 1.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/tree.lateautumn.png", "id": 5 } },
        //     { "command": "new", "object": { "sx": 0.5, "sy": 0.5, "ax": 0.6500000000000001, "ay": 1.2000000000000002, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/pow.png", "id": 6 } },
        //     { "command": "new", "object": { "sx": 1.0, "sy": 1.0, "ax": 0.0, "ay": 0.0, "type": "Image", "name": "..\/..\/common\/scene\/tree\/img\/stage.png", "id": 7 } },
        //     { "sx": 1.0, "sy": 1.0, "x": 0, "y": 0, "command": "drawImage", "object": { "type": "Image", "id": 7 } },
        //     { "sx": 1.0, "sy": 1.0, "x": 400, "y": 430, "command": "drawImage", "object": { "type": "Image", "id": 6 } },
        //     { "sx": 0.75, "sy": 0.75, "x": 650, "y": 410, "command": "drawImage", "object": { "type": "Image", "id": 4 } },
        //     { "sx": 0.75, "sy": 0.75, "x": 150, "y": 410, "command": "drawImage", "object": { "type": "Image", "id": 5 } },
        // ], 0)
    },
    addArgumentsTo(args) {
        if (this.scope) {
            let nr = 0
            while (true) {
                const input = $(`input#args_${nr}`)
                if (input.length === 0) break
                console.log("INPUT", input, input.val())
                args[nr] = (`${input.val()}`)
                nr++
            }
        }
    },
    reset(canvasElement) {
        this.resetCanvas(canvasElement)
    },
    update: function (txt, json, canvasElement, outputElement) {
        this.resetCanvas(canvasElement)
        this.runCommand(json, 0)
    },
    //custom functions
    resetCanvas: function (canvasElement) {

        if (this.commandTimer !== undefined) {
            clearTimeout(this.commandTimer)
            this.commandTimer = undefined
        }

        this.objects = {}

        const mainCanvas = $(document.createElement('canvas'))
        mainCanvas.attr('id', 'main_canvas')
        canvasElement.html('')
        canvasElement.append(mainCanvas)
        canvasElement.css('border', 'none')

        this.mainCanvas = mainCanvas

        const retinaScalingFactor = window.devicePixelRatio || 1;


        const scale = parseFloat(mainCanvas.css('--canvas-scale'))
        const width = parseFloat(mainCanvas.css('--width'))
        const height = parseFloat(mainCanvas.css('--height'))
        //console.log('DEBUG: Retina Scaling Factor:', retinaScalingFactor, scale, width, height);

        // Set the canvas width and height to account for the retina scaling factor
        mainCanvas.css("width", Math.round(width * scale) + "px");
        mainCanvas.css("height", Math.round(height * scale) + "px");
        mainCanvas.attr("width", Math.round(width * retinaScalingFactor) + "px");
        mainCanvas.attr("height", Math.round(height * retinaScalingFactor) + "px");


        // Scale the context to ensure the drawing operations are also scaled
        const context = mainCanvas[0].getContext('2d');
        context.scale(retinaScalingFactor, retinaScalingFactor);

        context.imageSmoothingEnabled = false;
        context.imageSmoothingQuality = 'high';

    },
    runCommand(commands, idx) {
        this.commandTimer = undefined
        if (idx < 0 || idx >= commands.length) return
        const cmd = commands[idx]
        const cmdName = cmd.command
        let hasDelay = true
        let callNext = true

        const self = this;
        const next = () => self.runCommand(commands, idx + 1)


        if (cmdName === 'new') {
            hasDelay = false
            const obj = cmd.object
            this.objects[cmd.object.id] = obj
            const newObjElement = $(document.createElement('div'))
            newObjElement.attr('id', obj.id)
            newObjElement.addClass(obj.type.toLowerCase())
            if (obj.type === 'Image') {
                callNext = false
                obj.img = new Image()
                obj.img.src = obj.name

                obj.img.onload = function () {
                    next()
                }
            }
        } else if (cmdName === 'drawImage') {
            const obj = this.objects[cmd.object.id]
            if (obj === undefined) console.error('Object not found', cmd.object.id)

            //console.log("DEBUG", cmd, obj)

            const ctx = self.mainCanvas[0].getContext('2d')

            //draw the image flname at x, y on the mainCanvas and scale the image by scale
            const iw = Math.round(obj.img.width * obj.sx * cmd.sx);
            const ih = Math.round(obj.img.height * obj.sy * cmd.sy);
            ctx.drawImage(obj.img, Math.round(cmd.x - iw * obj.ax), Math.round(cmd.y - ih * obj.ay), iw, ih)

            // // show a blue square at the x, y position
            // ctx.fillStyle = 'blue';
            // ctx.fillRect(Math.round(cmd.x) - 5, Math.round(cmd.y) - 5, 10, 10);
        }

        if (callNext) {
            this.commandTimer = setTimeout(() => {
                next()
            }, hasDelay ? this.commandDelay : 10)
        }
    }
}