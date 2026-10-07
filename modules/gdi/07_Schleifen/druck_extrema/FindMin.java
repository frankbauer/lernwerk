//#START STATIC
public class FindMin {
    public static void main(String[] args) {           
//#START STUDENT
        
//#START SOLUTION
        // Lese die erste Messung
        Measurement min = Recorder.getNext();
        
        // Iteriere über alle Messungen, indem solange wiederholt wird, wie noch unbearbeitete Messungen vorliegen.
        while (Recorder.hasMore()) {
            // Hole die nächste Messung 
            Measurement now = Recorder.getNext();

            // Prüfe ob der neue Wert kleiner ist
            if (now.value < min.value){
                // Aktualisiere den minimalen Wert
                min = now;
            }            
        }

        // Gib den Wert aus
        System.out.println("Minimum: " + min);
//#START STATIC
    }
}            