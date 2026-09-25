//#START STATIC
public class Factors {
    public static void main(String[] args) {
        final int x = 1 + (int)(Math.random() * 1000);
        System.out.println("Die Zahl " + x + " ist:");
//#START STUDENT

//#START SOLUTION
        if (x % 2 == 0) {
            System.out.println("  - gerade");
        }
        if (x % 3 == 0) {
            System.out.println("  - durch 3 teilbar");
        }
        if (x % 5 == 0) {
            System.out.println("  - durch 5 teilbar");
        }

        // Keine der drei Bedingungen trifft zu
        if (x % 2 != 0 && x % 3 != 0 && x % 5 != 0) {
            System.out.println("  - Unbekannt");
        }
//#START STATIC
        System.out.println("");
    }
}
