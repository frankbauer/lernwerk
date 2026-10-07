//#START STATIC
public class Sorted {
    public static void main(String[] args) {            
//#START STUDENT
        
//#START SOLUTION
        // Erstellen des ersten Vektors mit zufaelligen x- und y-Werten im Bereich [-25, 25[:
        Vec2D v1 = new Vec2D(Math.random()*50 - 25, Math.random()*50 - 25);

        // Berechnen des Winkels zwischen dem normalisierten v1 und der X-Achse:
        //1.) v1 normalisieren
        Vec2D v1Normalized = v1.toUnitLength();
        //2.) Skalarprodukt zwischen v1 und der X-Achse berechnen
        double scalarProduct = Vec2D.XAxis.x * v1Normalized.x + Vec2D.XAxis.y * v1Normalized.y;
        //3.) Winkel (in Radianten) bestimmen
        double w1 = Math.acos(scalarProduct);

        // Erstellen des zweiten Vektors mit zufaelligen x- und y-Werten im Bereich [-25, 25[:
        Vec2D v2 = new Vec2D(Math.random()*50 - 25, Math.random()*50 - 25);  

        // Berechnen des Winkels zwischen dem normalisierten v2 und der X-Achse:
        // (die X-Achse ist (1,0), das Skalarprodukt ist also die x-Komponente des normalisierten Vektors)
        double w2 = Math.acos(v2.toUnitLength().x);
        
        // Vergleich der Winkel und Ausgabe der Vektoren in aufsteigender Reihenfolge nach dem Winkel
        if (w1 > w2) {
            System.out.println("v2 = " + v2 + " Winkel: " + w2); 
            System.out.println("v1 = " + v1 + " Winkel: " + w1);               
        } else {
            System.out.println("v1 = " + v1 + " Winkel: " + w1);
            System.out.println("v2 = " + v2 + " Winkel: " + w2);                
        }
//#START STATIC
    }
}