
public class Breaker {
    public static void main(String[] args){        
        int i = 1; // Initialisierung der Variable i mit 1
        
        // Start einer Endlosschleife
        while (true) { 
            // Verdoppelt den Wert von i bei jedem Durchlauf
            i *= 2;   
            
            // Springt zur nächsten Iteration der Schleife, wenn i gleich 4 ist
            if (i == 4) {                
                continue; 
            }
            
            // Beendet die Schleife, wenn i größer als 10 ist
            if (i > 10){
                break; 
            }
            
            // Gibt den Wert von i aus, wenn er nicht 4 und nicht größer als 10 ist
            System.out.println(i); 
        }
        
        // Gibt das Ergebnis von i nach Beendigung der Schleife aus
        System.out.println("Result: " + i); 
    }
}