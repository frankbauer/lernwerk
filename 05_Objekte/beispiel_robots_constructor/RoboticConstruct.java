public class RoboticConstruct {
    public static void main(String[] args) {
        // Erstellt einen neuen Raum, in diesem Fall das Wohnzimmer.
        Room livingRoom = new Room();

        // Erstellt einen neuen Roboter und speichert ihn in der Variable 'robi'.  
        // Setzt die Anfangsposition und weist den Roboter dem Wohnzimmer zu.
        Robot robi = new Robot(690, 410, livingRoom);        
        
        // Erstellt einen weiteren neuen Roboter und speichert ihn in der Variable 'anna'.
        // Setzt die Anfangsposition und weist den Roboter dem Wohnzimmer zu.
        Robot anna = new Robot(260, 430, livingRoom);

        // Aktiviert die Bewegung für beide Roboter.
        robi.setMoving(true);
        anna.setMoving(true);
    }
}
