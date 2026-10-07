//#START STATIC

class Baum implements Renderable {
//#START STUDENT    
    // Oeffentliches Attribut, das die Jahreszeit des Baumes speichert
    public String jahreszeit = "herbst";
//#START STATIC    
    // Endgueltiges (konstantes) Attribut für die ID des Baumes
    private final int id;
    
    // Statische Zaehlvariable für die Anzahl der Baum-Instanzen
    private static int INSTANCE_COUNT = 0;

    // Standardkonstruktor, setzt die ID und registriert den Baum 
    // zum Rendern
    public Baum() {
        // Erhöht die Instanzanzahl und legt die ID für die Instanz fest
        INSTANCE_COUNT++;
        this.id = INSTANCE_COUNT;
        // Registriert den Baum zur Anzeige in der Grafikengine
        Graphics2D.instance().registerForRender(this);
    }

    // Konstruktor, der die Jahreszeit festlegt, die ID setzt und 
    // den Baum zum Rendern registriert
    public Baum(String jahreszeit) {
        // Setzt die uebergebene Jahreszeit
        this.jahreszeit = jahreszeit;
        // Erhoeht die Instanzanzahl und legt die ID für die Instanz fest
        INSTANCE_COUNT++;
        this.id = INSTANCE_COUNT;
        // Registriert den Baum zur Anzeige in der Grafikengine
        Graphics2D.instance().registerForRender(this);
    }

    // Implementierung der render-Methode des Renderable-Interfaces
    public void render(Graphics2D g) {
//#START STUDENT        
        // Definiert die minimale und maximale X-Position für das Zeichnen
        final int MIN_X = 150;
        final int MAX_X = 650;

        // Berechnet den Positionsindex (0=links, 1=mitte oder 2=rechts)
        // basierend auf der ID des Baumes
        final int POS_INDEX = this.id % 3;

        // Berechnet die X- und Y-Position sowie den Maßstab des Baumes 
        // basierend auf dem Positionsindex
        final int x = (int)(POS_INDEX / 2.0 * (MAX_X - MIN_X) + MIN_X);
        final int y = 430 - Math.abs(POS_INDEX - 1) * 20;
        final double scale = 1.25 - Math.abs(POS_INDEX - 1) * 0.5;

        // Bestimmt das zu zeichnende Bild basierend auf der Jahreszeit
        final Image img;
        if (this.jahreszeit.equals("herbst")) {
            img = TreeLibrary.AUTUMN;
        } else if (this.jahreszeit.equals("winter")) {
            img = TreeLibrary.WINTER;
        } else if (this.jahreszeit.equals("fruehling")) {
            img = TreeLibrary.SPRING;
        } else if (this.jahreszeit.equals("sommer")) {
            img = TreeLibrary.SUMMER;
        } else if (this.jahreszeit.equals("spaetherbst")) {
            img = TreeLibrary.LATE_AUTUMN;
        } else {
            img = TreeLibrary.POW;
        }

        // Zeichnet das ausgewaehlte Bild an der berechneten Position 
        // mit dem berechneten Maßstab
        g.drawImage(img, x, y, scale);
//#START STATIC        
    }
}