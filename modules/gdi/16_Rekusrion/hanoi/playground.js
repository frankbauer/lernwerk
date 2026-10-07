export default {
    // Playground zur Aufgabe "Türme von Hanoi". Gezeichnet wird von der Klasse Tuerme (Java) über den
    // canvasManager. Achtung: Die Datei muss mit "export default" beginnen (keine HTML-Entities).
    setupDOM: function () {
        this.canvasElement.css({ 'background-color': '#26304a', padding: '0px', overflow: 'hidden' })
    },
    init: function () {
        canvasManager.forbidAllInputEvents()
    },
    addArgumentsTo(args) { },
    reset() { },
    update: function (txt, json) { }
}
