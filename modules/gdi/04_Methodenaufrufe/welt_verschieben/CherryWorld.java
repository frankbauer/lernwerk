//#START STATIC
public class CherryWorld {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        // 1. Welt anzeigen und einen Spieler hinzufügen
        FloatingWorld.show();
        FloatingWorld.addPlayer();

        // 2. Die ganze Welt (samt Kirsche) nach rechts schieben, 
        // bis die Kirsche beim Spieler ankommt
        FloatingWorld.moveRight();

        // 3. Die Welt um 202 Einheiten nach links schieben: 
        // Der Spieler fällt mitsamt Kirsche herunter
        FloatingWorld.move(-202);
//#START STATIC
    }
}
