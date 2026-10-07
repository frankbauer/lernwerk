class Tuerme {
    public final int scheiben;
    // stab[s][i]: Größe der i-ten Scheibe von unten auf Stab s, hoehe[s]: Anzahl der Scheiben
    private final int[][] stab;
    private final int[] hoehe = new int[3];
    private int zuege = 0;
    private int delayInMs = 500;

    Tuerme(int scheiben) {
        this.scheiben = Math.max(1, Math.min(scheiben, 10));
        if (scheiben != this.scheiben) {
            System.err.println("Es sind 1 bis 10 Scheiben moeglich.");
        }
        this.stab = new int[3][this.scheiben];
        for (int i = 0; i < this.scheiben; i++) {
            stab[0][i] = this.scheiben - i;
        }
        hoehe[0] = this.scheiben;
        aufbauen();
    }

    public void setDelay(int delayInMs) {
        this.delayInMs = Math.max(delayInMs, 1);
    }

    private boolean gueltig(int s) {
        if (s < 0 || s > 2) {
            System.err.println("Unbekannter Stab: " + s + " (erlaubt sind 0, 1 und 2)");
            return false;
        }
        return true;
    }

    public void bewege(int von, int nach) {
        if (!gueltig(von) || !gueltig(nach)) {
            return;
        }
        if (hoehe[von] == 0) {
            System.err.println("Auf Stab " + von + " liegt keine Scheibe.");
            fehler(von);
            return;
        }
        int scheibe = stab[von][hoehe[von] - 1];
        if (hoehe[nach] > 0 && stab[nach][hoehe[nach] - 1] < scheibe) {
            System.err.println("Scheibe " + scheibe + " darf nicht auf die kleinere Scheibe "
                    + stab[nach][hoehe[nach] - 1] + " gelegt werden.");
            fehler(von);
            return;
        }
        zuege++;
        System.out.println("Scheibe " + scheibe + ": " + von + " -> " + nach);

        // die Scheibe anheben, hinüberschieben und absenken (gezeichnet vom Tick-Listener)
        hoehe[von]--;
        bewegt = scheibe;
        bewegtVon = von;
        bewegtNach = nach;
        zugStart = zeit;
        warten(delayInMs);
        bewegt = 0;
        stab[nach][hoehe[nach]++] = scheibe;
    }

    public int anzahlZuege() {
        return zuege;
    }

    public int anzahlScheiben(int s) {
        return gueltig(s) ? hoehe[s] : 0;
    }

    public int obersteScheibe(int s) {
        return !gueltig(s) || hoehe[s] == 0 ? 0 : stab[s][hoehe[s] - 1];
    }

    public boolean istFertig() {
        return hoehe[2] == scheiben;
    }

    private void fehler(int s) {
        fehlerStab = s;
        fehlerZeit = zeit;
        warten(delayInMs);
    }

    private static void warten(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            // nichts zu tun
        }
    }

    // ------------------------------------------------------------------ Darstellung

    private static final String[] FARBEN = { "#e05555", "#e8913a", "#e8c43a", "#8cc63f", "#3fb98c",
            "#3fa7c6", "#4f6fd8", "#8a5cd8", "#c65cc0", "#d85c8a" };

    private Vec2D groesse;
    private double zeit = 0, zugStart, fehlerZeit = -10;
    private int bewegt = 0, bewegtVon, bewegtNach, fehlerStab = -1;
    private double scheibenHoehe, basis;

    /** Wird von MainOverride nach dem Programm aufgerufen und beendet das Programm. */
    static void fertig() {
        warten(600);
        Canvas.disableTicks();
        CodeBlocks.exit(0);
    }

    private void aufbauen() {
        groesse = Canvas.getSize();
        basis = groesse.y - 46;
        scheibenHoehe = Math.min(26, Math.floor((basis - 70) / (scheiben + 1)));

        // die Türme werden bei jedem Tick neu gezeichnet, auch während das Programm in warten() steht
        Canvas.setTickMode(true);
        zeichnen();
        Canvas.addTickEventListener((time, delta) -> {
            zeit = time;
            zeichnen();
        });
        Canvas.enableTicks();
    }

    private double stabX(int s) {
        return groesse.x * (1 + 2 * s) / 6.0;
    }

    private double breite(int scheibe) {
        double max = groesse.x / 3 - 48, min = Math.max(24, max * 0.3);
        return scheiben == 1 ? max : min + (max - min) * (scheibe - 1) / (scheiben - 1);
    }

    private void scheibe(int nr, double mitteX, double untenY) {
        double b = breite(nr), h = scheibenHoehe - 2;
        double x = Math.round(mitteX - b / 2), y = Math.round(untenY - h);
        Canvas.setFillStyle("#1e2230");
        Canvas.fillRect(x - 2, y - 2, b + 4, h + 4);
        Canvas.setFillStyle(FARBEN[(nr - 1) % FARBEN.length]);
        Canvas.fillRect(x, y, b, h);
        Canvas.setFillStyle("rgba(255,255,255,0.35)");
        Canvas.fillRect(x + 2, y + 2, b - 4, Math.max(2, h / 5));
        Canvas.setFillStyle("rgba(0,0,0,0.25)");
        Canvas.fillRect(x + 2, y + h - Math.max(2, h / 5), b - 4, Math.max(2, h / 5));
    }

    private void zeichnen() {
        Canvas.clear();
        Canvas.setFillStyle("#26304a");
        Canvas.fillRect(0, 0, groesse.x, groesse.y);

        // Boden und Stäbe
        Canvas.setFillStyle("#6b4a2b");
        Canvas.fillRect(16, basis, groesse.x - 32, 10);
        double stabHoehe = (scheiben + 1) * scheibenHoehe + 10;
        for (int s = 0; s < 3; s++) {
            boolean rot = s == fehlerStab && zeit - fehlerZeit < delayInMs / 1000.0 * 0.8;
            Canvas.setFillStyle(rot ? "#e05555" : "#8a6238");
            Canvas.fillRect(Math.round(stabX(s)) - 4, basis - stabHoehe, 8, stabHoehe);
            Canvas.setFillStyle("rgba(255,255,255,0.8)");
            Canvas.setFont("bold 16px sans-serif");
            Canvas.setTextAlign("center");
            Canvas.fillText("" + s, stabX(s), basis + 30);
        }

        // liegende Scheiben
        for (int s = 0; s < 3; s++) {
            for (int i = 0; i < hoehe[s]; i++) {
                scheibe(stab[s][i], stabX(s), basis - i * scheibenHoehe);
            }
        }

        // die bewegte Scheibe: anheben, hinüberschieben, absenken
        if (bewegt > 0) {
            double p = Math.max(0, Math.min(1, (zeit - zugStart) / (delayInMs / 1000.0 * 0.9)));
            double oben = basis - stabHoehe - 12;
            double yStart = basis - hoehe[bewegtVon] * scheibenHoehe;
            double yZiel = basis - hoehe[bewegtNach] * scheibenHoehe;
            double x, y;
            if (p < 0.3) {
                x = stabX(bewegtVon);
                y = yStart + (oben - yStart) * (p / 0.3);
            } else if (p < 0.7) {
                double q = (p - 0.3) / 0.4;
                x = stabX(bewegtVon) + (stabX(bewegtNach) - stabX(bewegtVon)) * q;
                y = oben;
            } else {
                x = stabX(bewegtNach);
                y = oben + (yZiel - oben) * ((p - 0.7) / 0.3);
            }
            scheibe(bewegt, x, y);
        }

        Canvas.setFillStyle("rgba(255,255,255,0.8)");
        Canvas.setFont("14px sans-serif");
        Canvas.setTextAlign("left");
        Canvas.fillText("Zug " + zuege, 16, 24);
    }
}
