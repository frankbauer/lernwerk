function convert(num) {
    return {
        from: function (baseFrom) {
            return {
                to: function (baseTo) {
                    return parseInt(num, baseFrom).toString(baseTo)
                },
            }
        },
    }
}
function bin2dec(num) {
    return convert(num).from(2).to(10)
}
function dec2bin(num) {
    return convert(num).from(10).to(2)
}
const ENC_UNSIGNED = 'USG'
const ENC_B1 = 'B1'
const ENC_B2 = 'B2'

function encName(enc) {
    if (enc === ENC_B1) {
        return 'im <b>B1</b>-Komplement'
    }
    if (enc === ENC_B2) {
        return 'im <b>B2</b>-Komplement'
    }
    return 'mit <b>vorzeichenlosen Zahlen</b>'
}

class Binary {
    constructor(binNumber, encoding, bitCount) {
        this.bitCount = bitCount ? bitCount : 10
        if (Array.isArray(binNumber)) {
            let res = [...binNumber]
            while (res.length < this.bitCount) {
                res.push('0')
            }
            if (res.length > this.bitCount) {
                res.splice(this.bitCount)
            }
            this.bits = res
        } else {
            while (binNumber.length < this.bitCount) {
                binNumber = '0' + binNumber
            }
            const res = []
            for (let i = binNumber.length - 1; i >= binNumber.length - this.bitCount; i--) {
                if (binNumber[i] === ' ') continue;
                res.push(+binNumber[i])
            }
            this.bits = res
        }

        this.encoding = encoding ? encoding : ENC_UNSIGNED
    }

    setEncoding(enc) {
        this.encoding = enc
        return this
    }

    asBin() {
        return [...this.bits].reverse().join('')
    }

    invert() {
        return new Binary(
            this.bits.map((b) => (b == 0 ? 1 : 0)),
            ENC_UNSIGNED,
            this.bitCount
        )
    }

    _sum(final, a, b, u) {
        if (b === 1) {
            b = [1]
            while (b.length < this.bitCount) {
                b.push(0)
            }
        }
        for (let i = 0; i < this.bitCount; i++) {
            const res = u + a[i] + b[i]
            if (res === 0) {
                final[i] = 0
                u = 0
            } else if (res === 1) {
                final[i] = 1
                u = 0
            } else if (res === 2) {
                final[i] = 0
                u = 1
            } else if (res === 3) {
                final[i] = 1
                u = 1
            }
        }
        return u
    }

    sum(other, grow) {
        let final = []
        let u = this._sum(final, this.bits, other === 1 ? 1 : other.bits, 0)

        if (this.encoding === ENC_B1 && u === 1) {
            this._sum(final, final, 1, 0)
        }
        if (grow) {
            final.push(u)
        }
        return new Binary(final, this.encoding, final.length)
    }

    asDec() {
        if (this.encoding !== ENC_UNSIGNED && this.bits[this.bits.length - 1] === 1) {
            const inv = this.invert().setEncoding(ENC_UNSIGNED)
            if (this.encoding === ENC_B2) {
                return -1 * inv.sum(1).asDec()
            }
            return -1 * inv.asDec()
        }
        return this.bits.map((b, i) => Math.pow(2, i) * b).reduce((p, c) => p + c, 0)
    }

    prettyBin() {
        let res = ''
        let ct = 0;
        for (let i = 0; i < this.bits.length; i++) {
            if (this.bits[i] === 1 || this.bits[i] === 0) {
                if (ct === 4) {
                    res = '&thinsp;' + res
                    ct = 0
                }
                res = this.bits[i] + res
                ct++
            }
        }
        return res
    }
}

