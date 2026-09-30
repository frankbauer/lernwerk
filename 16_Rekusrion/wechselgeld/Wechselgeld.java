//#START STATIC
public class Wechselgeld {
    public static int arten(int betrag, int[] muenzen, int index) {
//#START STUDENT
        /* Hier könnte Ihr Code stehen */
        return 0;
//#START SOLUTION
        // Abbruchfall 1: der Betrag ist genau bezahlt, das ist eine gültige Art
        if (betrag == 0) {
            return 1;
        }
        // Abbruchfall 2: zu viel bezahlt oder keine Münzen mehr übrig
        if (betrag < 0 || index >= muenzen.length) {
            return 0;
        }
        // Kaskade: Entweder wird die Münze muenzen[index] (noch einmal) verwendet ...
        int mitMuenze = arten(betrag - muenzen[index], muenzen, index);
        // ... oder sie wird ab jetzt gar nicht mehr verwendet
        int ohneMuenze = arten(betrag, muenzen, index + 1);
        return mitMuenze + ohneMuenze;
//#START STATIC
    }

    public static void main(String[] args) {
        int[] muenzen = { 50, 20, 10, 5, 2, 1 };

        System.out.println(" 5 Cent: " + arten(5, muenzen, 0) + " Arten");
        System.out.println("10 Cent: " + arten(10, muenzen, 0) + " Arten");
        System.out.println("20 Cent: " + arten(20, muenzen, 0) + " Arten");
        System.out.println("50 Cent: " + arten(50, muenzen, 0) + " Arten");
    }
}
