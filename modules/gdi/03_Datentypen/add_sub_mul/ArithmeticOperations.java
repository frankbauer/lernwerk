//#START STATIC
public class ArithmeticOperations {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        // Deklaration und Initialisierung der Ganzzahlen
        int a = 11; // Erste Ganzzahl
        int b = 3; // Zweite Ganzzahl

        // Ausgabe der Variablenwerte
        System.out.println("a=" + a + ", b=" + b + "\n");

        // Addition der beiden Ganzzahlen und Ausgabe des Ergebnisses
        int sum = a + b;
        System.out.println("Summe: " + sum);

        // Subtraktion der zweiten von der ersten Ganzzahl und Ausgabe des Ergebnisses
        int difference = a - b;
        System.out.println("Differenz: " + difference);

        // Division der ersten Ganzzahl durch die zweite und Ausgabe des Ergebnisses
        // Beachte: Hier wird eine Ganzzahldivision durchgeführt, daher wird das
        //          Ergebnis automatisch abgerundet
        int quotient = a / b;
        System.out.println("Quotient: " + quotient);
//#START STATIC
    }
}
