export default {
    // Hologram playground for the simple_universe classes (05_Objekte/sandkasten_instanzen, sandkasten_sonnensystem).
    //
    // Universum, Sonne and Planet report through HoloScene (hidden Java helper) when they are created ("new"), changed
    // ("set": setRadius / setSpeed) or printed ("print"); the playground plays these commands back one after the other,
    // so the scene shows each step of the student's main method as a glowing hologram:
    //   layout "instances": one column per class (the class as the blueprint), every new object materialises in the
    //                       column of its class, labelled with the variables that reference it
    //   layout "system":    the sun in the middle, its planets orbit it - the orbit size follows setRadius (relative to
    //                       the largest radius of that sun's planets), the angular speed follows setSpeed (relative to
    //                       the fastest planet, negative values orbit the other way, 0 stands still)
    // Which variable references which object cannot be observed from Java, so for the run (the editor stays unchanged)
    // alterCodeBeforeRun appends `HoloScene.ref(x, "x");` to every assignment `x = ...;` / `Typ x = ...;` in the
    // student's methods. Objects that no variable references are dimmed when the program has finished.
    // (the file has to start with `export default`: the sandbox strips only that prefix, so there are no comments
    // or constants before it - the constants are properties of this object)

    // the scene's own size, shown scaled by --holo-scale (hologram.css)
    W: 800,
    H: 450,
    PLANET_IMAGES: 6,
    // angular speed of the fastest planet (rad/s): one orbit in ~7 s, calm enough that nothing blurs or strobes
    MAX_OMEGA: 0.9,
    // which sprite set (public/assets/hologram, art/replacements/make_hologram.py):
    //   'screen'  <name>.screen.png - the original renders on black, blended additively (hologram.css,
    //             .holo-screen): black vanishes, the glow adds light to the backdrop, dark parts are see-through
    //   'alpha'   <name>.alpha.png  - real transparency (normal compositing), the CSS adds the glow
    SPRITES: 'screen',
    COLUMNS: ['Universum', 'Sonne', 'Planet'],
    // delay after a command (ms): time to watch the step before the next one is shown
    DELAY: { new: 650, set: 550, ref: 220, print: 260, layout: 0 },
    root: undefined,
    stage: undefined,
    layer: undefined,
    objects: {},
    order: [],
    refs: {},
    layout: 'instances',
    timer: undefined,
    raf: undefined,
    last: 0,

    setupDOM() {
        this.canvasElement.html('')
        this.resetStage()
    },
    init() {
        this.resetStage()
    },
    reset() {
        this.resetStage()
    },
    update(txt, json) {
        this.resetStage()
        if (Array.isArray(json) && json.length > 0) this.play(json, 0)
    },

    alterCodeBeforeRun(code) {
        // `Typ name = expr;` or `name = expr;` on one line (not `==`, not `+=`, no array element or field)
        const assign = /^(?!\s*(?:return|throw|else|case|default|do|yield|assert|break|continue|static|private|public|protected)\b)\s*(?:final\s+)?(?:[\w.]+(?:<[\w<>,.\s?]*>)?(?:\[\])*\s+)?([A-Za-z_$][\w$]*)\s*=(?!=)(.*);\s*(\/\/.*)?$/
        const keywords = /^(?:new|int|double|float|long|short|byte|char|boolean|var|null|true|false|this|super|class)$/
        // the student's file comes in several entries (static and editable parts): the brace depth carries over
        let depth = 0
        for (const entry of code) {
            const src = entry.content
            if (/\bclass\s+(?:Universum|Sonne|Planet|HoloScene|MainOverride)\b/.test(src)) continue
            let changed = false
            const out = src.split('\n').map((line) => {
                // brace depth before this line: statements only inside method bodies (depth >= 2, class body = 1)
                const atDepth = depth
                const bare = line.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""').replace(/\/\/.*$/, '')
                for (const ch of bare) {
                    if (ch === '{') depth++
                    else if (ch === '}') depth--
                }
                if (atDepth < 2 || /[{}]/.test(bare)) return line
                const m = line.match(assign)
                if (!m || keywords.test(m[1])) return line
                changed = true
                const comment = m[3] ?? ''
                const code = line.slice(0, line.length - comment.length).trimEnd()
                return `${code} HoloScene.ref(${m[1]}, "${m[1]}");${comment ? ' ' + comment : ''}`
            })
            if (changed) entry.set(out.join('\n'))
        }
    },

    asset(name) {
        return (this.ASSETS_URL ?? '../../assets/') + 'hologram/' + name
    },

    stop() {
        if (this.timer !== undefined) clearTimeout(this.timer)
        if (this.raf !== undefined) cancelAnimationFrame(this.raf)
        this.timer = undefined
        this.raf = undefined
    },

    resetStage() {
        this.stop()
        this.objects = {}
        this.order = []
        this.refs = {}
        this.layout = 'instances'
        this.orphans = true

        const root = $('<div class="holo-root"></div>').toggleClass('holo-screen', this.SPRITES === 'screen')
        const stage = $('<div class="holo-stage"></div>')
        stage.append($('<img class="holo-backdrop" alt="">').on('error', function () { $(this).remove() })
            .attr('src', this.asset('backdrop.jpg')))
        // red tint of orphans (hologram.css .holo-orphan): luminance to red, black stays black
        stage.append('<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
            '<filter id="holo-red" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' +
            '0.45 0.88 0.17 0 0  0.05 0.1 0.02 0 0  0.07 0.14 0.03 0 0  0 0 0 1 0"/></filter></svg>')
        const layer = $('<div class="holo-layer"></div>')
        stage.append(layer)
        stage.append('<div class="holo-scanlines"></div>')
        root.append(stage)
        this.canvasElement.html('')
        this.canvasElement.append(root)
        this.canvasElement.css('border', 'none')
        this.root = root
        this.stage = stage
        this.layer = layer

        const scale = parseFloat(root.css('--holo-scale')) || 0.75
        root.css({ width: Math.round(this.W * scale) + 'px', height: Math.round(this.H * scale) + 'px' })
        stage.css('transform', `scale(${scale})`)
    },

    play(commands, idx) {
        this.timer = undefined
        if (idx >= commands.length) {
            this.finished()
            return
        }
        const cmd = commands[idx]
        let delay = this.run(cmd)
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) delay = Math.min(delay, 60)
        this.timer = setTimeout(() => this.play(commands, idx + 1), delay)
    },

    run(cmd) {
        switch (cmd.command) {
            case 'orphans':
                // per exercise, from its MainOverride: HoloScene.showOrphans(false) (default: on)
                this.orphans = cmd.value !== false
                return 0
            case 'layout':
                this.layout = cmd.value === 'system' ? 'system' : 'instances'
                this.buildLayout()
                return 0
            case 'new':
                this.create(cmd)
                return this.DELAY.new
            case 'set': {
                const o = this.objects[cmd.id]
                if (!o) return 0
                o[cmd.key] = cmd.value
                o.touched = true
                this.updateValues(o)
                this.flash(o, 'holo-changed', 700)
                this.relayout()
                return this.DELAY.set
            }
            case 'print': {
                const o = this.objects[cmd.id]
                if (!o) return 0
                this.flash(o, 'holo-print', 650)
                return this.DELAY.print
            }
            case 'ref': {
                const before = this.refs[cmd.name]
                if (before === cmd.id) return 0
                this.refs[cmd.name] = cmd.id
                if (before !== undefined && this.objects[before]) this.updateLabel(this.objects[before], true)
                if (this.objects[cmd.id]) this.updateLabel(this.objects[cmd.id], false)
                return this.DELAY.ref
            }
        }
        return 0
    },

    // after the run: objects without any variable are marked (the exercise asks to reference every object)
    finished() {
        for (const o of this.order) this.updateLabel(o, true)
    },

    buildLayout() {
        this.layer.find('.holo-column').remove()
        this.stage.toggleClass('holo-system', this.layout === 'system')
        if (this.layout !== 'instances') return
        this.COLUMNS.forEach((name, i) => {
            const col = $('<div class="holo-column"></div>')
            col.css({ left: `${this.columnX(i) - 125}px` })
            col.append($('<div class="holo-class"></div>').append(
                $('<span class="holo-class-kind">Klasse</span>'), $('<span class="holo-class-name"></span>').text(name)))
            this.layer.append(col)
        })
    },

    columnX(i) {
        return 140 + i * 260
    },

    create(cmd) {
        const sameType = this.order.filter((o) => o.type === cmd.type).length
        const o = {
            id: cmd.id, type: cmd.type, owner: cmd.owner, index: sameType, radius: 0, speed: 0, touched: false,
            // orbit state (layout "system")
            angle: 0.6 + sameType * 2.4, omega: 0, orbit: undefined,
        }
        let img = 'universe'
        if (o.type === 'Sonne') img = sameType % 2 === 0 ? 'sun.gold' : 'sun.blue'
        if (o.type === 'Planet') img = `planet.${sameType % this.PLANET_IMAGES}`
        img += this.SPRITES === 'screen' ? '.screen.png' : '.alpha.png'
        const el = $(`<div class="holo-obj holo-${o.type.toLowerCase()} holo-pop"></div>`)
        const body = $('<div class="holo-body"></div>')
        // .holo-fx carries the brightness effects (pop-in flash, print, dimming), so they interpolate smoothly;
        // inside it the sprite and a red copy (orphans, SVG colour matrix #holo-red) crossfade by opacity.
        // A missing image leaves the label (no broken-image icon).
        const fx = $('<div class="holo-fx"></div>')
        for (const cls of ['holo-sprite', 'holo-sprite holo-sprite-red']) {
            fx.append($(`<img class="${cls}" alt="">`).on('error', function () { $(this).css('visibility', 'hidden') })
                .attr('src', this.asset(img)))
        }
        body.append(fx)
        el.append(body)
        el.append('<div class="holo-ring"></div>')   // pulses (hologram.css), outside the blended body
        el.append('<div class="holo-label"><span class="holo-names"></span><span class="holo-values"></span>' +
            '<span class="holo-hint"></span></div>')
        o.el = el
        this.objects[o.id] = o
        this.order.push(o)
        if (o.type === 'Planet' && this.layout === 'system') {
            o.orbitEl = $('<div class="holo-orbit holo-pop"></div>')
            this.layer.append(o.orbitEl)
        }
        this.layer.append(el)
        setTimeout(() => el.removeClass('holo-pop'), 1000)
        if (o.orbitEl) setTimeout(() => o.orbitEl.removeClass('holo-pop'), 1000)
        this.updateValues(o)
        this.updateOrphan(o)
        this.relayout()
        this.startLoop()
    },

    // "orphans" are tinted red: a sun that belongs to no universe, a planet that orbits no sun. The owner is given
    // to the constructor (Sonne(Universum u), Planet(Sonne s); null or the default constructor: none) and is final,
    // so the state is known when the object appears; should it change (a future command), it flips with a pulse.
    updateOrphan(o) {
        const want = { Sonne: 'Universum', Planet: 'Sonne' }[o.type]
        if (!want || !this.orphans) return
        const owner = this.objects[o.owner]
        const orphan = !(owner && owner.type === want)
        const was = o.el.hasClass('holo-orphan')
        o.el.toggleClass('holo-orphan', orphan)
        o.el.find('.holo-hint').text(orphan ? (o.type === 'Sonne' ? 'kein Universum' : 'keine Sonne') : '')
        this.clampLabel(o)
        if (was !== orphan && o.shown) this.flash(o, 'holo-orphan-change', 700)
        o.shown = true
    },

    flash(o, cls, ms) {
        o.el.removeClass(cls)
        void o.el[0].offsetWidth   // restart the animation
        o.el.addClass(cls)
        setTimeout(() => o.el.removeClass(cls), ms)
    },

    // variables referencing o; `final`: also say so when there is none
    updateLabel(o, final) {
        const names = Object.keys(this.refs).filter((n) => this.refs[n] === o.id)
        const el = o.el.find('.holo-names')
        o.el.toggleClass('holo-noref', names.length === 0 && final)
        if (names.length > 0) el.text(names.join(', '))
        else el.text(final ? 'keine Referenz' : '')
        this.clampLabel(o)
    },

    updateValues(o) {
        if (o.type !== 'Planet') return
        const show = o.touched || this.layout === 'system'
        const fmt = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)))
        o.el.find('.holo-values').text(show ? `r: ${fmt(o.radius)}  s: ${fmt(o.speed)}` : '')
        this.clampLabel(o)
    },

    // ---- placement ----------------------------------------------------------------------------------------------

    relayout() {
        if (this.layout === 'system') this.layoutSystem()
        else this.layoutInstances()
    },

    place(o, x, y, size, z) {
        o.x = x
        o.y = y
        // the element is a point at the object's centre: body and label are placed around it by --holo-size
        // (no z-index on the element itself: the body is stacked by depth, all labels stay above every body)
        o.el[0].style.cssText = `left:${x}px;top:${y}px;--holo-z:${z ?? 10};--holo-size:${size}px`
        this.clampLabel(o)
    },

    // keep every text line at least MARGIN inside the stage. Measured on the untransformed layout (offset
    // geometry relative to the object's point, not getBoundingClientRect), so running animations never move
    // labels. Vertically the block moves as one; sideways each line moves only as far as it has to, so the name
    // stays centred over its object even when the wider values line is pushed in at the edge.
    MARGIN: 10,
    clampLabel(o) {
        const label = o.label ?? (o.label = o.el.find('.holo-label')[0])
        if (!label) return
        const m = this.MARGIN
        const x = o.x ?? 0
        const y = o.y ?? 0
        const lines = [...label.children].filter((e) => e.textContent)
        // vertical extent of the block: label top + each line's offsetTop/Height (the name sits above the
        // object via its own top/translate, see hologram.css; offsetTop includes that top, translateY is -100%)
        let top = Infinity, bottom = -Infinity
        for (const e of lines) {
            const above = getComputedStyle(e).position === 'absolute'
            const t = label.offsetTop + e.offsetTop - (above ? e.offsetHeight : 0)
            top = Math.min(top, t)
            bottom = Math.max(bottom, t + e.offsetHeight)
        }
        const dy = lines.length ? Math.max(0, m - (y + top)) - Math.max(0, y + bottom - (this.H - m)) : 0
        label.style.translate = dy ? `0 ${Math.round(dy)}px` : ''
        for (const e of lines) {
            const half = e.offsetWidth / 2
            const dx = Math.max(0, m - (x - half)) - Math.max(0, x + half - (this.W - m))
            e.style.translate = dx ? `${Math.round(dx)}px 0` : ''
        }
    },

    layoutInstances() {
        const base = { Universum: 150, Sonne: 138, Planet: 92 }
        this.COLUMNS.forEach((type, i) => {
            const list = this.order.filter((o) => o.type === type)
            const n = list.length
            if (n === 0) return
            const cols = n <= 3 ? 1 : 2
            const rows = Math.ceil(n / cols)
            const top = 78
            const cellH = Math.min(base[type] + 46, (this.H - top - 24) / rows)
            const cellW = 236 / cols
            const size = Math.max(28, Math.min(base[type], cellH - 46, cellW - 14))   // room for name + hint
            const y0 = top + (this.H - top - 24 - rows * cellH) / 2
            list.forEach((o, k) => {
                const c = k % cols
                const r = Math.floor(k / cols)
                const x = this.columnX(i) + (c - (cols - 1) / 2) * cellW
                this.place(o, x, y0 + r * cellH + (cellH - 40) / 2, size, 10)
            })
        })
    },

    layoutSystem() {
        const suns = this.order.filter((o) => o.type === 'Sonne')
        const universes = this.order.filter((o) => o.type === 'Universum')
        universes.forEach((u, i) => this.place(u, 72 + i * 105, 62, 84, 5))
        const n = Math.max(1, suns.length)
        // the sun sprites include their corona (the sphere is ~60% of the sprite)
        const sunSize = n === 1 ? 150 : n === 2 ? 120 : 96
        suns.forEach((s, i) => {
            s.cx = this.W * (i + 0.5) / n
            s.cy = 228
            s.rMin = sunSize * 0.48 + 40
            s.rMax = Math.max(s.rMin + 10, Math.min(this.W / n / 2 - 34, 340))
            this.place(s, s.cx, s.cy, sunSize, 50)
        })
        // planets: target orbit (radius relative to the largest of the sun's planets), target angular speed
        const planets = this.order.filter((o) => o.type === 'Planet')
        const maxS = Math.max(0, ...planets.map((p) => Math.abs(p.speed)))
        let free = 0
        for (const p of planets) {
            const sun = this.objects[p.owner]
            p.sun = sun && sun.type === 'Sonne' ? sun : undefined
            p.size = n === 1 ? 64 : 52
            if (!p.sun) {
                // no sun: parked at the bottom right, not orbiting
                this.place(p, this.W - 64 - free * 100, this.H - 104, p.size, 60)
                if (p.orbitEl) p.orbitEl.css('display', 'none')
                free++
                continue
            }
            const mine = planets.filter((q) => q.owner === p.owner)
            const maxR = Math.max(0, ...mine.map((q) => Math.abs(q.radius)))
            p.targetOrbit = maxR > 0 ? p.sun.rMin + Math.abs(p.radius) / maxR * (p.sun.rMax - p.sun.rMin) : p.sun.rMin
            if (p.orbit === undefined) p.orbit = p.targetOrbit
            // strictly proportional to setSpeed (sign = direction): the fastest planet turns at MAX_OMEGA, a planet with
            // 0.001 next to one with 50 stands as good as still - which is the right picture
            p.targetOmega = maxS === 0 ? 0 : p.speed / maxS * this.MAX_OMEGA
        }
        this.stepPlanets(0)
    },

    startLoop() {
        if (this.raf !== undefined || this.layout !== 'system') return
        this.last = performance.now()
        const tick = (now) => {
            const dt = Math.min(0.1, (now - this.last) / 1000)
            this.last = now
            this.stepPlanets(dt)
            this.raf = requestAnimationFrame(tick)
        }
        this.raf = requestAnimationFrame(tick)
    },

    // orbit ellipses lie flat like on a hologram table: y squashed, planets behind the sun when on the far side
    stepPlanets(dt) {
        const k = 1 - Math.exp(-dt * 4)   // easing towards new orbits and speeds
        for (const p of this.order) {
            if (p.type !== 'Planet' || !p.sun) continue
            p.orbit += (p.targetOrbit - p.orbit) * (dt > 0 ? k : 0)
            p.omega += (p.targetOmega - p.omega) * (dt > 0 ? k : 0)
            p.angle += p.omega * dt
            const rx = p.orbit
            const ry = p.orbit * 0.37
            const sin = Math.sin(p.angle)
            const depth = (sin + 1) / 2   // 0 far, 1 near
            const size = p.size * (0.82 + 0.3 * depth)
            this.place(p, p.sun.cx + rx * Math.cos(p.angle), p.sun.cy + ry * sin, size, 50 + Math.round(sin * 40))
            if (p.orbitEl) {
                p.orbitEl.css({
                    display: '', left: `${p.sun.cx - rx}px`, top: `${p.sun.cy - ry}px`,
                    width: `${2 * rx}px`, height: `${2 * ry}px`,
                })
            }
        }
    },
}
