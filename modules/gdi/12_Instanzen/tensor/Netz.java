class Netz {
    // Testet die Klasse Tensor, liest das gezeichnete Bild und schickt die Eingabe an den Playground

    private static final int ZEILEN = 10;
    private static final int SPALTEN = 12;
    private static int[][] original;
    private static boolean bestanden;

    // ---------- Tests ----------

    static boolean teste() {
        bestanden = true;
        int[][] bild = {{0, 51, 102}, {153, 204, 255}};
        System.out.println("Tests mit bild = {{0, 51, 102}, {153, 204, 255}}");

        Tensor t = null;
        try {
            t = Tensor.tensor2d(bild);
            if (t == null) {
                fehler("tensor2d(bild) liefert null. Erzeugen Sie mit new Tensor(...) ein neues Objekt.");
            } else {
                pruefe("tensor2d(bild).getForm()", t.getForm(), new int[] {2, 3});
                pruefe("tensor2d(bild).getDaten()", t.getDaten(), new double[] {0, 51, 102, 153, 204, 255});
            }
        } catch (Exception e) {
            fehler("tensor2d(bild)", e);
        }
        if (t == null) {
            return ende();
        }

        try {
            pruefe("get(0, 2)", t.get(0, 2), 102);
            pruefe("get(1, 0)", t.get(1, 0), 153);
        } catch (Exception e) {
            fehler("get", e);
        }

        try {
            Tensor r = t.reshape(new int[] {3, 2});
            if (r == null) {
                fehler("reshape({3, 2}) liefert null, obwohl 6 Werte in 3 x 2 Plätze passen.");
            } else {
                pruefe("reshape({3, 2}).getForm()", r.getForm(), new int[] {3, 2});
                pruefe("reshape({3, 2}).getDaten()", r.getDaten(), new double[] {0, 51, 102, 153, 204, 255});
                pruefe("reshape({3, 2}).get(1, 0)", r.get(1, 0), 102);
                pruefe("Form des ursprünglichen Tensors", t.getForm(), new int[] {2, 3});
            }
        } catch (Exception e) {
            fehler("reshape({3, 2})", e);
        }

        try {
            Tensor r = t.reshape(new int[] {4, 2});
            if (r != null) {
                fehler("reshape({4, 2}) muss null liefern: 6 Werte passen nicht in 4 x 2 = 8 Plätze.");
            } else {
                ok("reshape({4, 2}) = null");
            }
        } catch (Exception e) {
            fehler("reshape({4, 2})", e);
        }

        try {
            Tensor d = t.div(255);
            if (d == null) {
                fehler("div(255) liefert null. Erzeugen Sie einen neuen Tensor.");
            } else {
                pruefe("div(255).getForm()", d.getForm(), new int[] {2, 3});
                pruefe("div(255).getDaten()", d.getDaten(), new double[] {0, 0.2, 0.4, 0.6, 0.8, 1});
                pruefe("Daten des ursprünglichen Tensors", t.getDaten(), new double[] {0, 51, 102, 153, 204, 255});
            }
        } catch (Exception e) {
            fehler("div(255)", e);
        }
        return ende();
    }

    private static boolean ende() {
        System.out.println();
        if (bestanden) {
            System.out.println("Alle Tests bestanden. Das gezeichnete Bild wird jetzt erkannt.");
            System.out.println();
        } else {
            System.out.println("Erst wenn alle Tests bestanden sind, wird das gezeichnete Bild erkannt.");
            sende(new double[0], null, "Erst wenn alle Tests bestanden sind, wird das Bild erkannt.");
        }
        return bestanden;
    }

    private static void ok(String text) {
        System.out.println("  ok      " + text);
    }

    private static void fehler(String text) {
        bestanden = false;
        System.out.println("  FEHLER  " + text);
    }

    private static void fehler(String text, Exception e) {
        fehler(text + " wirft " + e);
    }

    private static void pruefe(String text, double ist, double soll) {
        if (Math.abs(ist - soll) < 1e-9) ok(text + " = " + ist);
        else fehler(text + " ist " + ist + ", erwartet wird " + soll);
    }

    private static void pruefe(String text, int[] ist, int[] soll) {
        if (java.util.Arrays.equals(ist, soll)) ok(text + " = " + text(ist));
        else fehler(text + " ist " + text(ist) + ", erwartet wird " + text(soll));
    }

    private static void pruefe(String text, double[] ist, double[] soll) {
        boolean gleich = ist != null && ist.length == soll.length;
        for (int i = 0; gleich && i < soll.length; i++) {
            gleich = Math.abs(ist[i] - soll[i]) < 1e-9;
        }
        if (gleich) ok(text + " = " + text(ist));
        else fehler(text + " ist " + text(ist) + ", erwartet wird " + text(soll));
    }

    private static String text(int[] a) {
        return a == null ? "null" : java.util.Arrays.toString(a).replace('[', '{').replace(']', '}');
    }

    private static String text(double[] a) {
        if (a == null) return "null";
        String s = "{";
        for (int i = 0; i < a.length; i++) {
            s += (i > 0 ? ", " : "") + Math.round(a[i] * 1000) / 1000.0;
        }
        return s + "}";
    }

    // ---------- Bild und Erkennung ----------

    // Liest das gezeichnete Bild aus args[0] (Zeilen durch "/", Werte durch "," getrennt)
    static int[][] leseBild(String[] args) {
        int[][] bild = new int[ZEILEN][SPALTEN];
        boolean gelesen = false;
        try {
            String[] zeilen = args[0].trim().split("/");
            for (int z = 0; z < ZEILEN; z++) {
                String[] werte = zeilen[z].split(",");
                for (int s = 0; s < SPALTEN; s++) {
                    bild[z][s] = Math.max(0, Math.min(255, Integer.parseInt(werte[s].trim())));
                }
            }
            gelesen = true;
        } catch (Exception e) {
        }
        if (!gelesen) {
            System.out.println("Kein gültiges Bild übergeben, es wird ein Beispielbild verwendet.");
            bild = new int[ZEILEN][SPALTEN];
            for (int s = 2; s < 11; s++) {
                bild[3][s] = 255;
                bild[2][s] = 100;
                bild[4][s] = 100;
            }
        }
        original = new int[ZEILEN][SPALTEN];
        for (int z = 0; z < ZEILEN; z++) {
            original[z] = bild[z].clone();
        }
        return bild;
    }

    static void erkenne(Tensor eingabe) {
        if (eingabe == null || eingabe.getDaten() == null) {
            System.out.println("Die Eingabe ist null.");
            sende(new double[0], null, null);
            return;
        }
        double[] daten = eingabe.getDaten();
        int[] form = eingabe.getForm();
        System.out.println("Eingabe für das Netz: Form " + text(form) + ", " + daten.length + " Werte");
        int n = ZEILEN * SPALTEN;
        if (!java.util.Arrays.equals(form, new int[] {1, n})) {
            System.out.println("Das Netz erwartet die Form {1, " + n + "}.");
        }
        int falsch = 0;
        for (int i = 0; i < Math.min(n, daten.length); i++) {
            if (Math.abs(daten[i] - original[i / SPALTEN][i % SPALTEN] / 255.0) > 1e-9) falsch++;
        }
        if (falsch > 0) {
            System.out.println(falsch + " Werte weichen von bild[z][s] / 255.0 ab.");
        }
        sende(daten, form, null);
    }

    private static void sende(double[] daten, int[] form, String meldung) {
        String json = "{\"zeilen\":" + ZEILEN + ",\"spalten\":" + SPALTEN;
        if (form != null) {
            json += ",\"form\":" + java.util.Arrays.toString(form);
        }
        if (meldung != null) {
            json += ",\"meldung\":\"" + meldung + "\"";
        }
        json += ",\"vektor\":[";
        for (int i = 0; i < daten.length; i++) {
            double v = daten[i];
            if (Double.isNaN(v) || Double.isInfinite(v)) v = 0;
            json += (i > 0 ? "," : "") + v;
        }
        json += "]}";
        de.fau.tf.lgdv.CodeBlocks.postResult(json);
    }
}
