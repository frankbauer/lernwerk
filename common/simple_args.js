export default {
    scope: undefined,
    setupDOM: function (canvasElement, outputElement, scope) {
        canvasElement.hide()
        this.scope = scope
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
    },
    addArgumentsTo(args) {
        if (this.scope) {
            let nr = 0
            while (true) {
                const input = $(`input#args_${nr}`)
                if (input.length === 0) break
                console.log("INPUT", input, input.val())
                args[nr] = (`${input.val()}`)
                nr++
            }
        }
    },
    reset(canvasElement) { },
    update: function (txt, json, canvasElement, outputElement) {
    }
}