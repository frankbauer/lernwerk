//#START STATIC
public class Swap {
    public static void main(String[] args) {    
        // Zwei Variablen deklarieren und initialisieren    
        double a = 42;
        double b = 58;
//#START STUDENT

//#START SOLUTION
        
        // Tausch der Werte mithilfe einer Hilfsvariablen
        double temp = a;
        a = b;
        b = temp;

//#START STATIC
        // Ausgabe
        System.out.println("a = " + a);
        System.out.println("b = " + b);
    }
}