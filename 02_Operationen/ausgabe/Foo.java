public class Foo {
    public static void main(String[] args) {
        int wert1 = 12;
        final int wert2 = 8;
        System.out.println("GdI");                         // Ausgabe: GdI
        System.out.println(wert1);                         // Ausgabe: 12
        System.out.println("wert2");                       // Ausgabe: wert2
        System.out.println("wert2=" + wert1);              // Ausgabe: wert2=12
        System.out.println("Hallo" + wert1);               // Ausgabe: Hallo12
        System.out.println("Welt " + wert2);               // Ausgabe: Welt 8
        System.out.println(wert1 + wert2);                 // Ausgabe: 20
        System.out.println("Summe: " + wert1 + wert2);     // Ausgabe: Summe: 128
        System.out.println("Summe: " + (wert1 + wert2));   // Ausgabe: Summe: 20
    }
}
