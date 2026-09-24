// Übungsplaner: lists all exercises from data/exercises.json and filters them
// by what the student already knows (last lecture heard + self-assessment).
(() => {
    "use strict";

    const DATA_URL = "./data/exercises.json";
    const STORAGE_KEY = "lernwerk.uebungsplaner.v1";

    /** Self-assessment per concept; everything but "unknown" counts as learned. */
    const STATES = ["unknown", "shaky", "known", "confident"];
    const STATE_INFO = {
        unknown: { glyph: "✕", label: "neu für mich" },
        shaky: { glyph: "?", label: "unsicher" },
        known: { glyph: "✓", label: "kann ich" },
        confident: { glyph: "★", label: "sicher" },
    };

    const SCOPES = {
        fits: {
            label: "Passt zu mir",
            hint: "Übungen, für die du alle benötigten Konzepte schon kennst.",
        },
        main: {
            label: "Thema bekannt",
            hint: "Das Hauptkonzept kennst du – einzelne Nebenkonzepte dürfen noch neu sein.",
        },
        next: {
            label: "Nächster Schritt",
            hint: "Übungen, die genau ein neues Konzept brauchen – ideal zum Vorarbeiten.",
        },
        all: {
            label: "Alle",
            hint: "Alle Übungen. Was noch Unbekanntes braucht, ist gekennzeichnet.",
        },
    };

    const SORTS = {
        recommended: "Empfohlen",
        chapter: "Kapitel",
        "level-asc": "Level aufsteigend",
        "level-desc": "Level absteigend",
        title: "Titel A–Z",
    };

    const FEATURES = {
        solution: { label: "Beispiellösung", test: (ex) => ex.hasSolution },
        explanation: { label: "Erklärung", test: (ex) => ex.hasExplanation },
        experiments: { label: "Experimente", test: (ex) => ex.hasExperiments },
        new: { label: "Neu", test: (ex) => ex.isNew },
    };

    const VIEWS = ["cards", "table"];
    const LEVELS = ["", "sehr einfach", "einfach", "mittel", "schwer", "sehr schwer"];
    const TYPE_ORDER = ["lecture", "sandbox", "exercise", "test", "tool"];

    const defaults = () => ({
        lastHeard: null, // chapter number, -1 = none yet, null = not set up
        overrides: {}, // concept id -> state, where it differs from the default
        done: [],
        view: "cards",
        sort: "recommended",
        scope: "fits",
        onlyHeard: true,
        focusShaky: false,
        hideDone: false,
        types: [],
        levels: [],
        features: [],
        concept: "",
        query: "",
        profileOpen: true,
        moreOpen: false,
    });

    let state = load();
    let catalog, concepts, chapters, typeLabel, typeById, conceptById, chapterByNumber;

    const $ = (id) => document.getElementById(id);

    // --- Persistence --------------------------------------------------------

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return { ...defaults(), ...JSON.parse(raw) };
        } catch (e) {
            // storage unavailable (private mode etc.): keep defaults
        }
        return defaults();
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            // ignore
        }
    }

    // --- Knowledge model ----------------------------------------------------

    const hasProfile = () => state.lastHeard !== null;

    function defaultState(conceptId) {
        const concept = conceptById[conceptId];
        return hasProfile() && concept.chapter <= state.lastHeard ? "known" : "unknown";
    }

    const conceptState = (id) => state.overrides[id] || defaultState(id);
    const isLearned = (id) => conceptState(id) !== "unknown";

    function analyze(ex) {
        const unknown = ex.tags.filter((t) => !isLearned(t));
        const shaky = ex.tags.filter((t) => conceptState(t) === "shaky");
        return {
            unknown,
            shaky,
            ready: unknown.length === 0,
            mainLearned: isLearned(ex.tags[0]),
            heard: hasProfile() && ex.chapter <= state.lastHeard,
            done: state.done.includes(ex.id),
            confident: ex.tags.every((t) => conceptState(t) === "confident"),
        };
    }

    /** Higher is better: ready first, then weak spots, then recent lectures. */
    function score(ex, a) {
        let s = a.ready ? 100 : -40 * a.unknown.length;
        s += 30 * a.shaky.length;
        if (a.heard) s += Math.max(0, 10 - (state.lastHeard - ex.chapter)) * 3;
        if (a.confident) s -= 25;
        if (a.done) s -= 150;
        if (ex.type === "tool") s -= 60;
        return s - ex.difficulty;
    }

    function reason(ex, a) {
        if (!hasProfile()) return null;
        if (a.done) return { kind: "done", text: "Schon erledigt" };
        if (!a.ready) return { kind: "missing", text: `Braucht noch: ${labels(a.unknown)}` };
        if (a.shaky.length) return { kind: "shaky", text: `Übt ${labels(a.shaky)} – da bist du unsicher` };
        if (ex.chapter === state.lastHeard) return { kind: "fresh", text: "Aus deiner letzten Vorlesung" };
        if (a.confident) return { kind: "easy", text: "Wiederholung – das kannst du sicher" };
        return { kind: "ok", text: "Passt zu deinem Wissensstand" };
    }

    const labels = (ids) => ids.map((id) => conceptById[id].label).join(", ");

    // --- Filtering ----------------------------------------------------------

    function normalize(s) {
        return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function searchText(ex) {
        return normalize(
            [
                ex.title,
                ex.description,
                typeLabel[ex.type],
                chapterByNumber[ex.chapter].title,
                ...ex.tags.map((t) => conceptById[t].label),
            ].join(" ")
        );
    }

    /** `skip` names one filter to ignore, used to compute facet counts. */
    function matches(ex, a, skip = "") {
        if (hasProfile()) {
            const scope = skip === "scope" ? "all" : state.scope;
            if (scope === "fits" && !a.ready) return false;
            if (scope === "main" && !a.mainLearned) return false;
            if (scope === "next" && a.unknown.length !== 1) return false;
            if (state.onlyHeard && scope !== "next" && !a.heard) return false;
            if (state.focusShaky && !a.shaky.length) return false;
        }
        if (state.hideDone && a.done) return false;
        if (skip !== "type" && state.types.length && !state.types.includes(ex.type)) return false;
        if (skip !== "level" && state.levels.length && !state.levels.includes(ex.difficulty)) return false;
        if (skip !== "feature" && !state.features.every((f) => FEATURES[f].test(ex))) return false;
        if (skip !== "concept" && state.concept && !ex.tags.includes(state.concept)) return false;
        if (state.query) {
            const words = normalize(state.query).split(/\s+/).filter(Boolean);
            const text = ex._search;
            if (!words.every((w) => text.includes(w))) return false;
        }
        return true;
    }

    function compare(sort) {
        const byChapter = (x, y) =>
            x.ex.chapter - y.ex.chapter ||
            TYPE_ORDER.indexOf(x.ex.type) - TYPE_ORDER.indexOf(y.ex.type) ||
            x.index - y.index;
        switch (sort) {
            case "recommended":
                return (x, y) => y.score - x.score || byChapter(x, y);
            case "level-asc":
                return (x, y) => x.ex.difficulty - y.ex.difficulty || byChapter(x, y);
            case "level-desc":
                return (x, y) => y.ex.difficulty - x.ex.difficulty || byChapter(x, y);
            case "title":
                return (x, y) => x.ex.title.localeCompare(y.ex.title, "de");
            default:
                return byChapter;
        }
    }

    function entries() {
        return catalog.exercises.map((ex, index) => {
            const a = analyze(ex);
            return { ex, a, index, score: score(ex, a) };
        });
    }

    // --- Rendering helpers --------------------------------------------------

    const esc = (s) =>
        String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    function icon(conceptId, cls = "concept-icon") {
        const c = conceptById[conceptId];
        return c.icon ? `<img class="${cls}" src="${esc(c.icon)}" alt="" width="64" height="64" />` : "";
    }

    function typeIcon(typeId) {
        const t = typeById[typeId];
        return t?.icon ? `<img class="type-icon" src="${esc(t.icon)}" alt="" width="64" height="64" />` : "";
    }

    /** Coloured badge with the exercise type's icon and label (cards, table). */
    const typeBadge = (typeId) =>
        `<span class="type-badge type-${typeId}" title="${esc(typeLabel[typeId])}">${typeIcon(typeId)}<span>${esc(typeById[typeId]?.short || typeLabel[typeId])}</span></span>`;

    function levelDots(level) {
        let dots = "";
        for (let i = 1; i <= 5; i++) dots += `<span class="dot${i <= level ? " on" : ""}"></span>`;
        return `<span class="dots" role="img" aria-label="Level ${level} von 5 (${LEVELS[level]})">${dots}</span>`;
    }

    /** Concept badge: an icon tile with tooltip (cards) or an icon + label pill (table). */
    function pill(conceptId, iconOnly = false) {
        const st = hasProfile() ? conceptState(conceptId) : "none";
        const c = conceptById[conceptId];
        const active = state.concept === conceptId ? " is-active" : "";
        const tip = hasProfile() ? `${c.label} · ${STATE_INFO[st].label}` : c.label;
        const attrs = `data-action="focus-concept" data-concept="${c.id}" aria-pressed="${state.concept === c.id}"`;
        if (iconOnly) {
            return `<button type="button" class="concept concept-${st}${active}" ${attrs}
                data-tip="${esc(tip)}" aria-label="${esc(tip)} – nach diesem Konzept filtern">${icon(c.id)}</button>`;
        }
        return `<button type="button" class="pill pill-${st}${active}" ${attrs}
            title="${esc(tip)} – klicken, um nach diesem Konzept zu filtern">${icon(c.id)}<span>${esc(c.label)}</span></button>`;
    }

    /** Preview image; `imagePosition` (CSS object-position) picks the crop, default is centre. */
    function preview(ex, cls) {
        const pos = /^[a-z0-9.% -]+$/i.test(ex.imagePosition || "") ? ` style="object-position:${ex.imagePosition}"` : "";
        return `<img class="${cls}" src="${esc(ex.image)}" alt="" loading="lazy"${pos} />`;
    }

    function features(ex, compact = false) {
        const items = [
            ["Beispiellösung", ex.hasSolution],
            ["Erklärung", ex.hasExplanation],
            ["Experimente", ex.hasExperiments],
        ].filter(([, has]) => has);
        if (!items.length) {
            return `<span class="feature feature-none">${compact ? "Ohne Lösung" : "Offene Aufgabe ohne Lösung"}</span>`;
        }
        return items.map(([label]) => `<span class="feature">${label}</span>`).join("");
    }

    // --- Rendering: profile -------------------------------------------------

    function renderProfile() {
        const open = state.profileOpen || !hasProfile();
        $("profile").classList.toggle("is-collapsed", !open);
        $("profile").classList.toggle("is-new", !hasProfile());
        document.querySelector(".profile-head").setAttribute("aria-expanded", String(open));
        $("profile-body").hidden = !open;
        $("profile-toggle-label").textContent = open ? "Einklappen" : "Anpassen";

        const select = $("last-heard");
        select.innerHTML =
            (hasProfile() ? "" : `<option value="" selected disabled>Bitte wählen …</option>`) +
            `<option value="-1">Noch keine Vorlesung</option>` +
            chapters.map((ch) => `<option value="${ch.number}">${ch.number} · ${esc(ch.title)}</option>`).join("");
        if (hasProfile()) select.value = String(state.lastHeard);

        $("path").innerHTML = concepts
            .map((c) => {
                const st = conceptState(c.id);
                const heard = hasProfile() && c.chapter <= state.lastHeard;
                const last = c.chapter === state.lastHeard;
                const rate = STATES.map(
                    (s) => `<button type="button" class="rate-btn state-${s}" data-action="rate"
                        data-concept="${c.id}" data-state="${s}" aria-pressed="${st === s}"
                        title="${esc(c.label)}: ${STATE_INFO[s].label}">${STATE_INFO[s].glyph}</button>`
                ).join("");
                return `<li class="tile state-${st}${heard ? " is-heard" : ""}${last ? " is-last" : ""}">
                    <button type="button" class="tile-main" data-action="set-last" data-chapter="${c.chapter}"
                        title="Kapitel ${c.chapter} als zuletzt gehörte Vorlesung setzen">
                        <span class="tile-no">${last ? "Zuletzt gehört" : `Kapitel ${c.chapter}`}</span>
                        ${icon(c.id, "tile-icon")}
                        <span class="tile-label">${esc(c.label)}</span>
                    </button>
                    <div class="tile-rate" role="group" aria-label="Einschätzung ${esc(c.label)}">${rate}</div>
                </li>`;
            })
            .join("");

        const learned = concepts.filter((c) => isLearned(c.id));
        const shaky = concepts.filter((c) => conceptState(c.id) === "shaky");
        const lastChapter = chapterByNumber[state.lastHeard];

        let summary;
        if (!hasProfile()) {
            summary = "Noch nicht eingerichtet – wähle deine zuletzt gehörte Vorlesung.";
        } else {
            summary = lastChapter
                ? `Zuletzt gehört: <b>${lastChapter.number} · ${esc(lastChapter.title)}</b>`
                : "Noch keine Vorlesung gehört";
            summary += ` · ${learned.length} von ${concepts.length} Konzepten gelernt`;
            if (shaky.length) {
                summary += ` · unsicher bei <span class="summary-shaky">${shaky
                    .map((c) => `${icon(c.id, "summary-icon")}${esc(c.label)}`)
                    .join(", ")}</span>`;
            }
        }
        $("profile-summary").innerHTML = summary;

        const fits = entries().filter((e) => e.a.ready && e.a.heard).length;
        $("profile-stats").textContent = hasProfile()
            ? `${fits} Übungen aus gehörten Vorlesungen passen zu deinem Wissensstand.`
            : "";
        $("reset-ratings").hidden = !Object.keys(state.overrides).length;
    }

    // --- Rendering: controls ------------------------------------------------

    function renderControls(all) {
        const scopeCounts = {};
        for (const key of Object.keys(SCOPES)) {
            const saved = state.scope;
            state.scope = key;
            scopeCounts[key] = all.filter((e) => matches(e.ex, e.a)).length;
            state.scope = saved;
        }
        $("scope").innerHTML = Object.entries(SCOPES)
            .map(
                ([key, s]) => `<button type="button" role="radio" class="scope-btn"
                    aria-checked="${state.scope === key}" data-action="scope" data-scope="${key}"
                    ${hasProfile() ? "" : "disabled"} title="${esc(s.hint)}">
                    <span>${s.label}</span><span class="count">${hasProfile() ? scopeCounts[key] : "–"}</span>
                </button>`
            )
            .join("");
        $("scope-hint").textContent = hasProfile()
            ? SCOPES[state.scope].hint
            : "Richte oben deinen Wissensstand ein, dann filtern wir passend für dich. Bis dahin siehst du alle Übungen.";

        const onlyHeard = $("only-heard");
        onlyHeard.checked = state.onlyHeard;
        onlyHeard.disabled = !hasProfile() || state.scope === "next";
        onlyHeard.closest(".switch").title =
            state.scope === "next" ? "Beim „Nächsten Schritt“ geht es gerade um noch nicht gehörte Inhalte." : "";
        const focusShaky = $("focus-shaky");
        focusShaky.checked = state.focusShaky;
        focusShaky.disabled = !hasProfile() || !concepts.some((c) => conceptState(c.id) === "shaky");
        focusShaky.closest(".switch").title = focusShaky.disabled
            ? "Markiere zuerst Konzepte als „unsicher“."
            : "";
        $("hide-done").checked = state.hideDone;

        const count = (skip, test) => all.filter((e) => matches(e.ex, e.a, skip) && test(e.ex)).length;
        const chip = (action, attr, value, label, on, n) =>
            `<button type="button" class="chip" data-action="${action}" data-${attr}="${value}"
                aria-pressed="${on}">${label}<span class="count">${n}</span></button>`;

        $("facet-type").innerHTML = catalog.types
            .filter((t) => catalog.exercises.some((ex) => ex.type === t.id))
            .map((t) =>
                chip("toggle-type", "type", t.id, `${typeIcon(t.id)}${esc(t.label)}`, state.types.includes(t.id),
                    count("type", (ex) => ex.type === t.id))
            )
            .join("");
        $("facet-level").innerHTML = [1, 2, 3, 4, 5]
            .map((l) =>
                chip("toggle-level", "level", l, `${levelDots(l)}<span class="sr">${LEVELS[l]}</span>`,
                    state.levels.includes(l), count("level", (ex) => ex.difficulty === l))
            )
            .join("");
        $("facet-feature").innerHTML = Object.entries(FEATURES)
            .map(([key, f]) =>
                chip("toggle-feature", "feature", key, f.label, state.features.includes(key),
                    count("feature", (ex) => f.test(ex) && state.features.every((g) => FEATURES[g].test(ex))))
            )
            .join("");
        $("facet-concept").innerHTML =
            `<option value="">Beliebig</option>` +
            concepts.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join("");
        $("facet-concept").value = state.concept;

        const extra = state.types.length + state.levels.length + state.features.length + (state.concept ? 1 : 0);
        $("more").hidden = !state.moreOpen;
        $("more-toggle").setAttribute("aria-expanded", String(state.moreOpen));
        $("more-toggle").innerHTML = `Weitere Filter${extra ? `<span class="badge">${extra}</span>` : ""}`;

        $("sort").innerHTML = Object.entries(SORTS)
            .map(([key, label]) => `<option value="${key}">${label}</option>`)
            .join("");
        $("sort").value = state.sort;
        document.querySelectorAll("[data-action=view]").forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.view === state.view))
        );
    }

    function activeChips() {
        const chips = [];
        if (state.query) chips.push(["query", `„${esc(state.query)}“`]);
        if (state.concept) chips.push(["concept", `${icon(state.concept, "chip-icon")}${esc(conceptById[state.concept].label)}`]);
        state.types.forEach((t) => chips.push([`type:${t}`, esc(typeLabel[t])]));
        state.levels.forEach((l) => chips.push([`level:${l}`, `Level ${l}`]));
        state.features.forEach((f) => chips.push([`feature:${f}`, FEATURES[f].label]));
        if (!chips.length) return "";
        return (
            chips
                .map(([key, label]) => `<button type="button" class="active-chip" data-action="remove-chip"
                    data-chip="${esc(key)}" aria-label="Filter entfernen: ${esc(label.replace(/<[^>]+>/g, ""))}">${label}<span aria-hidden="true">×</span></button>`)
                .join("") + `<button type="button" class="link-btn" data-action="reset-filters">Alle zurücksetzen</button>`
        );
    }

    // --- Rendering: results -------------------------------------------------

    function card(e, recommended) {
        const { ex, a } = e;
        const r = reason(ex, a);
        const locked = hasProfile() && !a.ready;
        const media = ex.image
            ? preview(ex, "card-image")
            : icon(ex.tags[0], "card-icon");
        return `<article class="card type-${ex.type}${locked ? " is-locked" : ""}${a.done ? " is-done" : ""}">
            <div class="card-body">
                ${recommended ? `<span class="card-flag">★ Empfehlung</span>` : ""}
                <div class="card-head">
                    <h3 class="card-title"><a href="${esc(ex.link)}">${esc(ex.title)}</a>${ex.isNew ? `<span class="new">Neu</span>` : ""}</h3>
                    ${typeBadge(ex.type)}
                </div>
                <p class="card-desc">${esc(ex.description)}</p>
                <div class="card-level"><span>Übungslevel</span>${levelDots(ex.difficulty)}</div>
                <div class="concepts">${ex.tags.map((t) => pill(t, true)).join("")}</div>
                <div class="features">${features(ex)}</div>
                ${r ? `<p class="reason reason-${r.kind}">${esc(r.text)}</p>` : ""}
            </div>
            <a class="card-media${ex.image ? " has-image" : ""}" href="${esc(ex.link)}" tabindex="-1" aria-hidden="true"
                style="--hue:${195 + ((ex.chapter * 37) % 80)}">
                ${media}
                <span class="card-chapter">Kap. ${ex.chapter}</span>
            </a>
            <button type="button" class="done-btn" data-action="toggle-done" data-id="${esc(ex.id)}"
                aria-pressed="${a.done}" aria-label="Als erledigt markieren"
                title="${a.done ? "Erledigt – klicken zum Zurücksetzen" : "Als erledigt markieren"}">${a.done ? "✓" : "○"} Erledigt</button>
        </article>`;
    }

    function tableRow(e) {
        const { ex, a } = e;
        const r = reason(ex, a);
        const locked = hasProfile() && !a.ready;
        return `<tr class="type-${ex.type}${locked ? " is-locked" : ""}${a.done ? " is-done" : ""}">
            <td class="c-done"><input type="checkbox" data-action="toggle-done" data-id="${esc(ex.id)}"
                ${a.done ? "checked" : ""} aria-label="${esc(ex.title)} erledigt" /></td>
            <td class="c-title">
                <div class="c-title-inner">
                    ${ex.image ? preview(ex, "c-thumb") : `<span class="c-thumb c-thumb-icon">${icon(ex.tags[0])}</span>`}
                    <div>
                        <a href="${esc(ex.link)}">${esc(ex.title)}</a>${ex.isNew ? `<span class="new">Neu</span>` : ""}
                        <span class="c-desc">${esc(ex.description)}</span>
                    </div>
                </div>
            </td>
            <td>${typeBadge(ex.type)}</td>
            <td class="c-chapter" title="${esc(chapterByNumber[ex.chapter].title)}">${ex.chapter}</td>
            <td>${levelDots(ex.difficulty)}</td>
            <td><div class="pills">${ex.tags.map((t) => pill(t)).join("")}</div></td>
            <td><div class="features features-compact">${features(ex, true)}</div></td>
            <td>${r ? `<span class="reason reason-${r.kind}">${esc(r.text)}</span>` : ""}</td>
        </tr>`;
    }

    function table(list) {
        const th = (label, sort, cls = "") => {
            const active = state.sort === sort || (sort === "level-asc" && state.sort === "level-desc");
            const arrow = active ? (state.sort === "level-desc" ? " ↓" : " ↑") : "";
            return `<th class="${cls}" aria-sort="${active ? (state.sort === "level-desc" ? "descending" : "ascending") : "none"}">
                <button type="button" data-action="sort-by" data-sort="${sort}">${label}${arrow}</button></th>`;
        };
        return `<div class="table-wrap"><table class="table">
            <thead><tr>
                <th class="c-done"><span class="sr">Erledigt</span></th>
                ${th("Übung", "title")}
                <th>Art</th>
                ${th("Kap.", "chapter")}
                ${th("Level", "level-asc")}
                <th>Konzepte</th>
                <th>Ausstattung</th>
                <th>${hasProfile() ? "Für dich" : ""}</th>
            </tr></thead>
            <tbody>${list.map(tableRow).join("")}</tbody>
        </table></div>`;
    }

    function cards(list) {
        const recommend = new Set(
            state.sort === "recommended" && hasProfile()
                ? list.filter((e) => e.a.ready && !e.a.done).slice(0, 3).map((e) => e.ex.id)
                : []
        );
        if (state.sort !== "chapter") {
            return `<div class="grid">${list.map((e) => card(e, recommend.has(e.ex.id))).join("")}</div>`;
        }
        const groups = [];
        for (const e of list) {
            const g = groups[groups.length - 1];
            if (g && g.chapter === e.ex.chapter) g.items.push(e);
            else groups.push({ chapter: e.ex.chapter, items: [e] });
        }
        return groups
            .map(({ chapter, items }) => {
                const ch = chapterByNumber[chapter];
                const c = concepts.find((x) => x.chapter === chapter);
                const heard = hasProfile() && chapter <= state.lastHeard;
                return `<section class="group">
                    <h2 class="group-head">${c ? icon(c.id, "group-icon") : ""}
                        <span class="group-no">${chapter}</span>${esc(ch.title)}
                        ${hasProfile() ? `<span class="group-state${heard ? " is-heard" : ""}">${heard ? "gehört" : "noch nicht gehört"}</span>` : ""}
                        <span class="group-count">${items.length} ${items.length === 1 ? "Übung" : "Übungen"}</span>
                    </h2>
                    <div class="grid">${items.map((e) => card(e, false)).join("")}</div>
                </section>`;
            })
            .join("");
    }

    function empty() {
        const hints = [];
        if (hasProfile() && (state.scope !== "all" || state.onlyHeard)) {
            hints.push(`<button type="button" class="btn" data-action="show-all">Alle Übungen anzeigen</button>`);
        }
        if (hasProfile() && state.lastHeard === -1) hints.unshift(`<button type="button" class="btn btn-primary" data-action="set-last" data-chapter="${chapters[0].number}">Ich habe die ${esc(chapters[0].title)} gehört</button>`);
        hints.push(`<button type="button" class="btn" data-action="reset-filters">Filter zurücksetzen</button>`);
        return `<div class="empty">
            <p class="empty-title">Keine Übungen gefunden</p>
            <p>Mit diesen Filtern bleibt nichts übrig. Lockere die Auswahl oder erweitere deinen Wissensstand.</p>
            <div class="empty-actions">${hints.join("")}</div>
        </div>`;
    }

    function renderResults(all) {
        const list = all.filter((e) => matches(e.ex, e.a)).sort(compare(state.sort));
        $("results-count").innerHTML = `<b>${list.length}</b> von ${all.length} Übungen`;
        $("active-chips").innerHTML = activeChips();
        $("results").className = `results view-${state.view}`;
        $("results").innerHTML = !list.length ? empty() : state.view === "table" ? table(list) : cards(list);
    }

    function render() {
        const all = entries();
        renderProfile();
        renderControls(all);
        renderResults(all);
        save();
    }

    // --- Events -------------------------------------------------------------

    const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

    const actions = {
        "toggle-profile": () => {
            if (hasProfile()) state.profileOpen = !state.profileOpen;
        },
        "set-last": (d) => {
            state.lastHeard = Number(d.chapter);
        },
        "step-last": (d) => {
            const numbers = [-1, ...chapters.map((c) => c.number)];
            const i = hasProfile() ? numbers.indexOf(state.lastHeard) : 0;
            state.lastHeard = numbers[Math.min(numbers.length - 1, Math.max(0, i + Number(d.dir)))];
        },
        rate: (d) => {
            if (!hasProfile()) state.lastHeard = -1;
            if (d.state === defaultState(d.concept)) delete state.overrides[d.concept];
            else state.overrides[d.concept] = d.state;
            if (!concepts.some((c) => conceptState(c.id) === "shaky")) state.focusShaky = false;
        },
        "reset-ratings": () => {
            state.overrides = {};
            state.focusShaky = false;
        },
        scope: (d) => {
            state.scope = d.scope;
        },
        "show-all": () => {
            state.scope = "all";
            state.onlyHeard = false;
        },
        "toggle-more": () => {
            state.moreOpen = !state.moreOpen;
        },
        "toggle-type": (d) => {
            state.types = toggleIn(state.types, d.type);
        },
        "toggle-level": (d) => {
            state.levels = toggleIn(state.levels, Number(d.level));
        },
        "toggle-feature": (d) => {
            state.features = toggleIn(state.features, d.feature);
        },
        "focus-concept": (d) => {
            state.concept = state.concept === d.concept ? "" : d.concept;
        },
        "toggle-done": (d) => {
            state.done = toggleIn(state.done, d.id);
        },
        view: (d) => {
            state.view = d.view;
        },
        "sort-by": (d) => {
            state.sort = d.sort === "level-asc" && state.sort === "level-asc" ? "level-desc" : d.sort;
        },
        "remove-chip": (d) => {
            const [kind, value] = d.chip.split(":");
            if (kind === "query") {
                state.query = "";
                $("search").value = "";
            } else if (kind === "concept") state.concept = "";
            else if (kind === "type") state.types = state.types.filter((t) => t !== value);
            else if (kind === "level") state.levels = state.levels.filter((l) => l !== Number(value));
            else if (kind === "feature") state.features = state.features.filter((f) => f !== value);
        },
        "reset-filters": () => {
            const d = defaults();
            Object.assign(state, {
                scope: d.scope, onlyHeard: d.onlyHeard, focusShaky: d.focusShaky, hideDone: d.hideDone,
                types: [], levels: [], features: [], concept: "", query: "",
            });
            $("search").value = "";
        },
    };

    function bind() {
        document.addEventListener("click", (ev) => {
            const el = ev.target.closest("[data-action]");
            if (!el || el.disabled || !actions[el.dataset.action]) return;
            actions[el.dataset.action](el.dataset);
            render();
        });

        $("last-heard").addEventListener("change", (ev) => {
            state.lastHeard = Number(ev.target.value);
            render();
        });
        const flags = { "only-heard": "onlyHeard", "focus-shaky": "focusShaky", "hide-done": "hideDone" };
        for (const [id, key] of Object.entries(flags)) {
            $(id).addEventListener("change", (ev) => {
                state[key] = ev.target.checked;
                render();
            });
        }
        $("facet-concept").addEventListener("change", (ev) => {
            state.concept = ev.target.value;
            render();
        });
        $("sort").addEventListener("change", (ev) => {
            state.sort = ev.target.value;
            render();
        });
        $("search").value = state.query;
        $("search").addEventListener("input", (ev) => {
            state.query = ev.target.value.trim();
            renderResults(entries());
            save();
        });
    }

    // --- Startup ------------------------------------------------------------

    async function init() {
        try {
            const res = await fetch(DATA_URL);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            catalog = await res.json();
        } catch (err) {
            $("results").innerHTML = `<div class="empty"><p class="empty-title">Übungen konnten nicht geladen werden</p>
                <p>${esc(err.message)}. Die Seite muss über einen Webserver geöffnet werden.</p></div>`;
            return;
        }

        chapters = [...catalog.chapters].sort((x, y) => x.number - y.number);
        concepts = [...catalog.concepts].sort((x, y) => x.chapter - y.chapter);
        conceptById = Object.fromEntries(concepts.map((c) => [c.id, c]));
        chapterByNumber = Object.fromEntries(chapters.map((c) => [c.number, c]));
        typeLabel = Object.fromEntries(catalog.types.map((t) => [t.id, t.label]));
        typeById = Object.fromEntries(catalog.types.map((t) => [t.id, t]));
        catalog.exercises.forEach((ex) => (ex._search = searchText(ex)));

        // drop stale settings (e.g. a concept that no longer exists)
        state.overrides = Object.fromEntries(
            Object.entries(state.overrides).filter(([id, s]) => conceptById[id] && STATES.includes(s))
        );
        if (state.concept && !conceptById[state.concept]) state.concept = "";
        if (hasProfile() && state.lastHeard !== -1 && !chapterByNumber[state.lastHeard]) state.lastHeard = null;
        if (!SCOPES[state.scope]) state.scope = "fits";
        if (!SORTS[state.sort]) state.sort = "recommended";
        if (!VIEWS.includes(state.view)) state.view = "cards";
        if (typeof state.query !== "string") state.query = "";
        state.types = state.types.filter((t) => typeLabel[t]);
        state.levels = state.levels.filter((l) => l >= 1 && l <= 5);
        state.features = state.features.filter((f) => FEATURES[f]);

        bind();
        render();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
