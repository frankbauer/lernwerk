//#START STATIC
public class Robots {
    public static void main(String[] args) {
        // Macht das Hauptzimmer sichtbar
        Room.displayMainRoom(true);

        // Ein Roboter an einer zufälligen Position im unteren Bereich des Raumes
        final int wd = Room.getRoomWidth();
        final int x = (int)(Math.random() * (wd - 2 * 100 + 1) + 100);
        final int y = (int)(Math.random() * 40 + (wd / 2));
        RobotFactory.addRobotToMainRoom(x, y);

//#START STUDENT
        // Ihr Code: ein zweiter Roboter in der unteren rechten Ecke

//#START SOLUTION
        // Die Ecke unten rechts hat die Koordinaten (Breite, Höhe) des Raumes
        RobotFactory.addRobotToMainRoom(Room.getRoomWidth(), Room.getRoomHeight());
//#START STATIC

        // Startet die Bewegung aller Roboter im Hauptzimmer
        RobotFactory.startMovingRobots();
    }
}
