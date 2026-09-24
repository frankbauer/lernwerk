//#START STATIC
public class Tank {
    public static void main(String[] args) {
        // Auslesen und Ausgabe der Fahrtrichtung
        int direction = Car.getDirection();
        Car.printDirection(direction);

        // Berechnen der Reichweite aus Verbrauch und Fuellstand und Ausgabe der Ergebnisse
        float consumption = Car.getConsumption();
        System.out.println("Verbrauch: " + consumption + " l/100km");
        float fillLevel = Car.getFillLevel();
        System.out.println("Fuellstand: " + fillLevel + " l");
        float range = fillLevel/consumption*100;
        System.out.println("verbleibende Reichweite: " + range + " km");

        // Bestimmen einer passenden Tankstelle
        String fillingStation = Car.getFillingStation(direction, range);
//#START STUDENT

//#START SOLUTION
        //falls eine Tankstelle in Reichweite gefunden wurde
        if(fillingStation != null){
            //Starten der Navigation
            Car.startNavigation(fillingStation);

        //falls keine Tankstelle in Reichweite gefunden wurde 
        } else {
            //Mitteilen, dass keine Tankstelle in Reichweite ist
            System.out.println("Keine bei aktuellem Verbrauch erreichbare Tankstelle gefunden.");

            //Bestimmen der naechsten Tankstelle und der Entfernung dorthin
            fillingStation = Car.getNearestFillingStation();
            float distance = Car.getDistance(fillingStation);
            //Ausgabe der naechsten Tankstelle und der Entfernung dorthin
            System.out.println("Naechste Tankstelle in " + distance + " km: " + fillingStation);

            //Berechnung des maximal erlaubten Verbrauchs
            float maxConsumption = fillLevel/distance*100;

            //Verbrauch kann ausreichend reduziert werden
            if (maxConsumption >= 3.5f){
                //Ausgabe, wie Verbrauch verändert werden muss
                System.out.println("Verbrauch muss von " + consumption + " l/100km auf " + maxConsumption + " l/100km gesenkt werden.");
                //Start der Navigation zur Tankstelle
                Car.startNavigation(fillingStation);
                
            //Verbrauch kann nicht ausreichend reduziert werden.
            } else {
                System.out.println("Auch bei Verbrauchsreduktion kann die Tankstelle nicht erreicht werden. "); 
                System.out.println("Halten Sie an und rufen Sie Hilfe.");
            } 
        }
//#START STATIC
    }
}