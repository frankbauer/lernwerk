public class Deklarationen {
    // gültig
    public static void createTree(String name) {
        System.out.println("Baum " + name + " gepflanzt");
    }

    // gültig: int + double ergibt double
    private static double sum(int a, double y) {
        return a + y;
    }

    // gültig
    public static void findMin(Robot[] robots) {
        System.out.println(robots.length + " Roboter durchsucht");
    }

    // ungültig: fehlendes Semikolon, und a ist bereits als Parameter deklariert
    // public static double dif(int a, int b) {
    //     final int a = 13
    //     return a + b + a;
    // }

    // ungültig: double ist ein Schlüsselwort und kein erlaubter Methodenname
    // public static void double() {/*...*/}

    // ungültig: dem Parameter fehlt der Name
    // public static Tree findOld(Tree[]) {/*...*/}

    // ungültig: beiden Parametern fehlt der Name
    // public static double div(double, double) {/*...*/}

    // ungültig: void ist kein erlaubter Parametertyp
    // public static boolean hasID(Player p, void id) {/*...*/}

    // ungültig: Rückgabetyp int, aber keine return-Anweisung
    // public static int mul(int a, int b) {
    //     System.out.println(a * b);
    // }

    public static void main(String[] args) {
        createTree("Eiche");
        System.out.println(sum(3, 0.5));
        findMin(new Robot[3]);
    }
}

class Robot {
}
