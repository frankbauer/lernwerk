public class DurchschnittBerechner {
//#START SOLUTION
    public static void main(String[] args) {
        // Deklariert die erste Fließkommazahl und initialisiert sie mit 5.5
        double zahl1 = 5.5;

        // Deklariert die zweite Fließkommazahl und initialisiert sie mit 9.3
        double zahl2 = 9.3;

        // Berechnet den Durchschnitt der beiden Zahlen
        double durchschnitt = (zahl1 + zahl2) / 2;

        // Gibt den berechneten Durchschnitt auf der Konsole aus
        System.out.print  ("Der Durchschnitt von " + zahl1);
        System.out.print  (" und " + zahl2);
        System.out.println(" ist: " + durchschnitt);
    }
   
}