export default {
    mainCanvas: undefined,
    commandDelay: 200,
    commandTimer: undefined,
    objects: {},
    // everything drawn so far, redrawn every frame while an image pops in
    drawn: [],
    animationFrame: undefined,
    setupDOM: function () {
        this.canvasElement.html('')
        this.resetCanvas(this.canvasElement)
    },
    init: function () {
        this.resetCanvas(this.canvasElement)

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
    // Field writes like `mitte.jahreszeit = "fruehling";` cannot be observed from Java, so for the run (the editor
    // stays unchanged) a render of the scene is appended to every line in the calling code that creates a tree or
    // assigns a tree's season. The scene then shows each step: new trees pop in, changed trees flip to their new
    // image (see redraw). Appended on the same line, so line numbers in compiler messages stay right. Code of the
    // Baum class itself (its constructors and methods) is left alone.
    alterCodeBeforeRun(code) {
        const RENDER = ' Graphics2D.instance().render();'
        const v = String.raw`\w+(?:\[[^\]]*\])?(?:\.\w+(?:\[[^\]]*\])?)*`   // a, a.b, a[i], a[i].b
        const step = new RegExp(String.raw`^\s*(?:[\w<>\[\]]+\s+)?${v}\s*=\s*new\s+Baum\s*\(.*\)\s*;\s*(\/\/.*)?$` +
            String.raw`|^\s*(?!this\.)${v}\.jahreszeit\s*=.*;\s*(\/\/.*)?$`)
        for (const entry of code) {
            if (/\bclass\s+Baum\b/.test(entry.content) || !/\bBaum\b|\.jahreszeit\b/.test(entry.content)) continue
            const lines = entry.content.split('\n')
            let changed = false
            const out = lines.map((line) => {
                if (!step.test(line)) return line
                changed = true
                const comment = line.indexOf('//')
                return comment >= 0 && !/"[^"]*\/\//.test(line)
                    ? line.slice(0, comment).trimEnd() + RENDER + ' ' + line.slice(comment)
                    : line.trimEnd() + RENDER
            })
            if (changed) entry.set(out.join('\n'))
        }
    },
    addArgumentsTo(args) {
        let nr = 0
        while (true) {
            const input = this.scope.find(`input#args_${nr}`)
            if (input.length === 0) break
            console.log("INPUT", input, input.val())
            args[nr] = (`${input.val()}`)
            nr++
        }
    },
    reset() {
        this.resetCanvas(this.canvasElement)
    },
    update: function (txt, json) {
        this.resetCanvas(this.canvasElement)
        this.runCommand(json, 0)
    },
    //custom functions
    resetCanvas: function (canvasElement) {

        if (this.commandTimer !== undefined) {
            clearTimeout(this.commandTimer)
            this.commandTimer = undefined
        }

        this.objects = {}
        this.drawn = []
        if (this.animationFrame !== undefined) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = undefined
        }

        const mainCanvas = $(document.createElement('canvas'))
        mainCanvas.attr('id', 'main_canvas')
        // ohne Textalternative, aber für Screenreader zumindest als Grafik benannt
        mainCanvas.attr({ role: 'img', 'aria-label': 'Grafische Ausgabe des Programms' })
        canvasElement.html('')
        canvasElement.append(mainCanvas)
        canvasElement.css('border', 'none')

        this.mainCanvas = mainCanvas

        const retinaScalingFactor = window.devicePixelRatio || 1;


        const scale = parseFloat(mainCanvas.css('--canvas-scale'))
        const width = parseFloat(mainCanvas.css('--canvas-width'))
        const height = parseFloat(mainCanvas.css('--canvas-height'))
        //console.log('DEBUG: Retina Scaling Factor:', retinaScalingFactor, scale, width, height);

        // Set the canvas width and height to account for the retina scaling factor
        mainCanvas.css("width", Math.round(width * scale) + "px");
        mainCanvas.css("height", Math.round(height * scale) + "px");
        mainCanvas.attr("width", Math.round(width * retinaScalingFactor) + "px");
        mainCanvas.attr("height", Math.round(height * retinaScalingFactor) + "px");


        // Scale the context to ensure the drawing operations are also scaled
        const context = mainCanvas[0].getContext('2d');
        context.scale(retinaScalingFactor, retinaScalingFactor);

        // smooth: the scene images are drawn scaled down, nearest-neighbour sampling makes their edges jagged
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

    },
    // Pop-in of the scene pieces, tuned in CSS (e.g. tree.css): the piece grows from its anchor (the tree's foot)
    // with an overshoot and wobbles around it while settling.
    //   --cb-image-pop-duration  e.g. 700ms     --cb-image-pop-wiggle  e.g. 7deg (0 to switch the wobble off)
    // An object whose image changes turns like a paper card: the old image folds away, the new one unfolds.
    //   --cb-image-change-duration  e.g. 800ms
    popSettings() {
        const css = (name, fallback) => parseFloat(this.mainCanvas.css(name)) || fallback
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        return {
            duration: reduced ? 0 : css('--cb-image-pop-duration', 700),
            wiggle: css('--cb-image-pop-wiggle', 7) * Math.PI / 180,
            change: reduced ? 0 : css('--cb-image-change-duration', 800),
        }
    },
    redraw() {
        const canvas = this.mainCanvas[0]
        const ctx = canvas.getContext('2d')
        const pop = this.popSettings()
        const now = performance.now()
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
        let animating = false
        for (const item of this.drawn) {
            animating = this.drawItem(ctx, item, now, pop) || animating
        }
        if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame)
        this.animationFrame = animating ? requestAnimationFrame(() => this.redraw()) : undefined
    },
    drawItem(ctx, item, now, pop) {
        const { cmd, start, kind } = item
        const duration = kind === 'flip' ? pop.change : pop.duration
        const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1
        // flip: the first half folds the old image to its edge, the second half unfolds the new one
        const obj = kind === 'flip' && t < 0.5 ? item.from : item.obj
        //draw the image at x, y scaled by the image's and the command's scale, placed by the image's anchor
        const iw = Math.round(obj.img.width * obj.sx * cmd.sx);
        const ih = Math.round(obj.img.height * obj.sy * cmd.sy);
        ctx.save()
        if (t < 1) {
            ctx.translate(cmd.x, cmd.y)
            if (kind === 'flip') {
                const fold = Math.abs(Math.cos(t * Math.PI))          // 1 -> 0 -> 1
                const lift = Math.sin(t * Math.PI)                       // up while turning
                ctx.translate(0, -0.06 * ih * lift)
                ctx.scale(Math.max(fold, 0.02), 1 + 0.06 * lift)
            } else {
                // easeOutBack for the size, a decaying swing for the angle, both around the anchor point
                const c = 1.9
                const grow = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
                ctx.rotate(pop.wiggle * Math.sin(t * Math.PI * 3) * (1 - t))
                ctx.scale(Math.max(grow, 0.001), Math.max(grow, 0.001))
            }
            ctx.translate(-cmd.x, -cmd.y)
        }
        // images marked with a shadow get the CSS drop-shadow from --cb-image-shadow (e.g. tree.css): as a canvas
        // filter, or where canvas filters are missing (Safari before 18) with the canvas shadow properties
        const shadow = obj.shadow ? this.mainCanvas.css('--cb-image-shadow')?.trim() : ''
        if (shadow) {
            const m = shadow.match(/^(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\s+(.+)$/)
            if (typeof ctx.filter === 'string') {
                ctx.filter = `drop-shadow(${shadow})`
            } else if (m) {
                // shadow offsets ignore the context transform: scale them to device pixels by hand
                const dpr = window.devicePixelRatio || 1
                ctx.shadowOffsetX = parseFloat(m[1]) * dpr
                ctx.shadowOffsetY = parseFloat(m[2]) * dpr
                ctx.shadowBlur = parseFloat(m[3]) * dpr
                ctx.shadowColor = m[4]
            }
        }
        ctx.drawImage(obj.img, Math.round(cmd.x - iw * obj.ax), Math.round(cmd.y - ih * obj.ay), iw, ih)
        ctx.restore()
        return t < 1
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
                // '@assets/...' points into the bundled asset folder, wherever it is installed
                obj.img.src = obj.name.startsWith('@assets/')
                    ? (self.ASSETS_URL ?? 'assets/') + obj.name.substring('@assets/'.length)
                    : obj.name

                obj.img.onload = function () {
                    next()
                }
            }
        } else if (cmdName === 'drawImage') {
            const obj = this.objects[cmd.object.id]
            if (obj === undefined) console.error('Object not found', cmd.object.id)

            // an image of an object drawn before (same key, see Graphics2D.render) replaces it: unchanged it is
            // skipped without delay, a new image flips in; other images marked with a shadow pop in (drawItem)
            const now = performance.now()
            const prev = cmd.key !== undefined ? this.drawn.find((it) => it.cmd.key === cmd.key) : undefined
            if (prev && prev.obj === obj && prev.cmd.x === cmd.x && prev.cmd.y === cmd.y) {
                hasDelay = false
            } else if (prev) {
                Object.assign(prev, { from: prev.obj, obj, cmd, start: now, kind: 'flip' })
                hasDelay = true
                this.extraDelay = this.popSettings().change
            } else {
                this.drawn.push({ obj, cmd, start: obj.shadow ? now : -Infinity, kind: 'pop' })
            }
            this.redraw()
        }

        if (callNext) {
            this.commandTimer = setTimeout(() => {
                next()
            }, hasDelay ? this.commandDelay + (this.extraDelay || 0) : 10)
            this.extraDelay = 0
        }
    }
}