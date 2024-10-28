public class Wald {
    public static void main(String[] args) {
        // Erstellt einen neuen Baum mit der Standardjahreszeit (Herbst)
        Baum mitte = new Baum();
        // Erstellt einen neuen Baum mit der Jahreszeit Winter
        Baum rechts = new Baum("winter");
        // Erstellt einen neuen Baum mit der Jahreszeit Spätherbst
        Baum links = new Baum("spätherbst");

        // Ändert die Jahreszeit des mittleren Baums zu Frühling
        mitte.jahreszeit = "frühling";
        // Ändert die Jahreszeit des mittleren Baums erneut zu Fasching
        mitte.jahreszeit = "fasching";
    }
}