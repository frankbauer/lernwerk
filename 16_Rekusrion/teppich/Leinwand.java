class Leinwand {
    public final int zeilen;
    public final int spalten;
    private final boolean[][] gefuellt;
    private int delayInMs = 8;
    private int anzahl = 0;
    private int erwartet = 1; // Felder eines vollständigen Teppichs: 8 hoch Stufe

    Leinwand(int groesse) {
        this.zeilen = groesse;
        this.spalten = groesse;
        this.gefuellt = new boolean[groesse][groesse];
        for (int g = groesse; g > 1; g /= 3) {
            erwartet *= 8;
        }
        aufbauen();
    }

    public void setDelay(int delayInMs) {
        this.delayInMs = Math.max(delayInMs, 1);
    }

    public boolean istGefuellt(int zeile, int spalte) {
        if (!gueltig(zeile, spalte)) {
            return true;
        }
        return gefuellt[zeile][spalte];
    }

    public void fuellen(int zeile, int spalte) {
        if (!gueltig(zeile, spalte)) {
            return;
        }
        if (gefuellt[zeile][spalte]) {
            System.err.println("Feld " + zeile + " / " + spalte + " ist schon gefuellt.");
            return;
        }
        gefuellt[zeile][spalte] = true;
        // die Farbe zeigt die Reihenfolge, in der die Felder gefüllt werden
        int farbton = (int) (300.0 * anzahl / Math.max(1, erwartet - 1)) % 360;
        Canvas.setFillStyle("hsl(" + farbton + ",75%,60%)");
        feld(zeile, spalte);
        anzahl++;
        warten(delayInMs);
    }

    public int anzahlGefuellt() {
        return anzahl;
    }

    // kurze Wartezeiten werden gesammelt, damit höchstens einmal pro Bild (ca. 16 ms) gewartet wird
    private static int offeneWartezeit = 0;

    private static void warten(int ms) {
        offeneWartezeit += ms;
        if (offeneWartezeit < 16) {
            return;
        }
        try {
            Thread.sleep(offeneWartezeit);
        } catch (InterruptedException e) {
            // nichts zu tun
        }
        offeneWartezeit = 0;
    }

    private boolean gueltig(int zeile, int spalte) {
        if (zeile < 0 || zeile >= zeilen || spalte < 0 || spalte >= spalten) {
            System.err.println("Ungueltiges Feld: " + zeile + " / " + spalte);
            return false;
        }
        return true;
    }

    // ------------------------------------------------------------------ Darstellung

    private double zelle, x0, y0;

    /** Wird von MainOverride nach dem Programm aufgerufen und beendet das Programm. */
    static void fertig() {
        CodeBlocks.exit(0);
    }

    private void aufbauen() {
        Vec2D groesse = Canvas.getSize();
        zelle = Math.floor(Math.min((groesse.x - 16) / spalten, (groesse.y - 16) / zeilen));
        x0 = Math.floor((groesse.x - zelle * spalten) / 2);
        y0 = Math.floor((groesse.y - zelle * zeilen) / 2);

        // ohne Tick-Modus: jedes gefüllte Feld wird sofort gezeichnet
        Canvas.clear();
        Canvas.setFillStyle("#1e2230");
        Canvas.fillRect(0, 0, groesse.x, groesse.y);
        Canvas.setFillStyle("#2d3345");
        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                feld(r, c);
            }
        }
    }

    private void feld(int r, int c) {
        double luecke = zelle >= 6 ? 1 : 0;
        Canvas.fillRect(x0 + c * zelle, y0 + r * zelle, zelle - luecke, zelle - luecke);
    }
}
