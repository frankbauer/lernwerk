export default {
    // Playground (v102) zur Aufgabe "Bildfilter", portiert vom v101-Playground der StudOn-Aufgabe.
    // Lädt robotdog.jpg als Graustufenbild (roter Kanal), übergibt es als Base64 zusammen mit dem im
    // Auswahlfeld #filter gewählten Kernel an das Programm (args[0..3]) und zeigt das von Image.save()
    // geschickte Ergebnis ({ width, height, data }) neben dem Quellbild an.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    imageData: undefined,

    // wird vor init geladen und steht dann als this.robotDog (Object-URL) zur Verfügung
    getResources() {
        return [{ uri: 'robotdog.jpg', type: 'image', name: 'robotDog' }]
    },

    setupDOM: function () {
        this.canvasElement.css({ border: 'none', 'box-shadow': 'none', 'background-color': 'transparent' })
        this.canvasElement.html(`
            <table style="margin: 0 auto">
                <tr>
                    <td style="padding-right: 8px"><canvas id="inputCanvas"></canvas></td>
                    <td><canvas id="outputCanvas"></canvas></td>
                </tr>
                <tr>
                    <td style="text-align: center">Quellbild</td>
                    <td style="text-align: center">Ergebnis</td>
                </tr>
            </table>`)
    },

    init: function () {
        const canvas = this.canvasElement.find('canvas#inputCanvas').get(0)
        const outCanvas = this.canvasElement.find('canvas#outputCanvas').get(0)
        const image = document.createElement('img')
        image.onload = () => {
            canvas.width = outCanvas.width = image.width
            canvas.height = outCanvas.height = image.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0)

            // Graustufen: pro Pixel nur der rote Kanal, zeilenweise als Byte-Folge
            const rgba = ctx.getImageData(0, 0, image.width, image.height).data
            const gray = new Uint8Array(image.width * image.height)
            for (let i = 0; i < gray.length; i++) gray[i] = rgba[4 * i]

            this.imageData = {
                width: image.width,
                height: image.height,
                data: this.bytesToBase64(gray)
            }
        }
        image.src = this.robotDog
    },

    addArgumentsTo(args) {
        if (this.imageData === undefined) return
        args[0] = '' + this.imageData.width
        args[1] = '' + this.imageData.height
        args[2] = this.imageData.data
        args[3] = '' + this.scope.find('#filter').val()
    },

    reset() { },

    update: function (txt, json) {
        const canvas = this.canvasElement.find('canvas#outputCanvas').get(0)
        const ctx = canvas.getContext('2d')
        if (json === undefined || json === null || json.data === undefined || json.width === undefined || json.height === undefined) {
            ctx.fillStyle = 'magenta'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            return
        }

        const gray = this.base64ToBytes(json.data)
        const out = ctx.createImageData(json.width, json.height)
        for (let i = 0; i < json.width * json.height; i++) {
            out.data[4 * i] = out.data[4 * i + 1] = out.data[4 * i + 2] = gray[i]
            out.data[4 * i + 3] = 0xff
        }
        canvas.width = json.width
        canvas.height = json.height
        ctx.putImageData(out, 0, 0)
    },

    // btoa/atob stehen im Playground nicht zur Verfügung
    base64Chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

    bytesToBase64(bytes) {
        const chars = this.base64Chars
        let out = ''
        for (let i = 0; i < bytes.length; i += 3) {
            const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
            out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63]
            out += i + 1 < bytes.length ? chars[(n >> 6) & 63] : '='
            out += i + 2 < bytes.length ? chars[n & 63] : '='
        }
        return out
    },

    base64ToBytes(base64) {
        const clean = base64.replace(/=+$/, '')
        const bytes = new Uint8Array(Math.floor(clean.length * 6 / 8))
        let buffer = 0, bits = 0, pos = 0
        for (const ch of clean) {
            buffer = (buffer << 6) | this.base64Chars.indexOf(ch)
            bits += 6
            if (bits >= 8) {
                bits -= 8
                bytes[pos++] = (buffer >> bits) & 0xff
            }
        }
        return bytes
    },
}
