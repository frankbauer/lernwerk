//#START STATIC
public class Shutdown {
    public static void main(String[] args) {
        final int needed = Shutdown.getPowerNeeded(args);
//#START STUDENT

//#START SOLUTION
        final int produced = Shutdown.getMaxPowerProduced();
        final int n = Shutdown.getNumberOfPlants();
        // Größte abschaltbare Leistung, bei der die benötigte Leistung noch erreicht wird
        final int maxOff = produced - needed;

        int disabledPower = 0;
        int plantID0 = 0;
        int plantID1 = 0;
        int plantID2 = 0;

        // Alle Kombinationen aus drei verschiedenen Kraftwerken. Da j bei i + 1 und k bei j + 1
        // beginnt, wird jede Kombination nur einmal geprüft.
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    int combinedPower = Shutdown.getSinglePower(i) + Shutdown.getSinglePower(j)
                            + Shutdown.getSinglePower(k);
                    if (combinedPower <= maxOff && combinedPower > disabledPower) {
                        plantID0 = i;
                        plantID1 = j;
                        plantID2 = k;
                        disabledPower = combinedPower;
                    }
                }
            }
        }
        Shutdown.turnOff(plantID0, plantID1, plantID2);
//#START STATIC
    }

//#START API
    private static final int[] powerPlants = {600, 12, 35, 75, 200, 20, 400, 1400, 64, 1000, 18, 13, 100};
    static int[] turnedOff = new int[0];

    public static int getMaxPowerProduced() {
        int sum = 0;
        for (int i = 0; i < powerPlants.length; i++) {
            sum = sum + powerPlants[i];
        }
        return sum;
    }

    public static int getNumberOfPlants() {
        return powerPlants.length;
    }

    private static int cachedNeeded = -1;

    public static int getPowerNeeded(String[] args) {
        if (cachedNeeded < 0) cachedNeeded = readPowerNeeded(args);
        return cachedNeeded;
    }

    private static int readPowerNeeded(String[] args) {
        int produced = getMaxPowerProduced();
        int[] copy = powerPlants.clone();
        java.util.Arrays.sort(copy);
        // mindestens benötigte Leistung: auch ohne die drei größten Kraftwerke erreichbar
        int minNeeded = produced - (copy[copy.length - 1] + copy[copy.length - 2] + copy[copy.length - 3]);
        // die drei kleinsten Kraftwerke müssen immer abgeschaltet werden können
        int minDiff = copy[0] + copy[1] + copy[2] - 1;
        try {
            int needed = Integer.parseInt(args[0].trim());
            if (needed >= minNeeded && needed < produced - minDiff) {
                return needed;
            }
        } catch (Exception e) {
        }
        int needed = (int) (minNeeded + Math.random() * (produced - minDiff - minNeeded));
        System.out.println("Ungültige benötigte Leistung! Verwende zufälligen Wert " + needed + " MW aus ["
                + minNeeded + ", " + (produced - minDiff) + "[");
        return needed;
    }

    public static int getSinglePower(int idPowerPlant) {
        if (idPowerPlant < 0 || idPowerPlant >= powerPlants.length) {
            System.err.println("getSinglePower: Index für idPowerPlant ist ungültig");
            return 0;
        }
        return powerPlants[idPowerPlant];
    }

    public static void turnOff(int id0, int id1, int id2) {
        turnedOff = new int[] {id0, id1, id2};
    }
//#START STATIC
}
