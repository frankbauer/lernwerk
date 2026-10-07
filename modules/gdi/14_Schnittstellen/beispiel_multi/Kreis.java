class Kreis implements Form2D, Verortbar {
    // Berechnet die Fläche des Kreises
    public double berechneFlaeche() {
        return this.radius * this.radius * Math.PI;    
    }
    
    // Setzt die Position des Kreises
    public void setLocation(double xIn, double yIn){
        this.x = xIn;
        this.y = yIn;
    }
    
    // Private Instanzattribute für den Radius und die Position des Kreises
    private double radius;
    private double x;
    private double y;

    // Konstruktor, der den Radius des Kreises initialisiert
    public Kreis(double radius) {
        this.radius = radius;
    }    

    // Überschreibt die toString-Methode, um eine Beschreibung des Kreises zurückzugeben
    public String toString(){
        return "Kreis mit Radius " + this.radius + " an Position (" + this.x + ", " + this.y + ")";
    }
}