export default {
    entities: {},
    setupDOM: function () { },
    init: function () { },
    addArgumentsTo(args) {
    },
    reset() { },
    update: function (txt, json) {
        //get the css variables defined on the :root of this site
        const planetSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--planet-size'));
        const rocketWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rocket-width'));
        const rocketHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rocket-height'));

        this.canvasElement.html('')
        Object.keys(this.entities).map(k => this.entities[k]).filter(e => e.timer).forEach(e => clearInterval(e.timer))
        this.entities = {}
        if (Array.isArray(json) && json.length > 0) {
            this.runCommand(this.canvasElement, json, 0, planetSize, rocketWidth, rocketHeight)
        }
    },
    runCommand(canvasElement, commands, index, planetSize, rocketWidth, rocketHeight) {
        const cmd = commands[index]
        if (cmd.command === 'Universe') {
            const universe = $('<div class="universe"></div>')
            const countdown = $('<div class="countdown over"></div>')
            universe.append(countdown)
            canvasElement.append(universe)
        } else if (cmd.command === 'Planet') {
            const planet = $('<div class="planet"></div>')
            planet.attr('data-id', cmd.id)
            this.entities[cmd.id] = {
                element: planet,
                clouds: false,
                x: 0,
                y: 0,
                added: false
            }
        } else if (cmd.command === 'Rocket') {
            const rocket = $('<div class="rocket fallen animated"></div>')
            rocket.attr('data-id', cmd.id)
            this.entities[cmd.id] = {
                element: rocket,
                planet: -1,
                x: 0,
                y: 0,
                launch: 0,
                added: false
            }
        } else if (cmd.command === 'addEntity') {
            const entity = this.entities[cmd.entity]
            if (entity && !entity.added) {
                entity.added = true
                let pPos = { left: 0, top: 0 }
                const universe = this.scope.find('.universe');
                if (entity.planet > 0) {
                    const planet = this.entities[entity.planet]
                    const uPos = universe.offset()
                    pPos = planet.element.offset()
                    pPos = { left: pPos.left - uPos.left + planetSize / 2, top: pPos.top - uPos.top + planetSize / 2 }

                    entity.element.css('left', `${pPos.left - rocketWidth / 2}px`)
                    entity.element.css('top', `${pPos.top - rocketHeight}px`)
                } else {
                    entity.element.css('left', `${- rocketWidth / 2}px`)
                    entity.element.css('top', `${- rocketHeight}px`)
                }
                universe.append(entity.element)

                setTimeout(() => {
                    entity.element.removeClass('fallen')
                    if (entity.planet > 0) {
                        entity.element.css('left', `${pPos.left - rocketWidth / 2 + entity.x}px`)
                        entity.element.css('top', `${pPos.top - rocketHeight + entity.y}px`)
                    } else {
                        entity.element.css('left', `${- rocketWidth / 2 + entity.x}px`)
                        entity.element.css('top', `${- rocketHeight + entity.y}px`)
                    }
                }, 10)
            }
        } else if (cmd.command === 'setLocation') {
            const planet = this.entities[cmd.id]
            if (planet) {
                planet.x = cmd.x
                planet.y = cmd.y
                planet.element.css('left', `calc(${planetSize / -2 + 320 + cmd.x}px)`)
                planet.element.css('top', `calc(${planetSize / -2 + 200 + cmd.y}px)`)
            }
        } else if (cmd.command === "setHasClouds") {
            const planet = this.entities[cmd.id]
            if (planet) {
                if (cmd.hasClouds && !planet.clouds) {
                    const clouds = $('<div class="clouds"></div>')
                    planet.element.append(clouds)
                    planet.clouds = true
                    setTimeout(() => clouds.addClass('added'), 10)
                } else if (!cmd.hasClouds && planet.clouds) {
                    planet.element.find('.clouds').remove()
                    planet.clouds = false
                }
            }
        } else if (cmd.command === 'setLocationRelativeTo') {
            const rocket = this.entities[cmd.id]
            if (rocket) {
                let pPos = { left: 0, top: 0 }

                if (cmd.planet >= 0) {
                    const universe = this.scope.find('.universe');
                    const planet = this.entities[cmd.planet]
                    const uPos = universe.offset()
                    pPos = planet.element.offset()
                    pPos = { left: pPos.left - uPos.left + planetSize / 2, top: pPos.top - uPos.top + planetSize / 2 }
                }

                rocket.x = cmd.offsetX
                rocket.y = cmd.offsetY
                rocket.planet = cmd.planet
                setTimeout(() => {
                    rocket.element.css('left', `${pPos.left - rocketWidth / 2 + cmd.offsetX}px`)
                    rocket.element.css('top', `${pPos.top - rocketHeight + cmd.offsetY}px`)
                }, 10)

            }
        } else if (cmd.command === 'launchIn') {
            const rocket = this.entities[cmd.id]
            if (rocket) {
                rocket.launch = cmd.seconds
            }
        } else if (cmd.command === 'simulate') {
            this.scope.find('.universe').addClass('simulate')
            Object.keys(this.entities).map(k => this.entities[k]).filter(e => e.launch !== undefined).forEach(rocket => {
                //get the position of rocket relative to canvasElement and append it to the canvasElement
                const cPos = canvasElement.offset()

                //add countdown layer
                if (rocket.launch >= 1 && rocket.added) {
                    rocket.cd = rocket.launch
                    const countdown = this.scope.find('.countdown')
                    countdown.removeClass('over')
                    countdown.html(rocket.launch)
                    const cTimer = setInterval(() => {
                        if (rocket.cd > 1) {
                            countdown.html(--rocket.cd)
                        } else {
                            countdown.html(0)
                            countdown.addClass('over')
                            clearInterval(cTimer)
                        }
                    }, 1000)
                }

                setTimeout(() => {
                    const rPos = rocket.element.offset()
                    rocket.time = 0
                    rocket.state = 0

                    rocket.pox = rPos.left - cPos.left - 1
                    rocket.poy = rPos.top - cPos.top - 1
                    rocket.element.css('left', rocket.pox + "px")
                    rocket.element.css('top', rocket.poy + "px")
                    rocket.element.addClass(`state_${rocket.state}`)
                    rocket.simulate = true

                    rocket.element.removeClass('animated')
                    canvasElement.append(rocket.element)
                    rocket.timer = setInterval(() => this.updateRocket(rocket), 1000 / 25)
                }, rocket.launch * 1000)
            })

        }

        if (commands.length > index + 1) {
            setTimeout(() => this.runCommand(canvasElement, commands, index + 1, planetSize, rocketWidth, rocketHeight), 300)
        }
    },
    updateRocket(rocket) {
        if (!rocket.simulate) return;
        const a_up = 20;
        const a_down = -9.81;
        const v0 = 0;
        rocket.time += 1 / 25
        const oldState = rocket.state
        rocket.state = (rocket.state + 1) % 3



        if (rocket.time < 3) {
            rocket.lastY = rocket.poy + v0 * rocket.time - 0.5 * a_up * rocket.time * rocket.time
            rocket.lastV = v0 - a_up * rocket.time
            rocket.lastT = rocket.time
            rocket.element.css('top', rocket.lastY + "px")
            if (oldState !== rocket.state) {
                rocket.element.removeClass(`state_${oldState}`).addClass(`state_${rocket.state}`)
            }
        } else {
            if (rocket.element.hasClass(`state_${oldState}`))
                rocket.element.removeClass(`state_${oldState}`)
            const t = rocket.time - rocket.lastT
            const p = rocket.lastY + rocket.lastV * t - 0.5 * a_down * t * t;
            rocket.element.css('top', p + "px")
            if (p > 700) {
                clearInterval(rocket.timer)
                rocket.simulate = false;
            } else if (p > 400 && !rocket.element.hasClass('fallen')) {
                rocket.element.addClass('fallen')
            }
        }
    }
}
