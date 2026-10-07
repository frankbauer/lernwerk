//#START STATIC
public class Einstieg {
    private static int calculate(int v) {
//#START STUDENT
        return 0;
//#START SOLUTION
        int w = v;

        // Schritt 1
        if (w % 5 == 0) {
            w = 200 - w;
        }

        // Schritte 2 bis 4 schließen sich gegenseitig aus
        if (w % 3 == 0) {
            w = w * 3;
        } else if (w % 7 == 0) {
            int y = w + 1;
            while (y % 6 != 0) {
                y++;
            }
            w += y;
        } else {
            w = w - 7;
        }

        // Schritt 5
        if (w <= 55) {
            w -= v;
        }

        return w;
//#START STATIC
    }

    public static void main(String[] args) {
        System.out.println(2 * 5 + " = " + calculate(2 * 5));
        System.out.println(13 + " = " + calculate(13));
        System.out.println(3 * 7 + " = " + calculate(3 * 7));
        System.out.println(5 * 7 + " = " + calculate(5 * 7));
        System.out.println(5 * 13 * 11 + " = " + calculate(5 * 13 * 11));
        System.out.println(3 * 5 * 13 + " = " + calculate(3 * 5 * 13));
    }
}
