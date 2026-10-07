//#START STATIC
public class Kunst {
    private static int berechneStartZahl(int n) {
//#START STUDENT
        return 0;
//#START SOLUTION
        // eine Hälfte enthält 1 + 2 + ... + n Zahlen,
        // die schmalste Zeile gehört zu beiden Hälften
        int zahl = 0;
        for (int i = 0; i < n; i++) {
            zahl += (i + 1);
        }
        zahl = zahl * 2 - 1;
        return zahl;
//#START STATIC
    }

    public static void zeichneSanduhr(int n) {
        int zahl = Kunst.berechneStartZahl(n);
//#START STUDENT

//#START SOLUTION
        // obere Hälfte: n Zeilen, jede um eine Zahl schmaler
        for (int row = 0; row < n; row++) {
            for (int offset = 0; offset < row; offset++) {
                System.out.print(" ");
            }
            for (int i = 0; i < n - row; i++) {
                System.out.print(zahl + " ");
                zahl -= 1;
            }
            System.out.println();
        }

        // untere Hälfte: n - 1 Zeilen, jede um eine Zahl breiter
        for (int row = 1; row < n; row++) {
            for (int offset = 0; offset < n - row - 1; offset++) {
                System.out.print(" ");
            }
            for (int i = 0; i <= row; i++) {
                System.out.print(zahl + " ");
                zahl -= 1;
            }
            System.out.println();
        }
//#START STATIC
    }

    public static void main(String[] args) {
        Kunst.zeichneSanduhr(2);
        System.out.println("--------------------------");
        Kunst.zeichneSanduhr(3);
        System.out.println("--------------------------");
        Kunst.zeichneSanduhr(5);
        System.out.println("--------------------------");
    }
}
