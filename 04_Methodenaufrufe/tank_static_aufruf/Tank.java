//#START STATIC
public class Tank {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        // Auslesen der Fahrtrichtung
        int direction = Car.getDirection();

        // Berechnen der Reichweite aus Verbrauch und Füllstand
        float consumption = Car.getConsumption();
        float fillLevel = Car.getFillLevel();
        float range = fillLevel/(consumption*100);

        // Bestimmen einer passenden Tankstelle
        String fillingStation = Car.getFillingStation(direction, range);

        //Starten der Navigation
        Car.startNavigation(fillingStation);

//#START STATIC
    }
}