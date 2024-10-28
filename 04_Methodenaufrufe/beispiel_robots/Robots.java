public class Robots {
    public static void main(String[] args) {
        // Macht das Hauptzimmer sichtbar
        Room.displayMainRoom(true);

        // Ermittelt die Breite des Hauptzimmers, um die Position des 
        // Roboters innerhalb dieser Grenzen zu bestimmen
        final int wd = Room.getRoomWidth();

        // Deklariert und berechnet eine zufällige x-Position für den Roboter
        final int x = (int)(Math.random() * (wd - 2 * 100) + 100);

        // Deklariert und berechnet eine zufällige y-Position für den Roboter
        final int y = (int)(Math.random() * 40 + (wd/2));

        // Fügt einen neuen Roboter an der berechneten x- und y-Position 
        // im Hauptzimmer hinzu
        RobotFactory.addRobotToMainRoom(x, y);

        // Startet die Bewegung aller Roboter im Hauptzimmer
        RobotFactory.startMovingRobots();
    }
}