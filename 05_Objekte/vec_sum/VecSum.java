//#START STATIC
public class VecSum {
    public static void main(String[] args){    
//#START STUDENT

//#START SOLUTION            
        // Erzeuge zwei Vektor instanzen mit new
        Vec2D v1 = new Vec2D(1, 2);
        Vec2D v2 = new Vec2D(3, 4);

        // Addiere die Vektoren, und speichere das Ergebnis in einem neuen Vektor
        Vec2D v3 = v1.add(v2);

        // Gib das Ergebnis aus
        System.out.println(v3);
//#START STATIC        
    }
}