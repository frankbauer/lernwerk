//#START STATIC
public class CherryGame {
    public static void main(String[] args) {
        FloatingWorld.show();
//#START STUDENT

//#START SOLUTION
        // 1. Zwei Spielfiguren-Objekte erzeugen: 
        // Die erste ist pink, die zweite rot
        Player pink = new Player();
        Player red = new Player();

        // 2. + 3. Beide Spielfiguren nach rechts bewegen, 
        // die pinke nimmt dabei die Kirsche auf
        pink.moveRight();
        red.moveRight();

        // 4. Die pinke Spielfigur löschen, die Kirsche verschwindet mit ihr
        FloatingWorld.removePlayer(pink);

        // 5. Die rote Spielfigur nach links bewegen. 
        // Die Referenz red zeigt weiterhin auf sie!
        red.moveLeft();
//#START STATIC
    }
}
