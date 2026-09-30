//#START STATIC
public class Tauwetter {
    public static int tauen(Wiese wiese, int zeile, int spalte) {
//#START STUDENT
        /* Hier könnte Ihr Code stehen */
        return 0;
//#START SOLUTION
        // Abbruchfall 1: Die Position liegt außerhalb der Wiese
        if (zeile < 0 || zeile >= wiese.zeilen || spalte < 0 || spalte >= wiese.spalten) {
            return 0;
        }
        // Abbruchfall 2: Hier steht (noch oder überhaupt) kein Schneemann
        if (!wiese.istSchneemann(zeile, spalte)) {
            return 0;
        }

        // Zuerst schmelzen, sonst würden sich die Nachbarn gegenseitig endlos aufrufen
        wiese.schmelzen(zeile, spalte);

        // Kaskade: Dieser Schneemann plus alle, die über die vier Nachbarn geschmolzen werden
        return 1
                + tauen(wiese, zeile - 1, spalte)
                + tauen(wiese, zeile + 1, spalte)
                + tauen(wiese, zeile, spalte - 1)
                + tauen(wiese, zeile, spalte + 1);
//#START STATIC
    }

    public static void main(String[] args) {
        Wiese wiese = new Wiese(args);

        wiese.sonnenstrahl(1, 2);
        System.out.println("Sonnenstrahl auf 1 / 2: " + tauen(wiese, 1, 2) + " geschmolzen");

        wiese.sonnenstrahl(3, 3);
        System.out.println("Sonnenstrahl auf 3 / 3: " + tauen(wiese, 3, 3) + " geschmolzen");

        wiese.sonnenstrahl(5, 9);
        System.out.println("Sonnenstrahl auf 5 / 9: " + tauen(wiese, 5, 9) + " geschmolzen");

        System.out.println("Es stehen noch " + wiese.anzahlSchneemaenner() + " Schneemaenner.");
    }
}
