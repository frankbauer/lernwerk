public class Increment {
    public static void main (String[] args){
        // Initialisiert die Variable 'a' mit dem Wert 5
        int a = 5;
        System.out.println("zu Beginn: a = " + a);
        
        // Verdoppelt den Wert von 'a' durch Multiplikation mit 2
        a *= 2;  

        // Gibt den aktuellen Wert von 'a' aus (sollte 10 sein)
        System.out.println("nach Multiplikation mit 2: a = " + a);
        
        // Erhöht den Wert von 'a' um 1 (Post-Inkrement)
        a++;        

        // Gibt den neuen Wert von 'a' aus (sollte 11 sein)
        System.out.println("nach 'a++': a = " + a);
        
        // Weist den aktuellen Wert von 'a' der Variable 'b' zu 
        // und erhoeht dann 'a' um 1
        int b = a++;

        // Gibt die Werte von 'b' und 'a' aus; 
        // 'b' sollte 11 sein und 'a' sollte 12 sein
        System.out.println("nach 'int b = a++': b = " + b + ", a = " + a);

        // Keine Veraenderung des Zahlenwerts in 'a' bei Zuweisung des Post-Inkremets zur selben Variablen
        a = a++;
        // Gibt die Werte von 'b' und 'a' aus; 
        // 'b' sollte 11 sein und 'a' sollte 12 sein
        System.out.println("nach 'a = a++': b = " + b + ", a = " + a);

        // Bildet die Summe des urspruenglichen 'a' und'b', Erhoehung von 'b' um 1 wird ueberschrieben
        b = a + b++;
        // Gibt die Werte von 'b' und 'a' aus; 
        // 'b' sollte 23 sein und 'a' sollte 12 sein
        System.out.println("nach 'b = a + b++': b = " + b + ", a = " + a);
    }
}
