//#START STATIC
public class Testend {
    public static void main(String[] args) {
        Gerade g = new Gerade();
        System.out.println("Aufpunkt: " + g.aufpunkt);
        System.out.println("Richtung: " + g.richtung);
    }
}

class Gerade {
//#START STUDENT

//#START SOLUTION
    public Punkt aufpunkt;
    public Richtung richtung;
    private static final int FARBE = 0xff0000;
    private String[] eigenschaften;
//#START STATIC
}
//#START API
class Punkt {}
class Richtung {}
