export default {
    // Playground zum Sandkasten "MeineRotTrennung" (angelehnt an 20_Bilder/bildfilter).
    // Lädt robotdog.jpg als Farbbild (verkleinert auf HEIGHT Pixel Höhe), übergibt es als Base64-codierte
    // RGB-Bytes an das Programm (args[0..2]) und zeigt das von MainOverride geschickte Ergebnis
    // ({ width, height, data }) neben dem Quellbild an.
    // Achtung: Die Datei muss mit "export default" beginnen (sonst wird es nicht entfernt).
    // Der Code wird als HTML in die Seite eingebettet, daher hier keine HTML-Entities verwenden.

    HEIGHT: 240,
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
            const height = Math.min(this.HEIGHT, image.height)
            const width = Math.round(image.width * height / image.height)
            canvas.width = outCanvas.width = width
            canvas.height = outCanvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0, width, height)

            // pro Pixel r, g, b als Byte-Folge (zeilenweise)
            const rgba = ctx.getImageData(0, 0, width, height).data
            const rgb = new Uint8Array(width * height * 3)
            for (let i = 0; i < width * height; i++) {
                rgb[3 * i] = rgba[4 * i]
                rgb[3 * i + 1] = rgba[4 * i + 1]
                rgb[3 * i + 2] = rgba[4 * i + 2]
            }

            this.imageData = { width, height, data: this.bytesToBase64(rgb) }
        }
        image.src = this.robotDog
    },

    addArgumentsTo(args) {
        if (this.imageData === undefined) return
        args[0] = '' + this.imageData.width
        args[1] = '' + this.imageData.height
        args[2] = this.imageData.data
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

        const rgb = this.base64ToBytes(json.data)
        const out = ctx.createImageData(json.width, json.height)
        for (let i = 0; i < json.width * json.height; i++) {
            out.data[4 * i] = rgb[3 * i]
            out.data[4 * i + 1] = rgb[3 * i + 1]
            out.data[4 * i + 2] = rgb[3 * i + 2]
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
