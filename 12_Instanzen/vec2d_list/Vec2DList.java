//#START STATIC
public class Vec2DList {
//#START STUDENT  
//#START SOLUTION   
    // Array zur Speicherung der Vektoren, nicht veränderbare Referenz 
    public final Vec2D[] data;

    // Konstruktor erstellt Array mit übergebener Kapazität
    public Vec2DList(int capacity){
        this.data = new Vec2D[capacity];
    }

    // Berechnet die Summe aller gespeicherten Vektoren
    public Vec2D sum(){
        double xSum = 0;
        double ySum = 0;

        // Addiere x- und y-Koordinaten aller nicht-null Vektoren
        for (int i=0; i < this.data.length; i++){
            if (this.data[i] != null){
            	xSum = xSum + this.data[i].x;
            	ySum = ySum + this.data[i].y;
            }
        }

        // Erstelle und gib neuen Vektor mit Summen zurück
        return new Vec2D(xSum, ySum);
    }
    
    // Fügt einen neuen Vektor an der ersten freien Stelle ein    
    public void add(Vec2D p){
        // Suche erste freie Position (null)
        for (int i=0; i < this.data.length; i++){
            if (this.data[i] == null){
                this.data[i] = p;
                return; // Beende Methode nach Einfügen
            }
        }
    }
    
    // Entfernt alle Vorkommen des übergebenen Vektors
    public void delete(Vec2D p){
        // Suche nach Referenzen auf den übergebenen Vektor
        for (int i=0; i<this.data.length; i++){
            if (this.data[i] == p){
                this.data[i] = null; // Lösche Referenz durch null-Überschreiben
            }
        }
    }

//#START STATIC    
    // Beispiel zur Verwendung der Klasse
    public static void main(String[] args){
//#START STUDENT    
//        Vec2DList liste = new Vec2DList(3);
//        liste.add(new Vec2D(1, 2));
//        liste.add(new Vec2D(3, 4));
//        Vec2D summe = liste.sum(); // Ergibt einen Vektor (4, 6)  
//#START SOLUTION   
        // Erstelle Testvektoren       
        Vec2D p1 = new Vec2D(1, 2);
        Vec2D p2 = new Vec2D(3, 4); 
        Vec2D p3 = new Vec2D(5, 6);

        // Erstelle Liste und demonstriere Operationen
        Vec2DList l = new Vec2DList(2);
		l.add(p1);
        l.add(p2);       // Liste ist jetzt voll
        l.delete(p1);    // Mache Platz
        l.add(p3);       // Füge neuen Vektor ein
        
        // Berechne und gib Summe aus
        Vec2D sum = l.sum();
        System.out.println("Summenvektor: " + sum);
//#START STATIC          
    }  
}