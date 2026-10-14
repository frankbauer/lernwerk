export default {
    // Prüft vor dem Ausführen, ob die Klasse so heißt wie die Datei aus der Aufgabenstellung. Der erwartete
    // Name kommt aus einem DATA-Block namens "classname":
    //
    //   { "className": "Nachricht" }
    //
    // Fehler (wie bei javac):
    //  - eine public-Klasse auf oberster Ebene hat einen anderen Namen,
    //  - es gibt keine Klasse mit dem erwarteten Namen.
    // In diesem Fall wird statt des Programms nur die Fehlermeldung (rot, über System.err) ausgegeben.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).

    setupDOM: function () {
        this.canvasElement.hide()
    },
    init: function () { },
    update: function () { },
    reset: function () { },

    // Kommentare, Strings und Zeichenliterale durch Leerzeichen ersetzen, Zeilenumbrüche bleiben erhalten
    stripCode: function (src) {
        return src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g,
            m => m.replace(/[^\n]/g, ' '))
    },

    // Typdeklarationen auf oberster Ebene (Klammertiefe 0): [{ name, isPublic, line }]
    topLevelTypes: function (src) {
        const code = this.stripCode(src)
        const types = []
        const re = /[{}]|\b((?:(?:public|protected|private|abstract|final|static|sealed|strictfp)\s+)*)(class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g
        let depth = 0
        let m
        while ((m = re.exec(code)) !== null) {
            if (m[0] === '{') depth++
            else if (m[0] === '}') depth = Math.max(0, depth - 1)
            else if (depth === 0) {
                types.push({
                    name: m[3],
                    isPublic: /\bpublic\b/.test(m[1]),
                    line: code.slice(0, m.index).split('\n').length
                })
            }
        }
        return types
    },

    alterCodeBeforeRun(code) {
        const expected = this.DATA?.classname?.className
        if (!expected) return

        let lineOffset = 0
        const types = []
        for (const entry of code) {
            this.topLevelTypes(entry.content).forEach(t => types.push({ ...t, line: t.line + lineOffset }))
            lineOffset += entry.content.split('\n').length
        }
        if (types.length === 0) return

        const file = `${expected}.java`
        const wrong = types.find(t => t.isPublic && t.name !== expected)
        let message
        if (wrong) {
            message = `at ${file}(${wrong.line}) Die Klasse ${wrong.name} ist public und muss daher in einer Datei ` +
                `namens ${wrong.name}.java stehen.`
        } else if (!types.some(t => t.name === expected)) {
            message = `at ${file}(${types[0].line}) Es gibt keine Klasse ${expected}. Da die Datei ${file} heißt, ` +
                `muss die Klasse ${expected} heißen (gefunden: ${types.map(t => t.name).join(', ')}).`
        } else {
            return
        }

        const literal = JSON.stringify(message)
        code.forEach((entry, nr) => entry.set(nr === 0
            ? `public class ${expected} { public static void main(String[] args) { System.err.println(${literal}); } }`
            : ''))
    }
}
