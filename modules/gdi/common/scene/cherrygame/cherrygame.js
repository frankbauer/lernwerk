export default {
    // Playground (v102) zur Aufgabe "Kirschenessen mit Klassenmethoden", portiert vom v101-Playground der
    // StudOn-Aufgabe. Spielt die Anweisungen ab, die FloatingWorld.java per CodeBlocks.postResult schickt:
    //   ["A", "cherry"]  Welt mit Kirsche zeigen
    //   ["A"]            Spieler hinzufügen (1. pink, 2. rot, 3. Monster, mehr sind nicht erlaubt)
    //   ["M", idx, dx]   Spieler mit Index idx um dx Pixel bewegen
    //   ["R", idx]       Spieler mit Index idx löschen (nachfolgende Spieler rücken nach vorne)
    // Die Meldungen (Kirsche gegessen, Fehler, richtige/falsche Befehlsfolge) werden vorab berechnet und als
    // Ausgabe zurückgegeben, danach wird die Sequenz animiert.
    // Optional kann ein DATA-Block namens "config" die Szene anpassen (alle Felder optional):
    //   {
    //     "correctSequence": "ACA2M0-10...",           // erwartete Befehlsfolge
    //     "timePerStep": 300,                          // Dauer eines Schritts in ms
    //     "positions": { "pink": 90, "red": 250 },     // Startpositionen (left in px)
    //     "ghost": { "sprite": "pinkGhost", "left": 79, "bottom": -1, "height": 102 }   // Umriss am Ziel
    //   }
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    timePerStep: 800,
    steps: [],
    players: [],
    pc: 0,
    correctSequence: 'ACA2A1M0-100M1-100R0M0--100',

    getResources: function () {
        const meta = document.head.querySelector('meta[name="codeblocks-baseurl"]')
        const base = (meta ? meta.getAttribute('content') : '../../../../') + 'assets/'
        // the players, ghosts and the cherry are shared with the Floating World scene
        const files = {
            cherry: 'floatingworld/Cherry.png',
            red: 'floatingworld/Player2.png',
            pink: 'floatingworld/Player1.png',
            monster: 'cherrygame/monster.png',
            redGhost: 'floatingworld/Ghost2.png',
            pinkGhost: 'floatingworld/Ghost1.png',
        }
        return Object.entries(files).map(([name, file]) => ({ uri: base + file, type: 'image', name: name + 'Img' }))
    },

    setupDOM: function () { },

    init: function () {
        const cfg = (this.DATA && this.DATA.config) || {}
        if (cfg.correctSequence !== undefined) this.correctSequence = cfg.correctSequence
        if (cfg.timePerStep !== undefined) this.timePerStep = cfg.timePerStep
        const pos = Object.assign({ red: 90, pink: 250 }, cfg.positions)
        const ghost = Object.assign({ sprite: 'redGhost', left: 89, bottom: -0.5, height: 101 }, cfg.ghost)

        const canvasElement = this.canvasElement
        canvasElement.css({
            'border-radius': '8px 8px 0 0',
            position: 'relative',
            height: '150px',
            width: '400px',
            overflow: 'hidden',
            'box-shadow': 'none',
            background: 'linear-gradient(0deg, rgba(32,30,71,1) 0%, rgba(15,78,91,1) 100%)'
        })

        const style = document.createElement('style')
        style.textContent =
            '.cherryShow{opacity:1;transition:opacity ' + (this.timePerStep / 1000) + 's linear;}' +
            '.cherryHide{opacity:0;transition:opacity ' + (this.timePerStep / 1000) + 's linear;}' +
            '.cherryHideNow{opacity:0;}'
        canvasElement.empty().append(style)

        const container = $(document.createElement('div'))
        container.css({ width: '100%', position: 'absolute', bottom: '0' })
        canvasElement.append(container)

        this.cherry = this.putImg(container, this.cherryImg, 190, 20, 33, 10)
        this.red = this.putImg(container, this.redImg, pos.red, 0, 100, 20)
        this.pink = this.putImg(container, this.pinkImg, pos.pink, 0, 100, 30)
        this.monster = this.putImg(container, this.monsterImg, Math.random() * 320, 0, 100, 15)
        this.ghost = this.putImg(container, this[ghost.sprite + 'Img'], ghost.left, ghost.bottom, ghost.height, 5)
        this.ghost.removeClass('cherryHideNow').addClass('cherryShow')

        const bt = $(document.createElement('button'))
        bt.attr('type', 'button')
        bt.text('Erneut abspielen')
        bt.css({
            position: 'absolute', right: '6px', bottom: '6px', 'z-index': 60, 'font-size': '9pt', padding: '2px 8px',
            border: '1px solid rgba(255,255,255,0.5)', 'border-radius': '3px', background: 'rgba(0,0,0,0.35)',
            color: 'white', cursor: 'pointer'
        })
        bt.on('click', () => {
            this.reset()
            this.runResult()
        })
        canvasElement.append(bt)
        this.replayButton = bt

        this.reset()
    },

    update: function (txt, json) {
        this.reset()
        if (!Array.isArray(json)) return txt
        this.steps = json
        const log = this.simulate(json)
        this.runResult()
        return log
    },

    putImg: function (container, src, left, bottom, height, zIndex) {
        const img = $(document.createElement('img'))
        img.css({ height: height + 'px', position: 'absolute', bottom: bottom + 'px', 'z-index': zIndex, left: left + 'px' })
        img.addClass('cherryHideNow')
        img.attr('XOrigL', left)
        img.attr('XCurL', left)
        img.attr('src', src)
        container.append(img)
        return img
    },

    // Breite eines Sprites bei seiner angezeigten Höhe (funktioniert auch, solange es unsichtbar ist)
    widthOf: function (item) {
        const img = item[0]
        return img.naturalHeight ? img.naturalWidth * parseFloat(item.css('height')) / img.naturalHeight : 64
    },

    // Berechnet ohne Animation, welche Meldungen die Sequenz erzeugt (gleiche Logik wie nextStep/checkHit)
    simulate: function (steps) {
        const lines = []
        const players = []
        const sprites = { pink: this.pink, red: this.red, monster: this.monster }
        let sequence = ''
        let cherryHit = false
        const cherryLeft = Number(this.cherry.attr('XOrigL'))
        const cherryRight = cherryLeft + this.widthOf(this.cherry)
        let ok = true

        for (const token of steps) {
            if (token[0] === 'A') {
                if (token[1] === 'cherry') {
                    sequence += 'AC'
                    continue
                }
                const kind = ['pink', 'red', 'monster'][players.length]
                if (kind === undefined) {
                    lines.push('Fehler: Es dürfen höchstens drei Spieler mitspielen!')
                    ok = false
                    break
                }
                sequence += kind === 'red' ? 'A1' : kind === 'pink' ? 'A2' : 'A3'
                const item = sprites[kind]
                players.push({ left: Number(item.attr('XOrigL')), width: this.widthOf(item) })
            } else if (token[0] === 'R' || token[0] === 'M') {
                sequence += token[0] === 'R' ? 'R' + token[1] : 'M' + token[1] + '-' + token[2]
                if (token[1] < 0 || token[1] >= players.length) {
                    lines.push('Fehler: Es gibt keinen Spieler mit der ID ' + token[1] + '.')
                    ok = false
                    break
                }
                if (token[0] === 'R') {
                    players.splice(token[1], 1)
                } else {
                    const p = players[token[1]]
                    p.left += token[2]
                    if (!cherryHit && p.left + p.width > cherryLeft && p.left < cherryRight) {
                        cherryHit = true
                        lines.push('Hurra: Spieler ' + token[1] + ' hat die Kirsche gegessen.')
                    }
                }
            }
        }
        lines.push('')
        lines.push(ok && sequence === this.correctSequence
            ? 'Ergebnis: Die Befehlsfolge ist richtig.'
            : 'Ergebnis: Die Befehlsfolge ist falsch.')
        return lines.join('\n')
    },

    checkHit: function (item) {
        if (this.cherry.attr('XHit') == 1) return

        const left = Number(item.attr('XCurL'))
        const right = left + item.width()
        const cleft = Number(this.cherry.attr('XCurL'))
        const cright = cleft + this.cherry.width()

        if (right > cleft && left < cright) {
            item.attr('XCherry', 1)
            this.cherry.attr('XHit', 1)
            this.cherry.css('bottom', 100)
            this.setItemPos(this.cherry, (left + right) / 2 - 10)
        }
    },

    setItemPos: function (item, left) {
        if (left === undefined) {
            left = Number(item.attr('XOrigL'))
        }
        item.css('left', left + 'px')
        item.attr('XCurL', left)
    },

    moveItemBy: function (item, deltaLeft) {
        const cleft = Number(item.attr('XCurL'))
        const frameDuration = 1000 / 25
        const frames = Math.max(1, Math.round((this.timePerStep / 2) / frameDuration))
        const run = this.run

        const animator = f => {
            if (run !== this.run) return
            const left = cleft + (f / frames) * deltaLeft
            item.css('left', left + 'px')
            item.attr('XCurL', left)

            if (item.attr('XCherry') == 1) {
                this.setItemPos(this.cherry, (left + left + item.width()) / 2 - 10)
            }

            if (f < frames) {
                setTimeout(() => animator(f + 1), frameDuration)
            } else {
                this.checkHit(item)
                this.later(() => this.nextStep(), 200)
            }
        }
        animator(0)
    },

    // setTimeout, das nach einem reset() nicht mehr ausgeführt wird
    later: function (fn, ms) {
        const run = this.run
        setTimeout(() => { if (run === this.run) fn() }, ms)
    },

    reset: function () {
        if (this.cherry === undefined) return
        this.run = (this.run || 0) + 1
        this.replayButton.hide()
        this.players = []
        this.pc = 0
        const items = [this.cherry, this.red, this.pink, this.monster]
        items.forEach(item => {
            item.removeClass('cherryHide cherryShow').addClass('cherryHideNow')
            item.attr('XCherry', 0)
        })
        this.setItemPos(this.cherry)
        this.setItemPos(this.red)
        this.setItemPos(this.pink)
        this.setItemPos(this.monster)
        this.cherry.css('bottom', 20)
        this.cherry.attr('XHit', 0)
    },

    runResult: function () {
        this.pc = 0
        this.nextStep()
    },

    finishedRun: function () {
        this.replayButton.show()
    },

    nextStep: function () {
        if (this.pc >= this.steps.length) {
            this.finishedRun()
            return
        }
        const token = this.steps[this.pc]
        this.pc++

        if (token[0] === 'A') {
            if (token[1] === 'cherry') {
                this.addItem(this.cherry)
                return
            }
            const item = [this.pink, this.red, this.monster][this.players.length]
            if (item === undefined) {
                this.finishedRun()
                return
            }
            this.players.push(item)
            this.addItem(item)
        } else if (token[0] === 'R' || token[0] === 'M') {
            if (token[1] < 0 || token[1] >= this.players.length) {
                this.finishedRun()
                return
            }
            if (token[0] === 'R') {
                this.removeItem(this.players[token[1]])
                this.players.splice(token[1], 1)
            } else {
                this.moveItemBy(this.players[token[1]], token[2])
            }
        } else {
            this.nextStep()
        }
    },

    addItem: function (item) {
        item.removeClass('cherryHide cherryHideNow').addClass('cherryShow')
        this.later(() => this.nextStep(), this.timePerStep)
    },

    removeItem: function (item) {
        item.removeClass('cherryShow').addClass('cherryHide')
        this.later(() => this.nextStep(), this.timePerStep)
    },
}
