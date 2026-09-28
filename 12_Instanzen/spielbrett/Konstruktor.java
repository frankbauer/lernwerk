//#START STUDENT
    
//#START SOLUTION
    public Spielbrett(Spielregel[] r, byte diff, String a, int sz) {
        this.regeln = r;
        this.schwierigkeit = diff;
        this.anleitung = a;
        this.brett = new Figur[sz][sz];
    }
//#START STATIC

    public static void main(String[] args) {
//#START STUDENT
        // Platz zum Testen
//#START SOLUTION
        Spielbrett s = new Spielbrett(new Spielregel[2], (byte) 3, "Würfeln und ziehen", 8);
        System.out.println(s.anleitung + " (Schwierigkeit " + s.schwierigkeit + ")");
        System.out.println("Spielbrett: " + s.brett.length + " x " + s.brett[0].length + " Felder");
//#START STATIC
    }
}
//#START API
class Spielregel {}
class Figur {}
