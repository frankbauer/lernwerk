public class Increment {
    public static void main (String[] args){
        // Initialisiert die Variable 'a' mit dem Wert 5
        int a = 5;
        
        // Verdoppelt den Wert von 'a' durch Multiplikation mit 2
        a *= 2;  

        // Gibt den aktuellen Wert von 'a' aus (sollte 10 sein)
        System.out.println(a);
        
        // Erhöht den Wert von 'a' um 1 (Post-Inkrement)
        a++;        

        // Gibt den neuen Wert von 'a' aus (sollte 11 sein)
        System.out.println(a);
        
        // Weist den aktuellen Wert von 'a' der Variable 'b' zu 
        // und erhöht dann 'a' um 1
        int b = a++;

        // Gibt die Werte von 'b' und 'a' aus; 
        // 'b' sollte 11 sein und 'a' sollte 12 sein
        System.out.println("b:" + b + ", a:" + a);
    }
}
