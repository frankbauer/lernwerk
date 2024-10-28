// Definition der Klasse Overload
public class Overload {
    // Überladene Methode zur Berechnung des Quadrats einer Ganzzahl
    public static int square(int x) {        
        // Gibt als Ergebnis das Quadrat von x zurück
        return x * x;
    }
    
    // Überladene Methode zur Berechnung des Quadrats einer Fließkommazahl
    public static double square(double x) {
        return x * x;
    }
    
    // Hauptmethode der Klasse, von hier startet die Ausführung des Programms
    public static void main(String[] args){
        // Aufruf der square-Methode mit einem int-Wert und Ausgabe des Ergebnisses
        System.out.println( Overload.square(3) );
        
        // Aufruf der square-Methode mit einem double-Wert und Ausgabe des Ergebnisses
        System.out.println( Overload.square(3.0) );
    }
}