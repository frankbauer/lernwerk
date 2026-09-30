//#START STATIC
public class PrimeSum {
    public static void main(String[] args) {
        final int limit = Input.getLimit(args);
//#START STUDENT

//#START SOLUTION
        // Akkumulatoren: Summe, Anzahl und zuletzt addierte Primzahl
        int sum = 0;
        int count = 0;
        int last = 0;
        // Nächster Kandidat, der geprüft wird
        int candidate = 2;
        // Weiter, solange der Kandidat die Summe nicht auf limit oder mehr bringen würde
        while (sum + candidate < limit) {
            if (Prim.isPrim(candidate)) {
                sum += candidate;
                count++;
                last = candidate;
            }
            candidate++;
        }
//#START STATIC
        System.out.println("Summe: " + sum + " (" + count + " Primzahlen, die letzte ist " + last + ")");
    }
}
//#START API
class Input {
    protected static int getLimit(String[] args) {
        try {
            return Integer.parseInt(args[0].trim());
        } catch (Exception e) {
            return 100;
        }
    }
}

class Prim {
    protected static boolean isPrim(int n) {
        if (n < 2) {
            return false;
        }
        for (int t = 2; t * t <= n; t++) {
            if (n % t == 0) {
                return false;
            }
        }
        return true;
    }
}
