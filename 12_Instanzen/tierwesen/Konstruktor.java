//#START STUDENT
    
//#START SOLUTION
    public Tierwesen(boolean p, String n, Farbe f, int platz) {
        this.phantastisch = p;
        this.name = n;
        this.farbe = f;
        this.vorkommen = new Ort[platz];
    }
//#START STATIC

    public static void main(String[] args) {
//#START STUDENT
        // Platz zum Testen
//#START SOLUTION
        Tierwesen t = new Tierwesen(true, "Niffler", new Farbe(), 3);
        System.out.println(t.name + " ist phantastisch: " + t.phantastisch);
        System.out.println("Anzahl möglicher Fundorte: " + t.vorkommen.length);
//#START STATIC
    }
}
//#START API
class Farbe {}
class Ort {}
