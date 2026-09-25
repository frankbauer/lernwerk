public class Ausgaben {
    public static void main(String[] args) {
        System.out.print("a) ");
        {
            long k = 17; double n = 48.3;
            System.out.print(k >= n);              // Ausgabe: false
        }
        System.out.println();
        System.out.print("b) ");
        {
            int p = 4; int z = 88;
            System.out.print("Erg : " +(p+ z));    // Ausgabe: Erg : 92
        }
        System.out.println();
        System.out.print("c) ");
        {
            int s = -8; float p = 36.3f;
            System.out.print(s + "= p");           // Ausgabe: -8= p
        }
        System.out.println();
        System.out.print("d) ");
        {
            long j = 31;
            System.out.print(j);                   // Ausgabe: 31
        }
        System.out.println();
        System.out.print("e) ");
        {
            double y = 71.9; double k = 25;
            System.out.print("k");                 // Ausgabe: k
        }
        System.out.println();
        System.out.print("f) ");
        {
            byte z = -18;
            if (-20 - z == z - z) {
                System.out.print("passed");        // nicht ausgeführt
            } else {
                System.out.print("been");          // Ausgabe: been
            }
        }
        System.out.println();
        System.out.print("g) ");
        {
            int h = 0;
            System.out.print(h+" ");               // Ausgabe: "0 " (mit Leerzeichen)
            h = h / 8 * ("you".length() - h);
            System.out.print(h);                   // Ausgabe: 0, zusammen: 0 0
        }
        System.out.println();
        System.out.print("h) ");
        {
            short u = 13;
            System.out.print(u / u + "the" + u);   // Ausgabe: 1the13
        }
        System.out.println();
    }
}
