//#START STATIC
public class Laufen {
    public static void main(String[] args) {
        FloatingWorld.show();

        // 1. Spieler 10-mal nach rechts bewegen
//#START STUDENT

//#START SOLUTION
        for (int i = 0; i < 10; i++) {
            Controller.movePlayerRight();
        }
//#START STATIC

        // 2. Spieler exakt zum Startpunkt zurückbringen
//#START STUDENT

//#START SOLUTION
        while (!Controller.isPlayerAtTarget()) {
            if (Controller.isPlayerRightOfTarget()) {
                Controller.movePlayerLeft();
            } else {
                Controller.movePlayerRight();
            }
        }
//#START STATIC
    }
}
