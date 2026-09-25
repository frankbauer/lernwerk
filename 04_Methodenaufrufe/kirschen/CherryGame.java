//#START STATIC
public class CherryGame {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spieler hinzufügen: Spieler 0 ist pink, Spieler 1 ist rot
        FloatingWorld.addPlayer();
        FloatingWorld.addPlayer();

        // 2. + 3. Beide Spieler nach rechts bewegen, der rote nimmt dabei die Kirsche auf
        FloatingWorld.movePlayerRight(0);
        FloatingWorld.movePlayerRight(1);

        // 4. Den pinken Spieler löschen. Der rote Spieler rückt dadurch auf Index 0 vor!
        FloatingWorld.removePlayer(0);

        // 5. Den roten Spieler (jetzt Index 0) nach links bewegen
        FloatingWorld.movePlayerLeft(0);
//#START STATIC
    }
}
