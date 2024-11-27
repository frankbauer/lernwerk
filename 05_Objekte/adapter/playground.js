{
  scope: undefined,
  runner: undefined,
  setupDOM: function (canvasElement, outputElement, scope) {    
      this.canvasElement = canvasElement
      canvasElement.hide();
      canvasElement.css("margin-top", "32px")
      canvasElement.css("border", "none")     

      this.scope = scope;      
      
      this.setupLights(scope)
  },
  update: function (txt, json, canvasElement, outputElement) {
      this.canvasElement = canvasElement
      this.showResults(json)
  },
  init: function (canvasElement, outputElement, scope, runner) {
      this.runner = runner
      this.scope = scope
      this.canvasElement = canvasElement
  },
  addArgumentsTo(args) {
      this.clearSwitches(this.scope)
  },
  onMessage(cmd, data) {
      //console.log("DEBUG Message", cmd, data, this.scope!==undefined)
      if (data === undefined || this.scope === undefined) return;
      if (cmd === "sw_on" || cmd === "sw_off") {
          const sw = $(`[data-sw=${+data.endpoint}]`)
          if (cmd === "sw_on") {
              sw.removeClass("gdiOff")
              sw.addClass("gdiOn")
          } else if (cmd === "sw_off") {
              sw.removeClass("gdiOn")
              sw.addClass("gdiOff")
          }
      } else if (cmd === "reg") {
          this.addSwitch(+data.value)
      } else {
          data.IP = data.IP === undefined ? "127.0.0.2" : data.IP.replace(/"/gm, '-')
          data.endpoint = data.endpoint === undefined ? 'none' : data.endpoint.replace(/"/gm, '-')
          //console.log("DEBUG SEARCH", `[data-ip="${data.IP}"][data-port="${+data.port}"][data-end="${data.endpoint}"] div`)
          const light = $(`[data-ip="${data.IP}"][data-port="${+data.port}"][data-end="${data.endpoint}"] div.gdiInnerLight`)
          if (cmd === 'hue') this.setColor(light, +data.value, undefined, undefined);
          if (cmd === 'saturation') this.setColor(light, undefined, +data.value, undefined);
          if (cmd === 'brightness') this.setColor(light, undefined, undefined, +data.value);
          if (cmd === 'on') this.setColor(light, undefined, undefined, undefined, true);
          if (cmd === 'off') this.setColor(light, undefined, undefined, undefined, false);
      }

  },
  whenFinished(args, resultData) {
      //console.log("DEBUG Finished", args, resultData)
      this.showResults(resultData)
  },
  reset(canvasElement) {
      //$('.gditest').hide()
  },
  showResults(json) {
      //const tests = this.runTests(this.canvasElement, '', json)      
  },
  //custom helpers --------------------------------------------------------------------------------------------------------------------------------    
  hsv: function (h, s, v) {
      var _h = h,
          _s = s * v,
          _l = (2 - s) * v;
      _s /= (_l <= 1) ? _l : 2 - _l;
      _l /= 2;

      return `hsl(${Math.round(_h)}deg ${_s * 100}% ${_l * 100}%)`
  },
  setColor: function (light, hue, sat, br, on) {
      if (hue === undefined) {
          hue = light.attr('data-hue') || 180
      } else {
          light.attr('data-hue', hue)
      }
      if (sat === undefined) {
          sat = light.attr('data-sat') || 1.0;
      } else {
          light.attr('data-sat', sat)
      }
      if (br === undefined) {
          br = light.attr('data-br') || 0.5;
      } else {
          light.attr('data-br', br)
      }
      if (on === undefined) {
          on = light.attr('data-on') || false;
          if (on==='true') on = true;
          else if (on==='false') on = false;
      } else {
          if (on==='true') on = true;
          else if (on==='false') on = false;
          
          light.attr('data-on', on)
      }
      // console.log("DEBUG COLOR", light, hue, sat, br, on, on ? 'On' : 'Off', this.hsv(hue, sat, br))
      light.css('background-color', this.hsv(hue, sat, Math.max(0.2, br)))
      light.find('.gdiState').html(on ? 'On' : 'Off')
  },
  setupLights: function (scope) {
      const panel = $('#lsPanel #lsLights div.row')
      console.log("DEBUG PANEL", panel)
      const lights = panel.find('.gdiLight');
      console.log("DEBUG LIGHTS", lights)
      lights.each(l => {
          const light = $(lights[l])
          light.html(`<div style="background-color:black" class="gdiInnerLight"><div class="gdiState">?</div><div class="gdiInfo" ><nobr><b>IP:</b> ${light.attr('data-ip')}</nobr><br><nobr><b>Port:</b> ${light.attr('data-port')}</nobr><br><nobr><b>Endpoint:</b> ${light.attr('data-end')}</nobr></div></div>`)
          console.log("DEBUG LIGHT", l, light.attr('data-ip'))
      })
  },
  clearSwitches: function (scope) {
      const panel = $('#lsPanel #lsSwitches div.row')
      panel.html('')
  },
  addSwitch: function (id) {
      const panel = $('#lsPanel #lsSwitches div.row')
      const div = $(document.createElement('DIV'))
      div.attr('data-sw', id)
      div.html(`<div class="gdiSwOnText">On</div><div class="gdiSwToggle">${id}</div><div class="gdiSwOffText">Off</div>`)
      //div.addClass('col-12')
      div.addClass('gdiSwitchBody')
      div.addClass('gdiOff')
      panel.append(div);

      div.on('click', () => {
          if (div.hasClass('gdiOff')) {
              div.removeClass('gdiOff')
              div.addClass('gdiOn')
              if (this.runner !== undefined) this.runner.postMessage('on', { id: id, value: id })
          } else {
              div.removeClass('gdiOn')
              div.addClass('gdiOff')
              if (this.runner !== undefined) this.runner.postMessage('off', { id: id, value: id })
          }
      })
  }
}