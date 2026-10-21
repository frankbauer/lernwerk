//#START STATIC
public class Bilderkennung {
    // Wandelt das Bild (Zeilen x Spalten, Helligkeit 0 bis 255) zeilenweise in ein
    // eindimensionales Feld mit Werten von 0.0 bis 1.0 um
    static double[] zuVektor(int[][] bild) {
//#START STUDENT
        return new double[0];
//#START SOLUTION
        int zeilen = bild.length;
        int spalten = bild[0].length;
        double[] vektor = new double[zeilen * spalten];
        for (int z = 0; z < zeilen; z++) {
            for (int s = 0; s < spalten; s++) {
                vektor[z * spalten + s] = bild[z][s] / 255.0;
            }
        }
        return vektor;
//#START STATIC
    }

    public static void main(String[] args) {
        int[][] bild = Bilderkennung.leseBild(args);
        Bilderkennung.zeigeBild(bild);

        double[] vektor = Bilderkennung.zuVektor(bild);
        Bilderkennung.erkenne(vektor);
    }
//#START API

    private static final int ZEILEN = 10;
    private static final int SPALTEN = 12;
    private static int[][] original;

    // Liest das gezeichnete Bild aus args[0] (Zeilen durch "/", Werte durch "," getrennt)
    private static int[][] leseBild(String[] args) {
        int[][] bild = new int[ZEILEN][SPALTEN];
        boolean ok = false;
        try {
            String[] zeilen = args[0].trim().split("/");
            for (int z = 0; z < ZEILEN; z++) {
                String[] werte = zeilen[z].split(",");
                for (int s = 0; s < SPALTEN; s++) {
                    bild[z][s] = Math.max(0, Math.min(255, Integer.parseInt(werte[s].trim())));
                }
            }
            ok = true;
        } catch (Exception e) {
        }
        if (!ok) {
            System.out.println("Kein gültiges Bild übergeben, es wird ein Beispielbild verwendet.");
            bild = new int[ZEILEN][SPALTEN];
            for (int s = 2; s < 11; s++) {
                bild[3][s] = 255;
                bild[2][s] = 100;
                bild[4][s] = 100;
            }
        }
        // Kopie für die Prüfung, falls zuVektor das Bild verändert
        original = new int[ZEILEN][SPALTEN];
        for (int z = 0; z < ZEILEN; z++) {
            original[z] = bild[z].clone();
        }
        return bild;
    }

    private static void zeigeBild(int[][] bild) {
        System.out.println("Bild (" + bild.length + " Zeilen x " + bild[0].length + " Spalten):");
        for (int z = 0; z < bild.length; z++) {
            String zeile = "  ";
            for (int s = 0; s < bild[z].length; s++) {
                int v = bild[z][s];
                zeile += v == 0 ? ". " : (v < 200 ? "+ " : "# ");
            }
            System.out.println(zeile);
        }
        System.out.println();
    }

    private static void erkenne(double[] vektor) {
        int n = ZEILEN * SPALTEN;
        if (vektor == null) {
            System.out.println("zuVektor gibt null zurück. Erzeugen Sie ein neues Feld mit new double[...].");
            vektor = new double[0];
        } else if (vektor.length != n) {
            System.out.println("Das Feld hat " + vektor.length + " Einträge. Erwartet werden Zeilen * Spalten = "
                    + ZEILEN + " * " + SPALTEN + " = " + n + " Einträge.");
        } else {
            pruefe(vektor);
        }

        String json = "{\"zeilen\":" + ZEILEN + ",\"spalten\":" + SPALTEN + ",\"vektor\":[";
        for (int i = 0; i < vektor.length; i++) {
            double v = vektor[i];
            if (Double.isNaN(v) || Double.isInfinite(v)) v = 0;
            json += (i > 0 ? "," : "") + v;
        }
        json += "]}";
        de.fau.tf.lgdv.CodeBlocks.postResult(json);
    }

    private static void pruefe(double[] vektor) {
        boolean zuGross = false;
        boolean ganzzahlig = true;
        boolean spaltenweise = true;
        int fehler = -1;
        for (int z = 0; z < ZEILEN; z++) {
            for (int s = 0; s < SPALTEN; s++) {
                double erwartet = original[z][s] / 255.0;
                double v = vektor[z * SPALTEN + s];
                if (v > 1.0 + 1e-9) zuGross = true;
                if (Math.abs(v - original[z][s] / 255) > 1e-9) ganzzahlig = false;
                if (Math.abs(vektor[s * ZEILEN + z] - erwartet) > 1e-9) spaltenweise = false;
                if (fehler < 0 && Math.abs(v - erwartet) > 1e-9) fehler = z * SPALTEN + s;
            }
        }
        if (fehler < 0) {
            System.out.println("Alle " + vektor.length + " Einträge stimmen.");
            return;
        }
        int z = fehler / SPALTEN;
        int s = fehler % SPALTEN;
        System.out.println("Eintrag " + fehler + " ist " + vektor[fehler] + ", erwartet wird bild[" + z + "][" + s
                + "] / 255.0 = " + (original[z][s] / 255.0) + ".");
        if (zuGross) {
            System.out.println("Hinweis: Einige Werte sind größer als 1.0. Die Helligkeit muss durch 255.0 geteilt werden.");
        } else if (ganzzahlig) {
            System.out.println("Hinweis: Es kommen nur 0.0 und 1.0 vor. Ist das eine Ganzzahldivision?");
        } else if (spaltenweise) {
            System.out.println("Hinweis: Das Bild wurde spaltenweise statt zeilenweise abgelegt.");
        } else {
            System.out.println("Hinweis: Prüfen Sie den Index. Wie viele Einträge liegen vor bild[z][s]?");
        }
    }
//#START STATIC
}
