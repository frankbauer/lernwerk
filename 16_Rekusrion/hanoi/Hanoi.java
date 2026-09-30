//#START STATIC
public class Hanoi {
    public static void hanoi(Tuerme tuerme, int n, int von, int nach, int hilf) {
//#START STUDENT
        /* Hier könnte Ihr Code stehen */
//#START SOLUTION
        // Abbruchfall: kein Turm, nichts zu tun
        if (n == 0) {
            return;
        }
        // 1. die oberen n - 1 Scheiben auf den Hilfsstab legen
        hanoi(tuerme, n - 1, von, hilf, nach);
        // 2. die größte Scheibe auf den Zielstab legen
        tuerme.bewege(von, nach);
        // 3. die n - 1 Scheiben vom Hilfsstab auf die größte Scheibe legen
        hanoi(tuerme, n - 1, hilf, nach, von);
//#START STATIC
    }

    public static void main(String[] args) {
        Tuerme tuerme = new Tuerme(4);
        hanoi(tuerme, 4, 0, 2, 1);
        System.out.println("Zuege: " + tuerme.anzahlZuege());
        System.out.println("Alle Scheiben auf Stab 2: " + tuerme.istFertig());
    }
}
