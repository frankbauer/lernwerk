//#START STATIC
public class CherryGame {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spieler-Objekte erzeugen: Der erste ist pink, der zweite rot
        Player pink = new Player();
        Player red = new Player();

        // 2. + 3. Beide Spieler nach rechts bewegen, der rote nimmt dabei die Kirsche auf
        pink.moveRight();
        red.moveRight();

        // 4. Den pinken Spieler löschen
        FloatingWorld.removePlayer(pink);

        // 5. Den roten Spieler nach links bewegen. Die Referenz red zeigt weiterhin auf ihn!
        red.moveLeft();
//#START STATIC
    }
}
