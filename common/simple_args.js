export default {
    setupDOM: function () {
        this.canvasElement.hide()    
    },
    init: function () {},
    addArgumentsTo(args) {        
        let nr = 0
        while (true) {
            const input = this.scope.find(`input#args_${nr}`)
            if (input.length === 0) break
            console.log("INPUT", input, input.val())
            args[nr] = (`${input.val()}`)
            nr++
        }        
    },
    reset() {},
    update: function (txt, json) {}
}