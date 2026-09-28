public class Auswerten {
    public static void main(String[] args) {
        System.out.print("a) ");
        {
            String[] a = new String[20];
            System.out.println(a[0]);                   // Ausgabe: null
        }
        System.out.print("b) ");
        {
            byte[] b = new byte[1000];
            System.out.println(b[98]);                  // Ausgabe: 0
        }
        System.out.print("c) ");
        {
            int[] c = {3, 6, 9, 12, 15};
            System.out.println(c[2]);                   // Ausgabe: 9
        }
        System.out.print("d) ");
        {
            double[] d = {1, 2, 3};
            d[2] = 8;
            System.out.println(d[1] + d[2]);            // Ausgabe: 10.0
        }
        System.out.print("e) ");
        {
            byte[] e = {8, 4, 2};
            e[e[2]/2] = (byte)(e[e[0]/9] * 2);
            System.out.print(e[0] + " ");
            System.out.println(e[1] + " " + e[2]);      // Ausgabe: 8 16 2
        }
        System.out.print("f) ");
        {
            int[] f = new int[10];
            f[0] = 2;
            for (int i = 0; i < f.length-1; i++) {
                f[i+1] = f[i] + 2;
            }
            System.out.println(f[f[3]]);                // Ausgabe: 18
        }
    }
}
