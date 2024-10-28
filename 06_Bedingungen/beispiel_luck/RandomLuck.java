
public class RandomLuck {
    public static void main(String[] args){        
        // Definiert eine Konstante, um zu bestimmen, ob der Spieler Glück hat.         
        final boolean halflingLuck = true;

        // Die Anweisungen im folgenden Block werden nur ausgeführt, 
        // wenn der Halbling kein Glück hat.
        if (!halflingLuck) {
            System.out.println("Du hast kein Glueck!");
        }

        // Simuliert einen Würfelwurf, um eine Zufallszahl zwischen 1 und 20 zu generieren.
        int d = (int)(Math.random() * 20) + 1; 
        System.out.println("Der Wuerfel zeigt: " + d);

        // Falls der Wurf eine 1 ergibt und die Eigenschaft halflingLuck 
        // aktiviert ist, wird der Wurf wiederholt.
        if (halflingLuck && d == 1) {
            // Der Wurf wird wiederholt und das neue Ergebnis ausgegeben.
            d = (int)(Math.random() * 20) + 1;            
            System.out.println("Aber mit Glueck eine " + d);
        }        
    }
}