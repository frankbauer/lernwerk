//#START STATIC
// Die Klasse Watched verfolgt, wie oft ihre Methode aufgerufen wird.
class Watched {
//#START STUDENT 

//#START SOLUTION  
    // Zählt, wie oft die Methode 'watchedMethod' aufgerufen wurde.
    private static int callCounter = 0;

    // Diese Methode erhöht den Zähler 'callCounter' jedes Mal, wenn sie aufgerufen wird.
    // Sie gibt außerdem eine Meldung in der Konsole aus.
    public static void watchedMethod(){
        Watched.callCounter++;
        System.out.println("Method called");
    }

    // Diese Methode gibt aus, wie oft 'watchedMethod' bisher aufgerufen wurde.
    public static void printCallCounter(){
        System.out.println("Method was called " + Watched.callCounter + " times");
    }
//#START STATIC     
}

// Die Hauptklasse des Programms.
public class CallCounter {
    public static void main(String[] args) {
//#START STUDENT         
        // Eine Endlosschleife...
        while (true) {
            // ...die mit einer Wahrscheinlichkeit von 20% abgebrochen wird.
            if (Math.random() < 0.2) { break; }
        }
//#START SOLUTION  
        // Eine Endlosschleife...
        while (true) {
            // ...die mit einer Wahrscheinlichkeit von 20% abgebrochen wird.
            if (Math.random() < 0.2) { break; }

            // Die Methode 'watchedMethod' wird aufgerufen.
            Watched.watchedMethod();
        }

        // Am Ende wird die Anzahl der Aufrufe ausgegeben.
        Watched.printCallCounter();
//#START STATIC            
    }
}