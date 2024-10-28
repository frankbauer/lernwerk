//#START STATIC
public class Printer {
    public static void main(String[] args) {            
//#START STUDENT

//#START SOLUTION
        // Erstellen von zwei Vektoren v1 und v2 mit den angegebenen Komponenten.
        Vec2D v1 = new Vec2D(-3, 4);
        Vec2D v2 = new Vec2D(5, 12);

        // Ausgabe des ersten Vektors v1 und seiner Länge.
        System.out.println("v1 = " + v1 + ", len: " + v1.length());
        
        // Ausgabe des zweiten Vektors v2 und seiner Länge.
        System.out.println("v2 = " + v2 + ", len: " + v2.length());

        // Addiere v1 und v2 und speichere das Ergebnis in v3.
        Vec2D v3 = v1.add(v2);
        // Ausgabe des addierten Vektors v3 und seiner Länge.
        System.out.println("v3 = v1 + v2 = " + v3 + ", len: " + v3.length());

        // Multipliziere v1 mit dem Skalar 3.         
        Vec2D t1 = v1.mul(3);
        // Dividiere v2 durch 2
        Vec2D t2 = v2.div(2);
        // Subtrahiere t2 von t1 und speichere das Ergebnis in v4.
        Vec2D v4 = t1.sub(t2);        
        // Ausgabe des resultierenden Vektors v4 und seiner Länge.
        System.out.println("v4 = 3*v1 - v2/2 = " + v4 + ", len: " + v4.length());
//#START STATIC
    }
}