//#START STATIC
public class CherryWorld {
    public static void main(String[] args) {
        FloatingWorld.show();
        FloatingWorld.addPlayer();
//#START STUDENT

//#START SOLUTION
        // Die ganze Welt (samt Kirsche) nach rechts schieben, bis die Kirsche beim Spieler ankommt
        FloatingWorld.moveRight();
//#START STATIC
    }
}
