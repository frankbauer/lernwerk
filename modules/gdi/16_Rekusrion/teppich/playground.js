export default {
    // Playground zur Aufgabe "Sierpinski-Teppich". Gezeichnet wird von der Klasse Leinwand (Java) über den
    // canvasManager. Achtung: Die Datei muss mit "export default" beginnen (keine HTML-Entities).
    setupDOM: function () {
        this.canvasElement.css({ 'background-color': '#1e2230', padding: '0px', overflow: 'hidden' })
    },
    init: function () {
        canvasManager.forbidAllInputEvents()
    },
    addArgumentsTo(args) { },
    reset() { },
    update: function (txt, json) { }
}
