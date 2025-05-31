//#START STATIC
public class Tank {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        // Auslesen der Fahrtrichtung
        int direction = Car.getDirection();
        Car.printDirection(direction);

        // Berechnen der Reichweite aus Verbrauch und Füllstand
        float consumption = Car.getConsumption();
        System.out.println("Verbrauch: " + consumption + " l/100km");
        float fillLevel = Car.getFillLevel();
        System.out.println("Fuellstand: " + fillLevel + " l");
        float range = fillLevel/consumption*100;
        System.out.println("verbleibende Reichweite: " + range + " km");

        // Bestimmen einer passenden Tankstelle
        String fillingStation = Car.getFillingStation(direction, range);

        //Starten der Navigation
        Car.startNavigation(fillingStation);

//#START STATIC
    }
}