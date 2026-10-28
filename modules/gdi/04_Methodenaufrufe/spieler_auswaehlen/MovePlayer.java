//#START STATIC
public class MovePlayer {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spieler hinzufügen: 
        // Spieler 0 ist pink, Spieler 1 ist rot
        FloatingWorld.addPlayer();
        FloatingWorld.addPlayer();

        // 2. Den roten Spieler (ID 1) um 200 Einheiten nach rechts bewegen
        FloatingWorld.movePlayer(1, 200);

        // 3. Den pinken Spieler (ID 0) löschen
        FloatingWorld.removePlayer(0);
//#START STATIC
    }
}
