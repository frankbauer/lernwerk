public class Robotic {
    public static void main(String[] args) {
        // Erstellt einen neuen Raum, in diesem Fall das Wohnzimmer.
        Room livingRoom = new Room();

        // Erstellt einen neuen Roboter namens 'robi'.
        Robot robi = new Robot();
        // Setzt die Anfangsposition von 'robi'
        robi.setLocation(690, 410);
        // Weist den Roboter 'robi' dem Wohnzimmer zu.
        robi.setRoom(livingRoom);

        // Erstellt einen weiteren neuen Roboter 
        Robot anna = new Robot();
        anna.setLocation(260, 430);
        anna.setRoom(livingRoom);

        // Aktiviert die Bewegung für beide Roboter.
        robi.setMoving(true);
        anna.setMoving(true);
    }
}
