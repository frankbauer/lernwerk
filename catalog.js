// Übungskatalog: data/curriculum.json lists the exercise modules (modules/<id>/exercises.json, exercises and
// concepts) and defines the chapters of the course: which concepts a chapter introduces and which exercises
// ({module, id}) it contains. LernwerkCatalog.load() merges everything into one catalog with the shape the pages
// use (chapters, concepts, types, exercises; see data/curriculum.schema.ts):
//  - exercise ids are prefixed with the module ("gdi/05_Objekte/vector"), links and images point into the module
//  - `chapter` of exercises and concepts is the number of the chapter that contains / introduces them
// Used by uebungsplaner.js, karte.js and theme.js.
(() => {
    "use strict";

    const CURRICULUM = "data/curriculum.json";
    const PLANER_KEY = "lernwerk.uebungsplaner.v1"; // done exercises (Übungsplaner and Abenteuerkarte)

    const withSlash = (path) => (path.endsWith("/") ? path : `${path}/`);

    async function fetchJson(url, init) {
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
        return res.json();
    }

    /**
     * Loads the curriculum and its modules. `base` is the site root (default: the folder of this page),
     * `init` is passed on to fetch (e.g. { cache: "no-cache" }).
     */
    async function load(base = new URL(".", location.href), init) {
        const curriculum = await fetchJson(new URL(CURRICULUM, base), init);
        const modules = await Promise.all(
            curriculum.modules.map(async (m) => ({
                ...m,
                path: withSlash(m.path),
                data: await fetchJson(new URL(`${withSlash(m.path)}exercises.json`, base), init),
            }))
        );
        return merge(curriculum, modules);
    }

    function merge(curriculum, modules) {
        const moduleById = Object.fromEntries(modules.map((m) => [m.id, m]));
        const find = (list, id, what) => {
            const item = list.find((x) => x.id === id);
            if (!item) console.warn(`catalog: ${what} '${id}' nicht gefunden`);
            return item;
        };
        const chapters = [];
        const exercises = new Map();
        const concepts = new Map();

        for (const ch of curriculum.chapters) {
            chapters.push({ number: ch.number, title: ch.title });
            for (const ref of ch.exercises) {
                const m = moduleById[ref.module];
                if (!m) console.warn(`catalog: Modul '${ref.module}' nicht in curriculum.modules`);
                const ex = m && find(m.data.exercises, ref.id, `Übung ${ref.module}`);
                const id = `${ref.module}/${ref.id}`;
                if (!ex || exercises.has(id)) continue; // an exercise belongs to the first chapter listing it
                exercises.set(id, {
                    ...ex,
                    id,
                    module: m.id,
                    link: m.path + ex.link,
                    image: ex.image ? m.path + ex.image : ex.image,
                    chapter: ch.number,
                });
            }
            for (const cid of ch.concepts ?? []) {
                if (!concepts.has(cid)) concepts.set(cid, ch.number);
            }
        }

        // concepts come from the modules (shared ids: the first module wins); one that no chapter introduces
        // counts from the first chapter that uses it
        const conceptList = [];
        const listed = new Set();
        for (const m of modules) {
            for (const c of m.data.concepts) {
                if (listed.has(c.id)) continue;
                listed.add(c.id);
                let chapter = concepts.get(c.id);
                if (chapter === undefined) {
                    const users = [...exercises.values()].filter((ex) => ex.tags.includes(c.id));
                    if (!users.length) continue; // not used in this curriculum
                    chapter = Math.min(...users.map((ex) => ex.chapter));
                }
                conceptList.push({ ...c, chapter, icon: c.icon ? m.path + c.icon : c.icon });
            }
        }

        const catalog = {
            version: curriculum.version,
            chapters,
            concepts: conceptList,
            types: curriculum.types,
            exercises: [...exercises.values()],
            modules: modules.map(({ data, ...m }) => ({ ...m, title: data.title })),
        };
        catalog.resolveId = resolver(catalog);
        return catalog;
    }

    /**
     * Maps an exercise id to the current one: ids from before the modules ("05_Objekte/vector") belong to
     * the first module that has them. Unknown ids are returned unchanged.
     */
    function resolver(catalog) {
        const ids = new Set(catalog.exercises.map((ex) => ex.id));
        return (id) => {
            if (ids.has(id)) return id;
            const m = catalog.modules.find((mod) => ids.has(`${mod.id}/${id}`));
            return m ? `${m.id}/${id}` : id;
        };
    }

    /** Rewrites the done exercises stored by the Übungsplaner to the current ids. */
    function migrateDone(catalog) {
        try {
            const s = JSON.parse(localStorage.getItem(PLANER_KEY));
            if (!s || !Array.isArray(s.done)) return;
            const done = [...new Set(s.done.map(catalog.resolveId))];
            if (done.some((id, i) => id !== s.done[i]) || done.length !== s.done.length) {
                localStorage.setItem(PLANER_KEY, JSON.stringify({ ...s, done }));
            }
        } catch (e) {
            // storage unavailable
        }
    }

    /** The chapter of a page, given its path relative to the site root, e.g. "modules/gdi/05_Objekte/x/index.html". */
    function chapterOfPath(catalog, relativePath) {
        const dir = (link) => withSlash(link.split("?")[0].replace(/[^/]*\.html?$/, ""));
        const ex = catalog.exercises.find((e) => relativePath.startsWith(dir(e.link)));
        return ex && catalog.chapters.find((ch) => ch.number === ex.chapter);
    }

    window.LernwerkCatalog = { load, merge, migrateDone, chapterOfPath };
})();
