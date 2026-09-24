// Definition der Hauptklasse des Programms mit dem Namen "Sandbox"
public class Sandbox {

    // Hauptmethode, die das Programm startet und die Eingabeparameter erhält
    public static void main(String[] args) {
        // Erstellen einer neuen Instanz des Universums und Übergabe der Eingabeparameter
        Universe u = new Universe(args);

        // Erstellen eines neuen Planeten vom Typ M und Hinzufügen zum Universum
        Planet p = new Planet(Type.M);
        u.addEntity(p);
        
        // Festlegen der Position des Planeten und Bestätigen, dass er Wolken hat
        p.setLocation(-75.7, 341.042);
        p.setHasClouds(true);

        // Erstellen einer neuen Rakete
        Rocket r = new Rocket();
        
        // Festlegen der Position der Rakete relativ zum Planeten
        r.setLocationRelativeTo(p, 12.2, -200.0);
        
        // Hinzufügen der Rakete zum Universum und Starten ihres Countdowns
        u.addEntity(r);
        r.launchIn(5);

        // Starten der Simulation des Universums
        u.simulate();
    }
}
