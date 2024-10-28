function processTabs() {
    const tabs = $('tabbar')
    tabs.each((_index, tabContainer) => {
        tabContainer = $(tabContainer);
        const tabs = tabContainer.find('>div[data-tab]')
        const buttonBar = $(document.createElement('DIV'))
        buttonBar.addClass('buttonbar')
        for (let nr = 0; nr < tabs.length; nr++) {
            const tab = $(tabs[nr])
            const tabId = tab.attr('data-tab')
            const tabName = tab.attr('data-name')
            const button = $(document.createElement('BUTTON'))

            //set the label of the bbutton to tabName
            button.text(tabName)
            //if the tab is the first tab, add the active class to the button
            if (nr === 0) {
                button.addClass('active')
                tab.addClass('active')
            } else {
                button.addClass('inactive')
                tab.addClass('inactive')
            }
            buttonBar.append(button)
            console.log(tabId, tabName)

            //add click event to the button. When clicked, remove the active class from all other tabs and buttons and add the active class to the clicked button and tab
            button.on('click', () => {
                tabs.removeClass('active').addClass('inactive')
                buttonBar.find('button').removeClass('active').addClass('inactive')

                tab.removeClass('inactive').addClass('active')
                button.removeClass('inactive').addClass('active')
            })
        }

        tabContainer.prepend(buttonBar)
    })
}

function processHints() {
    const hints = $('hint')
    hints.each((_index, hint) => {
        hint = $(hint)
        const isSolution = hint.attr("solution")!==undefined
        const rect = hint[0].getBoundingClientRect()

        const hintContainer = $('<div class="hint-container"></div>')
        const button = $(document.createElement('BUTTON'))
        if (rect.height < 35) button.addClass('slim')
        button.addClass('expanded')
        //set the label of the button to tabName
        if (isSolution){
            button.text("Beispiel Zeigen")
        } else {
            button.text("Hinweis Zeigen")
        }
        //replace hint with hintContainer
        hint.replaceWith(hintContainer)
        hintContainer.append(button)
        hintContainer.append(hint)
        hint.addClass('animate')
        button.on('click', () => {
            if (hint.hasClass('expanded')) {
                hint.removeClass('expanded')
                button.addClass('expanded')
                //button.text("Hinweis Zeigen")
            } else {
                hint.addClass('expanded')
                button.removeClass('expanded')
                //button.text("Verbergen")
            }
        })
    })

}

function betterInlineCode() {
    const inlineCode = $('code')
    inlineCode.each((_index, code) => {
        code = $(code)
        code.html('<span code>' + code.html() + '</span>')
        code.addClass('inline-code')
    })

}

function initHelpers() {
    betterInlineCode()
    processHints()
    setTimeout(() => processTabs(), 100);
}