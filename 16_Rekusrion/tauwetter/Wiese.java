class Wiese {
    // Inhalt der Felder (wie im Playground: . = 0, S = 1, T = 2, R = 3)
    private static final int SCHNEEMANN = 1;
    private static final int BAUM = 2;
    private static final int FELS = 3;
    private static final int GESCHMOLZEN = 4;

    private static final double SCHMELZDAUER = 1.4;
    private static final Color SCHMELZWASSER = new Color(90 / 255.0, 150 / 255.0, 200 / 255.0, 0.55);

    public final int zeilen;
    public final int spalten;
    private final int[][] felder;
    private int delayInMs = 60;

    // Darstellung mit der tileMap-Bibliothek (isometrische Karte)
    private final TileMap karte;
    private final MapSprite[][] sprites;

    Wiese(String[] args) {
        this.zeilen = Integer.parseInt(args[0]);
        this.spalten = Integer.parseInt(args[1]);
        this.felder = new int[zeilen][spalten];
        this.sprites = new MapSprite[zeilen][spalten];
        int p = 2;

        karte = new TileMap(Theme.VALLEY, spalten, zeilen, Projection.ISOMETRIC);
        karte.showCoordinates(true);
        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                felder[r][c] = Integer.parseInt(args[p++]);
                if (felder[r][c] == SCHNEEMANN) {
                    sprites[r][c] = new MapSprite(karte, SpriteType.SNOWMAN, c, r, (r * 7 + c * 3) % 5);
                } else if (felder[r][c] == BAUM) {
                    sprites[r][c] = new MapSprite(karte, SpriteType.TREES, c, r);
                } else if (felder[r][c] == FELS) {
                    sprites[r][c] = new MapSprite(karte, SpriteType.STONES, c, r);
                }
            }
        }
    }

    public void setDelay(int delayInMs) {
        this.delayInMs = Math.max(delayInMs, 1);
    }

    private boolean gueltig(int zeile, int spalte) {
        if (zeile < 0 || zeile >= zeilen || spalte < 0 || spalte >= spalten) {
            System.err.println("Ungueltige Position: " + zeile + " / " + spalte);
            return false;
        }
        return true;
    }

    public boolean istSchneemann(int zeile, int spalte) {
        if (!gueltig(zeile, spalte)) {
            return false;
        }
        // Prüfungen leuchten kurz auf
        karte.flashCell(spalte, zeile);
        warten(delayInMs);
        return felder[zeile][spalte] == SCHNEEMANN;
    }

    public void schmelzen(int zeile, int spalte) {
        if (!gueltig(zeile, spalte)) {
            return;
        }
        if (felder[zeile][spalte] != SCHNEEMANN) {
            System.err.println("Auf " + zeile + " / " + spalte + " steht kein Schneemann.");
            return;
        }
        felder[zeile][spalte] = GESCHMOLZEN;
        sprites[zeile][spalte].play(Animation.MELT);
        // Schmelzwasser breitet sich aus
        karte.tintCell(spalte, zeile, SCHMELZWASSER, SCHMELZDAUER);
        warten(delayInMs);
    }

    public void sonnenstrahl(int zeile, int spalte) {
        if (!gueltig(zeile, spalte)) {
            return;
        }
        karte.sunRay(spalte, zeile);
        warten(Math.max(700, delayInMs));
    }

    public int anzahlSchneemaenner() {
        int anzahl = 0;
        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                if (felder[r][c] == SCHNEEMANN) {
                    anzahl++;
                }
            }
        }
        return anzahl;
    }

    // Die Animationen laufen im Browser weiter, während das Programm hier wartet
    private static void warten(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            // nichts zu tun
        }
    }

    /** Wird von MainOverride nach dem Programm aufgerufen: lässt die Animationen auslaufen und beendet das Programm. */
    static void fertig() {
        warten(2200);
        CodeBlocks.exit(0);
    }
}
