//#START STATIC
public class Irrigation {
    public static void main(String[] args) {
        // Ausgabe der aktuellen Jahreszeit
        System.out.println("Jahreszeit: " + Sensor.getSeasonName(Sensor.getSeason()));

        // Versorgung aller Pflanzen und Aufsummieren des Wasserverbrauchs
        int total = 0;
        total = total + Irrigation.plantCare("Kaktus", 50);
        total = total + Irrigation.plantCare("Tomate", 400);
        total = total + Irrigation.plantCare("Basilikum", 200);
        System.out.println("Wasserverbrauch heute: " + total + " ml");

        // Probelauf: Wie wuerde die Tomate im Winter versorgt werden?
        System.out.println("--- Probelauf Winter ---");
        Irrigation.plantCare("Tomate", 400, Sensor.WINTER);
    }
//#START STUDENT
    // waterAmount, water, fertilize und die beiden Varianten von plantCare
//#START SOLUTION
    // berechnet die benoetigte Wassermenge in ml abhaengig von der Jahreszeit
    private static int waterAmount(int baseAmount, int season) {
        if (season == Sensor.SUMMER) {
            return baseAmount * 2;
        } else if (season == Sensor.WINTER) {
            return baseAmount / 2;
        }
        return baseAmount;
    }

    // giesst die Pflanze mit der uebergebenen Wassermenge
    private static void water(String plant, int amount) {
        System.out.println(plant + " wird mit " + amount + " ml Wasser gegossen.");
    }

    // duengt die Pflanze
    private static void fertilize(String plant) {
        System.out.println(plant + " wird geduengt.");
    }

    // versorgt eine Pflanze in der uebergebenen Jahreszeit und gibt die verbrauchte Wassermenge zurueck
    public static int plantCare(String plant, int baseAmount, int season) {
        int moisture = Sensor.getMoisture(plant);
        System.out.println(plant + ": Bodenfeuchte " + moisture + " %");

        int amount = 0;
        if (moisture < 30) {
            amount = waterAmount(baseAmount, season);
            water(plant, amount);
        } else {
            System.out.println(plant + " muss nicht gegossen werden.");
        }

        if (season == Sensor.SPRING || season == Sensor.SUMMER) {
            fertilize(plant);
        }
        return amount;
    }

    // versorgt eine Pflanze in der aktuellen Jahreszeit
    public static int plantCare(String plant, int baseAmount) {
        return plantCare(plant, baseAmount, Sensor.getSeason());
    }
//#START STATIC
}
