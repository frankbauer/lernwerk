//#START STATIC
public class CherryGame {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spieler hinzufügen 
        // Spieler 0 ist pink, Spieler 1 ist rot
        FloatingWorld.addPlayer();
        FloatingWorld.addPlayer();

        // 2. Den roten Spieler nach rechts bewegen
        FloatingWorld.movePlayerRight(1);

        // 3. Den pinken Spieler nach links bewegen
        FloatingWorld.movePlayerLeft(0);

        // 4. Die Welt nach links verschieben 
        // Die Kirsche kommt zum roten Spieler
        FloatingWorld.moveLeft();

        // 5. Den pinken Spieler löschen. 
        // Der rote Spieler rückt dadurch auf Index 0 vor!
        FloatingWorld.removePlayer(0);

        // 6. Den roten Spieler (jetzt Index 0) nach links bewegen
        FloatingWorld.movePlayerLeft(0);
//#START STATIC
    }
}
