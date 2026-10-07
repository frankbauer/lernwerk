public class Feldzugriff {
    // Statt der Werte werden hier die verwendeten Indizes ausgegeben. So sehen Sie direkt,
    // welche Elemente eine Schleife besucht. try/catch fängt die Exception ab, damit die
    // übrigen Beispiele trotzdem laufen.
    public static void main(String[] args) {
        System.out.print("a) ");
        int[] a = new int[100];
        for (int i=0; i<100; i++) {
            System.out.print(i + " ");                     // a[i]
        }
        System.out.println("-> alle 100 Elemente");

        System.out.print("b) ");
        char[] b = {'A', 'B', 'C', 'D'};
        for (int i=0; i<100; i++) {
            System.out.print(i%b.length + " ");            // b[i%b.length]
        }
        System.out.println("-> alle 4 Elemente (mehrfach)");

        System.out.print("c) ");
        int[] c = {10, -20, 30, -40};
        try {
            for (int x=c.length; x>0; x++) {
                System.out.print(x + " ");
                int current = c[x];
            }
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("-> ArrayIndexOutOfBoundsException beim zuletzt ausgegebenen Index");
        }

        System.out.print("d) ");
        int[] d = {1, 1, 0, 0, 0, 0};
        try {
            for (int t=0; t<d.length-1; t++) {
                System.out.print(t + "," + (t+1) + "," + (t+2) + " ");
                d[t+2] = d[t] + d[t+1];
            }
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("-> ArrayIndexOutOfBoundsException beim zuletzt ausgegebenen Index");
        }

        System.out.print("e) ");
        int[] e = new int[5];
        for (int v=0; v<50; v++) {
            if (v>=e.length) break;
            System.out.print(v + " ");                     // e[v]
        }
        System.out.println("-> alle 5 Elemente");

        System.out.print("f) ");
        Player[] f = new Player[5];
        for (int i=0; i<50; i++) {
            if (i>=f.length) continue;
            System.out.print(i + " ");                     // f[i]
        }
        System.out.println("-> alle 5 Elemente");

        System.out.print("g) ");
        int[] g = new int[5];
        for (int k=0; k<50; k++) {
            System.out.print(k + " ");                     // g[k]
            if (k>=g.length - 1) break;
        }
        System.out.println("-> alle 5 Elemente");

        System.out.print("h) ");
        Tree[] h = new Tree[5];
        try {
            for (int k=0; k<50; k++) {
                System.out.print(k + " ");
                Tree current = h[k];
                if (k>=h.length - 1) continue;
            }
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("-> ArrayIndexOutOfBoundsException beim zuletzt ausgegebenen Index");
        }

        System.out.print("i) ");
        int[] i = {1, 1, 0, 0, 0, 0};
        for (int t=0; t<i.length; t++) {
            if (t<2) continue;
            System.out.print(t + "," + (t-1) + "," + (t-2) + " ");
            i[t] = i[t-1] + i[t-2];
        }
        System.out.println("-> alle 6 Elemente");

        System.out.print("j) ");
        char[] j = {'A', 'B', 'C', 'D'};
        int runs = 0;                                      // nur hier: Notbremse nach 20 Durchläufen
        for (int l=0; l<100; l++) {
            l = l%j.length;
            System.out.print(l + " ");                     // j[l]
            if (++runs == 20) break;
        }
        System.out.println("... -> l wird nie größer als 3: Endlosschleife");

        System.out.print("k) ");
        String[] k = new String[30];
        try {
            for (int l=k.length-1; l>=0; l++) {
                System.out.print(l + " ");
                String current = k[l];
            }
        } catch (ArrayIndexOutOfBoundsException ex) {
            System.out.println("-> ArrayIndexOutOfBoundsException beim zuletzt ausgegebenen Index");
        }

        System.out.print("l) ");
        Robot[] l = new Robot[5];
        for (int v=50; v>=5; v--) {
            if (v>=l.length) break;
            System.out.print(v + " ");                     // l[v]
        }
        System.out.println("-> kein Element, die Schleife bricht sofort ab");

        System.out.print("m) ");
        int[] m = new int[5];
        for (int u=50; u>=0; u--) {
            if (u>=m.length) continue;
            System.out.print(u + " ");                     // m[u]
        }
        System.out.println("-> alle 5 Elemente (rückwärts)");
    }
}

class Player {
}

class Tree {
}

class Robot {
}
