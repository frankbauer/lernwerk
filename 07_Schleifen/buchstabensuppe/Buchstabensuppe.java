public class Buchstabensuppe {
    public static void main(String[] args) {
        for (int a = 0; a < 12; a++) {
            System.out.print("A");
        }
        System.out.println();

        for (int b = 12; b >= 0; b--) {
            System.out.print("B");
        }
        System.out.println();

        for (double c = 0.5; c < 5; c += 0.2) {
            System.out.print("C");
        }
        System.out.println();

        for (int d = 65; d > 0; d /= 2) {
            System.out.print("D");
        }
        System.out.println();

        for (int e = 1000;; e *= 2) {
            System.out.print("E");
            if (e > 2000) { break; }
        }
        System.out.println();

        for (byte f = 110; f > -117; f += 10) {
            System.out.print("F");
        }
        System.out.println();

        int g = 0;
        while (g < 20) {
            System.out.print("G");
            if (g % 11 == 0) break;
            g++;
        }
        System.out.println();

        int h = 0;
        while (h < 20) {
            h += 1;

            if (h % 2 == 0) continue;
            System.out.print("H");
        }
        System.out.println();
    }
}
