// Abenteuerkarte (karte.html): every chapter of the curriculum (catalog.js) is an island. A path leads from
// the arrival to the departure port; along it lie a castle (lecture slides, lecture examples and
// sandboxes), up to three houses (one exercise each), a village (the remaining exercises) and, where
// the chapter has homework, a volcano with its due date (see data/karte.json). Ships sail along
// dotted routes from island to island; a port only opens when all houses of its island are done.
//
// The art and the tile logic (coasts, paths, fog) come from the tileMap library of CodeBlocks
// (assets/tilemap/tilemap.json). The map's progress (fog, position, ships) is kept in localStorage;
// finished exercises are read from (and written to) the shared state of the Übungsplaner.
(() => {
    "use strict";

    const params = new URLSearchParams(location.search);
    const SHOW_HIDDEN = params.has("showHidden");
    const SHOW_DRAFTS = params.has("showDrafts");
    /** Same flags as uebersicht.html, carried into the exercise pages and back to the overview. */
    const FLAG_QUERY = [SHOW_HIDDEN && "showHidden", SHOW_DRAFTS && "showDrafts"].filter(Boolean).join("&");

    const CONFIG_URL = "./data/karte.json";
    const ASSETS = "./assets/tilemap/";
    const PLANER_KEY = "lernwerk.uebungsplaner.v1"; // state of uebersicht.html (done exercises)
    const STORAGE_KEY = `lernwerk.karte.v1${FLAG_QUERY ? `:${FLAG_QUERY}` : ""}`;
    /** Bump when the island generator changes: stored fog no longer matches the map then. */
    const GENERATOR = 15;

    const T = 16; // tile size in map pixels
    const THEMES = ["valley", "beach", "desert", "snow"];
    const SLOT_W = 40; // cells reserved for one island (or a small islet in an empty slot)
    const SLOT_H = 32;
    const MARGIN = 6; // open water around the archipelago
    const MAX_HOUSES = 3;
    const HERO_SPEED = 4.5; // cells per second
    const SHIP_SPEED = 7;
    const FERRY_SPEED = 18; // an empty ship coming over to pick the player up
    const REVEAL = 7; // fog radius around the player
    const SHIP_REVEAL = 7; // from the ship you may glimpse the coasts of later islands
    const ZOOMS = [1, 2, 3, 4, 5, 6]; // CSS pixels per map pixel
    const WALK_GRACE_MS = 150;
    const TEMPO_JITTER = 0.15;

    const FLIP = 1 << 16; // decoration flag: tile mirrored horizontally
    const DIRS = { N: [0, -1], NE: [1, -1], E: [1, 0], SE: [1, 1], S: [0, 1], SW: [-1, 1], W: [-1, 0], NW: [-1, -1] };
    const DIR_BY_ANGLE = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
    const TYPE_ORDER = ["lecture", "sandbox", "exercise", "test", "tool"];
    const LEVELS = ["", "sehr einfach", "einfach", "mittel", "schwer", "sehr schwer"];

    // little badge on finished houses
    const CHECK_ART = [".kkkkk.", "kGGGGGk", "kGGGGwk", "kwGGwGk", "kGwwGGk", "kGGGGGk", ".kkkkk."];
    const CHECK_COLORS = { k: "#14532d", G: "#22c55e", w: "#ffffff" };

    const $ = (id) => document.getElementById(id);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const esc = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    let tm; // tilemap.json
    let catalog, config, conceptById, typeById, exerciseById, knownIds;
    let tile; // tile id by name
    let W, H, GW, GH, placement, slotIsland, terrain, themeOf, deco, block, inter, fog, landNear;
    let dockAt = new Map(); // cell -> { island, route, end }
    let waterTiles = new Map(); // cell -> water tile with a tiny islet
    let extraLand = new Set(); // cells of the tiny islands next to the islands (not part of them)
    let islands = [];
    let routes = [];
    let interactables = [];
    let sprites = [];
    let sig;
    let state;
    let done = new Set();

    const images = new Map();
    let sheets = []; // tile sheet image per theme
    let layer, fogLayer, fogCtx;
    const fogDirty = [];
    let canvas, ctx, dpr = 1, view = { scale: 1, x: 0, y: 0 };
    // free: the player dragged the map; the camera stays there until the hero moves again
    const cam = { x: 0, y: 0, ready: false, free: false };

    // ------------------------------------------------------------------ helpers

    function mulberry32(seed) {
        return () => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const pick = (rng, list) => list[Math.floor(rng() * list.length)];

    /** Smooth random values in [0, 1] on a lattice with `step` cells. */
    function valueNoise(rng, w, h, step) {
        const gw = Math.ceil(w / step) + 2;
        const gh = Math.ceil(h / step) + 2;
        const g = Array.from({ length: gw * gh }, rng);
        return (x, y) => {
            const fx = x / step;
            const fy = y / step;
            const ix = Math.floor(fx);
            const iy = Math.floor(fy);
            const tx = fx - ix;
            const ty = fy - iy;
            const v = (a, b) => g[(iy + b) * gw + ix + a];
            const top = v(0, 0) * (1 - tx) + v(1, 0) * tx;
            const bottom = v(0, 1) * (1 - tx) + v(1, 1) * tx;
            return top * (1 - ty) + bottom * ty;
        };
    }

    const idx = (c, r) => r * W + c;
    const inside = (c, r) => c >= 0 && r >= 0 && c < W && r < H;
    const isLand = (c, r) => inside(c, r) && terrain[idx(c, r)] === 0;

    function dirOf(dx, dy) {
        return Object.keys(DIRS).find((d) => DIRS[d][0] === Math.sign(dx) && DIRS[d][1] === Math.sign(dy)) || "S";
    }

    function angleDir(dx, dy) {
        const a = Math.atan2(dy, dx);
        return DIR_BY_ANGLE[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
    }

    /** Small binary heap of [priority, value]. */
    class Heap {
        constructor() {
            this.a = [];
        }
        get size() {
            return this.a.length;
        }
        push(p, v) {
            const a = this.a;
            a.push([p, v]);
            let i = a.length - 1;
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (a[parent][0] <= a[i][0]) break;
                [a[parent], a[i]] = [a[i], a[parent]];
                i = parent;
            }
        }
        pop() {
            const a = this.a;
            const top = a[0];
            const last = a.pop();
            if (a.length) {
                a[0] = last;
                let i = 0;
                for (;;) {
                    const l = 2 * i + 1;
                    const r = l + 1;
                    let m = i;
                    if (l < a.length && a[l][0] < a[m][0]) m = l;
                    if (r < a.length && a[r][0] < a[m][0]) m = r;
                    if (m === i) break;
                    [a[m], a[i]] = [a[i], a[m]];
                    i = m;
                }
            }
            return top;
        }
    }

    // ------------------------------------------------------------------ exercises & shared state

    function pageHref(link, embedded = false) {
        // point directory links at "dir/" directly: many servers drop the query when redirecting "dir" -> "dir/"
        const [path, query] = link.split("?");
        const last = path.split("/").pop();
        const dir = path.endsWith("/") || last.includes(".") ? path : `${path}/`;
        const q = [query, FLAG_QUERY, embedded && "embedded"].filter(Boolean).join("&");
        return q ? `${dir}?${q}` : dir;
    }

    function readPlaner() {
        try {
            return JSON.parse(localStorage.getItem(PLANER_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function refreshDone() {
        const s = readPlaner();
        done = new Set(Array.isArray(s.done) ? s.done : []);
    }

    /** Toggles an exercise in the Übungsplaner's state (read fresh, so nothing of it is overwritten). */
    function toggleDone(id) {
        const s = readPlaner();
        const list = Array.isArray(s.done) ? s.done : [];
        s.done = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
        try {
            localStorage.setItem(PLANER_KEY, JSON.stringify(s));
        } catch (e) {
            // storage unavailable
        }
        refreshDone();
        refreshOpenViews();
        updateHud();
    }

    const doneCount = (list) => list.filter((ex) => done.has(ex.id)).length;

    // ------------------------------------------------------------------ world generation

    /**
     * The islands follow a winding walk over a grid of slots (8 directions, no slot twice), so the
     * archipelago does not read as rows. Seeded: the same number of islands gives the same layout.
     */
    function walkSlots(n, gw, gh) {
        const rng = mulberry32(4242 + n);
        const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
        const used = new Set();
        const path = [];
        let budget = 200000; // backtracking steps
        const go = (c, r, last) => {
            path.push({ col: c, row: r });
            used.add(r * gw + c);
            if (path.length === n) return true;
            // random order, but going on straight comes last: the route keeps turning
            const options = dirs
                .map((d) => ({ d, key: rng() + (last && d[0] === last[0] && d[1] === last[1] ? 1 : 0) }))
                .sort((a, b) => a.key - b.key)
                .map((o) => o.d);
            for (const d of options) {
                const cc = c + d[0];
                const rr = r + d[1];
                if (cc < 0 || rr < 0 || cc >= gw || rr >= gh || used.has(rr * gw + cc)) continue;
                if (--budget < 0) break;
                if (go(cc, rr, d)) return true;
            }
            path.pop();
            used.delete(r * gw + c);
            return false;
        };
        if (go(0, Math.floor(rng() * gh), null)) return path;
        // fallback: rows back and forth
        return Array.from({ length: n }, (_, i) => {
            const row = Math.floor(i / gw);
            return { row, col: row % 2 ? gw - 1 - (i % gw) : i % gw };
        });
    }

    function slotOf(i) {
        const { col, row } = placement[i];
        // the arrival port faces the previous island, the departure port is on the other side
        const prev = placement[i - 1];
        const eastward = !prev || prev.col <= col;
        return { row, col, eastward, ox: MARGIN + col * SLOT_W, oy: MARGIN + row * SLOT_H };
    }

    /** Index of the island whose slot contains the cell, or -1 (open sea or an islet). */
    function islandIndexAt(c, r) {
        const col = clamp(Math.floor((c - MARGIN) / SLOT_W), 0, GW - 1);
        const row = clamp(Math.floor((r - MARGIN) / SLOT_H), 0, GH - 1);
        return slotIsland[row * GW + col];
    }

    function buildWorld() {
        const chapters = [...catalog.chapters]
            .sort((a, b) => a.number - b.number)
            .map((ch) => ({ ...ch, items: catalog.exercises.filter((ex) => ex.chapter === ch.number) }))
            .filter((ch) => ch.items.length);
        // about a third of the slots stay empty (open sea or islets)
        GW = Math.max(2, Math.ceil(Math.sqrt(chapters.length * 1.45)));
        GH = Math.max(1, Math.ceil((chapters.length * 1.45) / GW));
        placement = walkSlots(chapters.length, GW, GH);
        slotIsland = new Int16Array(GW * GH).fill(-1);
        placement.forEach((p, i) => (slotIsland[p.row * GW + p.col] = i));
        W = 2 * MARGIN + GW * SLOT_W;
        H = 2 * MARGIN + GH * SLOT_H;
        const n = W * H;
        terrain = new Uint8Array(n).fill(1); // 0 land, 1 water
        themeOf = new Uint8Array(n);
        deco = new Int32Array(n);
        block = new Uint8Array(n);
        inter = new Int16Array(n).fill(-1);
        dockAt = new Map();
        waterTiles = new Map();
        extraLand = new Set();
        interactables = [];
        sprites = [];
        islands = chapters.map((ch, i) => buildIsland(ch, i));
        for (let slot = 0; slot < GW * GH; slot++) {
            if (slotIsland[slot] < 0) buildIslet(slot);
        }

        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                const i = islandIndexAt(c, r);
                const slot = clamp(Math.floor((r - MARGIN) / SLOT_H), 0, GH - 1) * GW + clamp(Math.floor((c - MARGIN) / SLOT_W), 0, GW - 1);
                themeOf[idx(c, r)] = i < 0 ? isletTheme(slot) : islands[i].theme;
            }
        }
        islands.forEach((isl, i) => {
            dockAt.set(idx(...isl.arrival.dock), { island: i, route: i - 1, end: "b" });
            dockAt.set(idx(...isl.departure.dock), { island: i, route: i < islands.length - 1 ? i : -1, end: "a" });
        });

        // water cells close to land: routes keep away from them
        landNear = new Uint8Array(n);
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                // islets and rocks count like land: the tracks keep away from them too
                if (terrain[idx(c, r)] !== 0 && !block[idx(c, r)]) continue;
                for (let y = r - 2; y <= r + 2; y++) {
                    for (let x = c - 2; x <= c + 2; x++) {
                        if (inside(x, y)) landNear[idx(x, y)] = Math.max(landNear[idx(x, y)], Math.max(Math.abs(x - c), Math.abs(y - r)) <= 1 ? 2 : 1);
                    }
                }
            }
        }
        // the name plate floats in the water above the island: centred over its land, above its north coast
        islands.forEach((isl) => {
            const [x0, y0, x1, y1] = isl.bounds;
            let minC = x1, maxC = x0, minR = y1, maxR = y0;
            for (let r = y0; r <= y1; r++) {
                for (let c = x0; c <= x1; c++) {
                    if (terrain[idx(c, r)] !== 0 || extraLand.has(idx(c, r))) continue;
                    minC = Math.min(minC, c);
                    maxC = Math.max(maxC, c);
                    minR = Math.min(minR, r);
                    maxR = Math.max(maxR, r);
                }
            }
            isl.label = [(minC + maxC + 1) / 2, minR];
            isl.southCoast = maxR + 1; // first row below the island
        });
        routes = islands.slice(1).map((_, i) => buildRoute(i));
        sig = [GENERATOR, W, H, ...islands.map((isl) => `${isl.chapter.number}:${isl.items.map((ex) => ex.id).join("|")}`)].join(",");
    }

    function addInteractable(it) {
        const n = interactables.length;
        interactables.push(it);
        it.index = n;
        it.cells.forEach(([c, r]) => {
            inter[idx(c, r)] = n;
            block[idx(c, r)] = 1;
        });
        return it;
    }

    function buildIsland(ch, i) {
        const rng = mulberry32(ch.number * 7919 + 17);
        const { ox, oy, eastward } = slotOf(i);
        const theme = i % THEMES.length;

        // houses: the exercises picked in data/karte.json (houses.<chapter>), filled up with the
        // chapter's first exercises. The other exercises and tools live in the village, lecture
        // examples and sandboxes (and the slides) in the castle, the homework in the volcano.
        const practice = (ex) => ["exercise", "test", "tool"].includes(ex.type);
        (config.houses?.[ch.number] || [])
            .filter((id) => !knownIds.has(id))
            .forEach((id) => console.warn(`karte: unknown exercise "${id}" in houses.${ch.number} of data/karte.json`));
        const picked = (config.houses?.[ch.number] || []).map((id) => ch.items.find((ex) => ex.id === id)).filter(Boolean);
        const houses = [...new Set([...picked, ...ch.items.filter(practice)])].slice(0, MAX_HOUSES);
        const byOrder = (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
        const villageList = ch.items.filter((ex) => practice(ex) && !houses.includes(ex)).sort(byOrder);
        const castleList = ch.items.filter((ex) => !practice(ex)).sort(byOrder);
        const slides = config.lectures?.[ch.number] || [];
        const volcano = config.homework?.[ch.number] || null;

        // features along the path, in walking order from the arrival port: the castle, the houses in
        // pairs facing each other across the path, the village
        // `dx`: column within the group, `spur`: length of a side path between the road and the building
        const groups = [];
        if (castleList.length || slides.length) {
            groups.push([{ kind: "castle", w: 3, h: 2, list: castleList, slides, up: true, dx: 0, spur: 0, bend: 0 }]);
        }
        // houses: side by side on one side of the road, or alone: at the road, up a short side path,
        // or off to the side at the end of a side path with a bend (`bend`: -1 left, 1 right). Never
        // opposite each other: the prompt bubble of the lower one would hide the upper one.
        const singles = houses.map((ex) => ({ kind: "house", w: 1, h: 1, ex, variant: Math.floor(rng() * 3), dx: 0, spur: 0, bend: 0 }));
        for (let j = 0; j < singles.length; ) {
            const v = rng();
            if (singles.length - j >= 2 && v < 0.3) {
                const [a, b] = singles.slice(j, j + 2);
                a.up = b.up = rng() < 0.5;
                b.dx = 2;
                groups.push([a, b]);
                j += 2;
            } else {
                const a = singles[j];
                a.up = rng() < 0.5;
                const w = rng();
                if (w < 0.4) a.spur = 1 + Math.floor(rng() * 2);
                else if (w < 0.75) a.bend = rng() < 0.5 ? -1 : 1;
                groups.push([a]);
                j += 1;
            }
        }
        if (villageList.length) {
            groups.push([{ kind: "village", w: 2, h: 2, list: villageList, up: rng() < 0.5, dx: 0, spur: rng() < 0.4 ? 1 : 0, bend: 0 }]);
        }
        if (!eastward) groups.reverse();
        const feats = groups.flat();

        let cursor = 3;
        groups.forEach((group) => {
            group.forEach((f) => (f.rx = cursor + f.dx));
            cursor += Math.max(...group.map((f) => f.dx + f.w)) + 4;
        });
        const L = Math.max(cursor, 16);
        const centre = Math.floor((L - cursor) / 2);
        const xs = clamp(ox + Math.floor((SLOT_W - L) / 2) + Math.floor(rng() * 9) - 4, ox + 4, ox + SLOT_W - 4 - L);
        const xe = xs + L - 1;
        const py = oy + 15 + Math.floor(rng() * 6);
        feats.forEach((f) => (f.x = xs + f.rx + centre));

        // the path meanders up and down, but runs straight in front of buildings and at the ports
        const straight = new Set([xs, xs + 1, xe - 1, xe]);
        feats.forEach((f) => {
            for (let x = f.x - 1; x <= f.x + f.w; x++) straight.add(x);
        });
        const path = [];
        const pathY = {};
        let y = py;
        let bent = -9; // last column with a bend: two bends side by side would form a loop
        for (let x = xs; x <= xe; x++) {
            path.push([x, y]);
            if (!straight.has(x) && x - bent > 1 && rng() < 0.6) {
                bent = x;
                let target = py + Math.floor(rng() * 5) - 2;
                if (target === y) target = clamp(y + (rng() < 0.5 ? -2 : 2), py - 2, py + 2);
                while (y !== target) {
                    y += Math.sign(target - y);
                    path.push([x, y]);
                }
            }
            pathY[x] = y;
        }

        const core = [...path];
        const spurs = []; // side paths from the road to buildings
        feats.forEach((f) => {
            const fy = pathY[f.x];
            const dir = f.up ? -1 : 1;
            f.hx = f.x; // column of the building
            if (f.bend) {
                // two cells away from the road, then one to the side; the house stands beyond. The cell
                // between the road and the bend stays free, so the path tiles do not join into a loop.
                spurs.push([f.x, fy + dir], [f.x, fy + 2 * dir], [f.x + f.bend, fy + 2 * dir]);
                f.hx = f.x + f.bend;
                f.top = fy + 3 * dir;
            } else {
                f.top = f.up ? fy - f.spur - f.h : fy + 1 + f.spur;
                for (let k = 1; k <= f.spur; k++) spurs.push([f.x, fy + k * dir]);
            }
            f.cells = [];
            for (let dy = 0; dy < f.h; dy++) for (let dx = 0; dx < f.w; dx++) f.cells.push([f.hx + dx, f.top + dy]);
            core.push(...f.cells);
        });
        core.push(...spurs);

        let vol = null;
        const branch = []; // side path from the road up to the volcano
        let branchEnd = null; // its last piece, hidden under the foot of the volcano
        if (volcano) {
            const upper = feats.filter((f) => f.up);
            const top = (x) => Math.min(...path.filter(([c]) => c === x).map(([, r]) => r));
            // the side path leaves the road where no building stands above it and no bend of the road
            // runs beside it (the path tiles would join into a loop)
            const fits = (x) =>
                !upper.some((f) => x === f.x || f.cells.some(([c]) => c === x)) &&
                ![...path, ...spurs].some(([c, r]) => Math.abs(c - x) === 1 && r < top(x));
            const starts = Array.from({ length: Math.max(1, L - 6) }, (_, k) => xs + 1 + k);
            for (let k = starts.length - 1; k > 0; k--) {
                const j = Math.floor(rng() * (k + 1));
                [starts[k], starts[j]] = [starts[j], starts[k]];
            }
            let vx = starts[0];
            let cx;
            for (const x of starts) {
                cx = [x + 2, x + 1, x + 3, x, x + 4].find(fits);
                if (cx !== undefined) {
                    vx = x;
                    break;
                }
            }
            // one free row above the highest path piece or building below the volcano
            const below = core.filter(([c]) => c >= vx - 1 && c <= vx + 5).map(([, r]) => r);
            const vy = Math.min(...below) - 5;
            vol = { x: vx, y: vy, cells: [] };
            for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 5; dx++) vol.cells.push([vx + dx, vy + dy]);
            core.push(...vol.cells);
            if (cx !== undefined) {
                for (let yy = vy + 4; yy < top(cx); yy++) branch.push([cx, yy]);
                branchEnd = [cx, vy + 3];
                core.push(...branch);
            }
        }

        // ports at both ends of the path, with an open water lane out to the edge of the slot. A port is
        // at the west or east end of the road, or (sometimes) on the south coast: the road turns down
        // to it at the end and the downward pier of the tile sheets (DOCK_2) is used.
        const end = (x, side) => {
            if (rng() < 0.3) {
                const depth = 3 + Math.floor(rng() * 3);
                for (let k = 1; k <= depth; k++) path.push([x, pathY[x] + k]);
                core.push(...path.slice(-depth));
                const y = pathY[x] + depth;
                return { side: "S", land: [x, y], dock: [x, y + 1], ship: [x, y + 2] };
            }
            const d = side === "E" ? 1 : -1;
            return { side, land: [x, pathY[x]], dock: [x + d, pathY[x]], ship: [x + 2 * d, pathY[x]] };
        };
        const west = end(xs, "W");
        const east = end(xe, "E");
        const water = new Set();
        for (const e of [west, east]) {
            const [dx, dy] = DIRS[e.side];
            for (let k = 1; ; k++) {
                const x = e.land[0] + dx * k;
                const y = e.land[1] + dy * k;
                if (x < ox || x >= ox + SLOT_W || y >= oy + SLOT_H) break;
                const spread = k <= 3 ? 2 : 1;
                for (let o = -spread; o <= spread; o++) water.add(dy ? idx(x + o, y) : idx(x, y + o));
            }
        }

        // land: everything near the core, with a noisy coast
        const coreSet = new Set(core.map(([c, r]) => idx(c, r)));
        // Euclidean distance to the core: round coasts instead of boxes
        const D = new Float32Array(SLOT_W * SLOT_H).fill(99);
        const local = (c, r) => (r - oy) * SLOT_W + (c - ox);
        const inSlot = (c, r) => c >= ox && r >= oy && c < ox + SLOT_W && r < oy + SLOT_H;
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) {
                let d = 99;
                for (const [a, b] of core) d = Math.min(d, Math.hypot(a - c, b - r));
                D[local(c, r)] = d;
            }
        }
        const noise = valueNoise(rng, SLOT_W, SLOT_H, 5);
        const land = new Uint8Array(SLOT_W * SLOT_H);
        const inner = (c, r) => c > ox && r > oy && c < ox + SLOT_W - 1 && r < oy + SLOT_H - 1;
        const fixed = (c, r) => coreSet.has(idx(c, r)) || water.has(idx(c, r));
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) {
                land[local(c, r)] =
                    inner(c, r) && !water.has(idx(c, r)) && D[local(c, r)] <= 1.5 + noise(c - ox, r - oy) * 3.8 ? 1 : 0;
            }
        }
        for (let pass = 0; pass < 2; pass++) {
            const next = land.slice();
            for (let r = oy + 1; r < oy + SLOT_H - 1; r++) {
                for (let c = ox + 1; c < ox + SLOT_W - 1; c++) {
                    if (fixed(c, r)) continue;
                    let n = 0;
                    for (const [dx, dy] of Object.values(DIRS)) n += land[local(c + dx, r + dy)];
                    if (!land[local(c, r)] && n >= 5) next[local(c, r)] = 1;
                    else if (land[local(c, r)] && n <= 2) next[local(c, r)] = 0;
                }
            }
            land.set(next);
        }
        // fill lakes: water that cannot be reached from the edge of the slot
        const seen = new Uint8Array(SLOT_W * SLOT_H);
        const flood = [];
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) {
                if (!inner(c, r) && !land[local(c, r)]) {
                    seen[local(c, r)] = 1;
                    flood.push([c, r]);
                }
            }
        }
        for (let q = 0; q < flood.length; q++) {
            const [c, r] = flood[q];
            for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const cc = c + dx;
                const rr = r + dy;
                if (inSlot(cc, rr) && !seen[local(cc, rr)] && !land[local(cc, rr)]) {
                    seen[local(cc, rr)] = 1;
                    flood.push([cc, rr]);
                }
            }
        }
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) {
                if (!land[local(c, r)] && !seen[local(c, r)] && !water.has(idx(c, r))) land[local(c, r)] = 1;
            }
        }
        // drop stray islets: only land connected to the core stays
        const main = new Uint8Array(SLOT_W * SLOT_H);
        const grow = [core[0]];
        main[local(...core[0])] = 1;
        for (let q = 0; q < grow.length; q++) {
            const [c, r] = grow[q];
            for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const cc = c + dx;
                const rr = r + dy;
                if (inSlot(cc, rr) && land[local(cc, rr)] && !main[local(cc, rr)]) {
                    main[local(cc, rr)] = 1;
                    grow.push([cc, rr]);
                }
            }
        }
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) land[local(c, r)] = main[local(c, r)];
        }
        const lake = carveWater(rng, land, D, local, inSlot, ox, oy, water);
        for (let r = oy; r < oy + SLOT_H; r++) {
            for (let c = ox; c < ox + SLOT_W; c++) terrain[idx(c, r)] = land[local(c, r)] ? 0 : 1;
        }

        const island = {
            index: i,
            chapter: ch,
            items: ch.items,
            theme,
            eastward,
            houses: [],
            castle: null,
            village: null,
            volcano: null,
            arrival: eastward ? west : east,
            departure: eastward ? east : west,
            centre: [xs + Math.floor(L / 2), py],
            // tilt of the name banner: 2 to 5 degrees, alternating up and down from island to island
            tilt: (i % 2 ? 1 : -1) * (2 + rng() * 3) * (Math.PI / 180),
            villageName: config.villages?.[ch.number] || "Übungsdorf",
            castleName: config.castles?.[ch.number] || "Vorlesungsburg",
            bounds: [ox, oy, ox + SLOT_W - 1, oy + SLOT_H - 1],
        };

        [...path, ...spurs, ...branch, ...(branchEnd ? [branchEnd] : [])].forEach(([c, r]) => (deco[idx(c, r)] = tile.PATH));
        const houseTiles = [tile.HOUSE, tile.HOUSE_2, tile.HOUSE_3];
        feats.forEach((f) => {
            const it = addInteractable({
                kind: f.kind, island: i, cells: f.cells, top: f.top, ex: f.ex, list: f.list, slides: f.slides,
            });
            if (f.kind === "house") {
                deco[idx(f.hx, f.top)] = houseTiles[f.variant % houseTiles.length];
                island.houses.push(it);
            } else {
                const sprite = f.kind === "castle" ? tm.sprites.CASTLE : tm.sprites.VILLAGE;
                sprite.tiles.forEach((line, dy) => line.forEach((id, dx) => (deco[idx(f.x + dx, f.top + dy)] = id)));
                island[f.kind] = it;
            }
        });
        if (vol) {
            island.volcano = addInteractable({ kind: "volcano", island: i, cells: vol.cells, top: vol.y, homework: volcano });
            island.volcano.sprite = addSprite("VOLCANO", vol.x, vol.y, theme);
            // the volcano smokes while the homework runs and sleeps before and after
            if (homeworkState(volcano) !== "open") island.volcano.sprite.anim = "idle";
            island.volcano.sprite.rest = island.volcano.sprite.anim;
        }
        // DOCK brings its own strip of coast on its west edge: as drawn for an east coast, mirrored for a west coast
        for (const e of [west, east]) {
            deco[idx(...e.dock)] = e.side === "S" ? tile.DOCK_2 : e.side === "W" ? tile.DOCK | FLIP : tile.DOCK;
        }

        // nature: trees keep a cell away from paths and buildings, flowers and grass may come closer
        // single trees; TREES_1 and TREES_2 are the left and right half of one group (placed together)
        const trees = ["TREE_1", "TREE_2", "TREE_3", "BUSH"].map((n) => tile[n]);
        const flowers = ["FLOWERS_1", "FLOWERS_2", "FLOWERS_3", "FLOWERS_4"].map((n) => tile[n]);
        const details = ["GROUND_DETAIL_1", "GROUND_DETAIL_2", "GROUND_DETAIL_3", "GROUND_DETAIL_4", "GROUND_DETAIL_5"].map((n) => tile[n]);
        const waterCells = [];
        for (let r = oy + 1; r < oy + SLOT_H - 1; r++) {
            for (let c = ox + 1; c < ox + SLOT_W - 1; c++) {
                const k = idx(c, r);
                if (!land[local(c, r)]) {
                    if (!water.has(k)) waterCells.push([c, r]);
                    continue;
                }
                if (coreSet.has(k) || deco[k]) continue;
                const v = rng();
                const right = idx(c + 1, r);
                const roomRight = c + 1 < ox + SLOT_W - 1 && land[local(c + 1, r)] && !coreSet.has(right) && !deco[right] && D[local(c + 1, r)] >= 2;
                if (D[local(c, r)] >= 2 && v < 0.05 && roomRight) {
                    // a group of trees over two cells
                    deco[k] = tile.TREES_1;
                    deco[right] = tile.TREES_2;
                    block[k] = block[right] = 1;
                } else if (D[local(c, r)] >= 2 && v < 0.17) {
                    deco[k] = pick(rng, trees);
                    block[k] = 1;
                } else if (v < 0.25) deco[k] = pick(rng, flowers);
                else if (v < 0.31) deco[k] = pick(rng, details);
                else if (v < 0.33) addSprite(rng() < 0.5 ? "GRASS_WIND" : "GRASS_WIND_2", c, r, theme);
            }
        }
        // life in the water
        const landAround = (c, r, d) => {
            for (let y = r - d; y <= r + d; y++) for (let x = c - d; x <= c + d; x++) if (isLand(x, y)) return true;
            return false;
        };
        const nearLane = (c, r) => {
            for (let y = r - 2; y <= r + 2; y++) for (let x = c - 2; x <= c + 2; x++) if (water.has(idx(x, y))) return true;
            return false;
        };
        if (waterCells.length) {
            for (let n = 0; n < 5; n++) {
                const [c, r] = pick(rng, waterCells);
                addSprite(rng() < 0.5 ? "WATER_RIPPLES" : "WATER_RIPPLES_2", c, r, theme);
            }
            // ducks on the lake: one or two
            const pond = [...lake];
            for (let n = 0; n < (pond.length >= 8 ? 2 : 1) && pond.length; n++) {
                const [c, r] = pond.splice(Math.floor(rng() * pond.length), 1)[0];
                addSprite(pick(rng, ["DUCK_BROWN", "DUCK_GREEN", "DUCK_YELLOW"]), c, r, theme);
            }
            const coast = waterCells.filter(([c, r]) => landAround(c, r, 1) && !nearLane(c, r));
            if (coast.length && rng() < 0.8) {
                const [c, r] = pick(rng, coast);
                addSprite(pick(rng, ["DUCK_BROWN", "DUCK_GREEN", "DUCK_YELLOW"]), c, r, theme);
            }
            const open = waterCells.filter(([c, r]) => !landAround(c, r, 2) && !nearLane(c, r));
            const rocks = ["ROCKS_1", "ROCKS_2", "ROCKS_3", "ROCK_1", "ROCK_2", "ROCK_3"].map((n) => tile[n]);
            for (let n = 0; n < 2 && open.length; n++) {
                const [c, r] = pick(rng, open);
                deco[idx(c, r)] = pick(rng, rocks);
                block[idx(c, r)] = 1;
            }
            // tiny islets of the tile sheets around the coast: open water, not right at the shore
            const islets = ["WATER_ISLAND", "WATER_ISLAND_2", "WATER_ISLETS", "WATER_ISLETS_2", "WATER_ISLETS_3",
                "WATER_ISLETS_4", "WATER_ISLETS_5", "WATER_ISLETS_6", "WATER_ISLETS_7"].map((n) => tile[n]);
            const freeWater = (c, r) => !nearLane(c, r) && !deco[idx(c, r)] && !block[idx(c, r)] && terrain[idx(c, r)] === 1;
            const offshore = waterCells.filter(([c, r]) => !landAround(c, r, 1) && landAround(c, r, 4) && freeWater(c, r));
            // in clusters: 1 to 3 groups of 3 to 6 islet tiles each
            const clusters = 1 + Math.floor(rng() * 3);
            for (let n = 0; n < clusters && offshore.length; n++) {
                const [cc, cr] = pick(rng, offshore);
                const around = offshore.filter(([c, r]) => Math.max(Math.abs(c - cc), Math.abs(r - cr)) <= 2);
                const size = 3 + Math.floor(rng() * 4);
                for (let m = 0; m < size && around.length; m++) {
                    const [c, r] = around.splice(Math.floor(rng() * around.length), 1)[0];
                    waterTiles.set(idx(c, r), pick(rng, islets));
                    block[idx(c, r)] = 1; // ships sail around them
                }
            }
            // sometimes a tiny regular island nearby: an L, 2 x 2, 2 x 3 or 3 x 2 cells of land
            if (rng() < 0.5) {
                const shapes = [
                    [[0, 0], [0, 1], [1, 1]], [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]],
                    [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
                    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
                ];
                const shape = pick(rng, shapes);
                // all of it in open water, two cells away from other land, islets and the lanes
                const clear = (c, r) => {
                    for (let y = r - 2; y <= r + 2; y++) {
                        for (let x = c - 2; x <= c + 2; x++) {
                            if (!inner(x, y) || isLand(x, y) || waterTiles.has(idx(x, y)) || !freeWater(x, y)) return false;
                        }
                    }
                    return true;
                };
                const spots = waterCells.filter(([c, r]) => landAround(c, r, 7) && shape.every(([dx, dy]) => clear(c + dx, r + dy)));
                if (spots.length) {
                    const [c, r] = pick(rng, spots);
                    shape.forEach(([dx, dy]) => {
                        const k = idx(c + dx, r + dy);
                        terrain[k] = 0;
                        extraLand.add(k);
                        if (rng() < 0.45) {
                            deco[k] = pick(rng, trees);
                            block[k] = 1;
                        } else if (rng() < 0.3) deco[k] = pick(rng, flowers);
                    });
                }
            }
            const wide = open.filter(([c, r]) => [1, 2, 3].every((dx) => open.some(([a, b]) => a === c + dx && b === r)));
            if (wide.length && rng() < 0.35) {
                const [c, r] = pick(rng, wide);
                addSprite("SHARK_SWIMMING", c, r, theme);
            }
        }
        return island;
    }

    /**
     * Sometimes an inland lake, sometimes a river from the lake (or from the hills) down to the sea.
     * Water only replaces land at least 2 cells away from paths, buildings and the volcano (`D` is the
     * distance to them), so nothing gets cut off: there is no bridge in the tile sheets.
     */
    function carveWater(rng, land, D, local, inSlot, ox, oy, lanes) {
        const free = (c, r) => inSlot(c, r) && land[local(c, r)] && D[local(c, r)] >= 2;
        const inner = (c, r) => c > ox + 1 && r > oy + 1 && c < ox + SLOT_W - 2 && r < oy + SLOT_H - 2 && !lanes.has(idx(c, r));
        const cells = [];
        for (let r = oy + 1; r < oy + SLOT_H - 1; r++) {
            for (let c = ox + 1; c < ox + SLOT_W - 1; c++) if (land[local(c, r)]) cells.push([c, r]);
        }
        const lake = [];
        if (rng() < 0.5) {
            // the island bulges out a little around the lake, so it really is inland
            const spots = cells.filter(([c, r]) => D[local(c, r)] >= 2.6);
            for (let attempt = 0; attempt < 6 && spots.length && !lake.length; attempt++) {
                const [lc, lr] = pick(rng, spots);
                const rx = 1.4 + rng() * 1.2;
                const ry = 1.1 + rng() * 0.8;
                const water = [];
                const shore = [];
                let ok = true;
                for (let r = lr - 5; r <= lr + 5 && ok; r++) {
                    for (let c = lc - 6; c <= lc + 6 && ok; c++) {
                        const e = ((c - lc) / rx) ** 2 + ((r - lr) / ry) ** 2;
                        const ring = ((c - lc) / (rx + 1.6)) ** 2 + ((r - lr) / (ry + 1.6)) ** 2;
                        if (e <= 1) {
                            if (!inner(c, r) || D[local(c, r)] < 2) ok = false;
                            else water.push([c, r]);
                        } else if (ring <= 1) {
                            if (!inner(c, r)) ok = false;
                            else shore.push([c, r]);
                        }
                    }
                }
                if (!ok || water.length < 4) continue;
                shore.forEach(([c, r]) => (land[local(c, r)] = 1));
                water.forEach(([c, r]) => (land[local(c, r)] = 0));
                lake.push(...water);
            }
        }
        // sometimes a bay: an inlet that opens to the sea (no shore ring around it)
        if (rng() < 0.45) {
            const touchesSea = (c, r) => [[0, 1], [1, 0], [0, -1], [-1, 0]].some(
                ([dx, dy]) => inSlot(c + dx, r + dy) && !land[local(c + dx, r + dy)] && !lake.some(([a, b]) => a === c + dx && b === r + dy)
            );
            // close to the coast, but away from paths and buildings
            const coastal = cells.filter(([c, r]) => free(c, r) && D[local(c, r)] >= 2.5 && touchesSea(c, r));
            if (coastal.length) {
                const [bc, br] = pick(rng, coastal);
                const rx = 1.5 + rng() * 1.5;
                const ry = 1.2 + rng() * 1.2;
                const bay = [];
                for (let r = br - 4; r <= br + 4; r++) {
                    for (let c = bc - 4; c <= bc + 4; c++) {
                        if (free(c, r) && inner(c, r) && ((c - bc) / rx) ** 2 + ((r - br) / ry) ** 2 <= 1) bay.push([c, r]);
                    }
                }
                if (bay.length >= 3) bay.forEach(([c, r]) => (land[local(c, r)] = 0));
            }
        }
        if (rng() < (lake.length ? 0.55 : 0.3)) {
            // distance to the sea over land (4 neighbours), the river flows downhill along it
            const sea = new Int16Array(SLOT_W * SLOT_H).fill(999);
            const queue = [];
            for (let r = oy; r < oy + SLOT_H; r++) {
                for (let c = ox; c < ox + SLOT_W; c++) {
                    const inLake = lake.some(([a, b]) => a === c && b === r);
                    if (!land[local(c, r)] && !inLake) {
                        sea[local(c, r)] = 0;
                        queue.push([c, r]);
                    }
                }
            }
            const N4 = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (let q = 0; q < queue.length; q++) {
                const [c, r] = queue[q];
                for (const [dx, dy] of N4) {
                    const cc = c + dx;
                    const rr = r + dy;
                    if (inSlot(cc, rr) && land[local(cc, rr)] && sea[local(cc, rr)] > sea[local(c, r)] + 1) {
                        sea[local(cc, rr)] = sea[local(c, r)] + 1;
                        queue.push([cc, rr]);
                    }
                }
            }
            // the source: next to the lake, or a cell far inland
            const sources = lake.length
                ? cells.filter(([c, r]) => free(c, r) && N4.some(([dx, dy]) => lake.some(([a, b]) => a === c + dx && b === r + dy)))
                : cells.filter(([c, r]) => free(c, r) && sea[local(c, r)] >= 5);
            if (sources.length) {
                let [c, r] = pick(rng, sources);
                const river = [[c, r]];
                for (let step = 0; step < 40; step++) {
                    const down = N4.map(([dx, dy]) => [c + dx, r + dy]).filter(
                        ([cc, rr]) => inSlot(cc, rr) && sea[local(cc, rr)] < sea[local(c, r)]
                    );
                    if (down.some(([cc, rr]) => sea[local(cc, rr)] === 0)) break; // reached the sea
                    const next = down.filter(([cc, rr]) => free(cc, rr));
                    if (!next.length) {
                        river.length = 0; // blocked by a path or a building: no river
                        break;
                    }
                    [c, r] = pick(rng, next);
                    river.push([c, r]);
                }
                if (river.length >= 3) river.forEach(([cc, rr]) => (land[local(cc, rr)] = 0));
            }
        }
        return lake;
    }

    const isletTheme = (slot) => (slot * 7) % THEMES.length;

    /** A small uninhabited islet in an empty slot: just land, trees and maybe a duck. */
    function buildIslet(slot) {
        const rng = mulberry32(slot * 104729 + 7);
        if (rng() < 0.25) return; // some slots stay open sea
        const col = slot % GW;
        const row = Math.floor(slot / GW);
        const ox = MARGIN + col * SLOT_W;
        const oy = MARGIN + row * SLOT_H;
        const theme = isletTheme(slot);
        const cx = ox + 8 + rng() * (SLOT_W - 16);
        const cy = oy + 8 + rng() * (SLOT_H - 16);
        const rx = 2 + rng() * 3.5;
        const ry = 1.5 + rng() * 2.5;
        const noise = valueNoise(rng, SLOT_W, SLOT_H, 3);
        const cells = [];
        for (let r = oy + 3; r < oy + SLOT_H - 3; r++) {
            for (let c = ox + 3; c < ox + SLOT_W - 3; c++) {
                const d = Math.hypot((c - cx) / rx, (r - cy) / ry);
                if (d <= 0.75 + noise(c - ox, r - oy) * 0.6) cells.push([c, r]);
            }
        }
        // no single cells and no one-cell-wide spits: they make odd coasts
        const land = new Set(cells.map(([c, r]) => idx(c, r)));
        const keep = cells.filter(([c, r]) => {
            const n = [[0, 1], [1, 0], [0, -1], [-1, 0]].filter(([dx, dy]) => land.has(idx(c + dx, r + dy))).length;
            return n >= 2;
        });
        keep.forEach(([c, r]) => (terrain[idx(c, r)] = 0));
        // single trees; TREES_1 and TREES_2 are the left and right half of one group (placed together)
        const trees = ["TREE_1", "TREE_2", "TREE_3", "BUSH"].map((n) => tile[n]);
        const flowers = ["FLOWERS_1", "FLOWERS_2", "GROUND_DETAIL_1", "GROUND_DETAIL_2"].map((n) => tile[n]);
        keep.forEach(([c, r]) => {
            const v = rng();
            if (v < 0.35) deco[idx(c, r)] = pick(rng, trees);
            else if (v < 0.55) deco[idx(c, r)] = pick(rng, flowers);
        });
        if (keep.length && rng() < 0.6) {
            const [c, r] = pick(rng, keep);
            const [wc, wr] = [c + (rng() < 0.5 ? -3 : 3), r + 2];
            if (terrain[idx(wc, wr)] === 1) addSprite(rng() < 0.5 ? "WATER_RIPPLES" : "WATER_RIPPLES_2", wc, wr, theme);
        }
    }

    function addSprite(name, col, row, theme) {
        const base = tm.sprites[name];
        const def = { ...base, ...(base.themes?.[THEMES[theme]] || {}) };
        const s = {
            name,
            def,
            col,
            row,
            theme,
            anim: def.default || null,
            start: 0,
            tempo: 1 + (Math.random() * 2 - 1) * TEMPO_JITTER,
            phase: Math.random(),
        };
        sprites.push(s);
        return s;
    }

    // ------------------------------------------------------------------ sea routes

    const isSea = (c, r) => inside(c, r) && terrain[idx(c, r)] === 1 && !block[idx(c, r)] && !dockAt.has(idx(c, r));
    const isOpenSea = (c, r) => isSea(c, r) && landNear[idx(c, r)] < 2;

    function findSeaPath(from, to) {
        const n = W * H;
        const dist = new Float64Array(n).fill(Infinity);
        const prev = new Int32Array(n).fill(-1);
        const heap = new Heap();
        const start = idx(...from);
        const goal = idx(...to);
        dist[start] = 0;
        heap.push(0, start);
        while (heap.size) {
            const [d, k] = heap.pop();
            if (k === goal) break;
            if (d > dist[k]) continue;
            const c = k % W;
            const r = (k - c) / W;
            for (const [dx, dy] of Object.values(DIRS)) {
                const cc = c + dx;
                const rr = r + dy;
                if (!isSea(cc, rr)) continue;
                if (dx && dy && (!isSea(c + dx, r) || !isSea(c, r + dy))) continue;
                const kk = idx(cc, rr);
                const nd = d + (dx && dy ? Math.SQRT2 : 1) + landNear[kk] * 1.5;
                if (nd < dist[kk]) {
                    dist[kk] = nd;
                    prev[kk] = k;
                    heap.push(nd, kk);
                }
            }
        }
        if (prev[goal] < 0 && goal !== start) return null;
        const cells = [];
        for (let k = goal; k >= 0; k = prev[k]) cells.unshift([k % W, Math.floor(k / W)]);
        return cells;
    }

    function clearLine([ax, ay], [bx, by], sea = isOpenSea) {
        const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 3);
        for (let s = 0; s <= n; s++) {
            const t = s / n;
            const x = ax + (bx - ax) * t;
            const y = ay + (by - ay) * t;
            for (const [ox, oy] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) {
                if (!sea(Math.round(x + ox), Math.round(y + oy))) return false;
            }
        }
        return true;
    }

    /** Straightens a cell path: keeps only the corners needed in open water. */
    function pull(cells) {
        if (cells.length < 6) return cells;
        const out = [cells[0], cells[1]];
        const last = cells.length - 2;
        let i = 1;
        while (i < last) {
            let j = last;
            while (j > i + 1 && !clearLine(cells[i], cells[j])) j--;
            // close to the coast (at the ports) there is no open sea yet: there any water will do
            if (j === i + 1) {
                j = last;
                while (j > i + 1 && !clearLine(cells[i], cells[j], isSea)) j--;
            }
            out.push(cells[j]);
            i = j;
        }
        out.push(cells[cells.length - 1]);
        return out;
    }

    function chaikin(pts) {
        const out = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
            const [ax, ay] = pts[i];
            const [bx, by] = pts[i + 1];
            if (i > 0) out.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by]);
            if (i < pts.length - 2) out.push([0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by]);
        }
        out.push(pts[pts.length - 1]);
        return out;
    }

    function buildRoute(i) {
        const a = islands[i].departure;
        const b = islands[i + 1].arrival;
        const cells = findSeaPath(a.ship, b.ship);
        if (!cells) {
            console.warn("karte: no sea route from island", i, "to", i + 1);
            return null;
        }
        let points = pull(cells);
        for (let k = 0; k < 4; k++) points = chaikin(points); // round corners
        points = points.map(([c, r]) => [(c + 0.5) * T, (r + 0.5) * T]);
        const cum = [0];
        for (let k = 1; k < points.length; k++) {
            cum.push(cum[k - 1] + Math.hypot(points[k][0] - points[k - 1][0], points[k][1] - points[k - 1][1]));
        }
        return {
            index: i, a: { ...a, island: i }, b: { ...b, island: i + 1 }, points, cum, length: cum[cum.length - 1],
            // timing of the ship's rocking animation
            tempo: 1 + (Math.random() * 2 - 1) * TEMPO_JITTER, phase: Math.random(),
        };
    }

    // --- ship tracks, drawn pixel by pixel in the style of the route tiles of the tile sheets:
    // white dashes, a small ring at regular distances and now and then an arrow towards the next island

    // the shapes are copied from the route tiles (ROUTE_W_E, ROUTE_SW_TO_NE)
    const TRACK_DASH = [4, 2]; // map pixels: dash, gap
    const TRACK_MARK = 26; // distance between the rings
    const TRACK_ARROW = 4; // every 4th mark is an arrow
    const RING = [[-1, -2], [0, -2], [-2, -1], [1, -1], [-2, 0], [1, 0], [-1, 1], [0, 1]];
    // arrow heads pointing north-east (as in the tiles) and east (the tiles have none, same style);
    // the other directions are turned by 90 degree steps
    const ARROW_NE = [[-1, -1], [0, -1], [1, -1], [0, 0], [1, 0], [-1, 1], [1, 1], [-2, 2]];
    const ARROW_E = [[-1, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [-1, 2]];

    function arrowPixels(dir) {
        const straight = ["E", "S", "W", "N"].indexOf(dir);
        const turns = straight >= 0 ? straight : ["NE", "SE", "SW", "NW"].indexOf(dir);
        let px = straight >= 0 ? ARROW_E : ARROW_NE;
        for (let t = 0; t < turns; t++) px = px.map(([x, y]) => [-y, x]); // 90 degrees clockwise
        return px;
    }

    function drawTrack(g, route) {
        g.fillStyle = "#ffffff";
        const plot = (x, y) => g.fillRect(x, y, 1, 1);
        const first = 12; // the first mark a little away from the ship
        const markAt = (d) => {
            const m = (((d - first) % TRACK_MARK) + TRACK_MARK) % TRACK_MARK;
            return m < 5 || m > TRACK_MARK - 5; // keep the dashes away from the marks
        };
        const period = TRACK_DASH[0] + TRACK_DASH[1];
        for (let d = 0; d <= route.length; d += 0.5) {
            if (d % period >= TRACK_DASH[0] || (d >= first - 4 && d < route.length - 6 && markAt(d))) continue;
            const p = along(route, d, false);
            plot(Math.floor(p.x), Math.floor(p.y));
        }
        for (let d = first, k = 0; d < route.length - 6; d += TRACK_MARK, k++) {
            const p = along(route, d, false);
            const cx = Math.floor(p.x);
            const cy = Math.floor(p.y);
            const px = k % TRACK_ARROW === TRACK_ARROW - 1 ? arrowPixels(p.dir) : RING;
            px.forEach(([x, y]) => plot(cx + x, cy + y));
        }
    }

    /** Position and heading `d` map pixels along a route (from end b when `reverse`). */
    function along(route, d, reverse) {
        const { points, cum, length } = route;
        const s = clamp(reverse ? length - d : d, 0, length);
        let k = 0;
        while (k < points.length - 2 && cum[k + 1] < s) k++;
        const seg = cum[k + 1] - cum[k] || 1;
        const t = (s - cum[k]) / seg;
        const [ax, ay] = points[k];
        const [bx, by] = points[k + 1];
        const sign = reverse ? -1 : 1;
        return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, dir: angleDir((bx - ax) * sign, (by - ay) * sign) };
    }

    // ------------------------------------------------------------------ fog of war

    function reveal(c, r, rad) {
        const R = rad + 2;
        let changed = false;
        for (let y = r - R; y <= r + R; y++) {
            for (let x = c - R; x <= c + R; x++) {
                if (!inside(x, y)) continue;
                const d2 = (x - c) ** 2 + (y - r) ** 2;
                // revealed or fully covered: the lighter fog levels of the tile sheet are see-through
                const k = idx(x, y);
                if (fog[k] && d2 <= rad * rad + rad) {
                    fog[k] = 0;
                    changed = true;
                }
            }
        }
        if (changed) {
            fogDirty.push([c - R - 1, r - R - 1, c + R + 1, r + R + 1]);
            saveSoon();
        }
    }

    function revealIsland(isl) {
        const [x0, y0, x1, y1] = isl.bounds;
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const near = landNear[idx(x, y)] || terrain[idx(x, y)] === 0;
                if (near) fog[idx(x, y)] = 0;
            }
        }
        fogDirty.push([x0 - 1, y0 - 1, x1 + 1, y1 + 1]);
    }

    function encodeFog() {
        const out = [];
        let v = fog[0];
        let n = 0;
        for (let k = 0; k < fog.length; k++) {
            if (fog[k] === v) n++;
            else {
                out.push(v + n.toString(36));
                v = fog[k];
                n = 1;
            }
        }
        out.push(v + n.toString(36));
        return out.join(".");
    }

    function decodeFog(s) {
        if (typeof s !== "string") return null;
        const a = new Uint8Array(W * H).fill(3);
        let k = 0;
        for (const part of s.split(".")) {
            const v = Number(part[0]);
            const n = parseInt(part.slice(1), 36);
            if (!(v >= 0 && v <= 3) || !(n > 0) || k + n > a.length) return null;
            a.fill(v ? 3 : 0, k, k + n); // older saves had lighter fog levels at the edges
            k += n;
        }
        return k === a.length ? a : null;
    }

    // ------------------------------------------------------------------ persistence

    let saveTimer = null;
    let resetting = false; // the reset button reloads the page: nothing may be saved on the way out

    function save() {
        clearTimeout(saveTimer);
        saveTimer = null;
        if (resetting) return;
        state.sig = sig;
        state.fog = encodeFog();
        if (!voyage) state.hero = { c: hero.c, r: hero.r, dir: hero.dir };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            // storage unavailable (private mode etc.): the map starts over next time
        }
    }

    function saveSoon() {
        if (!saveTimer) saveTimer = setTimeout(save, 600);
    }

    function loadState() {
        let s = null;
        try {
            s = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            // ignore
        }
        const chapterIndex = (n) => islands.findIndex((isl) => isl.chapter.number === n);
        state = {
            sig,
            hero: null,
            ships: {},
            visited: [],
            at: islands[0].chapter.number,
            zoom: null,
            ...(s && typeof s === "object" ? s : {}),
        };
        if (!Array.isArray(state.visited)) state.visited = [];
        if (!state.ships || typeof state.ships !== "object") state.ships = {};
        fog = state.sig === sig ? decodeFog(state.fog) : null;
        if (!fog) {
            // new map or the chapters changed: start with fresh fog, but keep the islands already visited
            fog = new Uint8Array(W * H).fill(3);
            state.visited.map(chapterIndex).filter((i) => i >= 0).forEach((i) => revealIsland(islands[i]));
            state.hero = null;
            state.ships = {};
        }
        let i = chapterIndex(state.at);
        if (i < 0) i = 0;
        const h = state.hero;
        const ok = h && Number.isInteger(h.c) && Number.isInteger(h.r) && walkable(h.c, h.r);
        const startCell = ok ? [h.c, h.r] : islands[i].arrival.land;
        hero.c = hero.fc = startCell[0];
        hero.r = hero.fr = startCell[1];
        hero.dir = ok && DIRS[h.dir] ? h.dir : islands[i].eastward ? "E" : "W";
    }

    // ------------------------------------------------------------------ hero & movement

    const hero = {
        c: 0, r: 0, fc: 0, fr: 0, dir: "S", step: null, queue: [], clock: 0,
        walkStart: 0, lastWalk: -1e9, idleStart: 0, visible: true, tempo: 1, phase: 0,
    };
    let pending = null; // action when the hero reaches the end of a clicked path
    let voyage = null;
    let currentIsland = -1;
    let marker = null; // clicked target cell
    const keys = new Set();
    const taps = new Set(); // keys pressed since the last poll: a short tap still makes a step
    let bumpArmed = false;
    const openStack = [];

    const walkable = (c, r) =>
        inside(c, r) && ((terrain[idx(c, r)] === 0 && !block[idx(c, r)]) || dockAt.has(idx(c, r)));

    function canStep(c, r, dx, dy) {
        if (!walkable(c + dx, r + dy)) return false;
        return !(dx && dy) || (walkable(c + dx, r) && walkable(c, r + dy));
    }

    const busy = () => openStack.length > 0 || !!voyage;

    function startStep(c, r, now) {
        cam.free = false;
        const dx = c - hero.c;
        const dy = r - hero.r;
        hero.dir = dirOf(dx, dy);
        const start = now - hero.clock < 80 ? hero.clock : now;
        if (now - hero.lastWalk > WALK_GRACE_MS) hero.walkStart = start;
        hero.step = { fc: hero.c, fr: hero.r, c, r, start, dur: (Math.hypot(dx, dy) / HERO_SPEED) * 1000 };
    }

    function keyDir() {
        const held = (dir) => keys.has(dir) || taps.has(dir);
        let dx = 0;
        let dy = 0;
        if (held("up")) dy--;
        if (held("down")) dy++;
        if (held("left")) dx--;
        if (held("right")) dx++;
        return dx || dy ? [dx, dy] : null;
    }

    function pollKeys(now) {
        const d = keyDir();
        taps.clear();
        if (!d) return;
        const [dx, dy] = d;
        const tries = dx && dy ? [[dx, dy], [dx, 0], [0, dy]] : [[dx, dy]];
        for (const [tx, ty] of tries) {
            if (canStep(hero.c, hero.r, tx, ty)) {
                startStep(hero.c + tx, hero.r + ty, now);
                return;
            }
        }
        hero.dir = dirOf(dx, dy);
        // walking into a building enters it (once per key press)
        if (bumpArmed) {
            bumpArmed = false;
            for (const [tx, ty] of tries) {
                const k = inside(hero.c + tx, hero.r + ty) ? inter[idx(hero.c + tx, hero.r + ty)] : -1;
                if (k >= 0) {
                    interact(k);
                    return;
                }
            }
        }
    }

    function updateHero(now) {
        for (let guard = 0; guard < 4; guard++) {
            if (!hero.step) {
                if (voyage || openStack.length) break;
                if (hero.queue.length) {
                    const [c, r] = hero.queue.shift();
                    if (!canStep(hero.c, hero.r, c - hero.c, r - hero.r)) {
                        hero.queue = [];
                        pending = null;
                        break;
                    }
                    startStep(c, r, now);
                } else {
                    pollKeys(now);
                }
                if (!hero.step) break;
            }
            const s = hero.step;
            const t = s.dur > 0 ? (now - s.start) / s.dur : 1;
            const k = clamp(t, 0, 1);
            hero.fc = s.fc + (s.c - s.fc) * k;
            hero.fr = s.fr + (s.r - s.fr) * k;
            hero.lastWalk = now;
            if (t < 1) break;
            hero.c = hero.fc = s.c;
            hero.r = hero.fr = s.r;
            hero.clock = s.start + s.dur;
            hero.step = null;
            hero.idleStart = now;
            arrived();
        }
    }

    function arrived() {
        reveal(hero.c, hero.r, REVEAL);
        enterIsland(islandIndexAt(hero.c, hero.r));
        saveSoon();
        const dock = dockAt.get(idx(hero.c, hero.r));
        if (dock) {
            hero.queue = [];
            pending = null;
            const open = openHouses(islands[dock.island]);
            if (dock.end === "a" && dock.route >= 0 && open.length) {
                // the next island waits until every house here is done: step back onto the island
                const isl = islands[dock.island];
                hero.queue = [isl.departure.land];
                announce(`Der Hafen ist noch gesperrt: ${open.length === 1 ? "ein Haus ist" : `${open.length} Häuser sind`} noch nicht erledigt.`);
            } else if (dock.route >= 0 && routes[dock.route]) startVoyage(dock);
            else announce(dock.end === "b" ? "Hier hat dein Abenteuer begonnen." : "Weiter geht es noch nicht – neue Inseln folgen bald!");
            return;
        }
        if (!hero.queue.length && pending) {
            const action = pending;
            pending = null;
            action();
        }
    }

    /** Houses of an island whose exercise is not done yet; the island can only be left forward without them. */
    const openHouses = (isl) => isl.houses.filter((it) => !done.has(it.ex.id));

    function enterIsland(i) {
        if (i === currentIsland || i < 0) return;
        currentIsland = i;
        const isl = islands[i];
        state.at = isl.chapter.number;
        if (!state.visited.includes(isl.chapter.number)) state.visited.push(isl.chapter.number);
        updateHud();
        announce(`Insel erreicht: Kapitel ${isl.chapter.number} · ${isl.chapter.title}`);
    }

    /** Shortest walk (8 directions, no corner cutting) to a cell for which `goal` holds. */
    function findWalk(from, goal, target) {
        const n = W * H;
        const prev = new Int32Array(n).fill(-2);
        const start = idx(...from);
        prev[start] = -1;
        const queue = [start];
        const passable = (c, r) => walkable(c, r) && (!dockAt.has(idx(c, r)) || idx(c, r) === target);
        for (let q = 0; q < queue.length; q++) {
            const k = queue[q];
            const c = k % W;
            const r = (k - c) / W;
            if (goal(c, r)) {
                const cells = [];
                for (let j = k; j !== start; j = prev[j]) cells.unshift([j % W, Math.floor(j / W)]);
                return cells;
            }
            for (const [dx, dy] of Object.values(DIRS)) {
                const cc = c + dx;
                const rr = r + dy;
                if (!passable(cc, rr) || prev[idx(cc, rr)] !== -2) continue;
                if (dx && dy && (!passable(c + dx, r) || !passable(c, r + dy))) continue;
                prev[idx(cc, rr)] = k;
                queue.push(idx(cc, rr));
            }
        }
        return null;
    }

    const touches = (it, c, r) =>
        it.cells.some(([a, b]) => Math.max(Math.abs(a - c), Math.abs(b - r)) === 1) && !it.cells.some(([a, b]) => a === c && b === r);

    function walkTo(c, r) {
        if (!inside(c, r)) return;
        const k = idx(c, r);
        let goal;
        let action = null;
        let target = -1;
        if (inter[k] >= 0) {
            const it = interactables[inter[k]];
            goal = (x, y) => touches(it, x, y);
            action = () => interact(it.index);
        } else {
            // clicking an anchored ship walks to its dock
            const route = routes.find((rt) => rt && shipWaiting(rt) && shipCell(rt).join() === `${c},${r}`);
            if (route) {
                const end = state.ships[route.index] || "a";
                [c, r] = (end === "a" ? route.a : route.b).dock;
            }
            if (!walkable(c, r)) {
                marker = { c, r, t: performance.now(), bad: true };
                return;
            }
            target = idx(c, r);
            goal = (x, y) => x === c && y === r;
        }
        const from = hero.step ? [hero.step.c, hero.step.r] : [hero.c, hero.r];
        const cells = findWalk(from, goal, target);
        if (!cells) {
            marker = { c, r, t: performance.now(), bad: true };
            return;
        }
        marker = { c, r, t: performance.now() };
        hero.queue = cells;
        pending = action;
        if (!cells.length && !hero.step && action) {
            pending = null;
            action();
        }
    }

    // ------------------------------------------------------------------ ships

    /** A ship waits at the departure port only once all houses of that island are done. */
    const shipWaiting = (route) =>
        (state.ships[route.index] || "a") === "b" || !openHouses(islands[route.a.island]).length;

    const shipCell = (route) => ((state.ships[route.index] || "a") === "a" ? route.a.ship : route.b.ship);

    function startVoyage(dock) {
        const route = routes[dock.route];
        const from = dock.end; // "a": forward to the next island, "b": back to the previous one
        const dest = from === "a" ? route.b : route.a;
        const shipEnd = state.ships[route.index] || "a";
        const now = performance.now();
        cam.free = false;
        const sail = () => {
            hero.visible = false;
            voyage = { route, reverse: from === "b", start: performance.now(), speed: SHIP_SPEED, carrying: true, then: () => landAt(dest) };
            announce(`Leinen los! Kurs auf Kapitel ${islands[dest.island].chapter.number} · ${islands[dest.island].chapter.title}`);
        };
        if (shipEnd !== from) {
            // the ship is at the other port: it comes over first
            voyage = { route, reverse: shipEnd === "b", start: now, speed: FERRY_SPEED, carrying: false, then: sail };
            announce("Das Schiff ist unterwegs zu dir …");
        } else {
            sail();
        }
        // a reload during the voyage lands at the destination
        state.ships[route.index] = from === "a" ? "b" : "a";
        state.hero = { c: dest.land[0], r: dest.land[1], dir: { E: "W", W: "E", S: "N" }[dest.side] };
        state.at = islands[dest.island].chapter.number;
        save();
        hidePrompt();
    }

    function updateVoyage(now) {
        if (!voyage) return;
        const d = ((now - voyage.start) / 1000) * voyage.speed * T;
        const p = along(voyage.route, d, voyage.reverse);
        voyage.pos = p;
        if (voyage.carrying) {
            const c = Math.floor(p.x / T);
            const r = Math.floor(p.y / T);
            if (c !== voyage.c || r !== voyage.r) {
                voyage.c = c;
                voyage.r = r;
                reveal(c, r, SHIP_REVEAL);
            }
        }
        if (d >= voyage.route.length) {
            const then = voyage.then;
            voyage = null;
            then();
        }
    }

    function landAt(dest) {
        hero.c = hero.fc = dest.dock[0];
        hero.r = hero.fr = dest.dock[1];
        hero.step = null;
        hero.visible = true;
        hero.clock = 0;
        hero.queue = [dest.land];
        pending = null;
        reveal(hero.c, hero.r, REVEAL);
        save();
    }

    // ------------------------------------------------------------------ interaction

    function interact(n) {
        const it = interactables[n];
        hero.queue = [];
        pending = null;
        const [c, r] = it.cells[0];
        hero.dir = dirOf(c - hero.c, r - hero.r);
        if (it.kind === "house") openCard(it);
        else if (it.kind === "volcano") openVolcano(it);
        else openScroll(it);
    }

    /** What the hero could do right now (shown in the prompt bubble). */
    function promptTarget() {
        if (busy() || hero.step || hero.queue.length || !hero.visible) return null;
        const dock = dockAt.get(idx(hero.c, hero.r));
        if (dock) return null;
        const [fx, fy] = DIRS[hero.dir];
        const facing = inside(hero.c + fx, hero.r + fy) ? inter[idx(hero.c + fx, hero.r + fy)] : -1;
        if (facing >= 0) return interactables[facing];
        for (const [dx, dy] of Object.values(DIRS)) {
            const k = inside(hero.c + dx, hero.r + dy) ? inter[idx(hero.c + dx, hero.r + dy)] : -1;
            if (k >= 0) return interactables[k];
        }
        return null;
    }

    function promptText(it) {
        const text = (title, hint) => `<span class="prompt-text"><b>${esc(title)}</b><small>${esc(hint)}</small></span>`;
        const isl = islands[it.island];
        if (it.kind === "house") return text(it.ex.title, "Haus betreten");
        if (it.kind === "castle") return text(isl.castleName, "Folien, Vorlesungsbeispiele und Sandkästen");
        if (it.kind === "village") return text(isl.villageName, `${it.list.length} weitere ${it.list.length === 1 ? "Übung" : "Übungen"}`);
        return text(`Hausaufgabe ${it.homework.nr}: ${it.homework.topic}`, homeworkLine(it.homework));
    }

    let promptFor = null;

    function updatePrompt() {
        const it = promptTarget();
        const el = $("prompt");
        if (it !== promptFor) {
            promptFor = it;
            if (!it) {
                el.hidden = true;
            } else {
                el.innerHTML = `<kbd>Enter</kbd>${promptText(it)}`;
                el.hidden = false;
            }
        }
        if (it) {
            // above the hero, unless the building is above: then below, so the bubble does not hide it
            const below = it.cells.some(([, r]) => r < hero.r);
            const s = view.scale / dpr;
            el.classList.toggle("is-below", below);
            el.style.left = `${((hero.fc + 0.5) * T - view.x) * s}px`;
            el.style.top = below ? `${((hero.fr + 1) * T - view.y) * s + 8}px` : `${(hero.fr * T - view.y) * s - 6}px`;
        }
    }

    function hidePrompt() {
        promptFor = null;
        $("prompt").hidden = true;
    }

    // ------------------------------------------------------------------ cards

    function conceptIcon(id, cls) {
        const c = conceptById[id];
        return c?.icon ? `<img class="${cls}" src="${esc(c.icon)}" alt="" width="64" height="64" />` : "";
    }

    function typeIcon(typeId) {
        const t = typeById[typeId];
        return t?.icon ? `<img class="type-icon" src="${esc(t.icon)}" alt="" width="64" height="64" />` : "";
    }

    const typeBadge = (typeId) =>
        `<span class="type-badge type-${typeId}" title="${esc(typeById[typeId]?.label || typeId)}">${typeIcon(typeId)}<span>${esc(typeById[typeId]?.short || typeById[typeId]?.label || typeId)}</span></span>`;

    function levelDots(level) {
        let dots = "";
        for (let i = 1; i <= 5; i++) dots += `<span class="dot${i <= level ? " on" : ""}"></span>`;
        return `<span class="dots" role="img" aria-label="Level ${level} von 5 (${LEVELS[level] || "ohne Angabe"})">${dots}</span>`;
    }

    function features(ex) {
        const items = [
            ["Beispiellösung", ex.hasSolution],
            ["Erklärung", ex.hasExplanation],
            ["Experimente", ex.hasExperiments],
        ].filter(([, has]) => has);
        if (!items.length) return `<span class="feature feature-none">Offene Aufgabe ohne Lösung</span>`;
        return items.map(([label]) => `<span class="feature">${label}</span>`).join("");
    }

    function preview(ex) {
        const pos = /^[a-z0-9.% -]+$/i.test(ex.imagePosition || "") ? ` style="object-position:${ex.imagePosition}"` : "";
        return `<img class="card-image" src="${esc(ex.image)}" alt="" loading="lazy"${pos} />`;
    }

    /** The exercise card of uebersicht.html (same markup and styles), opening the exercise in an overlay. */
    function cardHtml(ex) {
        const isDone = done.has(ex.id);
        const href = esc(pageHref(ex.link));
        const id = esc(ex.id);
        const concepts = ex.tags
            .filter((t) => conceptById[t])
            .map((t) => `<span class="concept concept-none" tabindex="0" data-tip="${esc(conceptById[t].label)}"
                aria-label="${esc(conceptById[t].label)}">${conceptIcon(t, "concept-icon")}</span>`)
            .join("");
        return `<article class="card type-${ex.type}${isDone ? " is-done" : ""}">
            <div class="card-body">
                <div class="card-head">
                    <h3 class="card-title"><a href="${href}" data-open="${id}">${esc(ex.title)}</a></h3>
                    ${ex.isNew ? `<span class="new">Neu</span>` : ""}
                    ${ex.isHidden ? `<span class="hidden-badge" title="Nur mit ?showHidden sichtbar">Versteckt</span>` : ""}
                    ${ex.isDraft ? `<span class="draft-badge" title="Nur mit ?showDrafts sichtbar">Entwurf</span>` : ""}
                    ${typeBadge(ex.type)}
                </div>
                <p class="card-desc">${esc(ex.description)}</p>
                <div class="card-level"><span>Übungslevel</span>${levelDots(ex.difficulty)}</div>
                <div class="concepts">${concepts}</div>
                <div class="features">${features(ex)}</div>
            </div>
            <a class="card-media${ex.image ? " has-image" : ""}" href="${href}" data-open="${id}" tabindex="-1" aria-hidden="true"
                style="--hue:${195 + ((ex.chapter * 37) % 80)}">
                ${ex.image ? preview(ex) : conceptIcon(ex.tags[0], "card-icon")}
                <span class="card-chapter">Kap. ${ex.chapter}</span>
            </a>
            <button type="button" class="done-btn" data-done="${id}" aria-pressed="${isDone}"
                title="${isDone ? "Erledigt – klicken zum Zurücksetzen" : "Als erledigt markieren"}">${isDone ? "✓" : "○"} Erledigt</button>
        </article>`;
    }

    // ------------------------------------------------------------------ overlays

    let lastFocus = null;
    let cardFor = null; // interactable shown in the card dialog
    let scrollFor = null; // interactable shown in the scroll
    let listOpen = false; // the scroll shows the list of all islands

    function openOverlay(id) {
        const el = $(id);
        if (!openStack.length) lastFocus = document.activeElement;
        if (!openStack.includes(id)) openStack.push(id);
        el.hidden = false;
        el.classList.remove("is-open");
        void el.offsetWidth; // restart the opening animation
        el.classList.add("is-open");
        keys.clear();
        taps.clear();
        hidePrompt();
        if (!$("help").hidden) toggleHelp(false);
        const focus = el.querySelector("[data-autofocus]") || el.querySelector("button, a[href], iframe");
        focus?.focus({ preventScroll: true });
    }

    function closeOverlay(id = openStack[openStack.length - 1]) {
        if (!id) return;
        const i = openStack.indexOf(id);
        if (i < 0) return;
        openStack.splice(i, 1);
        $(id).hidden = true;
        $(id).classList.remove("is-open");
        if (id === "frame-overlay") $("frame").src = "about:blank";
        if (id === "card-overlay") cardFor = null;
        if (id === "scroll-overlay") {
            scrollFor = null;
            listOpen = false;
            document.querySelector(".scroll").classList.remove("is-list");
        }
        const top = openStack[openStack.length - 1];
        if (top) $(top).querySelector("[data-autofocus], button")?.focus({ preventScroll: true });
        else (lastFocus && document.contains(lastFocus) ? lastFocus : canvas).focus({ preventScroll: true });
    }

    function chapterLine(isl) {
        return `Kapitel ${isl.chapter.number} · ${isl.chapter.title}`;
    }

    function openCard(it) {
        cardFor = it;
        const isl = islands[it.island];
        const n = isl.houses.indexOf(it) + 1;
        $("card-eyebrow").textContent = `${chapterLine(isl)} · Haus ${n} von ${isl.houses.length}`;
        $("card-slot").innerHTML = cardHtml(it.ex);
        $("card-actions").innerHTML = `<button type="button" class="btn" data-close>Weiterlaufen</button>
            <button type="button" class="btn btn-primary" data-open="${esc(it.ex.id)}" data-autofocus>Übung betreten</button>`;
        openOverlay("card-overlay");
    }

    // --- homework (volcanoes) ---

    const DAY_LONG = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "long" });
    const DAY_SHORT = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
    const TIME = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });

    /** "soon" (not started yet), "open" or "over"; the dates are local times like "2026-05-18T05:00". */
    function homeworkState(hw, now = Date.now()) {
        if (now < new Date(hw.start)) return "soon";
        return now > new Date(hw.due) ? "over" : "open";
    }

    const longDate = (iso) => `${DAY_LONG.format(new Date(iso))}, ${TIME.format(new Date(iso))} Uhr`;

    /** Short text for the sign on the island and the prompt. */
    function homeworkLine(hw) {
        const due = new Date(hw.due);
        const state = homeworkState(hw);
        if (state === "soon") return `ab ${DAY_SHORT.format(new Date(hw.start))}`;
        if (state === "over") return `Abgabe war ${DAY_SHORT.format(due)}`;
        return `Abgabe bis ${DAY_SHORT.format(due)}, ${TIME.format(due)}`;
    }

    function openVolcano(it) {
        cardFor = it;
        const isl = islands[it.island];
        const hw = it.homework;
        const state = homeworkState(hw);
        const s = it.sprite;
        s.anim = "lava";
        s.start = performance.now();
        s.until = s.start + 4000;
        const status = {
            soon: `Die Bearbeitung beginnt am ${longDate(hw.start)}.`,
            open: `Jetzt bearbeiten – die Abgabe endet am ${longDate(hw.due)}.`,
            over: `Die Bearbeitungszeit ist am ${longDate(hw.due)} abgelaufen.`,
        }[state];
        $("card-eyebrow").textContent = `${chapterLine(isl)} · Vulkan`;
        $("card-slot").innerHTML = `<div class="volcano-info is-${state}">
            <p class="volcano-kicker">Hausaufgabe ${hw.nr}</p>
            <h3 class="volcano-title">${esc(hw.topic)}</h3>
            <p class="volcano-status">${esc(status)}</p>
            <p class="volcano-dates">Bearbeitungszeit: ${esc(longDate(hw.start))} bis ${esc(longDate(hw.due))}</p>
        </div>`;
        $("card-actions").innerHTML = `<button type="button" class="btn" data-close${hw.link ? "" : " data-autofocus"}>Weiterlaufen</button>
            ${hw.link ? `<a class="btn btn-primary" href="${esc(hw.link)}" target="_blank" rel="noopener" data-autofocus>Zur Hausaufgabe in StudOn ↗</a>` : ""}`;
        openOverlay("card-overlay");
    }

    function renderScroll() {
        const it = scrollFor;
        if (!it) return;
        // the castle starts with the lecture slides
        const slides = (it.slides || [])
            .map((l) => `<li class="slide">
                <span class="slide-nr">${esc(l.nr)}</span>
                <b>${esc(l.title)}</b>
                ${l.slides ? `<a class="slide-link" href="${esc(l.slides)}" target="_blank" rel="noopener">Folien ↗</a>` : ""}
                ${l.pdf ? `<a class="slide-link" href="${esc(l.pdf)}" target="_blank" rel="noopener">PDF ↗</a>` : ""}
            </li>`)
            .join("");
        // one grid for all cards (two columns where there is room); the counts say what is inside
        const list = it.list;
        const parts = TYPE_ORDER.map((type) => {
            const n = list.filter((ex) => ex.type === type).length;
            if (!n) return "";
            const label = {
                lecture: ["Vorlesungsbeispiel", "Vorlesungsbeispiele"], sandbox: ["Sandkasten", "Sandkästen"], tool: ["Tool", "Tools"],
            }[type] || ["Übung", "Übungen"];
            return `<span>${typeIcon(type)}${n} ${label[n === 1 ? 0 : 1]}</span>`;
        }).filter(Boolean);
        $("scroll-body").innerHTML =
            (slides ? `<section class="slides"><h3>Vorlesungsfolien</h3><ul>${slides}</ul></section>` : "") +
            (list.length
                ? `<p class="scroll-count">${parts.join("")}<b>${doneCount(list)} von ${list.length} erledigt</b></p>
                    <div class="grid">${list.map(cardHtml).join("")}</div>`
                : "");
        document.querySelector(".scroll").classList.toggle("is-narrow", list.length <= 1);
    }

    function openScroll(it) {
        scrollFor = it;
        const isl = islands[it.island];
        $("scroll-title").textContent = it.kind === "castle" ? isl.castleName : isl.villageName;
        $("scroll-sub").textContent =
            it.kind === "castle"
                ? `${chapterLine(isl)} – Folien, Vorlesungsbeispiele und Sandkästen zum Nachlesen und Ausprobieren.`
                : `${chapterLine(isl)} – weitere Übungen zum Thema, die in keinem Haus wohnen.`;
        renderScroll();
        document.querySelector(".scroll-paper").scrollTop = 0;
        openOverlay("scroll-overlay");
    }

    function openExercise(id) {
        const ex = exerciseById[id];
        if (!ex) return;
        $("frame").title = ex.title;
        $("frame").src = pageHref(ex.link, true);
        openOverlay("frame-overlay");
    }

    function refreshOpenViews() {
        if (cardFor && cardFor.kind === "house") $("card-slot").innerHTML = cardHtml(cardFor.ex);
        renderScroll();
        if (listOpen) renderIslandList();
    }

    // --- list of all islands ---

    const THEME_SWATCH = { valley: "#5f9e2f", beach: "#f0d39a", desert: "#a8653a", snow: "#e9f3f7" };

    /** Visited, or the port of the island before it is open (then the ship would go there). */
    function reachable(i) {
        if (state.visited.includes(islands[i].chapter.number)) return true;
        return i > 0 && reachable(i - 1) && !openHouses(islands[i - 1]).length;
    }

    function renderIslandList() {
        const meter = (doneN, total, cls) =>
            `<span class="isle-meter ${cls}" aria-hidden="true"><i style="width:${total ? (100 * doneN) / total : 0}%"></i></span>`;
        let exercisesDone = 0;
        let exercisesTotal = 0;
        const rows = islands.map((isl, i) => {
            const reach = reachable(i);
            const n = doneCount(isl.items);
            const houses = isl.houses.length;
            const housesDone = houses - openHouses(isl).length;
            exercisesDone += n;
            exercisesTotal += isl.items.length;
            const status = i === currentIsland
                ? "Du bist hier"
                : !reach
                  ? "Noch nicht erreicht"
                  : n === isl.items.length
                    ? "Alles erledigt"
                    : housesDone === houses
                      ? "Hafen offen"
                      : "Hafen gesperrt";
            const hw = isl.volcano?.homework;
            const classes = ["isle", reach ? "" : "is-locked", i === currentIsland ? "is-current" : "", n === isl.items.length ? "is-complete" : ""];
            return `<li class="${classes.filter(Boolean).join(" ")}">
                <span class="isle-nr" style="--swatch:${THEME_SWATCH[THEMES[isl.theme]]}">${esc(isl.chapter.number)}</span>
                <span class="isle-name"><b>${esc(isl.chapter.title)}</b><small>${esc(status)}</small></span>
                <span class="isle-stat" title="Erledigte Häuser (öffnen den Hafen)">
                    <small>Häuser</small><b>${houses ? `${housesDone} / ${houses}` : "–"}</b>${meter(housesDone, houses, "is-houses")}
                </span>
                <span class="isle-stat" title="Erledigte Übungen der Insel">
                    <small>Übungen</small><b>${n} / ${isl.items.length}</b>${meter(n, isl.items.length, "is-all")}
                </span>
                <span class="isle-hw${hw ? ` is-${homeworkState(hw)}` : ""}">${hw ? `HA ${hw.nr} · ${esc(homeworkLine(hw))}` : ""}</span>
                ${i !== currentIsland && reach
                      ? `<button type="button" class="isle-go" data-travel="${i}" title="${esc(isl.chapter.title)} besuchen: zum Ankunftshafen reisen">Besuchen</button>`
                      : `<span></span>`}
            </li>`;
        });
        const visited = islands.filter((_, i) => reachable(i)).length;
        $("scroll-sub").textContent =
            `${visited} von ${islands.length} Inseln erreichbar · ${exercisesDone} von ${exercisesTotal} Übungen erledigt`;
        $("scroll-body").innerHTML = `<ol class="isles">${rows.join("")}</ol>`;
    }

    /** Fast travel to an unlocked island: the view fades out, the hero stands at its arrival port. */
    function travelTo(i) {
        const isl = islands[i];
        if (!isl || !reachable(i) || voyage) return;
        closeOverlay("scroll-overlay");
        const fade = $("fade");
        fade.classList.add("is-on");
        setTimeout(() => {
            const [c, r] = isl.arrival.land;
            hero.c = hero.fc = c;
            hero.r = hero.fr = r;
            hero.step = null;
            hero.queue = [];
            hero.dir = { E: "W", W: "E", S: "N" }[isl.arrival.side];
            hero.idleStart = performance.now();
            pending = null;
            cam.free = false;
            cam.ready = false; // jump, no long glide across the sea
            reveal(c, r, REVEAL);
            enterIsland(i);
            save();
            fade.classList.remove("is-on");
        }, 260);
    }

    function openIslandList() {
        if (voyage) return;
        scrollFor = null;
        listOpen = true;
        $("scroll-title").textContent = "Seekarte";
        renderIslandList();
        const scroll = document.querySelector(".scroll");
        scroll.classList.remove("is-narrow");
        scroll.classList.add("is-list");
        const paper = document.querySelector(".scroll-paper");
        paper.scrollTop = 0;
        openOverlay("scroll-overlay");
        // once the paper has unrolled: the current island in view, if it is further down
        setTimeout(() => {
            const row = document.querySelector(".isle.is-current");
            if (!listOpen || !row) return;
            const bottom = row.offsetTop + row.offsetHeight - paper.offsetTop;
            if (bottom > paper.scrollTop + paper.clientHeight) paper.scrollTop = bottom - paper.clientHeight / 2;
        }, 800);
    }

    // ------------------------------------------------------------------ HUD

    function updateHud() {
        const isl = islands[currentIsland];
        if (!isl) return;
        const n = doneCount(isl.items);
        const open = openHouses(isl).length;
        const houses = isl.houses.length;
        const fill = houses ? Math.round((100 * (houses - open)) / houses) : 100;
        $("hud-chapter").textContent = `Kapitel ${isl.chapter.number}`;
        $("hud-houses").textContent = `${houses - open} / ${houses}`;
        $("hud-houses-label").textContent = houses === 1 ? "Haus" : "Häuser";
        $("hud-count").textContent =
            `${houses - open} von ${houses} Häusern erledigt, ${n} von ${isl.items.length} Übungen der Insel erledigt`;
        $("hud-title").textContent = isl.chapter.title;
        const medallion = $("medallion");
        medallion.style.setProperty("--level", fill ? 16 + fill * 0.84 : 0);
        medallion.dataset.fill = fill;
        medallion.classList.toggle("is-full", fill === 100);
        medallion.title = `Häuser: ${houses - open} von ${houses} erledigt${open ? "" : " – der Hafen ist offen"}\n` +
            `Übungen der Insel (Punkte am Rand): ${n} von ${isl.items.length} erledigt`;
        renderRing(isl.items.length, n);
        const last = currentIsland === islands.length - 1;
        $("hud-gate").textContent = last
            ? "Letzte Insel"
            : open
              ? `gesperrt · noch ${open} ${open === 1 ? "Haus" : "Häuser"}`
              : "offen – Schiff wartet";
        $("hud-gate").classList.toggle("is-open", !open && !last);
        const quest = questTarget();
        $("go-next").disabled = !quest;
        $("goal-name").textContent = !quest
            ? "Alles erledigt"
            : quest.kind === "house"
              ? quest.ex.title
              : quest.kind === "castle"
                ? isl.castleName
                : isl.villageName;
    }

    /** One arc per exercise of the island on the medallion's rim, the first `done` ones green. */
    // the ribbon covers the bottom of the rim (about 50 degrees to both sides): the segments share the
    // arc from -RING_ARC to +RING_ARC degrees, measured clockwise from the top
    const RING_ARC = 126;

    function renderRing(count, doneN) {
        const span = 2 * RING_ARC;
        const gap = count > 1 ? Math.min(12, 90 / count) : 0; // degrees between the segments
        const size = (span - gap * (count - 1)) / Math.max(1, count);
        const point = (deg) => {
            const a = ((deg - 90) * Math.PI) / 180;
            return `${(50 + 44.5 * Math.cos(a)).toFixed(2)} ${(50 + 44.5 * Math.sin(a)).toFixed(2)}`;
        };
        let html = "";
        for (let i = 0; i < count; i++) {
            const from = -RING_ARC + i * (size + gap);
            const to = from + size;
            const d = `M ${point(from)} A 44.5 44.5 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`;
            // finished: dark outline, bright core and a highlight on top, like an enamel inlay
            html += i < doneN
                ? `<path d="${d}" class="done-edge" /><path d="${d}" class="is-done" /><path d="${d}" class="done-shine" />`
                : `<path d="${d}" />`;
        }
        $("hud-ring").innerHTML = html;
    }

    // ------------------------------------------------------------------ quick actions

    function goNext() {
        if (busy()) return;
        toggleHelp(false);
        const it = questTarget();
        if (!it) {
            announce("Auf dieser Insel ist alles erledigt – auf zum Hafen!");
            return;
        }
        walkTo(...it.cells[0]);
    }

    function goPort() {
        const isl = islands[currentIsland];
        if (busy() || !isl) return;
        toggleHelp(false);
        const open = openHouses(isl).length;
        if (open && currentIsland < islands.length - 1) {
            // locked: walk up to the port, but not onto the dock
            announce(`Der Hafen ist noch gesperrt: ${open === 1 ? "ein Haus ist" : `${open} Häuser sind`} noch nicht erledigt.`);
            walkTo(...isl.departure.land);
        } else {
            walkTo(...isl.departure.dock);
        }
    }

    function toggleHelp(show = $("help").hidden) {
        $("help").hidden = !show;
        $("help-toggle").setAttribute("aria-expanded", String(show));
        if (!show && !state.helpSeen) {
            state.helpSeen = true;
            saveSoon();
        }
    }

    let announceTimer = null;

    function announce(text) {
        $("announce").textContent = text;
        const toast = $("toast");
        toast.textContent = text;
        toast.hidden = false;
        toast.classList.remove("is-shown");
        void toast.offsetWidth;
        toast.classList.add("is-shown");
        clearTimeout(announceTimer);
        announceTimer = setTimeout(() => (toast.hidden = true), 3200);
    }

    // ------------------------------------------------------------------ rendering

    function loadImage(path) {
        const url = ASSETS + path;
        if (!images.has(url)) {
            images.set(
                url,
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`${url} konnte nicht geladen werden`));
                    img.src = url;
                })
            );
        }
        return images.get(url);
    }

    async function loadArt() {
        sheets = await Promise.all(THEMES.map((t) => loadImage(tm.themes[t].image)));
        const defs = [...new Set(sprites.map((s) => s.def)), tm.characters.HERO, tm.characters.SHIP, tm.sprites.ARROW];
        await Promise.all(
            defs.filter((d) => d.image).map(async (d) => {
                d.img = await loadImage(d.image);
            })
        );
    }

    function drawTile(g, sheet, id, x, y, flip = false) {
        if (id < 0) return;
        const cols = tm.sheet.columns;
        const sx = (id % cols) * T;
        const sy = Math.floor(id / cols) * T;
        if (flip) {
            g.save();
            g.translate(x + T, y);
            g.scale(-1, 1);
            g.drawImage(sheet, sx, sy, T, T, 0, 0, T, T);
            g.restore();
        } else {
            g.drawImage(sheet, sx, sy, T, T, x, y, T, T);
        }
    }

    function drawArt(g, art, colors, x, y) {
        art.forEach((line, r) =>
            [...line].forEach((ch, c) => {
                if (!colors[ch]) return;
                g.fillStyle = colors[ch];
                g.fillRect(x + c, y + r, 1, 1);
            })
        );
    }

    function terrainTile(c, r) {
        if (terrain[idx(c, r)] === 0) return tile.LAND;
        if (waterTiles.has(idx(c, r))) return waterTiles.get(idx(c, r));
        const coast = tm.autotiles.coast;
        const n = isLand(c, r - 1);
        const e = isLand(c + 1, r);
        const s = isLand(c, r + 1);
        const w = isLand(c - 1, r);
        const parts = [];
        if (n) parts.push("N");
        if (e) parts.push("E");
        if (s) parts.push("S");
        if (w) parts.push("W");
        if (!n && !e && isLand(c + 1, r - 1)) parts.push("NE");
        if (!s && !e && isLand(c + 1, r + 1)) parts.push("SE");
        if (!s && !w && isLand(c - 1, r + 1)) parts.push("SW");
        if (!n && !w && isLand(c - 1, r - 1)) parts.push("NW");
        return coast.tiles[parts.join(" ")] ?? coast.fallback;
    }

    function pathTile(c, r) {
        // only path pieces connect: next to a pier the path shows its end piece
        const isPath = (x, y) => inside(x, y) && deco[idx(x, y)] === tile.PATH;
        const parts = [];
        if (isPath(c, r - 1)) parts.push("N");
        if (isPath(c + 1, r)) parts.push("E");
        if (isPath(c, r + 1)) parts.push("S");
        if (isPath(c - 1, r)) parts.push("W");
        return tm.autotiles.path.tiles[parts.join(" ")] ?? tile.PATH;
    }

    function buildLayer() {
        layer = document.createElement("canvas");
        layer.width = W * T;
        layer.height = H * T;
        const g = layer.getContext("2d");
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                const k = idx(c, r);
                const sheet = sheets[themeOf[k]];
                drawTile(g, sheet, terrainTile(c, r), c * T, r * T);
                const d = deco[k];
                if (d === tile.PATH) drawTile(g, sheet, pathTile(c, r), c * T, r * T);
                else if (d) drawTile(g, sheet, d & 0xffff, c * T, r * T, !!(d & FLIP));
            }
        }
        routes.forEach((route) => route && drawTrack(g, route));
        fogLayer = document.createElement("canvas");
        fogLayer.width = W * T;
        fogLayer.height = H * T;
        fogCtx = fogLayer.getContext("2d");
        fogDirty.push([0, 0, W - 1, H - 1]);
    }

    function fogTile(c, r) {
        const level = fog[idx(c, r)];
        const def = tm.autotiles.fog.levels[level];
        if (!def) return -1;
        const fogged = (x, y) => !inside(x, y) || fog[idx(x, y)] > 0;
        const n = fogged(c, r - 1);
        const e = fogged(c + 1, r);
        const s = fogged(c, r + 1);
        const w = fogged(c - 1, r);
        if ((!n && !s) || (!e && !w)) return def.single[(c * 7 + r * 13) % def.single.length];
        return def.frame[!n ? 0 : !s ? 2 : 1][!w ? 0 : !e ? 2 : 1];
    }

    function flushFog() {
        while (fogDirty.length) {
            const [a, b, c, d] = fogDirty.pop();
            const x0 = clamp(a, 0, W - 1);
            const y0 = clamp(b, 0, H - 1);
            const x1 = clamp(c, 0, W - 1);
            const y1 = clamp(d, 0, H - 1);
            fogCtx.clearRect(x0 * T, y0 * T, (x1 - x0 + 1) * T, (y1 - y0 + 1) * T);
            for (let r = y0; r <= y1; r++) {
                for (let cc = x0; cc <= x1; cc++) {
                    if (fog[idx(cc, r)] > 0) drawTile(fogCtx, sheets[0], fogTile(cc, r), cc * T, r * T);
                }
            }
        }
    }

    const frameDuration = (def, f) => def.durations?.[f] || def.frameDuration || 100;

    /** Frame of an animation (from..to) `elapsed` ms after its start; see tileMap.js. */
    function animFrame(def, from, to, elapsed, loop, obj) {
        let total = 0;
        for (let f = from; f <= to; f++) total += frameDuration(def, f);
        if (total <= 0) return from;
        let t = elapsed * (obj?.tempo ?? 1);
        if (loop && obj) t += obj.phase * total;
        if (t >= total) {
            if (!loop) return to;
            t %= total;
        }
        for (let f = from; f <= to; f++) {
            t -= frameDuration(def, f);
            if (t < 0) return f;
        }
        return to;
    }

    function drawFrame(def, frame, x, y) {
        const cols = def.columns || def.frames || 1;
        ctx.drawImage(def.img, (frame % cols) * def.frameWidth, Math.floor(frame / cols) * def.frameHeight,
            def.frameWidth, def.frameHeight, x, y, def.frameWidth, def.frameHeight);
    }

    /**
     * Animations with `pause` (tilemap.json) play once, then wait a random time (`delay`, ms) showing
     * `pause.frame` (null: nothing) before they play again, like the blinking of the hero.
     */
    function pausedFrame(s, def, a, now) {
        const [minDelay, maxDelay] = a.pause.delay || [2000, 6000];
        const wait = () => minDelay + Math.random() * (maxDelay - minDelay);
        if (s.runAt === undefined) s.runAt = now + Math.random() * wait(); // not all at once
        let total = 0;
        for (let f = a.from; f <= a.to; f++) total += frameDuration(def, f);
        const t = now - s.runAt;
        if (t >= 0 && t < total) return animFrame(def, a.from, a.to, t, false, null);
        if (t >= total) s.runAt = now + wait();
        return a.pause.frame ?? null;
    }

    /**
     * Animations with `cycle` (tilemap.json) play `cycle.repeat` a random number of times (`times`), then
     * `cycle.then` once, and start over: the ducks swim left and right a few rounds, then dive.
     */
    function cycleFrame(s, def, cycle, now) {
        const repeat = def.animations[cycle.repeat];
        const then = def.animations[cycle.then];
        if (!repeat || !then) return def.frame || 0;
        const run = (anim) => {
            let total = 0;
            for (let f = anim.from; f <= anim.to; f++) total += frameDuration(def, f);
            return total || 1;
        };
        const [minN, maxN] = cycle.times || [2, 4];
        const count = () => minN + Math.floor(Math.random() * (maxN - minN + 1));
        if (s.cycleAt === undefined) {
            // start somewhere in the first rounds, so the ducks do not all dive together
            s.cycleLeft = count();
            s.cycleThen = false;
            s.cycleAt = now - Math.random() * s.cycleLeft * run(repeat);
        }
        let t = now - s.cycleAt;
        for (let guard = 0; guard < 100; guard++) {
            const length = s.cycleThen ? run(then) : s.cycleLeft * run(repeat);
            if (t < length) break;
            s.cycleAt += length;
            t -= length;
            s.cycleThen = !s.cycleThen;
            if (!s.cycleThen) s.cycleLeft = count();
        }
        if (s.cycleThen) return animFrame(def, then.from, then.to, t, false, null);
        // the rounds begin at frame `start` and wrap around: they end where the dive fits on
        let offset = 0;
        for (let f = repeat.from; f < (cycle.start ?? repeat.from); f++) offset += frameDuration(def, f);
        return animFrame(def, repeat.from, repeat.to, (t + offset) % run(repeat), false, null);
    }

    function drawSprite(s, now) {
        const def = s.def;
        if (!def.img) return;
        if (s.until && now > s.until) {
            s.anim = s.rest ?? def.default;
            s.until = 0;
        }
        const a = def.animations?.[s.anim];
        const frame = !a
            ? def.frame || 0
            : a.pause && a.loop
              ? pausedFrame(s, def, a, now)
              : a.cycle && a.loop
                ? cycleFrame(s, def, a.cycle, now)
                : animFrame(def, a.from, a.to, now - s.start, a.loop, s);
        if (frame === null) return; // pausing without a frame (the shark is just water then)
        const fp = def.footprint || [1, 1];
        const x = s.col * T + Math.round((fp[0] * T - def.frameWidth) / 2);
        const y = s.row * T + fp[1] * T - def.frameHeight;
        drawFrame(def, frame, x, y);
    }

    function drawShip(x, y, dir, now, obj) {
        const def = tm.characters.SHIP;
        if (!def.img) return;
        const a = def.animations[def.directions[dir] || def.directions.S];
        drawFrame(def, animFrame(def, a.from, a.to, now, true, obj), Math.round(x - def.frameWidth / 2), Math.round(y - def.frameHeight / 2));
    }

    // idle: the eyes are open most of the time (first frame of the idle animation, then half closed and
    // closed); after a random pause the hero blinks once, now and then twice
    const BLINK = [70, 90, 70]; // ms: half closed, closed, half closed

    function blinkFrame(idle, now) {
        if (!hero.blinkAt || hero.blinkAt < hero.idleStart) hero.blinkAt = hero.idleStart + 1500 + Math.random() * 3000;
        const t = now - hero.blinkAt;
        if (t < 0) return idle.from;
        const total = BLINK.reduce((a, b) => a + b, 0);
        if (t >= total) {
            hero.blinkAt = now + (Math.random() < 0.2 ? 180 : 2000 + Math.random() * 4000);
            return idle.from;
        }
        const step = t < BLINK[0] ? 1 : t < BLINK[0] + BLINK[1] ? 2 : 1;
        return Math.min(idle.from + step, idle.to);
    }

    function drawHero(now) {
        const def = tm.characters.HERO;
        if (!def.img) return;
        const walking = hero.step || now - hero.lastWalk <= WALK_GRACE_MS;
        let frame;
        if (!walking && def.idle) {
            frame = blinkFrame(def.animations[def.idle], now);
        } else {
            const a = def.animations[def.directions[hero.dir] || def.directions.S];
            frame = animFrame(def, a.from, a.to, now - hero.walkStart, true, hero);
        }
        drawFrame(def, frame, Math.round(hero.fc * T + (T - def.frameWidth) / 2), Math.round(hero.fr * T + T - def.frameHeight));
    }

    /** The next thing to do on the current island: houses first, then castle and village. */
    function questTarget() {
        const isl = islands[currentIsland];
        if (!isl || voyage) return null;
        const open = (it) => it && (it.ex ? !done.has(it.ex.id) : it.list.some((ex) => !done.has(ex.id)));
        return isl.houses.find(open) || [isl.castle, isl.village].find(open) || null;
    }

    function finished(it) {
        return it.ex ? done.has(it.ex.id) : it.list.every((ex) => done.has(ex.id));
    }

    function render(now, dt) {
        const cw = canvas.width;
        const chh = canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = tm.themes.valley.background;
        ctx.fillRect(0, 0, cw, chh);

        const scale = state.zoom * dpr;
        const target = voyage?.carrying && voyage.pos ? voyage.pos : { x: (hero.fc + 0.5) * T, y: (hero.fr + 0.5) * T };
        // the game bar covers the bottom of the view: centre the hero in the part above it
        const focus = { x: target.x, y: target.y + (barHeight * dpr) / scale / 2 };
        if (!cam.ready) {
            cam.x = focus.x;
            cam.y = focus.y;
            cam.ready = true;
        } else if (cam.free) {
            // dragged: cam.x/cam.y are set by the pointer
        } else {
            const k = Math.min(1, dt * 7);
            cam.x += (focus.x - cam.x) * k;
            cam.y += (focus.y - cam.y) * k;
        }
        const vw = cw / scale;
        const vh = chh / scale;
        const fit = (size, viewSize, c) => (size <= viewSize ? (size - viewSize) / 2 : clamp(c - viewSize / 2, 0, size - viewSize));
        view = {
            scale,
            x: Math.round(fit(W * T, vw, cam.x) * scale) / scale,
            y: Math.round(fit(H * T, vh, cam.y) * scale) / scale,
        };
        if (cam.free) {
            // keep the dragged camera inside the map, so dragging back responds at once
            cam.x = fit(W * T, vw, cam.x) + vw / 2;
            cam.y = fit(H * T, vh, cam.y) + vh / 2;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(scale, 0, 0, scale, -view.x * scale, -view.y * scale);
        ctx.drawImage(layer, 0, 0);

        if (marker) {
            const age = (now - marker.t) / 700;
            if (age >= 1) marker = null;
            else {
                ctx.globalAlpha = 1 - age;
                ctx.strokeStyle = marker.bad ? "#e11d48" : "#ffe14a";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(marker.c * T + 1.5 - age * 2, marker.r * T + 1.5 - age * 2, T - 3 + age * 4, T - 3 + age * 4);
                ctx.globalAlpha = 1;
            }
        }

        // sprites, ships and the hero, back to front
        const x0 = view.x - 6 * T;
        const x1 = view.x + vw + 6 * T;
        const y0 = view.y - 6 * T;
        const y1 = view.y + vh + 6 * T;
        const visible = (x, y) => x > x0 && x < x1 && y > y0 && y < y1;
        const drawables = [];
        sprites.forEach((s) => {
            const fp = s.def.footprint || [1, 1];
            if (visible(s.col * T, s.row * T)) drawables.push({ key: (s.row + fp[1]) * T, draw: () => drawSprite(s, now) });
        });
        routes.forEach((route) => {
            if (!route || voyage?.route === route || !shipWaiting(route)) return;
            const [c, r] = shipCell(route);
            const end = (state.ships[route.index] || "a") === "a" ? route.a : route.b;
            if (visible(c * T, r * T)) {
                drawables.push({ key: (r + 1) * T, draw: () => drawShip((c + 0.5) * T, (r + 0.5) * T, end.side, now, route) });
            }
        });
        if (voyage?.pos) {
            const p = voyage.pos;
            drawables.push({ key: p.y + T / 2, draw: () => drawShip(p.x, p.y, p.dir, now, voyage.route) });
        }
        if (hero.visible) drawables.push({ key: (hero.fr + 1) * T + 0.5, draw: () => drawHero(now) });
        drawables.sort((a, b) => a.key - b.key).forEach((d) => d.draw());

        // finished buildings get a badge, the next open one a bouncing arrow
        interactables.forEach((it) => {
            if (it.kind === "volcano" || (it.list && !it.list.length) || !finished(it)) return;
            const [c, r] = it.cells[it.cells.length > 1 ? 1 : 0];
            if (visible(c * T, r * T)) drawArt(ctx, CHECK_ART, CHECK_COLORS, c * T + 10, it.top * T - 2);
        });
        const quest = questTarget();
        const arrow = tm.sprites.ARROW;
        if (quest && arrow.img) {
            const xs = quest.cells.map(([c]) => c);
            const cx = ((Math.min(...xs) + Math.max(...xs) + 1) / 2) * T;
            const a = arrow.animations.loop;
            drawFrame(arrow, animFrame(arrow, a.from, a.to, now, true, null), Math.round(cx - 8), quest.top * T - 15);
        }

        flushFog();
        ctx.drawImage(fogLayer, 0, 0);
        drawLabels(dt);
    }

    /**
     * One banner per island in the water above it: a ribbon with forked tails, slightly tilted (a fixed
     * angle per island), with the chapter number, the name and the progress. The homework hangs below
     * it as a small tag on two strings.
     */
    function drawLabels(dt = 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const k = dpr;
        const s = view.scale;
        const geist = (weight, px) => `${weight} ${Math.round(px * k)}px Geist, system-ui, sans-serif`;
        const caveat = `700 ${Math.round(21 * k)}px Caveat, cursive`;
        // vertically centred on the capitals (descenders like the g in "Hausaufgabe" do not count)
        const centred = (text, x, y, font) => {
            ctx.font = font;
            ctx.textBaseline = "alphabetic";
            ctx.fillText(text, x, y + ctx.measureText("H").actualBoundingBoxAscent / 2);
        };
        const width = (text, font) => {
            ctx.font = font;
            return ctx.measureText(text).width;
        };

        islands.forEach((isl, i) => {
            const seen = state.visited.includes(isl.chapter.number) || fog[idx(...isl.centre)] === 0;
            if (!seen) return;
            const [lc, lr] = isl.label;
            const current = i === currentIsland;
            const sticky = current && !voyage; // on the island, not sailing away from it
            let x = (lc * T - view.x) * s;
            const bottom = (lr * T - view.y) * s - 14 * k; // a little above the north coast
            const offscreen = x < -300 * k || bottom < -80 * k || x > canvas.width + 300 * k || bottom > canvas.height + 80 * k;
            // the label glides between its normal place and the sticky one: only the shift is smoothed,
            // so it still moves with the map without lag
            const shift = isl.labelShift || (isl.labelShift = { x: 0, y: 0 });
            if (offscreen && !sticky && !shift.x && !shift.y) return;

            const n = doneCount(isl.items);
            const complete = n === isl.items.length;
            const count = `${n}/${isl.items.length}`;
            const hw = isl.volcano?.homework;

            // banner body
            const badgeR = 10 * k;
            const padX = 8 * k;
            const tw = width(isl.chapter.title, caveat);
            const cw = width(count, geist(700, 11));
            const bodyW = padX + 2 * badgeR + 7 * k + tw + 12 * k + 8 * k + cw + padX;
            const bodyH = 28 * k;
            const tail = 16 * k; // how far the tails reach out
            const drop = 6 * k; // the tails sit a little lower than the body
            const tagH = 31 * k; // two lines: "Hausaufgabe 2", the date
            const hang = 11 * k; // length of the strings
            const total = bodyH / 2 + (hw ? hang + tagH : drop);
            let cy = bottom - total;
            let wantX = 0;
            let wantY = 0;
            if (sticky) {
                // sticky: the label of the island you are on stays in view, below the top edge (and the
                // "Übersicht" button) and inside the screen sideways
                const minTop = 66 * k;
                // down to the south coast at most: dragged further, it leaves the view with the island
                const southY = (isl.southCoast * T - view.y) * s;
                const stickyY = Math.min(Math.max(cy, minTop + bodyH / 2), southY - total);
                wantY = Math.max(0, stickyY - cy);
                const half = bodyW / 2 + tail + 10 * k;
                wantX = clamp(x, half, canvas.width - half) - x;
            }
            const ease = Math.min(1, dt * 8);
            shift.x += (wantX - shift.x) * ease;
            shift.y += (wantY - shift.y) * ease;
            if (Math.abs(wantX - shift.x) < 0.5 && Math.abs(wantY - shift.y) < 0.5) {
                shift.x = wantX;
                shift.y = wantY;
            }
            x += shift.x;
            cy += shift.y;
            const angle = isl.tilt;

            ctx.save();
            ctx.translate(x, cy);
            ctx.rotate(angle);
            const L = -bodyW / 2;
            const R = bodyW / 2;
            const top = -bodyH / 2;
            const tailPath = (side) => {
                const edge = side < 0 ? L : R;
                const out = edge + side * tail;
                ctx.beginPath();
                ctx.moveTo(edge - side * 6 * k, top + drop);
                ctx.lineTo(out, top + drop);
                ctx.lineTo(out - side * 7 * k, drop); // the notch of the fork
                ctx.lineTo(out, top + bodyH + drop);
                ctx.lineTo(edge - side * 6 * k, top + bodyH + drop);
                ctx.closePath();
            };
            ctx.lineWidth = 1.5 * k;
            ctx.strokeStyle = "#1a1614";
            ctx.lineJoin = "round";

            // homework tag first: it hangs behind the banner
            if (hw) {
                const colors = { open: ["#c2410c", "#fff7ed"], soon: ["#1d4ed8", "#eff6ff"], over: ["#7a716b", "#f5f0eb"] }[homeworkState(hw)];
                const line1 = `Hausaufgabe ${hw.nr}`;
                const line2 = homeworkLine(hw);
                const tagW = Math.max(width(line1, geist(700, 10.5)), width(line2, geist(500, 10.5))) + 16 * k;
                ctx.save();
                ctx.translate(0, top + bodyH);
                ctx.rotate(-angle * 1.6); // swings a little the other way
                ctx.beginPath();
                ctx.moveTo(-tagW / 3, -4 * k);
                ctx.lineTo(-tagW / 3, hang);
                ctx.moveTo(tagW / 3, -4 * k);
                ctx.lineTo(tagW / 3, hang);
                ctx.strokeStyle = "#4a2a14";
                ctx.lineWidth = 1.4 * k;
                ctx.stroke();
                ctx.fillStyle = "rgba(26, 22, 20, 0.8)";
                ctx.beginPath();
                ctx.roundRect(-tagW / 2 + 2 * k, hang + 2 * k, tagW, tagH, 5 * k);
                ctx.fill();
                ctx.fillStyle = colors[0];
                ctx.strokeStyle = "#1a1614";
                ctx.lineWidth = 1.5 * k;
                ctx.beginPath();
                ctx.roundRect(-tagW / 2, hang, tagW, tagH, 5 * k);
                ctx.fill();
                ctx.stroke();
                // the knots of the strings
                ctx.fillStyle = "#1a1614";
                for (const sx of [-tagW / 3, tagW / 3]) {
                    ctx.beginPath();
                    ctx.arc(sx, hang + 3.5 * k, 1.6 * k, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = colors[1];
                ctx.textAlign = "center";
                centred(line1, 0, hang + 11 * k, geist(700, 10.5));
                centred(line2, 0, hang + 22.5 * k, geist(500, 10.5));
                ctx.restore();
            }

            // shadow, tails, body
            ctx.fillStyle = "rgba(26, 22, 20, 0.8)";
            ctx.save();
            ctx.translate(2 * k, 2 * k);
            tailPath(-1);
            ctx.fill();
            tailPath(1);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(L, top, bodyW, bodyH, 4 * k);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = current ? "#e9c35f" : "#dcc08d";
            for (const side of [-1, 1]) {
                tailPath(side);
                ctx.fill();
                ctx.stroke();
            }
            ctx.fillStyle = current ? "#ffe9a8" : "#fff6df";
            ctx.beginPath();
            ctx.roundRect(L, top, bodyW, bodyH, 4 * k);
            ctx.fill();
            ctx.stroke();

            // chapter number in a badge, the name, the progress
            const bx = L + padX + badgeR;
            ctx.fillStyle = "#9a3f28";
            ctx.beginPath();
            ctx.arc(bx, 0, badgeR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff6df";
            ctx.textAlign = "center";
            centred(String(isl.chapter.number), bx, 0, geist(800, isl.chapter.number > 9 ? 10 : 12));
            ctx.textAlign = "left";
            ctx.fillStyle = "#1a1614";
            const tx = bx + badgeR + 7 * k;
            centred(isl.chapter.title, tx, 0, caveat);
            const dx = tx + tw + 12 * k;
            ctx.fillStyle = complete ? "#22c55e" : "#cdb994";
            ctx.beginPath();
            ctx.arc(dx, 0, 3 * k, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = complete ? "#1f5f2a" : "#6b4f33";
            centred(count, dx + 8 * k, 0, geist(700, 11));
            ctx.restore();
        });
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
    }

    let barHeight = 0;

    function resize() {
        barHeight = innerHeight - $("gamebar").getBoundingClientRect().top;
        dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
    }

    function defaultZoom() {
        const fitZoom = Math.round(Math.min(innerWidth, innerHeight) / (T * 16));
        return clamp(fitZoom, 2, 4);
    }

    function setZoom(step) {
        const i = ZOOMS.indexOf(state.zoom);
        state.zoom = ZOOMS[clamp((i < 0 ? 2 : i) + step, 0, ZOOMS.length - 1)];
        saveSoon();
    }

    function cellAt(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const s = view.scale / dpr;
        const c = Math.floor(((clientX - rect.left) / s + view.x) / T);
        const r = Math.floor(((clientY - rect.top) / s + view.y) / T);
        return inside(c, r) ? { c, r } : null;
    }

    // ------------------------------------------------------------------ input

    const KEY_DIRS = {
        w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right",
    };

    function bind() {
        // dragging moves the map; a drag is no click
        let drag = null;
        let dragged = false;
        canvas.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            drag = { id: e.pointerId, x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y, moved: false };
        });
        canvas.addEventListener("pointermove", (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.x;
            const dy = e.clientY - drag.y;
            if (!drag.moved && Math.hypot(dx, dy) < 6) return;
            if (!drag.moved) {
                drag.moved = true;
                canvas.setPointerCapture(e.pointerId);
                canvas.classList.add("is-dragging");
                // start from where the camera really is (it may have been gliding)
                drag.camX = view.x + canvas.width / view.scale / 2;
                drag.camY = view.y + canvas.height / view.scale / 2;
            }
            cam.free = true;
            const k = dpr / view.scale; // map pixels per CSS pixel
            cam.x = drag.camX - dx * k;
            cam.y = drag.camY - dy * k;
        });
        const endDrag = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            dragged = drag.moved;
            drag = null;
            canvas.classList.remove("is-dragging");
        };
        canvas.addEventListener("pointerup", endDrag);
        canvas.addEventListener("pointercancel", endDrag);

        canvas.addEventListener("click", (e) => {
            if (dragged) {
                dragged = false;
                return;
            }
            if (busy()) return;
            const cell = cellAt(e.clientX, e.clientY);
            if (cell) walkTo(cell.c, cell.r);
        });
        canvas.addEventListener("mousemove", (e) => {
            const cell = cellAt(e.clientX, e.clientY);
            const k = cell ? idx(cell.c, cell.r) : -1;
            const active = cell && !busy() && fog[k] < 3 && (inter[k] >= 0 || dockAt.has(k));
            canvas.classList.toggle("is-target", !!active);
        });
        canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 4) return;
            setZoom(e.deltaY < 0 ? 1 : -1);
        }, { passive: false });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && openStack.length) {
                e.preventDefault();
                closeOverlay();
                return;
            }
            if (busy() || e.metaKey || e.ctrlKey || e.altKey) return;
            const key = e.key.toLowerCase();
            // typing belongs to form fields, Enter and Space also to focused buttons and links
            if (e.target.closest?.("input, select, textarea")) return;
            if (!KEY_DIRS[key] && e.target.closest?.("button, a")) return;
            if (KEY_DIRS[key]) {
                e.preventDefault();
                if (!e.repeat) bumpArmed = true;
                if (!$("help").hidden) toggleHelp(false);
                keys.add(KEY_DIRS[key]);
                taps.add(KEY_DIRS[key]);
                hero.queue = [];
                pending = null;
            } else if (key === "enter" || key === "e" || key === " ") {
                e.preventDefault();
                const it = promptTarget();
                if (it && !e.repeat) interact(it.index);
            } else if (key === "n" && !e.repeat) {
                goNext();
            } else if (key === "h" && !e.repeat) {
                goPort();
            } else if (key === "l" && !e.repeat) {
                openIslandList();
            } else if (key === "?" && !e.repeat) {
                toggleHelp();
            } else if (key === "+" || key === "=") {
                setZoom(1);
            } else if (key === "-") {
                setZoom(-1);
            }
        });
        document.addEventListener("keyup", (e) => {
            const dir = KEY_DIRS[e.key.toLowerCase()];
            if (dir) keys.delete(dir);
        });
        window.addEventListener("blur", () => {
            keys.clear();
            taps.clear();
        });
        window.addEventListener("resize", resize);

        $("prompt").addEventListener("click", () => {
            const it = promptTarget();
            if (it) interact(it.index);
        });
        // after a mouse click on the bar the keys belong to the map again (keyboard users keep their focus)
        $("gamebar").addEventListener("click", (e) => {
            if (e.detail > 0 && e.target.closest("button") && !e.target.closest("#help-toggle")) canvas.focus({ preventScroll: true });
        });
        // "Spielleiste höher setzen": overrides the guess in karte.html, kept per device
        $("lift-bar").checked = document.documentElement.classList.contains("is-lifted");
        $("lift-bar").addEventListener("change", (e) => {
            document.documentElement.classList.toggle("is-lifted", e.target.checked);
            try {
                localStorage.setItem("lernwerk.karte.liftBar", e.target.checked ? "1" : "0");
            } catch (err) {
                // storage unavailable: only for this visit
            }
            resize();
        });
        $("go-next").addEventListener("click", goNext);
        $("island-list").addEventListener("click", openIslandList);
        $("go-port").addEventListener("click", goPort);
        $("help-toggle").addEventListener("click", () => toggleHelp());
        canvas.addEventListener("pointerdown", () => !$("help").hidden && toggleHelp(false));
        document.querySelectorAll("[data-zoom]").forEach((b) =>
            b.addEventListener("click", () => setZoom(Number(b.dataset.zoom)))
        );
        $("reset-map").addEventListener("click", () => {
            if (!confirm("Karte zurücksetzen? Nebel, Position und Schiffe beginnen von vorn. Erledigte Übungen bleiben erhalten.")) return;
            resetting = true;
            clearTimeout(saveTimer);
            saveTimer = null;
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                // ignore
            }
            location.reload();
        });

        // overlays: open exercises, toggle done, close
        document.addEventListener("click", (e) => {
            const open = e.target.closest("[data-open]");
            if (open) {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return; // new tab: normal link
                e.preventDefault();
                openExercise(open.dataset.open);
                return;
            }
            const travel = e.target.closest("[data-travel]");
            if (travel) {
                travelTo(Number(travel.dataset.travel));
                return;
            }
            const toggle = e.target.closest("[data-done]");
            if (toggle) {
                toggleDone(toggle.dataset.done);
                return;
            }
            if (e.target.closest("[data-close]")) closeOverlay(e.target.closest(".overlay")?.id);
            else if (e.target.classList.contains("overlay") && e.target.id !== "frame-overlay") closeOverlay(e.target.id);
        });

        // the exercise page's "Schließen" link (helper.js, ?embedded)
        window.addEventListener("message", (e) => {
            if (e.origin !== location.origin || e.source !== $("frame").contentWindow) return;
            if (e.data?.type === "lernwerk:close") {
                closeOverlay("frame-overlay");
                refreshDone();
                refreshOpenViews();
                updateHud();
            }
        });
        window.addEventListener("storage", (e) => {
            if (e.key === PLANER_KEY) {
                refreshDone();
                refreshOpenViews();
                updateHud();
            }
        });
        window.addEventListener("pagehide", save);
        document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && save());
    }

    // ------------------------------------------------------------------ startup

    async function loadJson(url) {
        // revalidate: exercises, course data and tile descriptions change between visits
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
        return res.json();
    }

    async function init() {
        // karte.html?ua shows the browser's user agent (to recognise browsers like Arc on iOS)
        if (params.has("ua")) {
            const box = document.createElement("textarea");
            box.readOnly = true;
            box.value = [
                navigator.userAgent,
                `touch points: ${navigator.maxTouchPoints}, screen: ${screen.width} x ${screen.height}, ` +
                    `window: ${innerWidth} x ${innerHeight}, pixel ratio: ${devicePixelRatio}`,
                `lifted: ${document.documentElement.classList.contains("is-lifted")}`,
            ].join("\n");
            box.style.cssText = "position:fixed;left:10px;right:10px;top:64px;z-index:60;height:90px;font:12px monospace;padding:8px";
            document.body.append(box);
        }
        canvas = $("map");
        ctx = canvas.getContext("2d");
        const back = `./uebersicht.html${FLAG_QUERY ? `?${FLAG_QUERY}` : ""}`;
        $("back-link").href = back;
        try {
            [catalog, tm, config] = await Promise.all([
                LernwerkCatalog.load(undefined, { cache: "no-cache" }),
                loadJson(`${ASSETS}tilemap.json`),
                loadJson(CONFIG_URL).catch(() => ({})),
            ]);
            LernwerkCatalog.migrateDone(catalog); // ids from before the exercise modules
            knownIds = new Set(catalog.exercises.map((ex) => ex.id)); // before hiding drafts
            if (!SHOW_HIDDEN) catalog.exercises = catalog.exercises.filter((ex) => !ex.isHidden);
            if (!SHOW_DRAFTS) catalog.exercises = catalog.exercises.filter((ex) => !ex.isDraft);
            conceptById = Object.fromEntries(catalog.concepts.map((c) => [c.id, c]));
            typeById = Object.fromEntries(catalog.types.map((t) => [t.id, t]));
            exerciseById = Object.fromEntries(catalog.exercises.map((ex) => [ex.id, ex]));
            tile = Object.fromEntries(tm.tiles.map((t) => [t.name, t.id]));

            buildWorld();
            if (!islands.length) throw new Error("Keine Übungen gefunden");
            loadState();
            if (!ZOOMS.includes(state.zoom)) state.zoom = defaultZoom();
            await loadArt();
            buildLayer();
        } catch (err) {
            console.error(err);
            $("loading").innerHTML = `<b>Die Karte konnte nicht geladen werden.</b><span>${esc(err.message)}. Die Seite muss über einen Webserver geöffnet werden.</span>
                <a href="${esc(back)}">Zur Übersicht</a>`;
            return;
        }
        refreshDone();
        resize();
        bind();
        reveal(hero.c, hero.r, REVEAL);
        enterIsland(islandIndexAt(hero.c, hero.r));
        hero.idleStart = performance.now();
        $("loading").hidden = true;
        if (!state.helpSeen) toggleHelp(true);
        canvas.focus({ preventScroll: true });

        let last = performance.now();
        const loop = (now) => {
            const dt = Math.min(0.1, (now - last) / 1000);
            last = now;
            updateHero(now);
            updateVoyage(now);
            render(now, dt);
            updatePrompt();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    document.addEventListener("DOMContentLoaded", init);
})();
