
async function buildContent(elements) {
    console.log($('head title'))
    $('head title').text(`[GdI] ${elements.short}`);
    $('div.topbar h1').html(elements.title);
    const root = $('div#content');

    for (let child of elements.content) {
        await generateContent(child, root)
    }
}

async function generateContent(item, root) {
    let newElement = undefined
    if (item.type === 'tabs') {
        newElement = await generateTabs(item);
    } else if (item.type === 'codeblocks') {
        newElement = await generateCodeBlocks(item);
    } else if (item.type !== undefined) {
        newElement = generateText([item.type, 'boxed']);

    } else {
        console.error("Unknown element type", item.type)
    }

    if (newElement !== undefined) {
        addClass(item, newElement);
        await addContent(item, newElement);
        root.append(newElement);
    }
}

function camelToDash(text) {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function addClass(item, domElement) {
    if (item.class) {
        item.class.split(' ').forEach(c => domElement.addClass(c));
    }
}

function setAttributes(attributes, domElement) {
    if (attributes) {
        Object.keys(attributes).forEach(key => {
            domElement.attr(camelToDash(key), attributes[key]);
        });
    }
}

async function addContent(item, domElement) {
    if (Array.isArray(item.content)) {
        for (const child of item.content) {
            await generateContent(child, domElement);
        }
    } else if (item.content !== undefined) {
        console.log("FETCHING", item.type, item.content)
        const response = await fetch(item.content)
        let text = await response.text()
        if (item.loadPlaygroundContent === true) {
            if (item.content.endsWith('.js')) {
                text = text
                    .replace(/^export\s+default\s+\{/gs, '{')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        } else if (item.content.endsWith('.java')) {
            text = javaPreProcessor(text, {
                'SOLUTION': item.type === 'solution',
                'API': item.type === 'api',
                'STUDENT': item.type === 'student',
            });
            text = javaFinalizer(text)
        } else if (item.type === 'text') {
            text = text
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        } else if (item.type === 'data') {
            text = text
                .replace(/\{/g, '&#123;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
        domElement.html(text);
        console.log("Fetched", item.type, item.content, domElement)
    }
}

function generateText(classes) {
    const newElement = $(document.createElement('div'));
    classes.forEach(c => newElement.addClass(c));
    return newElement
}

async function generateTabs(item) {
    const tabContainer = $(document.createElement('tabbar'))

    const tabs = item.tabs.map(tab => {
        if (tab.codeblocks !== undefined) {
            if (tab.solution === undefined) tab.solution = []

            const solblocks = { ...tab.codeblocks, type: "codeblocks" }
            solblocks.blocks = solblocks.blocks.map(block => {
                return {
                    ...block,
                    withSolution: true
                }
            })
            return [{
                name: "Ihre Lösung",
                content: [{
                    ...tab.codeblocks,
                    type: "codeblocks",
                }]
            }, {
                name: "Beispiellösung",
                content: [solblocks, ...tab.solution]
            }]
        }

        return [tab]
    }).flat(1)
    for (let id = 0; id < tabs.length; id++) {
        const tabItem = tabs[id]
        const tab = $(document.createElement('div'))

        tab.attr('data-tab', tabItem.id ?? `tab-${id}`)
        tab.attr('data-name', tabItem.name)
        addClass(tabItem, tab);
        await addContent(tabItem, tab);
        tabContainer.append(tab)
    }
    return tabContainer
}

async function generateCodeBlocks(item) {
    const codeblocks = $(document.createElement('div'))
    setAttributes({
        dataCompiler: "java",
        dataRunCode: true,
        dataCompilerVersion: 101,
        dataExecutionTimeout: 5000,
        dataMaxCharacters: 6000,
        dataOutputParser: "data",
        dataScopeSelector: "div#content"
    }, codeblocks)
    setAttributes(item.attributes, codeblocks)
    //codeblocks.attr('codeblockseditor', 'true')
    codeblocks.attr('codeblocks', 'true')
    for (block of item.blocks) {
        await generateCodeBlockElement(block, codeblocks)
    }
    return codeblocks
}

function javaFinalizer(code) {
    return code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function javaPreProcessor(code, defines) {
    const names = Object.keys(defines);
    const lines = code.split('\n');
    const result = [];
    let keep = null;
    for (let nr = 0; nr < lines.length; nr++) {
        const line = lines[nr];
        if (keep === null) {
            if (line.trim().startsWith('//#IF ')) {
                const name = line.split(' ')[1];
                keep = defines[name] === true ? null : name;
            } else if (line.trim().startsWith('//#ENDIF ')) {

            } else {
                result.push(line)
            }
        } else {
            if (line.trim().startsWith('//#ENDIF ' + keep)) {
                keep = null;
            }
        }


    }
    return result.join('\n');
}

function generateBlocksFromJava(code, blockData, codeblocks) {
    if (!code.startsWith('//#START ')) {
        code = '//#START CODE\n' + code;
    }
    const blocks = code.split('//#START ')
    for (let nr = 0; nr < blocks.length; nr++) {
        const block = blocks[nr]
        const withSolution = blockData.withSolution === true
        const parts = block.split('\n')
        const type = parts[0].trim()

        if ((!withSolution && type === 'SOLUTION') || (withSolution && type === 'STUDENT')) {
            continue;
        }

        let content = parts.slice(1).join('\n')
        if (nr < blocks.length - 1) {
            content = content.slice(0, -1)
        }
        if (content === '' && type !== 'STUDENT') continue;
        const attributes = {
            dataVisibleLines: "auto",
            dataStatic: type === 'API' || type === 'SOLUTION' || type === 'STATIC' || withSolution,
            dataHidden: type === 'API'
        }
        content = javaPreProcessor(content, {
            'SOLUTION': type === 'SOLUTION' || (type === 'CODE' && withSolution),
            'API': type === 'API',
            'STUDENT': type === 'STUDENT' || (type === 'CODE' && !withSolution),
        });
        content = javaFinalizer(content)

        const blockElement = $(document.createElement('div'))
        blockElement.attr('as', 'block')
        setAttributes(attributes, blockElement)
        setAttributes(blockData.attributes, blockElement)
        blockElement.html(content)
        codeblocks.append(blockElement)
    }
}

async function generateCodeBlockElement(blockData, codeblocks) {
    let blockElement = undefined
    if (blockData.type === 'block' || blockData.type === 'api' || blockData.type === 'solution' || blockData.type === 'student') {
        blockElement = $(document.createElement('div'))
        blockElement.attr('as', 'block')

        setAttributes({
            dataVisibleLines: "auto",
            dataStatic: blockData.type === 'api' || blockData.type === 'solution',
            dataHidden: blockData.type === 'api'
        }, blockElement)
    } else if (blockData.type === 'code') {
        const response = await fetch(blockData.content)
        const code = await response.text()
        generateBlocksFromJava(code, blockData, codeblocks)
        return

    } else if (blockData.type === 'text') {
        blockElement = $(document.createElement('text'))
        blockElement.attr('as', 'text')

    } else if (blockData.type === 'data') {
        blockElement = $(document.createElement('data'))
        blockElement.attr('as', 'data')
        setAttributes({ dataName: blockData.name }, blockElement)
    } else if (blockData.type === 'playground' || blockData.type === 'script') {
        blockData.loadPlaygroundContent = true
        blockElement = $(document.createElement('playground'))
        setAttributes({
            dataVersion: 101,
            dataCodeExpanded: 0,
            align: "center"
        }, blockElement)
        if (blockData.type === 'script') {
            setAttributes({
                width: 0,
                height: 0
            }, blockElement)
        }
    }


    if (blockElement === undefined) {
        console.error("Unknown block type", block.type)
    } else {
        setAttributes(block.attributes, blockElement)
        await addContent(block, blockElement, true);
        codeblocks.append(blockElement);
    }
}