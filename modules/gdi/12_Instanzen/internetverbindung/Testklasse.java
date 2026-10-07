//#START STUDENT
// Testklasse (Teilaufgabe 10)

//#START SOLUTION
public class Testklasse {
    public static void main(String[] args) {
        Service service1 = new Service(0, 5000, true);
        Service service2 = new Service(6000, 7000, false);
        Service service3 = new Service("Jeremy's Internet", 70, 0);
        Service service4 = new Service("Weird Guy's WiFi", 35, 40);
        Connection.add(service1);
        Connection.add(service2);
        Connection.add(service3);
        Connection.add(service4);

        System.out.println("Verfügbar an (100, 200):");
        Connection.printAvailableNetworks(100, 200);

        System.out.println("Empfangsleistung an (0, 0):");
        System.out.println(Connection.computeIntensity(0, 0, service1));
        System.out.println(Connection.computeIntensity(0, 0, service2));
        System.out.println(Connection.computeIntensity(0, 0, service3));
        System.out.println(Connection.computeIntensity(0, 0, service4));

        Service best = Connection.getStrongestNetwork(0, 0, Service.FREQUENCY_WIFI);
        System.out.println("Stärkstes WLAN an (0, 0): " + (best == null ? "keines" : best.getName()));
    }
}
