//#START STUDENT
// Klasse Connection (Teilaufgaben 5 bis 9)

//#START SOLUTION
class Connection {
    // bis zu 100 Internetquellen, static: keine Instanz von Connection nötig
    private static Service[] services = new Service[100];

    public static boolean add(Service s) {
        // ersten freien Eintrag suchen
        for (int i = 0; i < Connection.services.length; i++) {
            if (services[i] == null) {
                services[i] = s;
                return true;
            }
        }
        // kein Platz mehr frei
        return false;
    }

    public static double computeIntensity(int x, int y, Service s) {
        double distance = Math.sqrt(Math.pow(s.getX() - x, 2) + Math.pow(s.getY() - y, 2));
        return s.getPower() * Math.pow(3000 / (4 * Math.PI * distance * s.getFrequency()), 2);
    }

    public static void printAvailableNetworks(int x, int y) {
        for (int i = 0; i < Connection.services.length; i++) {
            // add füllt das Feld von vorne, nach dem ersten leeren Eintrag kommt also nichts mehr
            if (services[i] == null) {
                break;
            }
            if (computeIntensity(x, y, services[i]) > 1) {
                System.out.println(services[i].getName());
            }
        }
        System.out.println();
    }

    public static Service getStrongestNetwork(int x, int y, double frequency) {
        // Startwert 1: schwächere Netze gelten als nicht verfügbar
        double max = 1;
        Service strongest = null;

        for (int i = 0; i < Connection.services.length; i++) {
            if (services[i] == null) {
                break;
            }
            if (Math.abs(services[i].getFrequency() - frequency) < 0.000001) {
                double intensity = computeIntensity(x, y, services[i]);
                if (intensity > max) {
                    max = intensity;
                    strongest = services[i];
                }
            }
        }
        return strongest;
    }
}
