export default {
    scope: undefined,
    canvasElement: undefined,
    commandDelay: 10,
    commandTimer: undefined,
    objects: {},
    forceStrength: -100,
    forceDistance: 130,
    forceCollide: 10,
    setupDOM: function (canvasElement, outputElement, scope) {
        this.scope = scope
    },
    init: function (canvasElement, outputElement, scope, runner) {
        this.scope = scope
        this.resetGraph(canvasElement)
    },
    addArgumentsTo(args) {
    },
    reset(canvasElement) {

    },
    update: function (txt, json, canvasElement, outputElement) {
        this.resetGraph(canvasElement)
        this.runCommand(json, 0)
    },
    buildGraphVisualization: function (canvasElement, inGraph) {
        canvasElement.show();
        const allEdges = inGraph.nodes.map((node) => node.edges).flat();
        //check if for each edge from source to target there is an edge from target to source
        let undirected = true;
        let unitWeights = true;
        for (let edge of allEdges) {
            const reverseEdge = allEdges.find((e) => e.source === edge.target && e.target === edge.source)
            if (reverseEdge === undefined) {
                undirected = false;
            }
            if (edge.weight !== 1) {
                unitWeights = false;
            }
            if (!undirected && !unitWeights) {
                break;
            }
        }


        const graph = {
            nodes: inGraph.nodes.map((node, idx) => {
                node.graphIdx = idx
                return {
                    id: node.graphIdx,
                    name: node.payload,
                }
            }),
            edges: allEdges.map((edge) => {
                return {
                    source: edge.source.graphIdx,
                    target: edge.target.graphIdx,
                    w: edge.weight,
                }
            })
        }
        //        console.log("GGG", inGraph, allEdges, graph)

        const width = canvasElement.width() - 2;
        const height = canvasElement.height() - 2;
        const container = $(document.createElement('div'));
        container.addClass('lightContainer');
        container.width(width);
        container.height(height);
        canvasElement.html('')
        canvasElement.append(container);

        const svg = d3.select(container.get(0)).append("svg")
            .attr("width", width)
            .attr("height", height);

        $(window).on('resize', () => {
            console.log("RESIZE")
            const width = canvasElement.width() - 2;
            const height = canvasElement.height() - 2;
            container.width(width);
            container.height(height);
            svg.attr("width", width)
                .attr("height", height);
        });



        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "-37 -5 22 22")
            .attr("refX", 6)
            .attr("refY", 0)
            .attr("markerWidth", 22)
            .attr("markerHeight", 22)
            .attr("markerUnits", "strokeWidth")
            .attr("orient", "auto")
            .append("path")
            .attr('d', 'M -37,-5 L -27 ,0 L -37,5')
            .attr('class', 'arrowhead')


        const simulation = d3.forceSimulation(graph.nodes)
            .force("charge", d3.forceManyBody().strength(this.forceStrength))
            .force("link", d3.forceLink(graph.Edges).distance(this.forceDistance))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide(this.forceCollide))

        const link = svg.append("g")
            .attr("class", "lightLinks")
            .selectAll("line")
            .data(graph.edges)
            .enter()
            .append('g')
            .attr('class', function (d) {
                return (d.clicked ? ' lineSelected' : '')
            });

        const line = link.append("line")
            .attr('class', 'line');
        if (!undirected) {
            line
                .attr("marker-end", "url(#arrow)");
        }
        if (!unitWeights) {
            const labelGroup = link.append('g')
                .attr('class', 'labelGroup');

            labelGroup.append("text")
                .attr('class', 'lightLineLabel')
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .text(d => d.w)

            link.selectAll("text").each(function (d, i) {
                d.bb = this.getBBox();
            });


            const padding = 3;
            labelGroup.insert("rect", ":first-child")
                .attr('class', function (d) {
                    return 'clickable lightLineLabelBox' + (d.clicked ? ' lightLineLabelSelected' : '')
                })
                .attr("width", function (d) {
                    return d.bb.width + 2 * padding;
                })
                .attr("height", function (d) {
                    return d.bb.height + 2 * padding;
                })
                .attr("x", function (d) {
                    return -d.bb.width / 2 - padding;
                })
                .attr("y", function (d) {
                    return -d.bb.height / 2 - padding;
                }).on("click", function (d) {
                    if (self.readonly) return;
                    if (d.clicked === undefined) {
                        d.clicked = true;
                    } else {
                        d.clicked = !d.clicked;
                    }

                    d3.select(this.parentNode.parentNode).classed("lineSelected", d.clicked)
                    d3.select(this).classed("lightLineLabelSelected", d.clicked);
                    self.storeResult();
                });
        }

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll(".nodes")
            .data(graph.nodes)
            .enter()
            .append('g')
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr('cx', 0)
            .attr('cy', 0)
            .attr("r", 32)

        node.append("text")
            .attr('class', 'nodeLabel')
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', 1)
            .text(d => d.name)

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.edges);

        function ticked() {
            link.selectAll('line')
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            link.selectAll('g')
                .attr('transform', d => 'translate(' +
                    (d.source.x + d.target.x) / 2 +
                    ', ' +
                    (d.source.y + d.target.y) / 2 +
                    ')'
                )

            node.attr('transform', d => 'translate(' + d.x + ', ' + d.y + ')')
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        const me = this
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            if (me.printDebugNodes) {
                me.printNodes(graph)
            }
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            if (me.printDebugNodes) {
                setTimeout(() => me.printNodes(graph), 5000)
            }
        }
    },
    resetGraph(canvasElement) {
        if (this.commandTimer !== undefined) {
            clearTimeout(this.commandTimer)
            this.commandTimer = undefined
        }
        this.canvasElement = canvasElement
        canvasElement.hide();
        this.objects = {}
    },
    runCommand(commands, idx) {
        this.commandTimer = undefined
        if (idx < 0 || idx >= commands.length) {

            return
        }
        const cmd = commands[idx]
        const cmdName = cmd.command
        let hasDelay = false;

        if (cmdName === "new") {
            const obj = cmd.object
            const objType = obj.type
            const objId = obj.id

            if (objType === "Graph") {
                this.objects[objId] = {
                    nodes: [],
                    ...obj,
                }
            } else if (objType === "Node") {
                this.objects[objId] = {
                    edges: [],
                    ...obj,
                }
            } else if (objType === "Edge") {
                this.objects[objId] = {
                    weight: obj.weight,
                    source: this.objects[obj.source.id],
                    target: this.objects[obj.target.id],
                }
            }

            //this.canvasElement.html(this.canvasElement.html() + "<br>" + cmdName + ": " + JSON.stringify(this.objects[objId]));
        } if (cmdName === "addNode") {
            const graph = this.objects[cmd.object.id]
            const node = this.objects[cmd.node.id]
            graph.nodes.push(node)
            //this.canvasElement.html(this.canvasElement.html() + "<br>" + cmdName + ": " + JSON.stringify(graph) + " ++ " + JSON.stringify(node));
        } if (cmdName === "addEdge") {
            const node = this.objects[cmd.object.id]
            const edge = this.objects[cmd.edge.id]
            node.edges.push(edge)
            //this.canvasElement.html(this.canvasElement.html() + "<br>" + cmdName + ": " + JSON.stringify(node) + " ++ " + JSON.stringify(edge));
        } if (cmdName === "visualize") {
            const graph = this.objects[cmd.object.id]

            this.buildGraphVisualization(this.canvasElement, graph)
        } else {
            //this.canvasElement.html(this.canvasElement.html() + "<br>" + cmdName + ": " + JSON.stringify(cmd));
        }


        this.commandTimer = setTimeout(() => {
            this.runCommand(commands, idx + 1)
        }, hasDelay ? this.commandDelay : 1)
    }

}