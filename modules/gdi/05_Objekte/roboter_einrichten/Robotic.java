//#START STATIC
public class Robotic {
    public static void main(String[] args) {
        // Erstellt einen neuen Raum, das Wohnzimmer.
        Room livingRoom = new Room();

//#START STUDENT
        // Ihr Code: zwei Roboter mit dem Standardkonstruktor erzeugen, platzieren,
        // dem Wohnzimmer zuweisen und in Bewegung setzen

//#START SOLUTION
        // Erster Roboter: erzeugen, Position setzen, dem Raum zuweisen
        Robot robi = new Robot();
        robi.setLocation(690, 410);
        robi.setRoom(livingRoom);

        // Zweiter Roboter
        Robot anna = new Robot();
        anna.setLocation(260, 430);
        anna.setRoom(livingRoom);

        // Beide Roboter bewegen sich unabhängig voneinander
        robi.setMoving(true);
        anna.setMoving(true);
//#START STATIC
    }
}
