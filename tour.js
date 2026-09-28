// Rundgang durch den Übungsplaner (uebersicht.html): dunkelt die Seite ab, kreist den jeweils erklärten
// Bereich handgezeichnet ein und beschriftet ihn. Startet beim ersten Besuch automatisch, danach über den
// ?-Knopf neben dem Darstellungsmenü oder mit ?tour in der URL.
// Die Seite wird nur über ihre eigenen Knöpfe bedient (Filter aufklappen, Kartenansicht, Sortierung …); am Ende
// stellt der Rundgang den vorherigen Zustand wieder her.
(() => {
    "use strict";

    const SEEN_KEY = "lernwerk.tour.v1";
    const MARGIN = 16; // Abstand zum Fensterrand
    const GAP = 56; // Abstand Markierung ↔ Notiz (Platz für den Pfeil)
    const RING_PAD = 10;
    const HOLE_PAD = 8;
    const SVG_NS = "http://www.w3.org/2000/svg";

    const q = (sel, root = document) => root.querySelector(sel);
    const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasProfile = () => !q("#profile")?.classList.contains("is-new");
    const hasResults = () => Number(q("#results-count b")?.textContent) > 0;

    // --- Beispielkarte: dieselbe Karte über alle Kartenschritte hinweg -----------------------------

    let cardId = null;

    function exampleCard() {
        if (cardId) {
            const btn = q(`.results .done-btn[data-id="${CSS.escape(cardId)}"]`);
            if (btn) return btn.closest(".card");
        }
        const cards = [...document.querySelectorAll(".results .card")];
        const card =
            cards.find((c) => !c.matches(".is-locked, .is-done") && q(".card-image", c)) ||
            cards.find((c) => !c.matches(".is-locked, .is-done")) ||
            cards[0];
        cardId = card ? q(".done-btn", card).dataset.id : null;
        return card || null;
    }

    const inCard = (sel) => () => {
        const card = exampleCard();
        return card && q(sel, card);
    };

    // --- Schritte ------------------------------------------------------------------------------
    // target: wird eingekreist und vom Pfeil angezeigt; area: wird zusätzlich aufgehellt.
    // page: Zustand der Seite, den der Schritt braucht (sonst gilt der Zustand vor dem Rundgang).

    const STEPS = [
        {
            title: "Willkommen im Übungsplaner!",
            text: "In einer Minute zeigen wir dir, was du hier siehst und einstellen kannst. Weiter geht es mit dem Knopf unten oder mit der Pfeiltaste →.",
        },
        {
            target: () => q('[aria-controls="lw-theme-menu"]'),
            title: "Dein Look",
            text: "Hier wählst du die Darstellung: klassisch, als Schulheft, im Terminal-Stil, als Tafel … Deine Wahl gilt auch auf allen Übungsseiten.",
        },
        {
            target: () => q(".profile-steps .stepper"),
            area: () => q(".profile-steps .step"),
            page: { profile: true },
            title: "Deine letzte Vorlesung",
            text: "Wähle die Vorlesung, die du zuletzt gehört hast, oder blättere mit ‹ ›. Alle Konzepte bis dahin gelten als bekannt – danach richten sich alle Vorschläge.",
        },
        {
            target: () => q("#path .tile.is-last") || q("#path .tile"),
            area: () => q("#path"),
            page: { profile: true },
            title: "Wie sicher bist du?",
            text: "Jede Kachel ist ein Konzept aus der Vorlesung. Darunter schätzt du dich ein: ✕ neu, ? unsicher, ✓ kann ich, ★ sicher. Wo du unsicher bist, schlagen wir dir bevorzugt Übungen vor.",
        },
        {
            target: () => q("#scope"),
            title: "Welche Übungen?",
            text: "„Passt zu mir“ zeigt alles, wofür du die Konzepte schon kennst. „Nächster Schritt“ braucht genau ein neues Konzept – ideal zum Vorarbeiten. Die Zahl verrät, wie viele Übungen es jeweils sind.",
        },
        {
            target: () => q(".control-row"),
            title: "Feinschliff",
            text: "Nur Übungen aus Vorlesungen, die du schon gehört hast, deine unsicheren Konzepte in den Fokus rücken oder Erledigtes ausblenden.",
        },
        {
            target: () => q("#more"),
            area: () => q(".search-row"),
            page: { more: true },
            title: "Weitere Filter",
            text: "„Weitere Filter“ klappt diesen Bereich auf: Art der Übung, Übungslevel, Ausstattung (z. B. mit Beispiellösung) ein bestimmtes Konzept oder Kapitel. Oder du tippst einfach ins Suchfeld.",
        },
        {
            target: () => q(".results-info"),
            title: "Deine Treffer",
            text: "So viele Übungen bleiben übrig. Aktive Filter erscheinen hier als Kärtchen – ein Klick auf × entfernt sie wieder.",
        },
        {
            target: () => q(".results-tools .seg"),
            area: () => q(".results-tools"),
            title: "Karten oder Tabelle",
            text: "Karten zeigen Bild und alle Details, die Tabelle ist kompakt und lässt sich über die Spaltenköpfe sortieren. Links daneben wählst du die Sortierung.",
        },
        {
            target: () => q(".results .group-title"),
            area: () => q(".results .group-head"),
            when: hasResults,
            page: { view: "cards", sort: "chapter" },
            title: "Nach Kapiteln",
            text: "Sortierst du nach „Kapitel“, stehen die Übungen unter ihrem Vorlesungskapitel. Ein Klick auf die Kapitelüberschrift zeigt nur noch die Übungen aus diesem Kapitel, ein zweiter Klick hebt den Filter wieder auf.",
        },
        {
            target: exampleCard,
            when: hasResults,
            page: { view: "cards" },
            title: "Eine Übungskarte",
            text: "Jede Karte ist eine Übung – ein Klick auf Titel oder Bild öffnet sie. Mit „★ Empfehlung“ markieren wir die Übungen, die gerade am besten zu dir passen. Schauen wir uns die Teile genauer an.",
        },
        {
            target: inCard(".card-head"),
            when: hasResults,
            page: { view: "cards" },
            title: "Titel und Art",
            text: "Das farbige Schild zeigt die Art: Vorlesungsbeispiel, Sandkasten, Übung, Test oder Tool. „Neu“ steht an frisch hinzugekommenen Übungen.",
        },
        {
            target: inCard(".card-level"),
            when: hasResults,
            page: { view: "cards" },
            title: "Übungslevel",
            text: "Ein Punkt heißt sehr einfach, fünf Punkte sehr schwer.",
        },
        {
            target: inCard(".concepts"),
            when: hasResults,
            page: { view: "cards" },
            title: "Konzepte",
            text: "Diese Konzepte kommen in der Übung vor. Die Farbe zeigt deine Einschätzung, beim Drüberfahren siehst du den Namen. Ein Klick zeigt alle Übungen zu diesem Konzept.",
        },
        {
            target: inCard(".features"),
            when: hasResults,
            page: { view: "cards" },
            title: "Was ist dabei?",
            text: "Gibt es eine Beispiellösung, eine Erklärung oder Experimente zum Ausprobieren? Oder ist es eine offene Aufgabe ohne Lösung?",
        },
        {
            target: inCard(".reason"),
            when: () => hasResults() && hasProfile(),
            page: { view: "cards" },
            title: "Warum diese Übung?",
            text: "Hier steht, warum die Übung zu dir passt – oder welches Konzept dir dafür noch fehlt.",
        },
        {
            target: inCard(".card-chapter"),
            area: inCard(".card-media"),
            when: hasResults,
            page: { view: "cards" },
            title: "Kapitel",
            text: "Aus diesem Kapitel der Vorlesung stammt die Übung. Ein Klick darauf zeigt nur die Übungen aus diesem Kapitel.",
        },
        {
            target: inCard(".done-btn"),
            when: hasResults,
            page: { view: "cards" },
            title: "Erledigt!",
            text: "Fertig mit einer Übung? Hake sie hier ab. Dein Fortschritt wird nur in diesem Browser gespeichert.",
        },
        {
            target: () => q(".lw-tour-button"),
            title: "Das war's!",
            text: "Diesen Rundgang kannst du hier jederzeit noch einmal starten. Viel Spaß beim Üben!",
            next: "Los geht's",
        },
    ];

    // --- Zustand der Seite (über ihre eigenen Knöpfe) ------------------------------------------------

    function readPage() {
        return {
            profile: !q("#profile-body").hidden,
            more: !q("#more").hidden,
            view: q('.seg [aria-pressed="true"]')?.dataset.view || "cards",
            sort: q("#sort").value,
        };
    }

    function applyPage(want) {
        if (!q("#profile-body").hidden !== want.profile) q(".profile-head").click();
        if (!q("#more").hidden !== want.more) q("#more-toggle").click();
        const view = q(`.seg [data-view="${want.view}"]`);
        if (view && view.getAttribute("aria-pressed") !== "true") view.click();
        const sort = q("#sort");
        if (want.sort && sort.value !== want.sort) {
            sort.value = want.sort;
            sort.dispatchEvent(new Event("change"));
        }
    }

    // --- Handgezeichnete Formen -------------------------------------------------------------------

    const rand = (min, max) => min + Math.random() * (max - min);

    function newSeed() {
        return {
            start: rand(-2.9, -2.2), // oben links anfangen, wie mit dem Stift
            rot: rand(-0.04, 0.04),
            wobble: rand(0.012, 0.03),
            phase: rand(0, Math.PI * 2),
            drift: rand(4, 8), // Ende läuft etwas außen am Anfang vorbei
            overshoot: rand(0.35, 0.6),
        };
    }

    /** Leicht verwackelte Superellipse, die das Rechteck vollständig umschließt. */
    function ringPath(r, s) {
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const hw = r.w / 2 - RING_PAD;
        const hh = r.h / 2 - RING_PAD;
        const a = r.w / 2;
        const b = r.h / 2;
        // kleinster Exponent, bei dem die Ecken des Elements noch innen liegen
        let n = 2;
        while (n < 12 && (hw / a) ** n + (hh / b) ** n > 0.92) n += 0.25;

        const steps = 90;
        const span = Math.PI * 2 + s.overshoot;
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const t = s.start + span * u;
            const c = Math.cos(t);
            const sn = Math.sin(t);
            let x = a * Math.sign(c) * Math.abs(c) ** (2 / n);
            let y = b * Math.sign(sn) * Math.abs(sn) ** (2 / n);
            const len = Math.hypot(x, y) || 1;
            const f = 1 + s.wobble * Math.sin(2 * t + s.phase);
            const out = s.drift * u;
            x = x * f + (x / len) * out;
            y = y * f + (y / len) * out;
            const rx = x * Math.cos(s.rot) - y * Math.sin(s.rot);
            const ry = x * Math.sin(s.rot) + y * Math.cos(s.rot);
            pts.push([cx + rx, cy + ry]);
        }
        let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i][0] + pts[i + 1][0]) / 2;
            const my = (pts[i][1] + pts[i + 1][1]) / 2;
            d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
        }
        return d;
    }

    /** Geschwungener Pfeil von (sx, sy) nach (ex, ey) mit Spitze am Ende. */
    function arrowPath(sx, sy, ex, ey, bend) {
        const mx = (sx + ex) / 2;
        const my = (sy + ey) / 2;
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy) || 1;
        const cx = mx - (dy / len) * len * 0.22 * bend;
        const cy = my + (dx / len) * len * 0.22 * bend;
        const ang = Math.atan2(ey - cy, ex - cx);
        const head = 13;
        const h1 = [ex - head * Math.cos(ang - 0.45), ey - head * Math.sin(ang - 0.45)];
        const h2 = [ex - head * Math.cos(ang + 0.5), ey - head * Math.sin(ang + 0.5)];
        const f = (v) => v.toFixed(1);
        return (
            `M${f(sx)} ${f(sy)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}` +
            `M${f(h1[0])} ${f(h1[1])}L${f(ex)} ${f(ey)}L${f(h2[0])} ${f(h2[1])}`
        );
    }

    // --- Overlay ---------------------------------------------------------------------------------

    let root, svg, holes, rings, arrow, note, els, current, index, list, before, frame, lastFocus;

    function svgEl(name, attrs = {}) {
        const el = document.createElementNS(SVG_NS, name);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
    }

    function build() {
        root = document.createElement("div");
        root.className = "tour";

        svg = svgEl("svg", { class: "tour-canvas", "aria-hidden": "true" });
        const defs = svgEl("defs");
        const blur = svgEl("filter", { id: "tour-soft", x: "-20%", y: "-20%", width: "140%", height: "140%" });
        blur.append(svgEl("feGaussianBlur", { stdDeviation: "5" }));
        const mask = svgEl("mask", { id: "tour-mask" });
        mask.append(svgEl("rect", { width: "100%", height: "100%", fill: "#fff" }));
        holes = svgEl("g", { fill: "#000", filter: "url(#tour-soft)" });
        mask.append(holes);
        defs.append(blur, mask);
        rings = svgEl("g", { class: "tour-rings" });
        arrow = svgEl("path", { class: "tour-arrow", pathLength: "1" });
        svg.append(defs, svgEl("rect", { class: "tour-dim", width: "100%", height: "100%", mask: "url(#tour-mask)" }), rings, arrow);

        note = document.createElement("div");
        note.className = "tour-note";
        note.setAttribute("role", "dialog");
        note.setAttribute("aria-modal", "true");
        note.setAttribute("aria-labelledby", "tour-title");
        note.setAttribute("aria-describedby", "tour-text");
        note.innerHTML = `
            <div class="tour-head">
                <p class="tour-count" id="tour-count"></p>
                <button type="button" class="tour-btn tour-skip" data-tour="close">Überspringen</button>
            </div>
            <h2 class="tour-title" id="tour-title"></h2>
            <p class="tour-text" id="tour-text"></p>
            <div class="tour-actions">
                <button type="button" class="tour-btn" data-tour="back">‹ Zurück</button>
                <button type="button" class="tour-btn tour-next" data-tour="next">Weiter ›</button>
            </div>`;

        root.append(svg, note);
        root.addEventListener("click", (ev) => {
            const act = ev.target.closest("[data-tour]")?.dataset.tour;
            if (act === "close") close();
            else if (act === "back") go(index - 1, -1);
            else if (act === "next") go(index + 1, 1);
        });
    }

    function onKey(ev) {
        if (ev.key === "Escape") close();
        else if (ev.key === "ArrowRight") go(index + 1, 1);
        else if (ev.key === "ArrowLeft") go(index - 1, -1);
        else if (ev.key === "Tab") {
            // Fokus bleibt in der Notiz
            const btns = [...note.querySelectorAll("button:not([hidden])")];
            const i = btns.indexOf(document.activeElement);
            const next = ev.shiftKey ? (i <= 0 ? btns.length - 1 : i - 1) : (i + 1) % btns.length;
            btns[next].focus({ preventScroll: true });
        } else return;
        ev.preventDefault();
    }

    function scheduleLayout() {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            layout();
        });
    }

    const padded = (el, pad) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
    };

    const union = (rs) => {
        const x = Math.min(...rs.map((r) => r.x));
        const y = Math.min(...rs.map((r) => r.y));
        return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
    };

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    function layout() {
        if (!current) return;
        const vw = document.documentElement.clientWidth;
        const vh = window.innerHeight;

        holes.innerHTML = "";
        const lit = [...els.target, ...els.area].map((el) => padded(el, HOLE_PAD));
        for (const r of lit) holes.append(svgEl("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 14 }));

        // am Bildschirmrand (z. B. Karten auf dem Handy) den Kreis nach innen ziehen
        const ringRects = els.target.map((el) => {
            const r = padded(el, RING_PAD);
            const x = Math.max(r.x, 4);
            return { ...r, x, w: Math.min(r.x + r.w, vw - 4) - x };
        });
        [...rings.children].forEach((p, i) => p.setAttribute("d", ringPath(ringRects[i], current.seeds[i])));

        // Notiz platzieren: unter, über, rechts oder links neben der Markierung, sonst unten angeheftet
        const w = Math.min(420, vw - MARGIN * 2);
        note.style.width = `${w}px`;
        const h = note.offsetHeight;
        note.classList.remove("is-pinned", "is-boxed");

        if (!ringRects.length) {
            note.style.left = `${(vw - w) / 2}px`;
            note.style.top = `${Math.max(MARGIN, (vh - h) / 2)}px`;
            arrow.setAttribute("d", "");
            return;
        }

        const box = union(ringRects.slice(0, 1));
        const cx = box.x + box.w / 2;
        const cy = box.y + box.h / 2;
        const hx = clamp(cx - w / 2, MARGIN, vw - MARGIN - w);
        const vy = clamp(cy - h / 2, MARGIN, vh - MARGIN - h);
        const options = [
            { side: "below", left: hx, top: box.y + box.h + GAP, ok: box.y + box.h + GAP + h <= vh - MARGIN },
            { side: "above", left: hx, top: box.y - GAP - h, ok: box.y - GAP - h >= MARGIN },
            { side: "right", left: box.x + box.w + GAP, top: vy, ok: box.x + box.w + GAP + w <= vw - MARGIN },
            { side: "left", left: box.x - GAP - w, top: vy, ok: box.x - GAP - w >= MARGIN },
        ];
        // Handschrift auf hellem Grund ist schlecht lesbar: aufgehellte Bereiche möglichst meiden
        const overlaps = (o) =>
            lit.some((r) => o.left < r.x + r.w && o.left + w > r.x && o.top < r.y + r.h && o.top + h > r.y);
        const pick = options.find((o) => o.ok && !overlaps(o)) || options.find((o) => o.ok);
        if (pick && overlaps(pick)) note.classList.add("is-boxed");
        if (!pick) {
            note.classList.add("is-pinned");
            note.style.left = `${(vw - w) / 2}px`;
            note.style.top = `${vh - MARGIN - note.offsetHeight}px`;
            arrow.setAttribute("d", "");
            return;
        }
        note.style.left = `${pick.left}px`;
        note.style.top = `${pick.top}px`;

        // Pfeil von der Notiz zur Markierung
        const n = { l: pick.left, t: pick.top, r: pick.left + w, b: pick.top + h };
        let sx, sy, ex, ey;
        if (pick.side === "below" || pick.side === "above") {
            sx = clamp(cx + (cx < vw / 2 ? 40 : -40), n.l + 36, n.r - 36);
            ex = clamp(sx + (sx < cx ? 18 : -18), box.x + 14, box.x + box.w - 14);
            sy = pick.side === "below" ? n.t - 8 : n.b + 8;
            ey = pick.side === "below" ? box.y + box.h + 4 : box.y - 4;
        } else {
            sy = clamp(cy + 24, n.t + 24, n.b - 24);
            ey = clamp(sy - 16, box.y + 10, box.y + box.h - 10);
            sx = pick.side === "right" ? n.l - 8 : n.r + 8;
            ex = pick.side === "right" ? box.x + box.w + 4 : box.x - 4;
        }
        arrow.setAttribute("d", arrowPath(sx, sy, ex, ey, current.bend));
    }

    /** Scrollt so, dass Markierung und Notiz (darunter) möglichst gemeinsam sichtbar sind. */
    function scrollToStep() {
        if (!els.target.length) return Promise.resolve();
        const vh = window.innerHeight;
        const box = padded(els.target[0], RING_PAD);
        const h = note.offsetHeight;
        let top;
        if (box.h + GAP + h + MARGIN * 2 <= vh) top = (vh - (box.h + GAP + h)) / 2;
        else if (box.h + MARGIN * 2 <= vh) top = (vh - box.h) / 2;
        else top = MARGIN;
        const max = document.documentElement.scrollHeight - vh;
        const y = clamp(window.scrollY + box.y - top, 0, max);
        if (Math.abs(y - window.scrollY) < 2) return Promise.resolve();
        window.scrollTo({ top: y, behavior: reduceMotion() ? "auto" : "smooth" });
        // warten, bis das Scrollen zur Ruhe kommt (scrollend gibt es nicht überall)
        return new Promise((resolve) => {
            let last = window.scrollY;
            let still = 0;
            const t0 = performance.now();
            const tick = () => {
                still = Math.abs(window.scrollY - last) < 0.5 ? still + 1 : 0;
                last = window.scrollY;
                if (still > 5 || performance.now() - t0 > 1500) resolve();
                else requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    const resolve = (fn) => {
        const el = fn?.();
        return el && el.getClientRects().length ? [el] : [];
    };

    let token = 0;

    async function go(i, dir) {
        if (!root) return;
        if (i >= list.length) return close();
        if (i < 0) return;

        const step = list[i];
        applyPage({ ...before, ...step.page });
        const target = resolve(step.target);
        if (step.target && !target.length) return go(i + dir, dir); // Element fehlt gerade: überspringen

        const my = ++token;
        index = i;
        els = { target, area: resolve(step.area) };
        current = { seeds: target.map(newSeed), bend: Math.random() < 0.5 ? -1 : 1 };

        root.classList.remove("is-shown");
        note.querySelector("#tour-count").textContent = `${i + 1} / ${list.length}`;
        note.querySelector("#tour-title").textContent = step.title;
        note.querySelector("#tour-text").textContent = step.text;
        note.querySelector('[data-tour="back"]').hidden = i === 0;
        note.querySelector('[data-tour="close"]').hidden = i === list.length - 1;
        note.querySelector('[data-tour="next"]').textContent = step.next || (i === 0 ? "Los geht's ›" : "Weiter ›");

        rings.innerHTML = "";
        target.forEach(() => rings.append(svgEl("path", { class: "tour-ring", pathLength: "1" })));
        layout();

        await scrollToStep();
        if (my !== token || !root) return;
        layout();
        root.getBoundingClientRect(); // Ausgangszustand festhalten, damit die Zeichen-Animation startet
        root.classList.add("is-shown");
        note.querySelector('[data-tour="next"]').focus({ preventScroll: true });
    }

    function start() {
        if (root) return;
        try {
            localStorage.setItem(SEEN_KEY, "1");
        } catch (e) { }
        q(".lw-menu-anchor--floating .lw-menu[id]")?.setAttribute("hidden", "");
        lastFocus = document.activeElement;
        before = readPage();
        cardId = null;
        list = STEPS.filter((s) => !s.when || s.when());
        build();
        document.body.append(root);
        q(".page")?.setAttribute("inert", "");
        document.addEventListener("keydown", onKey, true);
        window.addEventListener("scroll", scheduleLayout, { passive: true });
        window.addEventListener("resize", scheduleLayout);
        requestAnimationFrame(() => root.classList.add("is-open"));
        go(0, 1);
    }

    function close() {
        if (!root) return;
        token++;
        document.removeEventListener("keydown", onKey, true);
        window.removeEventListener("scroll", scheduleLayout);
        window.removeEventListener("resize", scheduleLayout);
        cancelAnimationFrame(frame);
        frame = 0;
        q(".page")?.removeAttribute("inert");
        applyPage(before);
        const old = root;
        root = current = null;
        old.classList.remove("is-open");
        setTimeout(() => old.remove(), reduceMotion() ? 0 : 250);
        (lastFocus?.isConnected ? lastFocus : q(".lw-tour-button"))?.focus({ preventScroll: true });
    }

    // --- Start ---------------------------------------------------------------------------------

    function addButton() {
        const anchor = q(".lw-menu-anchor--floating");
        if (!anchor) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lw-menu-button lw-tour-button";
        btn.setAttribute("aria-label", "Rundgang: So funktioniert der Übungsplaner");
        btn.title = "Rundgang starten";
        btn.textContent = "?";
        btn.addEventListener("click", start);
        anchor.prepend(btn);
    }

    /** Wartet, bis der Übungsplaner seine Übungen gezeichnet hat (oder aufgibt). */
    function whenRendered() {
        return new Promise((resolve) => {
            const results = q("#results");
            if (!results || results.childElementCount) return resolve();
            const obs = new MutationObserver(() => {
                if (results.childElementCount) done();
            });
            const timer = setTimeout(done, 5000);
            function done() {
                obs.disconnect();
                clearTimeout(timer);
                resolve();
            }
            obs.observe(results, { childList: true });
        });
    }

    async function init() {
        addButton();
        let seen = false;
        try {
            seen = localStorage.getItem(SEEN_KEY) === "1";
        } catch (e) { }
        const forced = new URLSearchParams(location.search).has("tour");
        if (seen && !forced) return;
        await whenRendered();
        setTimeout(start, 500);
    }

    // nach theme.js, das das Menü oben rechts erst bei DOMContentLoaded erzeugt
    // (verzögerte Skripte laufen schon vorher, im Zustand "interactive")
    if (document.readyState === "complete") init();
    else document.addEventListener("DOMContentLoaded", init);
})();
