public class Robots {
    public static void main(String[] args) {
        // Erstellen eines neuen Room-Objekts namens livingRoom.
        Room livingRoom = new Room();
        
        // Erstellen eines Arrays vom Typ Robot, welches mit seiner festgelegten größe maximal zwei Roboter-Objekte aufnehmen kann.
        Robot[] robots = new Robot[2];

        // Initialisieren des ersten Roboters und Zuweisung zu einem Standort im Wohnzimmer.
        // Der Roboter wird im ersten Eintrag des Feldes angelegt (index = 0)
        robots[0] = new Robot(690, 410, livingRoom);

        // Initialisieren des zweiten Roboters und Zuweisung zu einem anderen Standort im Wohnzimmer.
        // Der Roboter wird im zweiten Eintrag des Feldes angelegt (index = 1)
        robots[1] = new Robot(260, 430, livingRoom);

        // Eine Schleife, die über alle Elemente des Roboter-Array iteriert.
        for (int i = 0; i < robots.length; i++) {
            // Setzen der Bewegungseigenschaft des i-ten Roboters auf "true", was bedeutet, dass er 
            // sich sich entlang der x-Achse im Raum bewegen wird.
            robots[i].setMoving(true);
        }
    }
}