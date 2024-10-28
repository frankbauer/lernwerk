//#START STATIC
public class FindMaxTimeDifference {
    public static void main(String[] args) {           
//#START STUDENT
        // Lese die erste Messung
        Measurement current = Recorder.getNext();
//#START SOLUTION
        // Lese die erste Messung
        Measurement current = Recorder.getNext();

        // Initialisiere eine Variable für die größte Zeitdifferenz
        int maxDiff = 0;

        // Iteriere über alle Messungen.
        while (Recorder.hasMore()) {
            // Hole die nächste Messung 
            Measurement next = Recorder.getNext();

            // Berechne die Zeitdifferenz
            int deltaTime = next.timeInHours - current.timeInHours;

            // Überprüfe, ob die berechnete Zeitdifferenz größer ist 
            if (deltaTime > maxDiff) {
                // Aktualisiere 'maxDiff' 
                maxDiff = deltaTime;
            }

            // Tausche 'current' mit 'next'
            current = next;
        }

        // Gib die größte gefundene Zeitdifferenz in Stunden aus.
        System.out.println("Zeitdifferenz: " + maxDiff + " Stunden");
//#START STATIC
    }
}            