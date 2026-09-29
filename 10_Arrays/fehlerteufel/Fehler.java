//#START STATIC
public class Fehler {
//#START STUDENT
    public static int summeQuadGerade(int[] a) {
        if (a == null) {
            return -1;
        }

        int summe = 1;
        for (int i = 0; i = a.length; i++) ; {
            if (a[i] % 2 == 2) {
                summe = a[i] * a[i];
            }
        }

        return summe * summe;
    }

    public static void main(String[] args) {
        int a = { 3, 4, 2, 5 };
        int b = summeQuadGerade(a);
        System.out.println("b = " + b);
    }
//#START SOLUTION
    public static int summeQuadGerade(int[] a) {
        if (a == null) {
            return -1;
        }

        int summe = 0;
        for (int i = 0; i < a.length; i++) {
            if (a[i] % 2 == 0) {
                summe += a[i] * a[i];
            }
        }

        return summe;
    }

    public static void main(String[] args) {
        int[] a = { 3, 4, 2, 5 };
        int b = summeQuadGerade(a);
        System.out.println("b = " + b);
    }
//#START STATIC
}
