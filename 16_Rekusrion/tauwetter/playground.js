export default {
    // Playground zur Aufgabe "Tauwetter". Gezeichnet wird von der Klasse Wiese (Java) über die
    // tileMap-Bibliothek (isometrische Karte), der Playground übergibt nur die Karte als Programmargumente.
    // Achtung: Die Datei muss mit "export default" beginnen und wird als HTML eingebettet (keine HTML-Entities).

    // . = Wiese, S = Schneemann, T = Bäume, R = Felsen
    map: [
        '..SS.T..SS..',
        '.SSS.T.SS..R',
        '..S.....S...',
        'T.SSSTR...S.',
        'T...S...SSS.',
        '.R...S...S.T',
        '..SS...T.SS.',
        '..S..T......'
    ],

    init: function () {},

    addArgumentsTo(args) {
        args[0] = `${this.map.length}`
        args[1] = `${this.map[0].length}`
        let p = 2
        for (const row of this.map) {
            for (const ch of row) {
                args[p++] = `${'.STR'.indexOf(ch)}`
            }
        }
    },

    reset() { },

    update: function (txt, json) { }
}
