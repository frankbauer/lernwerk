// Parsons-Puzzle: Codezeilen per Drag & Drop (oder mit den Pfeiltasten) in die richtige Reihenfolge bringen.
//
//   mountParsons(container, {
//       lines: [{ code: "public class A {", indent: 0 }, ...],
//       shuffle: true,                                            // Standard; false = Reihenfolge aus `lines`
//       rules: [
//           { first: 0, message: "..." },                        // Zeile 0 muss ganz oben stehen
//           { last: 1, message: "..." },                         // Zeile 1 muss ganz unten stehen
//           { position: 2, index: 1, message: "..." },           // Zeile 2 muss an Position 1 stehen (negativ = von hinten)
//           { before: [4, 5], message: "..." },                  // Zeile 4 muss vor Zeile 5 stehen
//           { check: (pos, order) => "...", warning: true },     // eigene Prüfung, liefert Meldung oder null
//       ]
//   })
//
// Regeln ohne `warning` machen die Lösung falsch, Regeln mit `warning` nur "unsinnig".

const PARSONS_KEYWORDS = /\b(public|private|protected|static|final|void|class|new|int|double|boolean|char|long|return|if|else|for|while|import)\b/g

function parsonsHighlight(code) {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return escaped
        .split(/("[^"]*")/)
        .map((part, i) => i % 2 === 1
            ? `<span class="p-str">${part}</span>`
            : part
                .replace(PARSONS_KEYWORDS, '<span class="p-kw">$1</span>')
                .replace(/\b(\d+)\b/g, '<span class="p-num">$1</span>'))
        .join('')
}

function mountParsons(container, config) {
    container = typeof container === 'string' ? document.querySelector(container) : container
    let order = initialOrder()

    container.classList.add('parsons')
    container.innerHTML = `
        <ol class="parsons-list" aria-label="Codezeilen, per Drag &amp; Drop oder mit den Pfeiltasten sortierbar"></ol>
        <div class="parsons-actions">
            <button type="button" class="parsons-check">Prüfen</button>
            <button type="button" class="parsons-reset">Neu mischen</button>
        </div>
        <div class="parsons-feedback" aria-live="polite"></div>`
    const list = container.querySelector('.parsons-list')
    const feedback = container.querySelector('.parsons-feedback')

    // Zufällig mischen, aber nie so, dass die Lösung schon (fast) fertig dasteht
    function initialOrder() {
        const ids = config.lines.map((_, i) => i)
        if (config.shuffle === false) return ids
        for (let attempt = 0; attempt < 100; attempt++) {
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ids[i], ids[j]] = [ids[j], ids[i]]
            }
            if (evaluate(ids).errors.length >= 2) break
        }
        return ids
    }

    function clearFeedback() {
        feedback.className = 'parsons-feedback'
        feedback.innerHTML = ''
        list.querySelectorAll('.bad').forEach(el => el.classList.remove('bad'))
    }

    function move(from, to) {
        if (to < 0 || to >= order.length || from === to) return
        const [item] = order.splice(from, 1)
        order.splice(to, 0, item)
        clearFeedback()
        render()
    }

    function render() {
        list.innerHTML = ''
        order.forEach((lineIdx, pos) => {
            const line = config.lines[lineIdx]
            const li = document.createElement('li')
            li.className = 'parsons-line'
            li.dataset.line = lineIdx
            li.style.setProperty('--indent', line.indent ?? 0)
            li.innerHTML = `
                <span class="parsons-grip" aria-hidden="true">⋮⋮</span>
                <pre class="parsons-code">${parsonsHighlight(line.code)}</pre>
                <span class="parsons-move">
                    <button type="button" data-dir="-1" aria-label="Zeile nach oben" ${pos === 0 ? 'disabled' : ''}>▲</button>
                    <button type="button" data-dir="1" aria-label="Zeile nach unten" ${pos === order.length - 1 ? 'disabled' : ''}>▼</button>
                </span>`
            li.querySelectorAll('.parsons-move button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const dir = Number(btn.dataset.dir)
                    move(pos, pos + dir)
                    const target = list.children[pos + dir]?.querySelector(`button[data-dir="${dir}"]:not([disabled])`)
                        ?? list.children[pos + dir]?.querySelector('button:not([disabled])')
                    target?.focus()
                })
            })
            li.addEventListener('pointerdown', e => startDrag(e, li, pos))
            list.appendChild(li)
        })
    }

    // Ziehen mit Pointer-Events statt HTML5-Drag&Drop, damit es auch auf Touch-Geräten funktioniert
    function startDrag(e, li, fromPos) {
        if (e.button !== 0 || e.target.closest('button')) return
        e.preventDefault()
        const items = [...list.children]
        const rects = items.map(el => el.getBoundingClientRect())
        const startY = e.clientY
        let toPos = fromPos
        li.classList.add('dragging')
        li.setPointerCapture(e.pointerId)

        const onMove = ev => {
            const dy = ev.clientY - startY
            li.style.transform = `translateY(${dy}px)`
            const center = rects[fromPos].top + rects[fromPos].height / 2 + dy
            toPos = rects.findIndex(r => center < r.bottom)
            if (toPos < 0) toPos = items.length - 1
            const h = rects[fromPos].height + 4
            items.forEach((el, i) => {
                if (i === fromPos) return
                const shift = (i > fromPos && i <= toPos) ? -h : (i < fromPos && i >= toPos) ? h : 0
                el.style.transform = shift ? `translateY(${shift}px)` : ''
            })
        }
        const onUp = () => {
            li.removeEventListener('pointermove', onMove)
            li.removeEventListener('pointerup', onUp)
            li.removeEventListener('pointercancel', onUp)
            items.forEach(el => { el.style.transform = '' })
            li.classList.remove('dragging')
            if (toPos !== fromPos) move(fromPos, toPos)
        }
        li.addEventListener('pointermove', onMove)
        li.addEventListener('pointerup', onUp)
        li.addEventListener('pointercancel', onUp)
    }

    function evaluate(order) {
        const pos = {}
        order.forEach((lineIdx, p) => { pos[lineIdx] = p })
        const errors = []
        const warnings = []
        for (const rule of config.rules) {
            let ok = true
            let lines = []
            if (rule.first !== undefined) { ok = pos[rule.first] === 0; lines = [rule.first] }
            else if (rule.last !== undefined) { ok = pos[rule.last] === order.length - 1; lines = [rule.last] }
            else if (rule.position !== undefined) {
                const want = rule.index < 0 ? order.length + rule.index : rule.index
                ok = pos[rule.position] === want
                lines = [rule.position]
            } else if (rule.before !== undefined) {
                ok = pos[rule.before[0]] < pos[rule.before[1]]
                lines = rule.before
            } else if (rule.check !== undefined) {
                const msg = rule.check(pos, order)
                ok = !msg
                if (!ok) (rule.warning ? warnings : errors).push({ message: msg, lines: rule.lines ?? [] })
                continue
            }
            if (!ok) (rule.warning ? warnings : errors).push({ message: rule.message, lines })
        }
        return { errors, warnings }
    }

    function check() {
        clearFeedback()
        const { errors, warnings } = evaluate(order)
        const shown = errors.length ? errors : warnings
        shown[0]?.lines.forEach(l => list.querySelector(`[data-line="${l}"]`)?.classList.add('bad'))
        if (errors.length) {
            feedback.classList.add('error')
            feedback.innerHTML = `<b>Noch nicht kompilierbar.</b> ${errors[0].message}`
        } else if (warnings.length) {
            feedback.classList.add('warning')
            feedback.innerHTML = `<b>Kompiliert – aber:</b> ${warnings[0].message}`
        } else {
            feedback.classList.add('success')
            feedback.innerHTML = config.successMessage ?? '<b>Richtig!</b> Das Programm ist kompilierbar.'
        }
    }

    container.querySelector('.parsons-check').addEventListener('click', check)
    container.querySelector('.parsons-reset').addEventListener('click', () => {
        order = initialOrder()
        clearFeedback()
        render()
    })
    render()
}
