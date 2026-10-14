export default {
    // Zeigt nach dem Ausführen einen Fehler an, wenn eine Zeile der Ausgabe einer bestimmten Ausgabe entspricht
    // (z.B. der unverändert übernommenen Beispiellösung). Die Konfiguration kommt aus einem DATA-Block namens
    // "outputcheck":
    //
    //   {
    //     "checks": [
    //       { "output": "Kim Musterdann", "message": "..." }   // Vergleich zeilenweise, ohne führende/abschließende Leerzeichen
    //     ]
    //   }
    //
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).

    setupDOM: function () {
        this.canvasElement.hide()
    },
    init: function () { },
    reset: function () { },

    // Rückgabewert ersetzt die Ausgabe; Zeilen mit "@red:" werden von Codeblocks rot dargestellt
    update: function (txt) {
        const checks = this.DATA?.outputcheck?.checks
        if (!checks || typeof txt !== 'string') return undefined
        const lines = txt.split('\n').map(l => l.trim())
        const messages = checks.filter(c => lines.includes(c.output.trim())).map(c => c.message)
        if (messages.length === 0) return undefined
        return txt.replace(/\n?$/, '\n') + messages.map(m => `@red:${m}`).join('\n') + '\n'
    }
}
