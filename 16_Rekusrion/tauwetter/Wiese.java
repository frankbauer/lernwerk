class Wiese {
    // Inhalt der Felder (wie im Playground: . = 0, S = 1, T = 2, R = 3)
    private static final int SCHNEEMANN = 1;
    private static final int BAUM = 2;
    private static final int FELS = 3;
    private static final int GESCHMOLZEN = 4;

    private static final String BILDER = "../../common/scene/schnee/img/";
    private static final int FRAMES = 30;
    private static final double SCHMELZDAUER = 1.4;

    private static Wiese aktuelleWiese;

    public final int zeilen;
    public final int spalten;
    private final int[][] felder;
    private final int[][] start;
    private int delayInMs = 60;

    Wiese(String[] args) {
        this.zeilen = Integer.parseInt(args[0]);
        this.spalten = Integer.parseInt(args[1]);
        this.felder = new int[zeilen][spalten];
        this.start = new int[zeilen][spalten];
        int p = 2;

        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                felder[r][c] = Integer.parseInt(args[p++]);
                start[r][c] = felder[r][c];
            }
        }
        aktuelleWiese = this;
        aufbauen();
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
        testZeit[zeile][spalte] = zeit;
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
        schmelzZeit[zeile][spalte] = zeit;
        sprites[zeile][spalte].play();
        warten(delayInMs);
    }

    public void sonnenstrahl(int zeile, int spalte) {
        sonneR = zeile;
        sonneC = spalte;
        sonneZeit = zeit;
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

    // Während des Wartens zeichnet der Tick-Listener die Wiese neu
    private static void warten(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            // nichts zu tun
        }
    }

    // ------------------------------------------------------------------ Darstellung

    private Vec2D groesse;
    private double s, tw, th, ox, oy;
    private Sprite[][] sprites;
    private double[][] testZeit, schmelzZeit;
    private int sonneR = -1, sonneC = -1;
    private double sonneZeit;
    private double zeit = 0;

    /** Wird von MainOverride nach dem Programm aufgerufen: lässt die Animationen auslaufen und beendet das Programm. */
    static void fertig() {
        warten(2200);
        Canvas.disableTicks();
        CodeBlocks.exit(0);
    }

    private void aufbauen() {
        groesse = Canvas.getSize();
        s = Math.min((groesse.x - 40) / ((zeilen + spalten) * 45), (groesse.y - 50) / ((zeilen + spalten) * 22.5 + 30));
        tw = 90 * s;
        th = 45 * s;
        ox = groesse.x / 2 + (zeilen - spalten) * tw / 4;
        oy = (groesse.y - (zeilen + spalten) * th / 2) / 2 + 12 * s;

        testZeit = new double[zeilen][spalten];
        schmelzZeit = new double[zeilen][spalten];

        Image schneemann = new Image(BILDER + "schneemann.webp");
        Image deko = new Image(BILDER + "deko.webp");
        sprites = new Sprite[zeilen][spalten];
        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                testZeit[r][c] = -10;
                schmelzZeit[r][c] = -1;
                Sprite sp = null;
                if (start[r][c] == SCHNEEMANN) {
                    int variante = (r * 7 + c * 3) % 5;
                    sp = new Sprite(schneemann, 90, 53, variante * FRAMES, FRAMES, FRAMES / SCHMELZDAUER, false);
                    sp.show(mitte(r, c), s, new Vec2D(45 / 90.0, 31 / 53.0));
                } else if (start[r][c] == BAUM || start[r][c] == FELS) {
                    int bild = (start[r][c] == BAUM ? 0 : 3) + (r * 5 + c * 11) % 3;
                    sp = new Sprite(deko, 90, 59, bild, 1, 1, false);
                    sp.show(mitte(r, c), s, new Vec2D(46 / 90.0, 33 / 59.0));
                }
                if (sp != null) {
                    sp.setDepth(r + c);
                }
                sprites[r][c] = sp;
            }
        }

        // die Wiese wird bei jedem Tick neu gezeichnet, auch während das Programm in warten() steht
        Canvas.setTickMode(true);
        zeichnen(0);
        Canvas.addTickEventListener((time, delta) -> {
            zeit = time;
            zeichnen(time);
        });
        Canvas.enableTicks();
    }

    private Vec2D mitte(double r, double c) {
        return new Vec2D(ox + (c - r) * tw / 2, oy + (c + r) * th / 2 + th / 2);
    }

    private void raute(Vec2D m, double rand) {
        Canvas.beginPath();
        Canvas.moveTo(m.x, m.y - th / 2 + rand);
        Canvas.lineTo(m.x + tw / 2 - 2 * rand, m.y);
        Canvas.lineTo(m.x, m.y + th / 2 - rand);
        Canvas.lineTo(m.x - tw / 2 + 2 * rand, m.y);
        Canvas.closePath();
    }

    private static String rgba(int r, int g, int b, double a) {
        return "rgba(" + r + "," + g + "," + b + "," + Math.max(0, Math.min(1, a)) + ")";
    }

    private void zeichnen(double zeit) {
        Canvas.clear();
        Canvas.setFillStyle("#2b3a4a");
        Canvas.fillRect(0, 0, groesse.x, groesse.y);
        Canvas.setLineWidth(1);

        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                Vec2D m = mitte(r, c);
                raute(m, 0);
                Canvas.setFillStyle((r + c) % 2 == 1 ? "#7fb24a" : "#74a843");
                Canvas.fill();
                Canvas.setStrokeStyle("rgba(40,70,30,0.35)");
                Canvas.stroke();
                if (schmelzZeit[r][c] >= 0) {
                    // Schmelzwasser breitet sich aus
                    raute(m, th * 0.18);
                    Canvas.setFillStyle(rgba(90, 150, 200, 0.55 * (zeit - schmelzZeit[r][c]) / SCHMELZDAUER));
                    Canvas.fill();
                }
            }
        }

        // Koordinaten am Rand
        Canvas.setFillStyle("rgba(255,255,255,0.55)");
        Canvas.setFont(Math.max(9, Math.round(11 * s)) + "px sans-serif");
        Canvas.setTextAlign("center");
        for (int r = 0; r < zeilen; r++) {
            Vec2D m = mitte(r, -0.8);
            Canvas.fillText("" + r, m.x, m.y + 4);
        }
        for (int c = 0; c < spalten; c++) {
            Vec2D m = mitte(-0.8, c);
            Canvas.fillText("" + c, m.x, m.y + 4);
        }

        // Prüfungen (istSchneemann) als kurz aufleuchtender Rahmen
        Canvas.setLineWidth(2.5);
        for (int r = 0; r < zeilen; r++) {
            for (int c = 0; c < spalten; c++) {
                double a = 1 - (zeit - testZeit[r][c]) / 0.6;
                if (a > 0) {
                    raute(mitte(r, c), 1.5);
                    Canvas.setStrokeStyle(rgba(255, 225, 60, a));
                    Canvas.stroke();
                }
            }
        }

        // Sonnenstrahl
        if (sonneR >= 0) {
            double a = 1 - (zeit - sonneZeit) / 2.2;
            if (a > 0) {
                Vec2D m = mitte(sonneR, sonneC);
                double oben = 16 * s;
                Canvas.setFillStyle(rgba(255, 230, 120, 0.35 * a));
                Canvas.beginPath();
                Canvas.moveTo(m.x - 6 * s, oben);
                Canvas.lineTo(m.x + 6 * s, oben);
                Canvas.lineTo(m.x + tw / 3, m.y);
                Canvas.lineTo(m.x - tw / 3, m.y);
                Canvas.closePath();
                Canvas.fill();
                raute(m, 0);
                Canvas.setFillStyle(rgba(255, 235, 140, 0.45 * a));
                Canvas.fill();

                double rad = 9 * s;
                Canvas.setStrokeStyle(rgba(255, 176, 0, a));
                Canvas.setLineWidth(Math.max(1, rad / 5));
                for (int i = 0; i < 8; i++) {
                    double w = i * Math.PI / 4;
                    Canvas.line(m.x + Math.cos(w) * rad * 1.3, oben + Math.sin(w) * rad * 1.3,
                            m.x + Math.cos(w) * rad * 1.8, oben + Math.sin(w) * rad * 1.8);
                }
                Canvas.setFillStyle(rgba(255, 210, 63, a));
                Canvas.circle(m.x, oben, rad, true);
            }
        }
    }
}
