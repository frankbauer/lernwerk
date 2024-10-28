public class RoboticConstruct {
    public static void main(String[] args) {
        // Erstellt einen neuen Raum, in diesem Fall das Wohnzimmer.
        Room livingRoom = new Room();

        // Erstellt einen neuen Roboter namens 'robi', Setzt die 
        // Anfangsposition und weist den Roboter dem Wohnzimmer zu.
        Robot robi = new Robot(690, 410, livingRoom);        
        
        // Erstellt einen weiteren neuen Roboter 
        Robot anna = new Robot(260, 430, livingRoom);

        // Aktiviert die Bewegung für beide Roboter.
        robi.setMoving(true);
        anna.setMoving(true);
    }
}
