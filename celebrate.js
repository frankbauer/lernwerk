// Little celebrations: confetti bursts and a pop when an exercise is marked as done, a lecture as heard
// or an island is discovered, checkmarks and stars when a concept is rated "kann ich" or "sicher"; on
// phones each one also vibrates. Used by uebungsplaner.js and karte.js, styles in css/uebungsplaner.css
// (.lw-burst). Nothing moves (or vibrates) with "prefers-reduced-motion: reduce".
(() => {
    "use strict";

    const COLORS = ["#22c55e", "#ffd23f", "#61a2ff", "#ff7a59", "#c084fc", "#2dd4bf", "#f472b6"];
    const GLYPHS = ["★", "✦"];
    const GRAVITY = 1500; // px/s²
    const DRAG = 2.2; // velocity lost per second (exponential)

    const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const rand = (lo, hi) => lo + Math.random() * (hi - lo);

    let tapper = null; // iOS: a hidden switch whose toggling the system answers with a haptic tick

    /**
     * Vibrates in `pattern` (milliseconds on, off, on, …). Android has navigator.vibrate; Safari on iOS has
     * no vibration API but ticks when a switch (<input type="checkbox" switch>) is toggled, so there each
     * "on" becomes one tick. Both only work right after a tap or click of the user.
     */
    function buzz(pattern) {
        if (!pattern || reduced()) return;
        if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // no tap yet: not allowed
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
            return;
        }
        if (!/iP(hone|od|ad)|Macintosh/.test(navigator.userAgent) || navigator.maxTouchPoints < 1) return;
        if (!tapper) {
            tapper = document.createElement("label");
            tapper.setAttribute("aria-hidden", "true");
            tapper.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
            tapper.innerHTML = `<input type="checkbox" switch tabindex="-1" />`;
            document.body.append(tapper);
        }
        let t = 0;
        pattern.forEach((ms, i) => {
            if (i % 2 === 0) setTimeout(() => tapper.click(), t);
            t += ms;
        });
    }

    const CONFETTI = (i) => (i % 9 === 0 ? "glyph" : i % 4 === 0 ? "streamer" : i % 5 === 0 ? "dot" : "paper");

    /**
     * Confetti from the centre of `target` (an element or a DOMRect): a flash and a ring, then pieces of
     * paper, streamers and stars that fly, flutter and fall. The burst lives in its own fixed layer, so it
     * survives a re-render of the element it came from. `big` throws more, further and in all directions;
     * otherwise the confetti fountains upwards. The other options shape special bursts (see known(),
     * confident()): `kinds` picks the piece per index, `cone` is the half angle around "up" (null: all
     * around), `spread` lets the pieces leave one after another over that many seconds (a fountain),
     * `size` the font size of glyphs and images, `images` the pictures for the "img" pieces, `ring` the
     * colour of the ring (null: no flash and ring), `glow` a white (true) or golden ("gold") glow around the glyphs, `vibrate` the
     * vibration pattern on phones (null: none, see buzz()).
     */
    function burst(target, options = {}) {
        if (reduced() || !target) return;
        const { big = false } = options;
        const {
            count = big ? 90 : 44,
            kinds = CONFETTI,
            glyphs = GLYPHS,
            colors = COLORS,
            cone = big ? null : 1.15,
            speed = big ? [380, 1050] : [320, 720],
            life = [1.2, big ? 2.4 : 1.8],
            spread = 0.06,
            size = [18, 22],
            images = [],
            ring = "#ffd23f",
            glow = false,
            vibrate = big ? [30, 50, 30] : [20],
        } = options;
        buzz(vibrate);
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const layer = document.createElement("div");
        layer.className = `lw-burst${big ? " is-big" : ""}${glow ? ` is-glowing${glow === "gold" ? "-gold" : ""}` : ""}`;
        layer.setAttribute("aria-hidden", "true");
        layer.style.left = `${rect.left + rect.width / 2}px`;
        layer.style.top = `${rect.top + rect.height / 2}px`;
        if (ring) {
            layer.style.setProperty("--ring", ring);
            layer.innerHTML = `<i class="lw-burst-flash"></i><i class="lw-burst-ring"></i>`;
        }

        const bits = [];
        for (let i = 0; i < count; i++) {
            const kind = kinds(i);
            const el = document.createElement(kind === "img" ? "img" : "i");
            el.className = `lw-bit lw-bit-${kind}`;
            el.style.setProperty("--c", colors[i % colors.length]);
            if (kind === "glyph") el.textContent = glyphs[i % glyphs.length];
            if (kind === "img") {
                el.src = images[i % images.length];
                el.alt = "";
                el.style.width = el.style.height = "1em";
            }
            if (kind === "glyph" || kind === "img") el.style.fontSize = `${Math.round(rand(...size))}px`;
            const angle = cone == null ? rand(0, Math.PI * 2) : -Math.PI / 2 + rand(-cone, cone);
            const v = rand(...speed);
            bits.push({
                el,
                paper: kind === "paper",
                x: 0,
                y: 0,
                vx: Math.cos(angle) * v,
                vy: Math.sin(angle) * v - (cone == null ? 220 : 120),
                rot: kind === "glyph" || kind === "img" ? rand(-25, 25) : rand(0, 360),
                vrot: kind === "glyph" || kind === "img" ? rand(-240, 240) : rand(-720, 720),
                flutter: kind === "glyph" || kind === "img" ? 0 : rand(6, 14), // turns of the paper per second
                phase: rand(0, Math.PI * 2),
                life: rand(...life),
                delay: spread > 0.1 ? (i / count) * spread + rand(0, 0.03) : rand(0, spread),
            });
            el.style.opacity = "0";
            layer.append(el);
        }
        document.body.append(layer);

        let last = performance.now();
        let t = 0;
        const step = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            t += dt;
            let alive = 0;
            const drag = Math.exp(-DRAG * dt);
            for (const b of bits) {
                const age = t - b.delay;
                if (age < 0) {
                    alive++;
                    continue;
                }
                if (age > b.life) {
                    b.el.style.opacity = "0";
                    continue;
                }
                alive++;
                b.vx *= drag;
                b.vy = b.vy * drag + GRAVITY * dt * (b.paper ? 0.55 : 0.8);
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                b.rot += b.vrot * dt;
                const tilt = b.flutter ? Math.cos(b.phase + age * b.flutter) : 1; // paper turning in the air
                const grow = Math.min(1, age / 0.12); // glyphs and paper unfold as they leave
                const fade = Math.min(1, (b.life - age) / 0.35);
                b.el.style.opacity = String(fade);
                b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}deg) scale(${grow.toFixed(3)}, ${(grow * tilt).toFixed(3)})`;
            }
            if (alive) requestAnimationFrame(step);
            else layer.remove();
        };
        requestAnimationFrame(step);
    }

    const GREENS = ["#22c55e", "#16a34a", "#4ade80", "#15803d", "#86efac"];
    const STARS = ["#ffd23f", "#a855f7", "#facc15", "#c084fc", "#fde047", "#7c3aed"];
    const LIGHTS = ["#ffffff", "#fffbe6", "#fef9c3", "#fef08a", "#fde047", "#facc15"];

    /** A concept rated "kann ich": a spray of green checkmarks (and a pop of `button`, if given). */
    function known(target, button) {
        pop(button);
        burst(target, {
            count: 18,
            kinds: () => "glyph",
            glyphs: ["✓", "✔"],
            colors: GREENS,
            cone: 1.0,
            speed: [300, 640],
            life: [0.9, 1.4],
            size: [16, 28],
            ring: "#22c55e",
            glow: true,
            vibrate: [12],
        });
    }

    /**
     * A concept rated "sicher": three blasts of stars, one after the other (first small ones in all colours,
     * then two of glowing light yellow and white, a softer one and, after the fountain of stars, a full one).
     */
    function confident(target, button) {
        pop(button);
        const blast = { big: true, count: 40, kinds: () => "glyph", speed: [320, 820], size: [14, 28] };
        const yellow = { ...blast, glyphs: ["★", "★", "✦"], colors: LIGHTS, ring: "#fde047", glow: "gold", vibrate: null };
        burst(target, { ...blast, glyphs: ["★", "✦"], colors: [...STARS, ...COLORS], size: [7, 14], ring: "#a855f7", vibrate: [24, 166, 16, 694, 40] }); // a thump for each blast
        setTimeout(() => burst(target, { ...yellow, count: 28, speed: [200, 500] }), 190);
        setTimeout(() => burst(target, yellow), 900); // a while after the fountain (0.4 s) has run dry
        burst(target, {
            count: 30,
            kinds: () => "glyph",
            glyphs: ["★", "★", "✦"],
            colors: STARS,
            cone: 0.32,
            speed: [700, 1100],
            life: [1.1, 1.7],
            spread: 0.4,
            size: [14, 30],
            ring: null,
            vibrate: null,
        });
    }

    /**
     * Where a click happened, as a rect for burst(): the pointer for mouse and touch, the centre of `el`
     * for the keyboard (Enter and Space click with detail 0 and no position).
     */
    function at(event, el) {
        if (event?.detail > 0) return { left: event.clientX, top: event.clientY, width: 0, height: 0 };
        return el.getBoundingClientRect();
    }

    /** (Re)starts the one-off animation class `cls` on an element. */
    function pop(el, cls = "is-popping") {
        if (!el || reduced()) return;
        el.classList.remove(cls);
        void el.offsetWidth;
        el.classList.add(cls);
        el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
    }

    /**
     * After an exercise was marked as done: its concept icons (`icons`, image URLs; confetti without them)
     * jump out where it was clicked (`rect`, taken before the re-render, see at()), and the buttons and
     * cards that show it now (`selector`) pop.
     */
    function done(rect, selector, icons = []) {
        if (icons.length) {
            burst(rect, {
                count: 26,
                kinds: (i) => (i % 3 === 2 ? "dot" : "img"),
                images: icons,
                colors: GREENS,
                speed: [340, 700],
                life: [1.1, 1.6],
                size: [22, 36],
                ring: "#22c55e",
                vibrate: [14, 70, 24], // tick-tack
            });
        } else burst(rect);
        document.querySelectorAll(selector).forEach((btn) => {
            pop(btn);
            pop(btn.closest(".card"), "is-celebrating");
        });
    }

    window.LernwerkCelebrate = { burst, pop, done, at, known, confident };
})();
