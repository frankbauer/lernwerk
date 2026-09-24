//#START STATIC
public class CherryGame {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spieler hinzufügen: Spieler 0 ist pink, Spieler 1 ist rot
        FloatingWorld.addPlayer();
        FloatingWorld.addPlayer();

        // 2. Den pinken Spieler nach rechts bewegen (er fällt dabei von der Insel)
        FloatingWorld.movePlayerRight(0);

        // 3. Den roten Spieler nach rechts bewegen, bis er die Kirsche aufnimmt
        FloatingWorld.movePlayerRight(1);
        FloatingWorld.movePlayerRight(1);
        FloatingWorld.movePlayerRight(1);

        // 4. Den pinken Spieler löschen. Der rote Spieler rückt dadurch auf Index 0 vor!
        FloatingWorld.removePlayer(0);

        // 5. Den roten Spieler (jetzt Index 0) zurück zur Ausgangsposition bewegen
        FloatingWorld.movePlayerLeft(0);
        FloatingWorld.movePlayerLeft(0);
        FloatingWorld.movePlayerLeft(0);
//#START STATIC
    }
}
