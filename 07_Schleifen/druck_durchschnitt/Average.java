//#START STATIC
public class Average {
    public static void main(String[] args) {           
//#START STUDENT
        // Lese die erste Messung 
        Measurement current = Recorder.getNext();
//#START SOLUTION
        // Lese die erste Messung 
        Measurement current = Recorder.getNext();

        // Initialisiere eine Variablen für die Summe...
        double areaSum = 0;
        // ...und die Gesamtdauer 
        double totalTime = 0;

        // Iteriere über alle Messungen
        while (Recorder.hasMore()) {
            // Lese die nächste Messung
            Measurement next = Recorder.getNext();

            // Berechne den Mittelwert
            int midValue = (next.value + current.value) / 2;

            // Berechne die Zeitdifferenz
            int deltaTime = next.timeInHours - current.timeInHours;

            // Aktualisiere Gesamtzeit
            totalTime += deltaTime;

            // Aktualisiere SUmme der Flächeninhalte
            areaSum += deltaTime * midValue;

            // Tausche 'current' mit 'next'
            current = next;
        }

        // Berechne den durchschnittlichen Luftdruck
        double average = areaSum / totalTime;

        // Runde das Ergebnis auf (maximal) zwei Dezimalstellen.
        average = Math.round(average * 100.0) / 100.0;

        // Gib den berechneten Wert aus.
        System.out.println("Durchschnittlicher Luftdruck: " + average + " hPa");
//#START STATIC
    }
}


             