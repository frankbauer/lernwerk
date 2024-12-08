public class Robotic {
    public static void main(String[] args) {
        // Erstellt einen neuen Raum, in diesem Fall das Wohnzimmer.
        Room livingRoom = new Room();

        // Erstellt einen neuen Roboter und speichert ihn in der Variable 'robi'.
        Robot robi = new Robot();
        // Setzt die Anfangsposition von 'robi'
        robi.setLocation(690, 410);
        // Weist den Roboter 'robi' dem Wohnzimmer zu.
        robi.setRoom(livingRoom);

        // Erstellt einen weiteren neuen Roboter und speichert ihn in der Variable 'anna'
        Robot anna = new Robot();
        // Setzt die Anfangsposition von 'anna'
        anna.setLocation(260, 430);
        // Weist den Roboter 'anna' dem Wohnzimmer zu.
        anna.setRoom(livingRoom);

        // Aktiviert die Bewegung für beide Roboter.
        robi.setMoving(true);
        anna.setMoving(true);
    }
}
