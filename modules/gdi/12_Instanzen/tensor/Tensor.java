//#START STATIC
public class Tensor {
//#START STUDENT
    // Attribute: die Werte (double[]) und die Form (int[])

    // Konstruktor

    public int[] getForm() {
        return null;
    }

    public double[] getDaten() {
        return null;
    }

    public double get(int z, int s) {
        return 0;
    }

    public static Tensor tensor2d(int[][] werte) {
        return null;
    }

    public Tensor reshape(int[] neueForm) {
        return null;
    }

    public Tensor div(double wert) {
        return null;
    }
//#START SOLUTION
    // Alle Werte zeilenweise hintereinander
    private final double[] daten;
    // Größe jeder Dimension, z. B. {10, 12} für 10 Zeilen und 12 Spalten
    private final int[] form;

    public Tensor(double[] daten, int[] form) {
        this.daten = daten;
        this.form = form;
    }

    public int[] getForm() {
        return this.form;
    }

    public double[] getDaten() {
        return this.daten;
    }

    // Wert in Zeile z und Spalte s eines zweidimensionalen Tensors
    public double get(int z, int s) {
        return this.daten[z * this.form[1] + s];
    }

    // Erzeugt aus einem 2D-Feld einen Tensor mit der Form {Zeilen, Spalten}
    public static Tensor tensor2d(int[][] werte) {
        int zeilen = werte.length;
        int spalten = werte[0].length;
        double[] daten = new double[zeilen * spalten];
        for (int z = 0; z < zeilen; z++) {
            for (int s = 0; s < spalten; s++) {
                daten[z * spalten + s] = werte[z][s];
            }
        }
        return new Tensor(daten, new int[] {zeilen, spalten});
    }

    // Gleiche Werte, neue Form. Passt die Anzahl nicht, wird null zurückgegeben.
    public Tensor reshape(int[] neueForm) {
        int anzahl = 1;
        for (int i = 0; i < neueForm.length; i++) {
            anzahl = anzahl * neueForm[i];
        }
        if (anzahl != this.daten.length) {
            System.out.println("reshape: " + this.daten.length + " Werte passen nicht in " + anzahl + " Plätze");
            return null;
        }
        // Die Werte ändern sich nicht, daher kann das Feld gemeinsam genutzt werden
        return new Tensor(this.daten, neueForm);
    }

    // Neuer Tensor, in dem jeder Wert durch wert geteilt ist. Der alte Tensor bleibt unverändert.
    public Tensor div(double wert) {
        double[] ergebnis = new double[this.daten.length];
        for (int i = 0; i < this.daten.length; i++) {
            ergebnis[i] = this.daten[i] / wert;
        }
        return new Tensor(ergebnis, this.form);
    }
//#START STATIC
}
