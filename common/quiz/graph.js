export default {
    // Nicht ausführbarer Playground (v102): Graphen-Theorie mit zufällig erzeugten Graphen.
    // Beim ersten Öffnen wird ein Graph erzeugt und im localStorage abgelegt. Er bleibt erhalten (samt der
    // bisherigen Eingaben), bis "Neuer Graph" gedrückt wird.
    // Die Konfiguration kommt aus einem DATA-Block namens "config":
    //
    //   {
    //     "task": "dijkstra",            // "dijkstra" | "prim" | "kruskal" | "path" | "centrality"
    //     "view": "exercise",            // "exercise" (Eingabe) oder "solution" (zeigt die Lösung desselben Graphen)
    //     "storageKey": "18_Graphen/dijkstra",   // gemeinsamer Schlüssel für Aufgabe und Lösung
    //     "nodes": 9,                    // optional: Anzahl der Knoten
    //     "edges": 14,                   // optional: Anzahl der (ungerichteten) Kanten
    //     "minWeight": 1, "maxWeight": 12        // optional: Bereich der Kantengewichte
    //   }
    //
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    VERSION: 1,
    INF: -1,
    DEFAULTS: {
        dijkstra: { nodes: 9, edges: 15, minWeight: 1, maxWeight: 12 },
        path: { nodes: 9, edges: 15, minWeight: 1, maxWeight: 12 },
        prim: { nodes: 7, edges: 11, minWeight: 1, maxWeight: 20 },
        kruskal: { nodes: 8, edges: 12, minWeight: 1, maxWeight: 30 },
        centrality: { nodes: 6, edges: 8, minWeight: 1, maxWeight: 1 },
    },

    setupDOM: function () {
        this.config = this.DATA.config
        this.task = this.config.task
        this.opts = Object.assign({}, this.DEFAULTS[this.task], this.config)
        this.key = 'lernwerk.graph.' + (this.config.storageKey || this.task)
        this.uid = 'g' + Math.floor(Math.random() * 1e9).toString(36)
        this.canvasElement.addClass('quiz-canvas')
        this.load()
        this.render()
        if (this.config.view === 'solution') {
            // Aufgabe und Lösung sind getrennte Playgrounds; die Sandbox erlaubt nur postMessage zur Abstimmung
            window.addEventListener('message', e => {
                if (e.origin !== location.origin || !e.data || e.data.type !== 'lernwerk-graph-changed' || e.data.key !== this.key) return
                this.load()
                this.render()
            })
        }
    },
    init: function () { },
    update: function () { return undefined },
    reset: function () { },

    // ------------------------------------------------------------------ Speicher

    load: function () {
        let stored
        try {
            stored = JSON.parse(localStorage.getItem(this.key))
        } catch (e) {
            stored = undefined
        }
        if (stored && stored.v === this.VERSION && stored.puzzle && stored.puzzle.task === this.task) {
            this.puzzle = stored.puzzle
            this.answer = stored.answer || {}
        } else {
            this.puzzle = this.generate()
            this.answer = {}
            this.save()
        }
    },
    save: function () {
        try {
            localStorage.setItem(this.key, JSON.stringify({ v: this.VERSION, puzzle: this.puzzle, answer: this.answer }))
        } catch (e) { }
    },
    newGraph: function () {
        this.puzzle = this.generate()
        this.answer = {}
        this.save()
        this.render()
        window.postMessage({ type: 'lernwerk-graph-changed', key: this.key }, location.origin)
    },

    // ------------------------------------------------------------------ Zufall

    rndInt: function (min, max) { // inklusive max
        return min + Math.floor(Math.random() * (max - min + 1))
    },
    shuffle: function (list) {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const t = list[i]; list[i] = list[j]; list[j] = t
        }
        return list
    },

    // ------------------------------------------------------------------ Layout

    // Zufällige, kreuzungsfreie Anordnung: Knoten mit Mindestabstand, Kanten nur zwischen Nachbarn und so, dass
    // Gewichte, Knoten und Kanten sich nicht gegenseitig verdecken.
    layout: function (n, m) {
        const width = Math.round(Math.sqrt(n * 24000 * 1.35))
        const height = Math.round(width / 1.35)
        const pad = 30
        const minDist = 0.66 * Math.sqrt((width - 2 * pad) * (height - 2 * pad) / n)
        const maxLen = 2.3 * minDist
        for (let attempt = 0; attempt < 400; attempt++) {
            const pts = []
            for (let tries = 0; pts.length < n && tries < 3000; tries++) {
                const p = { x: this.rndInt(pad, width - pad), y: this.rndInt(pad, height - pad) }
                if (pts.every(q => Math.hypot(p.x - q.x, p.y - q.y) >= minDist)) pts.push(p)
            }
            if (pts.length < n) continue
            const cand = []
            for (let a = 0; a < n; a++) {
                for (let b = a + 1; b < n; b++) {
                    const len = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y)
                    if (len <= maxLen) cand.push({ a: a, b: b, key: len * (0.55 + 0.9 * Math.random()) })
                }
            }
            cand.sort((x, y) => x.key - y.key)
            const edges = []
            const parent = pts.map((_, i) => i)
            const find = i => parent[i] === i ? i : (parent[i] = find(parent[i]))
            // erst ein Spannbaum (zusammenhängend), dann weitere Kanten
            for (const c of cand) {
                if (edges.length >= n - 1) break
                if (find(c.a) === find(c.b) || !this.edgeFits(pts, edges, c)) continue
                parent[find(c.a)] = find(c.b)
                edges.push({ a: c.a, b: c.b })
            }
            if (edges.length < n - 1) continue
            for (const c of cand) {
                if (edges.length >= m) break
                if (edges.some(e => e.a === c.a && e.b === c.b) || !this.edgeFits(pts, edges, c)) continue
                edges.push({ a: c.a, b: c.b })
            }
            if (edges.length < m) continue
            // auf die tatsächlich belegte Fläche zuschneiden
            const x0 = Math.min.apply(null, pts.map(p => p.x)) - pad, y0 = Math.min.apply(null, pts.map(p => p.y)) - pad
            const x1 = Math.max.apply(null, pts.map(p => p.x)) + pad, y1 = Math.max.apply(null, pts.map(p => p.y)) + pad
            return { width: x1 - x0, height: y1 - y0, pts: pts.map(p => ({ x: p.x - x0, y: p.y - y0 })), edges: edges }
        }
        return undefined
    },
    segDist: function (p, a, b) {
        const dx = b.x - a.x, dy = b.y - a.y
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
        return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy)
    },
    crosses: function (p1, p2, p3, p4) {
        const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
        const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4)
        return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0))
    },
    edgeFits: function (pts, edges, c) {
        const A = pts[c.a], B = pts[c.b]
        const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }
        for (let i = 0; i < pts.length; i++) {
            if (i === c.a || i === c.b) continue
            if (this.segDist(pts[i], A, B) < 32) return false
            if (Math.hypot(pts[i].x - mid.x, pts[i].y - mid.y) < 34) return false
        }
        for (const e of edges) {
            const C = pts[e.a], D = pts[e.b]
            const shared = e.a === c.a || e.a === c.b || e.b === c.a || e.b === c.b
            if (!shared && this.crosses(A, B, C, D)) return false
            const emid = { x: (C.x + D.x) / 2, y: (C.y + D.y) / 2 }
            if (Math.hypot(emid.x - mid.x, emid.y - mid.y) < 40) return false
            if (!shared && (this.segDist(mid, C, D) < 16 || this.segDist(emid, A, B) < 16)) return false
            if (shared) {
                // zwei Kanten am selben Knoten dürfen nicht fast übereinander liegen
                const s = (e.a === c.a || e.b === c.a) ? c.a : c.b
                const o1 = s === c.a ? c.b : c.a
                const o2 = e.a === s ? e.b : e.a
                const v1 = { x: pts[o1].x - pts[s].x, y: pts[o1].y - pts[s].y }
                const v2 = { x: pts[o2].x - pts[s].x, y: pts[o2].y - pts[s].y }
                const cos = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y))
                if (cos > Math.cos(24 * Math.PI / 180)) return false
            }
        }
        return true
    },

    // Graph mit zufälligen Buchstaben (fortlaufend, zufällig verteilt) und Gewichten
    randomGraph: function () {
        const o = this.opts
        const lay = this.layout(o.nodes, o.edges)
        if (!lay) return undefined
        const first = 65 + this.rndInt(0, 26 - o.nodes)
        return {
            width: lay.width,
            height: lay.height,
            nodes: lay.pts.map((p, i) => ({ name: String.fromCharCode(first + i), x: p.x, y: p.y })),
            edges: lay.edges.map(e => ({ a: e.a, b: e.b, w: this.rndInt(o.minWeight, o.maxWeight) })),
        }
    },

    // ------------------------------------------------------------------ Aufgaben erzeugen

    generate: function () {
        const make = {
            dijkstra: () => this.makeDijkstra(false),
            path: () => this.makeDijkstra(true),
            prim: () => this.makeMst('prim'),
            kruskal: () => this.makeMst('kruskal'),
            centrality: () => this.makeCentrality(),
        }[this.task]
        let res
        for (let attempt = 0; attempt < 3000 && !res; attempt++) res = make(attempt)
        for (let attempt = 0; attempt < 3000 && !res; attempt++) {
            this.relaxed = true
            this.usedRelaxed = true
            res = make(attempt)
        }
        this.relaxed = false
        res.task = this.task
        return res
    },

    adjacency: function (g) {
        const adj = g.nodes.map(() => [])
        g.edges.forEach((e, i) => {
            adj[e.a].push({ to: e.b, w: e.w, edge: i })
            if (!g.directed) adj[e.b].push({ to: e.a, w: e.w, edge: i })
        })
        return adj
    },

    // Dijkstra wie in der Vorlesung als Tabelle: Zeile 0 = Start, danach je Zeile ein Knoten abgearbeitet.
    // Werte: Zahl, INF (-1) oder null (bereits abgearbeitet, bleibt leer).
    runDijkstra: function (g, start) {
        const n = g.nodes.length
        const adj = this.adjacency(g)
        const dist = g.nodes.map((_, i) => i === start ? 0 : Infinity)
        const pred = g.nodes.map(() => -1)
        const done = g.nodes.map(() => false)
        const rows = [dist.map(d => d === Infinity ? this.INF : d)]
        const order = []
        const stats = { overwrite: 0, ignore: 0, tie: false, predTie: false }
        for (let r = 1; r <= n; r++) {
            const open = g.nodes.map((_, i) => i).filter(i => !done[i]).sort((x, y) => dist[x] - dist[y])
            const u = open[0]
            if (dist[u] === Infinity) return undefined
            if (open.length > 1 && dist[open[1]] === dist[u]) stats.tie = true
            done[u] = true
            order.push(u)
            if (r === n) break
            adj[u].forEach(e => {
                if (done[e.to]) return
                const nd = dist[u] + e.w
                if (nd < dist[e.to]) {
                    if (dist[e.to] !== Infinity) stats.overwrite++
                    dist[e.to] = nd
                    pred[e.to] = u
                } else if (nd === dist[e.to]) {
                    stats.predTie = true
                } else {
                    stats.ignore++
                }
            })
            rows.push(dist.map((d, i) => done[i] ? null : d === Infinity ? this.INF : d))
        }
        return { rows: rows, order: order, pred: pred, dist: dist, stats: stats }
    },

    makeDijkstra: function (withPath) {
        const g = this.randomGraph()
        if (!g) return undefined
        const n = g.nodes.length
        const start = this.rndInt(0, n - 1)
        const d = this.runDijkstra(g, start)
        if (!d || d.stats.tie || d.stats.predTie) return undefined
        // nur m - (n - 1) Relaxierungen treffen auf einen schon bekannten Wert, daher kleine Schwellen
        if (d.stats.overwrite < (this.relaxed ? 2 : 3) || d.stats.ignore < (this.relaxed ? 1 : 3)) return undefined
        if (Math.max.apply(null, d.dist) > 45) return undefined
        const res = { graph: g, start: start, rows: d.rows, order: d.order, pred: d.pred }
        if (withPath) {
            // Pfad wie in der Klausur: vom zuletzt abgearbeiteten Knoten rückwärts bis zum Start
            const target = d.order[n - 1]
            const path = [target]
            while (path[path.length - 1] !== start) path.push(d.pred[path[path.length - 1]])
            const minLen = this.relaxed ? 3 : 4
            if (path.length < minLen || path.length > Math.max(5, n - 3)) return undefined
            res.target = target
            res.path = path
            res.marks = path.map(p => ({ r: d.order.indexOf(p), c: p }))
        }
        return res
    },

    unionFind: function (n) {
        const parent = []
        for (let i = 0; i < n; i++) parent.push(i)
        const find = i => parent[i] === i ? i : (parent[i] = find(parent[i]))
        return { find: find, union: (a, b) => { parent[find(a)] = find(b) } }
    },

    makeMst: function (type) {
        const g = this.randomGraph()
        if (!g) return undefined
        const n = g.nodes.length
        const byWeight = g.edges.map((_, i) => i).sort((x, y) => g.edges[x].w - g.edges[y].w)

        // Kruskal
        const uf = this.unionFind(n)
        const kruskal = []
        let rejected = 0
        for (const i of byWeight) {
            if (kruskal.length === n - 1) break
            const e = g.edges[i]
            if (uf.find(e.a) === uf.find(e.b)) {
                rejected++
                continue
            }
            uf.union(e.a, e.b)
            kruskal.push(i)
        }

        // eindeutiger Spannbaum: jede Nicht-Baumkante ist echt schwerer als alle Kanten auf ihrem Kreis
        const inTree = g.edges.map((_, i) => kruskal.indexOf(i) >= 0)
        const tadj = g.nodes.map(() => [])
        kruskal.forEach(i => {
            const e = g.edges[i]
            tadj[e.a].push({ to: e.b, w: e.w })
            tadj[e.b].push({ to: e.a, w: e.w })
        })
        const maxOnPath = (from, to) => {
            const stack = [{ v: from, p: -1, m: 0 }]
            while (stack.length) {
                const s = stack.pop()
                if (s.v === to) return s.m
                tadj[s.v].forEach(x => { if (x.to !== s.p) stack.push({ v: x.to, p: s.v, m: Math.max(s.m, x.w) }) })
            }
            return Infinity
        }
        const unique = g.edges.every((e, i) => inTree[i] || e.w > maxOnPath(e.a, e.b))
        if (!unique) return undefined

        const weights = g.edges.map(e => e.w)
        const duplicates = weights.length - new Set(weights).size
        if (duplicates < 1 && !this.relaxed) return undefined

        if (type === 'kruskal') {
            const treeWeights = kruskal.map(i => g.edges[i].w)
            if (new Set(treeWeights).size !== treeWeights.length) return undefined
            if (rejected < (this.relaxed ? 1 : 3)) return undefined
            return { graph: g, tree: kruskal }
        }

        // Prim (mit Prioritätsliste, verworfene Kanten zählen)
        const start = this.rndInt(0, n - 1)
        const adj = this.adjacency(g)
        const added = g.nodes.map((_, i) => i === start)
        let queue = adj[start].slice()
        const prim = []
        let ignored = 0
        while (prim.length < n - 1) {
            queue.sort((x, y) => x.w - y.w)
            // gleich schwere Kandidaten würden die Reihenfolge mehrdeutig machen (beide können im Baum landen)
            const valid = queue.filter(x => !added[x.to])
            if (valid.length > 1 && valid[0].w === valid[1].w) return undefined
            const e = queue.shift()
            if (added[e.to]) {
                ignored++
                continue
            }
            added[e.to] = true
            prim.push(e.edge)
            queue = queue.concat(adj[e.to].filter(x => !added[x.to]))
        }
        let inversions = 0
        for (let i = 0; i < prim.length; i++) {
            for (let j = i + 1; j < prim.length; j++) {
                if (g.edges[prim[i]].w > g.edges[prim[j]].w) inversions++
            }
        }
        if (!this.relaxed && (inversions < 2 || ignored < 2)) return undefined
        return { graph: g, start: start, tree: prim }
    },

    // Alle kürzesten Wege eines gerichteten, ungewichteten Graphen: paths[i][j] = Liste von Knotenfolgen i -> j
    allShortestPaths: function (g) {
        const n = g.nodes.length
        const adj = this.adjacency(g)
        const paths = []
        for (let s = 0; s < n; s++) {
            const dist = g.nodes.map(() => Infinity)
            const preds = g.nodes.map(() => [])
            dist[s] = 0
            const queue = [s]
            while (queue.length) {
                const u = queue.shift()
                adj[u].forEach(e => {
                    if (dist[e.to] === Infinity) {
                        dist[e.to] = dist[u] + 1
                        queue.push(e.to)
                    }
                    if (dist[e.to] === dist[u] + 1) preds[e.to].push(u)
                })
            }
            const build = t => t === s ? [[s]] : [].concat.apply([], preds[t].map(p => build(p).map(q => q.concat([t]))))
            paths.push(g.nodes.map((_, t) => t === s || dist[t] === Infinity ? [] : build(t).sort()))
        }
        return paths
    },

    makeCentrality: function () {
        const g = this.randomGraph()
        if (!g) return undefined
        const n = g.nodes.length
        // Kanten zufällig ausrichten, manche in beide Richtungen
        const arcs = []
        g.edges.forEach(e => {
            const r = Math.random()
            if (r < 0.35) {
                arcs.push({ a: e.a, b: e.b, w: 1 }, { a: e.b, b: e.a, w: 1 })
            } else if (r < 0.675) {
                arcs.push({ a: e.a, b: e.b, w: 1 })
            } else {
                arcs.push({ a: e.b, b: e.a, w: 1 })
            }
        })
        g.edges = arcs
        g.directed = true
        const paths = this.allShortestPaths(g)
        const cells = [].concat.apply([], paths)
        if (cells.filter(c => c.length > 0).length < (this.relaxed ? 14 : 18)) return undefined
        if (cells.filter(c => c.length > 1).length < (this.relaxed ? 1 : 2)) return undefined
        if (Math.max.apply(null, cells.map(c => c.length ? c[0].length : 0)) > 5) return undefined
        const through = (p, t) => p.slice(1, p.length - 1).indexOf(t) >= 0
        const targets = g.nodes.map((_, t) => t).filter(t => {
            const count = cells.reduce((sum, c) => sum + c.filter(p => through(p, t)).length, 0)
            const mixed = cells.some(c => c.length > 1 && c.some(p => through(p, t)) && !c.every(p => through(p, t)))
            return count >= 3 && count <= 9 && (mixed || this.relaxed)
        })
        if (!targets.length) return undefined
        const target = targets[this.rndInt(0, targets.length - 1)]
        const solution = []
        paths.forEach((row, i) => row.forEach((cell, j) => cell.forEach((p, k) => {
            if (through(p, target)) solution.push(i + '_' + j + '_' + k)
        })))
        return { graph: g, target: target, paths: paths, solution: solution }
    },

    // ------------------------------------------------------------------ DOM-Helfer

    el: function (tag, cls, text) {
        const e = document.createElement(tag)
        if (cls) e.className = cls
        if (text !== undefined) e.textContent = text
        return e
    },
    // Die Sandbox der Playgrounds kennt kein document.createElementNS, daher SVG als Markup (innerHTML setzt den
    // richtigen Namensraum)
    svgTag: function (tag, attrs, inner) {
        const list = Object.keys(attrs).map(k => ' ' + k + '="' + attrs[k] + '"').join('')
        return '<' + tag + list + (inner === undefined ? '/>' : '>' + inner + '</' + tag + '>')
    },
    name: function (i) {
        return this.puzzle.graph.nodes[i].name
    },
    edgeName: function (i) {
        const e = this.puzzle.graph.edges[i]
        return [this.name(e.a), this.name(e.b)].sort().join('')
    },
    fmt: function (v) {
        if (v === null) return ''
        return v === this.INF ? '∞' : String(v)
    },

    // opts: { onEdge(i), edgeClass(i), nodeClass(i) }
    drawGraph: function (opts) {
        const g = this.puzzle.graph
        const R = 16
        const r1 = v => Math.round(v * 10) / 10
        const lines = [], labels = [], nodes = []
        const drawn = {}
        const arrow = this.uid + '-arrow'
        g.edges.forEach((e, i) => {
            const A = g.nodes[e.a], B = g.nodes[e.b]
            const extra = opts.edgeClass ? ' ' + opts.edgeClass(i) : ''
            if (g.directed) {
                const pair = Math.min(e.a, e.b) + '_' + Math.max(e.a, e.b)
                if (drawn[pair]) return
                drawn[pair] = true
                const both = g.edges.some(f => f.a === e.b && f.b === e.a)
                const len = Math.hypot(B.x - A.x, B.y - A.y)
                const ux = (B.x - A.x) / len, uy = (B.y - A.y) / len
                const attrs = {
                    x1: r1(A.x + ux * (R + 2)), y1: r1(A.y + uy * (R + 2)),
                    x2: r1(B.x - ux * (R + 2)), y2: r1(B.y - uy * (R + 2)),
                    class: 'quiz-graph-edge' + extra, 'marker-end': 'url(#' + arrow + ')',
                }
                if (both) attrs['marker-start'] = 'url(#' + arrow + ')'
                lines.push(this.svgTag('line', attrs))
                return
            }
            lines.push(this.svgTag('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 'quiz-graph-edge' + extra }))
            const txt = String(e.w)
            const w = 10 + 8 * txt.length
            const attrs = {
                class: 'quiz-graph-weight' + extra + (opts.onEdge ? ' clickable' : ''),
                transform: 'translate(' + r1((A.x + B.x) / 2) + ',' + r1((A.y + B.y) / 2) + ')',
                'data-edge': i,
            }
            if (opts.onEdge) {
                attrs.tabindex = 0
                attrs.role = 'button'
                attrs['aria-label'] = 'Kante ' + this.edgeName(i) + ' mit Gewicht ' + e.w
            }
            labels.push(this.svgTag('g', attrs,
                this.svgTag('rect', { x: -w / 2, y: -10, width: w, height: 20, rx: 3 }) +
                this.svgTag('text', { x: 0, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, txt)))
        })
        g.nodes.forEach((n, i) => {
            nodes.push(this.svgTag('g', {
                class: 'quiz-graph-node' + (opts.nodeClass ? ' ' + opts.nodeClass(i) : ''),
                transform: 'translate(' + n.x + ',' + n.y + ')',
            }, this.svgTag('circle', { r: R }) +
            this.svgTag('text', { x: 0, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, n.name)))
        })
        const defs = g.directed ? this.svgTag('defs', {}, this.svgTag('marker', {
            id: arrow, viewBox: '0 0 10 10', refX: 10, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
        }, this.svgTag('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'quiz-graph-arrow' }))) : ''
        const box = this.el('div', 'quiz-graph')
        box.innerHTML = this.svgTag('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 ' + g.width + ' ' + g.height,
            width: g.width,
            style: 'max-width:' + g.width + 'px',
            role: 'img',
            'aria-label': 'Graph mit den Knoten ' + g.nodes.map(n => n.name).join(', '),
        }, defs + this.svgTag('g', {}, lines.join('')) + this.svgTag('g', {}, labels.join('')) +
            this.svgTag('g', {}, nodes.join('')))
        if (opts.onEdge) {
            box.querySelectorAll('[data-edge]').forEach(grp => {
                const i = Number(grp.getAttribute('data-edge'))
                grp.addEventListener('click', () => opts.onEdge(i))
                grp.addEventListener('keydown', ev => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault()
                        opts.onEdge(i)
                    }
                })
            })
        }
        return box
    },

    // ------------------------------------------------------------------ Aufbau

    render: function () {
        const solution = this.config.view === 'solution'
        const root = this.el('div', 'quiz quiz-graphs')
        this.feedback = this.el('div', 'quiz-feedback')
        this.feedback.setAttribute('aria-live', 'polite')
        const info = this.el('p', 'quiz-graph-info')
        const body = this.el('div', 'quiz-graph-body')
        root.append(info, body)
        this.info = info
        this.body = body
        const builder = {
            dijkstra: this.buildDijkstra,
            path: this.buildPath,
            prim: this.buildMst,
            kruskal: this.buildMst,
            centrality: this.buildCentrality,
        }[this.task]
        builder.call(this, solution)

        if (solution) {
            const note = this.el('p', 'quiz-graph-note',
                'Lösung für den Graphen aus „Ihre Lösung“. Mit „Neuer Graph“ wird dort eine neue Aufgabe erzeugt.')
            root.append(note)
        } else {
            const actions = this.el('div', 'quiz-actions')
            const check = this.el('button', '', 'Prüfen')
            const clear = this.el('button', 'secondary', 'Zurücksetzen')
            const shuffle = this.el('button', 'secondary', '↻ Neuer Graph')
            check.type = clear.type = shuffle.type = 'button'
            clear.title = 'Eingaben löschen, Graph behalten'
            shuffle.title = 'Einen neuen zufälligen Graphen erzeugen'
            check.addEventListener('click', () => this.check())
            clear.addEventListener('click', () => {
                this.answer = {}
                this.save()
                this.render()
            })
            shuffle.addEventListener('click', () => this.newGraph())
            actions.append(check, clear, shuffle)
            root.append(actions, this.feedback)
        }
        this.canvasElement.empty().append(root)
    },

    setFeedback: function (kind, html) {
        this.feedback.className = 'quiz-feedback' + (kind ? ' ' + kind : '')
        this.feedback.innerHTML = html
    },
    clearFeedback: function () {
        if (this.feedback) this.setFeedback('', '')
        this.body.querySelectorAll('.ok, .bad').forEach(x => x.classList.remove('ok', 'bad'))
    },
    toggle: function (list, value) {
        const at = list.indexOf(value)
        if (at >= 0) list.splice(at, 1)
        else list.push(value)
        return at < 0
    },

    // ------------------------------------------------------------------ Dijkstra

    buildDijkstra: function (solution) {
        const p = this.puzzle
        const n = p.graph.nodes.length
        this.info.innerHTML = 'Startknoten: <b>' + this.name(p.start) + '</b>'
        if (!this.answer.cells) this.answer.cells = p.rows.map((row, r) => r === 0 ? null : row.map(() => ''))
        if (!this.answer.marks) this.answer.marks = []
        if (!this.answer.edges) this.answer.edges = []
        const a = this.answer

        const tree = p.pred.map((q, v) => q < 0 ? -1 : p.graph.edges.findIndex(e => (e.a === q && e.b === v) || (e.b === q && e.a === v)))
        let graphBox
        const drawGraph = () => {
            const box = this.drawGraph({
                onEdge: solution ? undefined : i => {
                    this.toggle(a.edges, i)
                    this.save()
                    const fresh = drawGraph()
                    graphBox.replaceWith(fresh)
                    graphBox = fresh
                },
                edgeClass: i => solution ? (tree.indexOf(i) >= 0 ? 'selected' : '') : (a.edges.indexOf(i) >= 0 ? 'noted' : ''),
                nodeClass: i => i === p.start ? 'start' : '',
            })
            return box
        }
        graphBox = drawGraph()

        const table = this.el('table', 'quiz-graph-table')
        const head = this.el('tr')
        p.graph.nodes.forEach(nd => head.appendChild(this.el('th', '', nd.name)))
        table.appendChild(head)
        this.cellInputs = []
        p.rows.forEach((row, r) => {
            const tr = this.el('tr')
            this.cellInputs[r] = []
            row.forEach((v, c) => {
                const td = this.el('td')
                const key = r + '_' + c
                if (solution) {
                    td.textContent = this.fmt(v)
                    if (p.order[r] === c) td.classList.add('marked')
                } else if (r === 0) {
                    td.textContent = this.fmt(v)
                    td.classList.add('static')
                } else {
                    const input = this.el('input')
                    input.type = 'text'
                    input.inputMode = 'numeric'
                    input.autocomplete = 'off'
                    input.maxLength = 4
                    input.value = a.cells[r][c]
                    input.setAttribute('aria-label', 'Zeile ' + r + ', Knoten ' + this.name(c))
                    input.addEventListener('input', () => {
                        a.cells[r][c] = input.value
                        input.classList.remove('ok', 'bad')
                        this.save()
                    })
                    input.addEventListener('change', () => {
                        const val = this.parseCell(input.value)
                        input.value = val === undefined ? input.value : this.fmt(val)
                        a.cells[r][c] = input.value
                        this.save()
                    })
                    input.addEventListener('keydown', ev => this.moveFocus(ev, r, c))
                    td.appendChild(input)
                    this.cellInputs[r][c] = input
                }
                if (!solution && r > 0) {
                    if (a.marks.indexOf(key) >= 0) td.classList.add('marked')
                    td.addEventListener('click', ev => {
                        if (ev.target !== td) return
                        td.classList.toggle('marked', this.toggle(a.marks, key))
                        this.save()
                    })
                }
                tr.appendChild(td)
            })
            table.appendChild(tr)
        })
        const tableBox = this.el('div', 'quiz-graph-tablebox')
        tableBox.appendChild(table)
        this.body.append(graphBox, tableBox)
        if (!solution) {
            this.body.appendChild(this.el('p', 'quiz-graph-note',
                'Unendlich als -1 oder ∞ eingeben, bereits abgearbeitete Knoten leer lassen. ' +
                'Ein Klick auf ein Kantengewicht oder auf den Rand einer Zelle markiert sie (nur als Gedächtnisstütze).'))
        }
    },
    moveFocus: function (ev, r, c) {
        const dirs = { ArrowUp: [-1, 0], ArrowDown: [1, 0], Enter: [1, 0] }
        const input = ev.target
        if (ev.key === 'ArrowLeft' && input.selectionStart === 0) dirs.ArrowLeft = [0, -1]
        if (ev.key === 'ArrowRight' && input.selectionEnd === input.value.length) dirs.ArrowRight = [0, 1]
        const d = dirs[ev.key]
        if (!d) return
        const next = (this.cellInputs[r + d[0]] || [])[c + d[1]]
        if (next) {
            ev.preventDefault()
            next.focus()
            next.select()
        }
    },
    // '' -> null (leer), -1/∞/- -> INF, Zahl -> Zahl, sonst undefined (ungültig)
    parseCell: function (text) {
        const t = String(text).trim().toLowerCase()
        if (t === '') return null
        if (t === '-1' || t === '-' || t === '∞' || t === 'inf' || t === 'oo') return this.INF
        if (/^\d+$/.test(t)) return Number(t)
        return undefined
    },
    checkDijkstra: function () {
        const p = this.puzzle
        const rows = this.body.querySelectorAll('table tr')
        let rowsOk = 0, filledVisited = 0, invalid = 0, emptyRows = 0
        let firstBad = -1
        for (let r = 1; r < p.rows.length; r++) {
            let ok = true
            if (this.answer.cells[r].every(raw => String(raw).trim() === '')) {
                emptyRows++
                if (firstBad < 0) firstBad = r
                continue
            }
            p.rows[r].forEach((expected, c) => {
                const td = rows[r + 1].children[c]
                const raw = this.answer.cells[r][c]
                const val = this.parseCell(raw)
                const good = val === expected
                if (val === undefined) invalid++
                if (!good && expected === null && val !== null) filledVisited++
                td.querySelector('input').classList.add(good ? 'ok' : 'bad')
                ok = ok && good
            })
            if (ok) rowsOk++
            else if (firstBad < 0) firstBad = r
        }
        const total = p.rows.length - 1
        if (rowsOk === total) {
            this.setFeedback('success', '<b>Richtig!</b> Alle ' + total + ' Zeilen stimmen.')
            return
        }
        const tips = []
        if (invalid) tips.push('Nur Zahlen, -1 bzw. ∞ oder leere Zellen sind erlaubt.')
        if (filledVisited) tips.push('Bereits abgearbeitete Knoten bleiben in allen folgenden Zeilen leer.')
        if (emptyRows) tips.push(emptyRows === 1 ? 'Eine Zeile ist noch leer.' : emptyRows + ' Zeilen sind noch leer.')
        if (firstBad > 0 && this.answer.cells[firstBad].some(raw => String(raw).trim() !== '')) {
            tips.push('Der erste Fehler steckt in Zeile ' + firstBad +
                '. Wurde in der Zeile davor der Knoten mit dem kleinsten Wert gewählt, und wurden alle seine Nachbarn aktualisiert?')
        }
        this.setFeedback(rowsOk === 0 ? 'error' : 'warning', '<b>' + rowsOk + ' von ' + total + ' Zeilen richtig.</b> ' + tips.join(' '))
    },

    // ------------------------------------------------------------------ Kürzester Pfad

    buildPath: function (solution) {
        const p = this.puzzle
        this.info.innerHTML = 'Gesucht: kürzester Pfad von <b>' + this.name(p.target) + '</b> nach <b>' +
            this.name(p.start) + '</b>'
        if (!this.answer.list) this.answer.list = [p.target]
        if (!this.answer.marks) this.answer.marks = []
        const a = this.answer
        const solMarks = p.marks.map(m => m.r + '_' + m.c)

        const table = this.el('table', 'quiz-graph-table')
        const head = this.el('tr')
        p.graph.nodes.forEach((nd, c) => {
            const th = this.el('th', solution ? '' : 'clickable', nd.name)
            if (!solution) {
                th.tabIndex = 0
                th.setAttribute('role', 'button')
                th.title = 'Knoten ' + nd.name + ' zum Pfad hinzufügen oder entfernen'
                const act = () => {
                    this.toggle(a.list, c)
                    this.save()
                    this.clearFeedback()
                    this.renderChips()
                }
                th.addEventListener('click', act)
                th.addEventListener('keydown', ev => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault()
                        act()
                    }
                })
            }
            head.appendChild(th)
        })
        table.appendChild(head)
        p.rows.forEach((row, r) => {
            const tr = this.el('tr')
            row.forEach((v, c) => {
                const td = this.el('td', 'static', this.fmt(v))
                const key = r + '_' + c
                if ((solution ? solMarks : a.marks).indexOf(key) >= 0) td.classList.add('marked')
                if (!solution) {
                    td.classList.add('clickable')
                    td.addEventListener('click', () => {
                        td.classList.toggle('marked', this.toggle(a.marks, key))
                        this.save()
                    })
                }
                tr.appendChild(td)
            })
            table.appendChild(tr)
        })
        const tableBox = this.el('div', 'quiz-graph-tablebox')
        tableBox.appendChild(table)

        this.chipBox = this.el('div', 'quiz-graph-chips')
        const chipLabel = this.el('div', 'quiz-graph-chiplabel', 'Kürzester Pfad:')
        const chipWrap = this.el('div', 'quiz-graph-chipwrap')
        chipWrap.append(chipLabel, this.chipBox)
        this.chipList = solution ? p.path : a.list
        this.chipText = i => this.name(i)
        this.chipEditable = !solution
        this.body.append(tableBox, chipWrap)
        if (solution) {
            const pathEdges = []
            for (let k = 0; k + 1 < p.path.length; k++) {
                const u = p.path[k], v = p.path[k + 1]
                pathEdges.push(p.graph.edges.findIndex(e => (e.a === u && e.b === v) || (e.b === u && e.a === v)))
            }
            this.body.appendChild(this.drawGraph({
                edgeClass: i => pathEdges.indexOf(i) >= 0 ? 'selected' : '',
                nodeClass: i => i === p.start ? 'start' : p.path.indexOf(i) >= 0 ? 'onpath' : '',
            }))
        } else {
            this.body.appendChild(this.el('p', 'quiz-graph-note',
                'Klick auf einen Knoten in der Kopfzeile fügt ihn hinzu bzw. entfernt ihn. Die Reihenfolge lässt sich per ' +
                'Drag & Drop oder mit den Pfeiltasten ändern. Klicks in die Tabelle markieren Zellen (nur als Gedächtnisstütze).'))
        }
        this.renderChips()
    },
    checkPath: function () {
        const p = this.puzzle
        const list = this.answer.list
        const chips = this.chipBox.children
        let correct = 0
        list.forEach((v, k) => {
            const ok = p.path[k] === v
            chips[k].classList.add(ok ? 'ok' : 'bad')
            if (ok) correct++
        })
        if (correct === p.path.length && list.length === p.path.length) {
            this.setFeedback('success', '<b>Richtig!</b> Der Pfad ' + p.path.map(i => this.name(i)).join(' → ') + ' stimmt.')
            return
        }
        const tips = []
        if (list.length < p.path.length) tips.push('Es fehlen noch Knoten.')
        if (list.length > p.path.length) tips.push('Der Pfad enthält zu viele Knoten.')
        if (list[list.length - 1] !== p.start) tips.push('Der Pfad endet beim Startknoten ' + this.name(p.start) + '.')
        tips.push('Tipp: Suche in der Spalte eines Knotens die Zeile, in der sein endgültiger Wert zuerst auftaucht. ' +
            'Der Knoten mit dem kleinsten Wert in der Zeile darüber ist sein Vorgänger.')
        this.setFeedback(correct === 0 ? 'error' : 'warning', '<b>Noch nicht richtig.</b> ' + tips.join(' '))
    },

    // ------------------------------------------------------------------ Prim / Kruskal

    buildMst: function (solution) {
        const p = this.puzzle
        this.info.innerHTML = this.task === 'prim'
            ? 'Minimaler Spannbaum mit Prim, Startknoten: <b>' + this.name(p.start) + '</b>'
            : 'Minimaler Spannbaum mit Kruskal'
        if (!this.answer.list) this.answer.list = []
        const a = this.answer
        this.chipList = solution ? p.tree : a.list
        this.chipText = i => this.edgeName(i)
        this.chipSub = i => String(this.puzzle.graph.edges[i].w)
        this.chipEditable = !solution
        let graphBox
        const drawGraph = () => this.drawGraph({
            onEdge: solution ? undefined : i => {
                this.toggle(a.list, i)
                this.save()
                this.clearFeedback()
                this.renderChips()
            },
            edgeClass: i => this.chipList.indexOf(i) >= 0 ? 'selected' : '',
            nodeClass: i => i === p.start ? 'start' : '',
        })
        graphBox = drawGraph()
        this.onChipsChanged = () => {
            const fresh = drawGraph()
            graphBox.replaceWith(fresh)
            graphBox = fresh
        }
        this.chipBox = this.el('div', 'quiz-graph-chips')
        const chipWrap = this.el('div', 'quiz-graph-chipwrap')
        chipWrap.append(this.el('div', 'quiz-graph-chiplabel', 'Eingefügte Kanten:'), this.chipBox)
        this.body.append(graphBox, chipWrap)
        if (!solution) {
            this.body.appendChild(this.el('p', 'quiz-graph-note',
                'Klick auf ein Kantengewicht fügt die Kante hinzu, ein erneuter Klick entfernt sie. Die Reihenfolge lässt ' +
                'sich per Drag & Drop oder mit den Pfeiltasten ändern.'))
        }
        this.renderChips()
    },
    checkMst: function () {
        const p = this.puzzle
        const g = p.graph
        const list = this.answer.list
        const chips = this.chipBox.children
        const wrong = list.filter(i => p.tree.indexOf(i) < 0).length
        const missing = p.tree.filter(i => list.indexOf(i) < 0).length
        let orderOk = true
        list.forEach((i, k) => {
            let ok = p.tree.indexOf(i) >= 0
            if (ok && this.task === 'prim') ok = p.tree[k] === i
            if (ok && this.task === 'kruskal') ok = k === 0 || g.edges[list[k - 1]].w <= g.edges[i].w
            if (p.tree.indexOf(i) >= 0 && !ok) orderOk = false
            chips[k].classList.add(ok ? 'ok' : 'bad')
        })
        if (!wrong && !missing && orderOk) {
            const sum = p.tree.reduce((s, i) => s + g.edges[i].w, 0)
            this.setFeedback('success', '<b>Richtig!</b> Der minimale Spannbaum hat das Gesamtgewicht ' + sum + '.')
            return
        }
        const tips = []
        if (wrong) tips.push(wrong + (wrong === 1 ? ' Kante gehört' : ' Kanten gehören') + ' nicht in den Spannbaum.')
        if (missing) tips.push(missing + (missing === 1 ? ' Kante fehlt' : ' Kanten fehlen') + ' noch.')
        if (!orderOk) {
            tips.push(this.task === 'prim'
                ? 'Die Reihenfolge stimmt nicht: Prim wählt immer die leichteste Kante, die den bisherigen Baum mit einem neuen Knoten verbindet.'
                : 'Die Reihenfolge stimmt nicht: Kruskal fügt die Kanten nach aufsteigendem Gewicht ein.')
        }
        if (list.length === g.nodes.length - 1 && (wrong || missing)) {
            tips.push('Ein Spannbaum hat immer genau ' + (g.nodes.length - 1) + ' Kanten, aber nicht alle gewählten stimmen.')
        }
        this.setFeedback(list.length && !wrong ? 'warning' : 'error', '<b>Noch nicht richtig.</b> ' + tips.join(' '))
    },

    // ------------------------------------------------------------------ Liste (Kanten bzw. Knoten), sortierbar

    renderChips: function () {
        const box = this.chipBox
        box.innerHTML = ''
        if (!this.chipList.length) {
            box.appendChild(this.el('span', 'quiz-graph-empty', this.task === 'path' ? 'noch keine Knoten' : 'noch keine Kanten'))
        }
        this.chipList.forEach((item, pos) => {
            const chip = this.el('span', 'quiz-graph-chip')
            chip.appendChild(document.createTextNode(this.chipText(item)))
            if (this.chipSub && this.task !== 'path') chip.appendChild(this.el('sub', '', this.chipSub(item)))
            if (this.chipEditable) {
                chip.tabIndex = 0
                chip.setAttribute('aria-label', (pos + 1) + '. ' + this.chipText(item) +
                    ' – Pfeiltasten verschieben, Entf entfernt')
                const del = this.el('button', 'quiz-graph-chipdel', '×')
                del.type = 'button'
                del.tabIndex = -1
                del.setAttribute('aria-label', 'Entfernen')
                del.addEventListener('click', () => this.chipRemove(pos))
                chip.appendChild(del)
                chip.addEventListener('keydown', ev => {
                    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
                        ev.preventDefault()
                        const to = pos + (ev.key === 'ArrowLeft' ? -1 : 1)
                        if (this.chipMove(pos, to)) box.children[to].focus()
                    } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
                        ev.preventDefault()
                        this.chipRemove(pos)
                    }
                })
                chip.addEventListener('pointerdown', e => this.chipDrag(e, chip, pos))
            }
            box.appendChild(chip)
        })
        if (this.onChipsChanged) this.onChipsChanged()
    },
    chipRemove: function (pos) {
        this.chipList.splice(pos, 1)
        this.save()
        this.clearFeedback()
        this.renderChips()
    },
    chipMove: function (from, to) {
        if (to < 0 || to >= this.chipList.length || from === to) return false
        const item = this.chipList.splice(from, 1)[0]
        this.chipList.splice(to, 0, item)
        this.save()
        this.clearFeedback()
        this.renderChips()
        return true
    },
    // Pointer-Events statt HTML5-Drag&Drop, damit es auch auf Touch-Geräten funktioniert
    chipDrag: function (e, chip, from) {
        if (e.button !== 0 || e.target.closest('button')) return
        e.preventDefault()
        const chips = Array.from(this.chipBox.children)
        const rects = chips.map(x => x.getBoundingClientRect())
        const sx = e.clientX, sy = e.clientY
        let to = from
        chip.setPointerCapture(e.pointerId)
        chip.classList.add('dragging')
        const onMove = ev => {
            chip.style.transform = 'translate(' + (ev.clientX - sx) + 'px,' + (ev.clientY - sy) + 'px)'
            let best = Infinity
            rects.forEach((r, i) => {
                const d = Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height / 2))
                if (d < best) { best = d; to = i }
            })
            chips.forEach((x, i) => x.classList.toggle('drop-target', i === to && i !== from))
        }
        const onUp = () => {
            chip.removeEventListener('pointermove', onMove)
            chip.removeEventListener('pointerup', onUp)
            chip.removeEventListener('pointercancel', onUp)
            chip.style.transform = ''
            chip.classList.remove('dragging')
            chips.forEach(x => x.classList.remove('drop-target'))
            if (!this.chipMove(from, to)) chip.focus()
        }
        chip.addEventListener('pointermove', onMove)
        chip.addEventListener('pointerup', onUp)
        chip.addEventListener('pointercancel', onUp)
    },

    // ------------------------------------------------------------------ Zwischenzentralität

    buildCentrality: function (solution) {
        const p = this.puzzle
        const names = p.graph.nodes.map(nd => nd.name)
        const T = names[p.target]
        this.info.innerHTML = 'Gesucht: alle Mengen, die für die Zwischenzentralität <i>Z</i>(' + T + ') von Knoten <b>' +
            T + '</b> in die Tabelle <i>δ</i><sub>' + T + '</sub>(<i>v<sub>i</sub></i>, <i>v<sub>j</sub></i>) übertragen werden.'
        if (!this.answer.selected) this.answer.selected = []
        const a = this.answer
        const table = this.el('table', 'quiz-graph-table quiz-graph-paths')
        const head = this.el('tr')
        const corner = this.el('th')
        corner.innerHTML = 'γ(<i>v<sub>i</sub></i>, <i>v<sub>j</sub></i>)'
        head.appendChild(corner)
        names.forEach(nm => head.appendChild(this.el('th', '', nm)))
        table.appendChild(head)
        p.paths.forEach((row, i) => {
            const tr = this.el('tr')
            tr.appendChild(this.el('th', '', names[i]))
            row.forEach((cell, j) => {
                const td = this.el('td')
                cell.forEach((path, k) => {
                    const id = i + '_' + j + '_' + k
                    const item = this.el(solution ? 'span' : 'button', 'quiz-graph-set', '{' + path.map(v => names[v]).join(',') + '}')
                    const on = (solution ? p.solution : a.selected).indexOf(id) >= 0
                    if (on) item.classList.add('marked')
                    if (!solution) {
                        item.type = 'button'
                        item.setAttribute('aria-pressed', String(on))
                        item.addEventListener('click', () => {
                            const now = this.toggle(a.selected, id)
                            item.classList.toggle('marked', now)
                            item.setAttribute('aria-pressed', String(now))
                            this.clearFeedback()
                            this.save()
                        })
                    }
                    item.dataset.id = id
                    td.appendChild(item)
                })
                tr.appendChild(td)
            })
            table.appendChild(tr)
        })
        const tableBox = this.el('div', 'quiz-graph-tablebox')
        tableBox.appendChild(table)
        this.body.appendChild(tableBox)
        if (solution) {
            this.body.appendChild(this.el('p', 'quiz-graph-note',
                'Zur Kontrolle der zugehörige gerichtete Graph, aus dem die Tabelle der kürzesten Wege stammt:'))
            this.body.appendChild(this.drawGraph({ nodeClass: i => i === p.target ? 'start' : '' }))
        } else {
            this.body.appendChild(this.el('p', 'quiz-graph-note', 'Ein Klick auf eine Menge markiert sie bzw. hebt die Markierung auf.'))
        }
    },
    checkCentrality: function () {
        const p = this.puzzle
        const sel = this.answer.selected
        let wrong = 0, missing = 0, endpoint = 0
        this.body.querySelectorAll('.quiz-graph-set').forEach(item => {
            const id = item.dataset.id
            const should = p.solution.indexOf(id) >= 0
            const is = sel.indexOf(id) >= 0
            if (should && is) item.classList.add('ok')
            if (is && !should) {
                item.classList.add('bad')
                wrong++
                const parts = id.split('_').map(Number)
                if (parts[0] === p.target || parts[1] === p.target) endpoint++
            }
            if (should && !is) missing++
        })
        if (!wrong && !missing) {
            this.setFeedback('success', '<b>Richtig!</b> Alle ' + p.solution.length + ' Mengen sind markiert.')
            return
        }
        const T = this.name(p.target)
        const tips = []
        if (wrong) tips.push(wrong + (wrong === 1 ? ' Menge ist' : ' Mengen sind') + ' zu viel markiert.')
        if (missing) tips.push(missing + (missing === 1 ? ' Menge fehlt' : ' Mengen fehlen') + ' noch.')
        if (endpoint) tips.push('Wege, die bei ' + T + ' beginnen oder enden, zählen nicht – ' + T + ' muss ein Zwischenknoten sein.')
        this.setFeedback(wrong && !missing ? 'warning' : 'error', '<b>Noch nicht richtig.</b> ' + tips.join(' '))
    },

    // ------------------------------------------------------------------ Prüfen

    check: function () {
        this.clearFeedback()
        const checker = {
            dijkstra: this.checkDijkstra,
            path: this.checkPath,
            prim: this.checkMst,
            kruskal: this.checkMst,
            centrality: this.checkCentrality,
        }[this.task]
        checker.call(this)
    },
}
